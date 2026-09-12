import { invoke } from "@tauri-apps/api/core";
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { listen } from '@tauri-apps/api/event';
import QRCode from "qrcode";

const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const serverBtn = document.getElementById('btn-toggle-server');
const langGlobe = document.querySelector('.lang-globe');
const langMenu = document.getElementById('lang-menu');
const langOpts = document.querySelectorAll('.lang-opt');

let isServerRunning = false;

const translations = {
    ru: { navPulse: "PZ Pulse", navMap: "PZ Map", navSet: "Настройки", btnStart: "ЗАПУСТИТЬ", btnStop: "ОСТАНОВИТЬ", titlePulse: "Панель состояния", titleMap: "Глобальная карта", titleSet: "Конфигурация узла", setPulse: "Путь к моду Pulse (web):", setMap: "Путь к моду Map (web):", setLua: "Путь к логам (Lua):", setWin: "Запускать с Windows (в трее)", setPz: "Автозапуск при старте PZ", statusOffline: "Оффлайн", statusWait: "Ожидание запуска...", logStart: "Сервер запущен. Адрес:", logStop: "Сервер остановлен.", logErr: "Ошибка:", trayShow: "Pulse Pad", trayStart: "Запустить сервер", trayStop: "Остановить сервер", trayQuit: "Выйти",
        tooltipPz: "Если включено, сервер сам стартует и останавливается вместе с игрой. При попытке ручного запуска без открытой игры он немедленно отключится.",
        logPzFound: "Обнаружен процесс Zomboid. Запуск сервера...", 
        logPzLost: "Процесс Zomboid завершен. Остановка сервера...",
        authorTooltip: "Автор: Vlaseeds"
    },
    ua: { navPulse: "PZ Pulse", navMap: "PZ Map", navSet: "Налаштування", btnStart: "ЗАПУСТИТИ", btnStop: "ЗУПИНИТИ", titlePulse: "Панель стану", titleMap: "Глобальна мапа", titleSet: "Конфігурація вузла", setPulse: "Шлях до моду Pulse (web):", setMap: "Шлях до моду Map (web):", setLua: "Шлях до логів (Lua):", setWin: "Запускати з Windows (у треї)", setPz: "Автозапуск при старті PZ", statusOffline: "Офлайн", statusWait: "Очікування запуску...", logStart: "Сервер запущено. Адреса:", logStop: "Сервер зупинено.", logErr: "Помилка:", trayShow: "Pulse Pad", trayStart: "Запустити сервер", trayStop: "Зупинити сервер", trayQuit: "Вийти",
        tooltipPz: "Якщо увімкнено, сервер автоматично стартує та зупиняється разом із грою. При спробі ручного запуску без відкритої гри він одразу вимкнеться.",
        logPzFound: "Виявлено процес Zomboid. Запуск сервера...", 
        logPzLost: "Процес Zomboid завершено. Зупинка сервера...",
        authorTooltip: "Розробник: Vlaseeds"
    },
    en: { navPulse: "PZ Pulse", navMap: "PZ Map", navSet: "Settings", btnStart: "START SERVER", btnStop: "STOP SERVER", titlePulse: "Status Panel", titleMap: "Global Map", titleSet: "Node Configuration", setPulse: "Pulse mod path (web):", setMap: "Map mod path (web):", setLua: "Logs path (Lua):", setWin: "Run on Windows startup", setPz: "Auto-start with PZ", statusOffline: "Offline", statusWait: "Waiting to start...", logStart: "Server started. Address:", logStop: "Server stopped.", logErr: "Error:", trayShow: "Pulse Pad", trayStart: "Start Server", trayStop: "Stop Server", trayQuit: "Quit",
        tooltipPz: "Server automatically starts and stops with the game. If forced to start manually without the game running, it will immediately shut down.",
        logPzFound: "Project Zomboid process detected. Starting server...", 
        logPzLost: "Project Zomboid process ended. Stopping server...",
        authorTooltip: "Author: Vlaseeds"
    }
};

let currentLang = "ru";

async function syncTray() {
    const t = translations[currentLang];
    const toggleText = isServerRunning ? t.trayStop : t.trayStart;
    try {
        await invoke('update_tray_menu', { show: t.trayShow, toggle: toggleText, quit: t.trayQuit });
    } catch (e) { console.error("Tray update error:", e); }
}

