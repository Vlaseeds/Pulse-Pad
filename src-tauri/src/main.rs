#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use local_ip_address::list_afinet_netifas;
use axum::Router;
use tower_http::services::ServeDir;
use tower_http::cors::CorsLayer;
use tokio::sync::oneshot;
use sysinfo::System;

use tauri::{State, Manager, Emitter, Wry};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton};
use tauri::menu::{Menu, MenuItem};

#[derive(Deserialize)]
struct Config {
    pulse_path: String,
    map_path: String,
    lua_path: String,
    port: u16, 
}

#[derive(Serialize)]
struct ServerResponse {
    pulse_url: String,
    map_url: String,
    ip: String,
}

struct ServerState(Mutex<Option<oneshot::Sender<()>>>);

#[derive(Serialize)]
struct DetectedPaths {
    pulse: String,
    map: String,
    lua: String,
}

struct TrayState {
    show: MenuItem<Wry>,
    toggle: MenuItem<Wry>,
    quit: MenuItem<Wry>,
}

#[tauri::command]
async fn get_free_port() -> Result<u16, String> {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:0").await.map_err(|e| format!("Ошибка бинда: {}", e))?;
    Ok(listener.local_addr().unwrap().port())
}

#[tauri::command]
fn detect_paths() -> DetectedPaths {
    let mut result = DetectedPaths { pulse: String::new(), map: String::new(), lua: String::new() };
    if let Ok(user_profile) = std::env::var("USERPROFILE") {
        let lua_path = format!("{}\\Zomboid\\Lua", user_profile);
        if std::path::Path::new(&lua_path).exists() { result.lua = lua_path.replace("\\", "/"); }
    }
    let steam_bases = [
        "D:/Games/Steam/steamapps/workshop/content/108600",
        "C:/Program Files (x86)/Steam/steamapps/workshop/content/108600",
        "E:/SteamLibrary/steamapps/workshop/content/108600",
        "D:/SteamLibrary/steamapps/workshop/content/108600",
    ];
    for base in steam_bases.iter() {
        let pulse = format!("{}/3753700423/mods/PZ_Pulse/42/media/web", base);
        let map = format!("{}/3770149036/mods/PZ_Map/42/media/web", base);
        if result.pulse.is_empty() && std::path::Path::new(&pulse).exists() { result.pulse = pulse; }
        if result.map.is_empty() && std::path::Path::new(&map).exists() { result.map = map; }
    }
    result
}

#[tauri::command]
fn is_pz_running() -> bool {
    use sysinfo::{RefreshKind, ProcessRefreshKind};
    let mut sys = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new())
    );
    sys.refresh_processes();
    sys.processes().values().any(|p| {
        let name = p.name().to_lowercase();
        name.contains("projectzomboid") || name == "pz.exe"
    })
}

#[tauri::command]
fn update_tray_menu(state: State<'_, TrayState>, show: String, toggle: String, quit: String) {
    let _ = state.show.set_text(show);
    let _ = state.toggle.set_text(toggle);
    let _ = state.quit.set_text(quit);
}

fn is_safe_path(path: &str) -> bool {
    let p = std::path::Path::new(path);
    p.components().count() >= 3
}

#[tauri::command]
async fn start_server(config: Config, state: State<'_, ServerState>) -> Result<ServerResponse, String> {
    let _ = stop_server(state.clone()).await;

    if !is_safe_path(&config.pulse_path) || !is_safe_path(&config.map_path) || !is_safe_path(&config.lua_path) {
        return Err("ОШИБКА БЕЗОПАСНОСТИ: Попытка расшарить системный каталог!".into());
    }

    let network_interfaces = list_afinet_netifas().map_err(|e| format!("Ошибка сети: {}", e))?;
    let mut ip = String::from("127.0.0.1");

    for (name, net_ip) in network_interfaces.iter() {
        let ip_str = net_ip.to_string();
        if net_ip.is_ipv4() && !ip_str.starts_with("127.") && !ip_str.starts_with("26.") && !ip_str.starts_with("25.") {
            ip = ip_str.clone();
            if name.to_lowercase().contains("wi-fi") || name.to_lowercase().contains("ethernet") { break; }
        }
    }

    let app = Router::new()
        .nest_service("/pulse", ServeDir::new(config.pulse_path))
        .nest_service("/map", ServeDir::new(config.map_path))
        .nest_service("/data", ServeDir::new(config.lua_path))
        .layer(CorsLayer::permissive()); 

    let (tx, rx) = oneshot::channel();
    *state.0.lock().unwrap() = Some(tx);
    
    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr).await.map_err(|e| format!("Порт {} заблокирован: {}", config.port, e))?;
    let port = config.port; 

    tokio::spawn(async move {
        if let Err(e) = axum::serve(listener, app).with_graceful_shutdown(async { rx.await.ok(); }).await {
            eprintln!("Ошибка сервера: {}", e);
        }
    });

    Ok(ServerResponse {
        pulse_url: format!("http://{}:{}/pulse/?d=http://{}:{}/data/PZ_Pulse/", ip, port, ip, port),
        map_url: format!("http://{}:{}/map/?d=http://{}:{}/data/PZ_Map/", ip, port, ip, port),
        ip,
    })
}

#[tauri::command]
async fn stop_server(state: State<'_, ServerState>) -> Result<(), String> {
    if let Some(tx) = state.0.lock().unwrap().take() {
        let _ = tx.send(());
    }
    Ok(())
}

#[tauri::command]
fn open_github() {
    let _ = std::process::Command::new("cmd")
        .args(["/C", "start", "https://github.com/Vlaseeds"])
        .spawn();
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .manage(ServerState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![start_server, stop_server, detect_paths, is_pz_running, update_tray_menu, get_free_port, open_github])
        .setup(|app| {
            let handle = app.handle();

            let show_i = MenuItem::with_id(handle, "show", "Pulse Pad", true, None::<&str>)?;
            let toggle_i =
                MenuItem::with_id(handle, "toggle", "Запустить сервер", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(handle, "quit", "Выйти", true, None::<&str>)?;
            let menu = Menu::with_items(handle, &[&show_i, &toggle_i, &quit_i])?;

            app.manage(TrayState {
                show: show_i.clone(),
                toggle: toggle_i.clone(),
                quit: quit_i.clone(),
            });

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Pulse Pad")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => std::process::exit(0),
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "toggle" => {
                        let _ = app.emit("tray-toggle-server", "toggled");
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        if let Some(window) = tray.app_handle().get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;
            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("Ошибка при запуске Tauri");
}