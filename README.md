# 🧟‍♂️ Pulse Pad

**Pulse Pad** is a lightweight local server designed for Project Zomboid. It seamlessly connects your web-based mods (like PZ Pulse and PZ Map) to your mobile devices (tablets/phones) via a permanent local network link and QR codes.

![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=Tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

## 🇬🇧 English 

### 🚀 Features
* 🌍 **Multilingual:** Full support for EN, UA, and RU languages.
* ⚡ **Auto-start (Radar):** The server automatically wakes up when you launch Project Zomboid and shuts down when you exit the game.
* 📱 **Persistent Port & QR Codes:** The app finds a free port once, remembers it forever, and generates handy QR codes for instant connection from a tablet or phone.
* ⚙️ **Auto-detect:** The utility automatically finds mod paths in your Steam directories.
* 💻 **Portable & Setup:** Available as a classic installer or a portable version (no installation required).

### 📥 Installation
1. Go to the [Releases](https://github.com/Vlaseeds/Pulse-Pad/releases/latest) section.
2. Download your preferred format:
   * `Pulse.Pad_0.1.0_x64-setup.exe` — classic installer (recommended).
   * `Pulse-Pad-v1.0.0-Portable.exe` — portable version.
3. Launch the app, verify the mod paths, and click "Start".

> ⚠️ **Notice: False Positive Antivirus Alert (SmartScreen / Defender)**
> Since this is a free open-source project without a paid corporate certificate, Windows Defender might panic on the first launch (often showing a `Wacatac.C!ml` warning). 
> **Why?** The app adds itself to Windows startup via the registry, scans processes (looking for Zomboid), and hosts a local web server. For Microsoft's heuristic algorithms, this is enough to trigger an alarm.
> **The code is 100% clean and open for review.** 
> *Solution:* When prompted, click `More info` -> `Run anyway`.

---

<details>
<summary>🇺🇦 <b>Українська версія (Натисни, щоб розгорнути)</b></summary>

### 🚀 Особливості
* 🌍 **Багатомовність:** Повна підтримка UA, EN та RU мов.
* ⚡ **Авто-старт (Радар):** Сервер автоматично прокидається, коли ти запускаєш Project Zomboid, і вимикається, коли ти виходиш з гри.
* 📱 **Вічний порт і QR-коди:** Програма один раз знаходить вільний порт, назавжди запам'ятовує його та генерує зручні QR-коди для миттєвого підключення з планшета.
* ⚙️ **Авто-пошук:** Утиліта сама знайде шляхи до модів у папках Steam.
* 💻 **Portable & Setup:** Доступний як класичний інсталятор, так і портативна версія (не потребує встановлення).

### 📥 Встановлення
1. Перейди у розділ [Releases](https://github.com/Vlaseeds/Pulse-Pad/releases/latest).
2. Завантаж зручний для тебе формат:
   * `Pulse.Pad_0.1.0_x64-setup.exe` — класичний інсталятор (рекомендується).
   * `Pulse-Pad-v1.0.0-Portable.exe` — портативна версія.
3. Запусти програму, перевір шляхи до модів і натисни "Запустити".

> ⚠️ **Увага: Хибне спрацьовування антивірусу (SmartScreen / Defender)**
> Оскільки це безкоштовний open-source проєкт без платного корпоративного сертифіката, алгоритми Windows Defender можуть запанікувати при першому запуску (найчастіше видає попередження `Wacatac.C!ml`).
> **Чому це відбувається?** Програма додає себе в автозавантаження через системний реєстр, сканує процеси (шукає запущений Zomboid) і піднімає локальний веб-сервер. Для евристичних алгоритмів Майкрософта цього достатньо, щоб підняти тривогу.
> **Код абсолютно чистий і відкритий для перевірки в цьому репозиторії.**
> *Рішення:* Під час запуску натисніть `Детальніше` -> `Виконати в будь-якому випадку`.

</details>

<details>
<summary>🇷🇺 <b>Русская версия (Нажми, чтобы развернуть)</b></summary>

### 🚀 Особенности
* 🌍 **Мультиязычность:** Полная поддержка RU, UA и EN языков.
* ⚡ **Авто-старт (Радар):** Сервер автоматически просыпается, когда ты запускаешь Project Zomboid, и глушится, когда ты выходишь из игры.
* 📱 **Вечный порт и QR-коды:** Программа один раз находит свободный порт, намертво запоминает его и генерирует удобные QR-коды для мгновенного подключения с планшета.
* ⚙️ **Авто-поиск:** Утилита сама найдет пути к модам в папках Steam.
* 💻 **Portable & Setup:** Доступен как классический установщик, так и портативная версия (не требует установки).

### 📥 Установка
1. Перейди в раздел [Releases](https://github.com/Vlaseeds/Pulse-Pad/releases/latest).
2. Скачай удобный для тебя формат:
   * `Pulse.Pad_0.1.0_x64-setup.exe` — классический установщик (рекомендуется).
   * `Pulse-Pad-v1.0.0-Portable.exe` — портативная версия.
3. Запусти программу, проверь пути к модам и нажми "Запустить".

> ⚠️ **Внимание: Ложное срабатывание антивируса (SmartScreen / Defender)**
> Так как это бесплатный open-source проект без платного корпоративного сертификата, алгоритмы Windows Defender могут запаниковать при первом запуске (чаще всего выдает предупреждение `Wacatac.C!ml`). 
> **Почему это происходит?** Программа добавляет себя в автозагрузку через системный реестр, сканирует процессы (ищет запущенный Zomboid) и поднимает локальный веб-сервер. Для эвристических алгоритмов Майкрософта этого достаточно, чтобы поднять тревогу.
> **Код абсолютно чист и открыт для проверки в этом репозитории.**
> *Решение:* При запуске нажмите `Подробнее` -> `Выполнить в любом случае`.

</details>

---
*Created by [Vlaseeds](https://github.com/Vlaseeds)*