langGlobe.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('show');
});

document.addEventListener('click', () => {
    langMenu.classList.remove('show');
});

function setLang(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.getElementById('t-nav-pulse').innerText = t.navPulse;
    document.getElementById('t-nav-map').innerText = t.navMap;
    document.getElementById('t-nav-settings').innerText = t.navSet;
    document.getElementById('t-pulse-title').innerText = t.titlePulse;
    document.getElementById('t-map-title').innerText = t.titleMap;
    document.getElementById('t-set-title').innerText = t.titleSet;
    document.getElementById('t-set-pulse').innerText = t.setPulse;
    document.getElementById('t-set-map').innerText = t.setMap;
    document.getElementById('t-set-lua').innerText = t.setLua;
    document.getElementById('t-set-win').innerText = t.setWin;
    document.getElementById('t-set-pz').innerText = t.setPz;
    serverBtn.querySelector('span').innerText = isServerRunning ? t.btnStop : t.btnStart;
    
  document.getElementById('tooltip-pz').setAttribute('data-tooltip', t.tooltipPz);
  document.getElementById('github-link').setAttribute('title', t.authorTooltip);
    
    if (!isServerRunning) {
        document.getElementById('url-pulse').innerText = t.statusOffline;
        document.getElementById('url-map').innerText = t.statusOffline;
        document.getElementById('log-pulse').innerHTML = `<div>${t.statusWait}</div>`;
        document.getElementById('log-map').innerHTML = `<div>${t.statusWait}</div>`;
    }

    langOpts.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    langMenu.classList.remove('show');
    syncTray();
}

const sysLang = navigator.language.toLowerCase();
if (sysLang.includes('uk') || sysLang.includes('ua')) setLang('ua');
else if (sysLang.includes('ru')) setLang('ru');
else setLang('en');

langOpts.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setLang(btn.dataset.lang);
    });
});

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

function logTo(tab, message) {
    const time = new Date().toLocaleTimeString();
    const logArea = document.getElementById(`log-${tab}`);
    if (logArea) {
        logArea.innerHTML += `<div>[${time}] ${message}</div>`;
        logArea.scrollTop = logArea.scrollHeight;
    }
}

serverBtn.addEventListener('click', async () => {
    const t = translations[currentLang];
    if (!isServerRunning) {
        serverBtn.disabled = true;
        serverBtn.querySelector('span').innerText = '...';

        const config = {
            pulse_path: document.getElementById('path-pulse').value,
            map_path: document.getElementById('path-map').value,
            lua_path: document.getElementById('path-lua').value,
            port: parseInt(localStorage.getItem('saved_port')) || 49152 
        };

        try {
            const response = await invoke('start_server', { config });
            
            await QRCode.toCanvas(document.getElementById('canvas-pulse'), response.pulse_url, { color: { dark: '#4ade80', light: '#141414' } });
            await QRCode.toCanvas(document.getElementById('canvas-map'), response.map_url, { color: { dark: '#4ade80', light: '#141414' } });

            document.getElementById('url-pulse').innerText = response.pulse_url;
            document.getElementById('url-map').innerText = response.map_url;

            logTo('pulse', `${t.logStart} ${response.pulse_url}`);
            logTo('map', `${t.logStart} ${response.map_url}`);

            serverBtn.classList.remove('off');
            serverBtn.classList.add('on');
            isServerRunning = true;
            serverBtn.querySelector('span').innerText = t.btnStop;
            syncTray();
        } catch (error) {
            logTo('pulse', `${t.logErr} ${error}`);
            logTo('map', `${t.logErr} ${error}`);
        }
        serverBtn.disabled = false;
    } else {
        serverBtn.disabled = true;
        try {
            await invoke('stop_server');
            
            serverBtn.classList.remove('on');
            serverBtn.classList.add('off');
            
            document.getElementById('canvas-pulse').getContext('2d').clearRect(0, 0, 300, 300);
            document.getElementById('canvas-map').getContext('2d').clearRect(0, 0, 300, 300);
            document.getElementById('url-pulse').innerText = t.statusOffline;
            document.getElementById('url-map').innerText = t.statusOffline;

            logTo('pulse', t.logStop);
            logTo('map', t.logStop);
            isServerRunning = false;
            serverBtn.querySelector('span').innerText = t.btnStart;
            syncTray(); 
        } catch (error) {
            logTo('pulse', `${t.logErr} ${error}`);
        }
        serverBtn.disabled = false;
    }
});

(async () => {
    await listen('tray-toggle-server', () => {
        const startBtn = document.getElementById('btn-toggle-server');
        if (startBtn && !startBtn.disabled) {
            startBtn.click();
        }
    });
})();

function sanitizePath(value, isLua = false) {
    let clean = value.trim();
    if (!clean.includes('file:///')) return clean; 

    if (!isLua) {
        clean = clean.split('?d=')[0];
        clean = clean.replace('file:///', '');
        clean = clean.replace(/\/index\.html$/i, '');
    } else {
        if (clean.includes('?d=')) {
            clean = clean.split('?d=')[1];
        }
        clean = clean.replace('file:///', '');
        clean = clean.replace(/\/PZ_Pulse\/?$/i, '');
        clean = clean.replace(/\/PZ_Map\/?$/i, '');
    }
    
    return clean.replace(/\//g, '\\');
}

async function initPaths() {
    const pathPulse = document.getElementById('path-pulse');
    const pathMap = document.getElementById('path-map');
    const pathLua = document.getElementById('path-lua');

    const savedPulse = localStorage.getItem('saved_pulse');
    const savedMap = localStorage.getItem('saved_map');
    const savedLua = localStorage.getItem('saved_lua');

    if (savedPulse || savedMap || savedLua) {
        if (savedPulse) pathPulse.value = savedPulse;
        if (savedMap) pathMap.value = savedMap;
        if (savedLua) pathLua.value = savedLua;
    } else {
        try {
            const autoPaths = await invoke('detect_paths');
            if (autoPaths.pulse) pathPulse.value = autoPaths.pulse;
            if (autoPaths.map) pathMap.value = autoPaths.map;
            if (autoPaths.lua) pathLua.value = autoPaths.lua + "/";
        } catch (e) {
            console.error("Auto-detect paths error:", e);
        }
    }

    [pathPulse, pathMap, pathLua].forEach(input => {
        input.addEventListener('input', () => {
            const isLua = input.id === 'path-lua';
            input.value = sanitizePath(input.value, isLua); 

            localStorage.setItem('saved_pulse', pathPulse.value);
            localStorage.setItem('saved_map', pathMap.value);
            localStorage.setItem('saved_lua', pathLua.value);
        });
    });
}
initPaths();

async function initPort() {
    if (!localStorage.getItem('saved_port')) {
        try {
            const port = await invoke('get_free_port');
            localStorage.setItem('saved_port', port);
        } catch (e) {
            localStorage.setItem('saved_port', 49152); 
        }
    }
}
initPort();

const autoWin = document.getElementById('auto-start-win');
const autoPz = document.getElementById('auto-start-pz');

autoPz.checked = localStorage.getItem('auto_pz') === 'true';

isEnabled().then(enabled => {
    autoWin.checked = enabled;
}).catch(e => console.error("Ошибка проверки автозагрузки:", e));

autoWin.addEventListener('change', async () => {
    try {
        if (autoWin.checked) {
            await enable();
            console.log("Added to autostart");
        } else {
            await disable();
            console.log("Removed from autostart");
        }
    } catch (e) {
        console.error("Blocked by system (no permissions):", e);
        autoWin.checked = !autoWin.checked; 
    }
});

autoPz.addEventListener('change', () => localStorage.setItem('auto_pz', autoPz.checked));

const githubBtn = document.getElementById('github-link');
if (githubBtn) {
    githubBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await invoke('open_github');
        } catch (err) {
            console.error("Failed to open link:", err);
        }
    });
}
setInterval(async () => {
    if (localStorage.getItem('auto_pz') !== 'true') return;

    try {
        const isPzRunning = await invoke('is_pz_running');
        const t = translations[currentLang];

        if (isPzRunning && !isServerRunning) {
            logTo('pulse', t.logPzFound);
            logTo('map', t.logPzFound);
            serverBtn.click();
        } 
        else if (!isPzRunning && isServerRunning) {
            logTo('pulse', t.logPzLost);
            logTo('map', t.logPzLost);
            serverBtn.click();
        }
    } catch (error) {
        console.error("PZ process polling error:", error);
    }
}, 3000);