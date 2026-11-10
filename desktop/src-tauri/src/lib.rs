// The Sartorialist für den Mac (Tauri v2, WKWebView): das Admin-Backend (/admin/) in einem nativen Fenster, ergänzt um alles,
// was ein Browser-Tab nicht kann. Vorbild: VoxCRM-Mac-App (~/_Claude/voxcrm/apps/desktop), ohne Spracherkennung.
// - Native Menüleiste (The Sartorialist, Ablage, Bearbeiten, Darstellung, Fenster, Hilfe) mit Kurzbefehlen zu allen Bereichen
//   (⌘1 … ⌘8, ⌘,), ⌘R neu laden, ⌘[ / ⌘] zurück/vor, Zoom.
// - Menüleisten-Symbol (Monogramm) mit Schnellaktionen; Fenster schliessen = App läuft weiter (Mitteilungen kommen weiter).
// - Mitteilungen: das Backend fragt jede Minute /api/admin/mitteilungen/ ab (lib/admin/mac-app.ts) und zeigt neue Anfragen
//   über mitteilung_zeigen als macOS-Mitteilung; Klick öffnet /admin/termine/<id>/. Dock-Badge über badge_setzen.
// - Schreibtisch-Widget: kleines, randloses Fenster unter allen anderen Fenstern, auf allen Spaces (/admin/widget/).
// - Externe Links im Standardbrowser, Downloads (PDF) in «Downloads» (datei_speichern bzw. on_download), im Finder gezeigt.
// - Fensterzustand wird gemerkt, Autostart wählbar.
// Entscheid und Grenzen: docs/decisions/2026-11-10-mac-app.md
use std::sync::Mutex;

#[cfg(feature = "pruefen")]
mod pruefen;

use serde_json::json;
use tauri::menu::{AboutMetadataBuilder, CheckMenuItem, CheckMenuItemBuilder, Menu, MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::webview::{DownloadEvent, NewWindowResponse, PageLoadEvent};
use tauri::{AppHandle, Manager, RunEvent, WebviewUrl, WebviewWindow, WebviewWindowBuilder, WindowEvent, Wry};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri_plugin_autostart::{MacosLauncher, ManagerExt as _};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_window_state::{AppHandleExt, StateFlags, WindowExt};
use url::Url;

const HAUPT: &str = "haupt";
const WIDGET: &str = "widget";
const STANDARD_URL: &str = "https://thesartorialist.ch/admin/";
const AUTOSTART_ARG: &str = "--hintergrund";
const NAME: &str = "The Sartorialist";

/// Bereiche des Backends (components/admin/navigation.ts) mit Kurzbefehl.
const BEREICHE: &[(&str, &str, Option<&str>)] = &[
    ("/admin/uebersicht/", "Übersicht", Some("CmdOrCtrl+1")),
    ("/admin/termine/", "Termine", Some("CmdOrCtrl+2")),
    ("/admin/leads/", "Leads", Some("CmdOrCtrl+3")),
    ("/admin/kunden/", "Kunden", Some("CmdOrCtrl+4")),
    ("/admin/angebote/", "Angebote", Some("CmdOrCtrl+5")),
    ("/admin/auftraege/", "Aufträge", Some("CmdOrCtrl+6")),
    ("/admin/rechnungen/", "Rechnungen", Some("CmdOrCtrl+7")),
    ("/admin/reichweite/", "Reichweite", Some("CmdOrCtrl+8")),
    ("/admin/kontakte/", "Alle Kontakte", None),
    ("/admin/massblaetter/", "Massblätter", None),
    ("/admin/produkte/", "Produkte", None),
];

/// Adresse des Backends: zur Laufzeit TS_APP_URL (npm run dev), sonst beim Bauen festgelegt (build:lokal), sonst Produktion.
fn app_url() -> Url {
    let roh = std::env::var("TS_APP_URL").ok().or_else(|| option_env!("TS_APP_URL").map(String::from)).unwrap_or_else(|| STANDARD_URL.into());
    Url::parse(&roh).unwrap_or_else(|_| Url::parse(STANDARD_URL).unwrap())
}

#[derive(Default)]
struct Zustand {
    zoom: Mutex<f64>,
    /// Backend geladen und angemeldet (lib/admin/mac-app.ts hat «bereit» gemeldet) – vorher werden Navigationen gesammelt
    bereit: Mutex<bool>,
    wartend: Mutex<Vec<String>>,
    /// Häkchen «Widget auf dem Schreibtisch» in Menüleiste und Menüleisten-Symbol (gleich halten)
    widget_haken: Mutex<Vec<CheckMenuItem<Wry>>>,
    autostart_haken: Mutex<Vec<CheckMenuItem<Wry>>>,
}

fn haupt(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window(HAUPT)
}

fn zeigen(app: &AppHandle) {
    if let Some(w) = haupt(app) {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
    }
}

fn js(app: &AppHandle, code: &str) {
    if let Some(w) = haupt(app) {
        let _ = w.eval(code);
    }
}

/// Ereignis im Backend auslösen (z. B. ts:neu-angebot, components/admin/Shell.tsx).
fn ereignis(app: &AppHandle, name: &str) {
    zeigen(app);
    js(app, &format!("window.dispatchEvent(new CustomEvent({}))", json!(name)));
}

/// Seite im Hauptfenster öffnen (nur /admin/…). Vor «bereit» (Anmeldung, Laden) wird gesammelt und danach zugestellt.
/// Kein «//» am Anfang und kein «\» (Browser lesen «/\host» wie «//host» = fremde Adresse), keine Steuerzeichen.
fn navigieren(app: &AppHandle, pfad: &str) {
    if !pfad.starts_with("/admin/") || pfad.contains('\\') || pfad.chars().any(|c| c.is_control()) || pfad.len() > 500 {
        return;
    }
    zeigen(app);
    let st = app.state::<Zustand>();
    if !*st.bereit.lock().unwrap() {
        st.wartend.lock().unwrap().push(pfad.to_string());
        // Anmeldeseite: dorthin mit «weiter», damit es nach der Anmeldung direkt weitergeht
        let p = json!(pfad);
        js(app, &format!("if (location.pathname.startsWith('/admin/login')) location.assign('/admin/login/?weiter=' + encodeURIComponent({p}))"));
        return;
    }
    let p = json!(pfad);
    js(app, &format!("window.__tsNavigieren ? window.__tsNavigieren({p}) : location.assign({p})"));
}

fn zoomen(app: &AppHandle, faktor: Option<f64>) {
    let st = app.state::<Zustand>();
    let mut z = st.zoom.lock().unwrap();
    *z = match faktor {
        Some(f) => (*z * f).clamp(0.5, 2.0),
        None => 1.0,
    };
    if let Some(w) = haupt(app) {
        let _ = w.set_zoom(*z);
    }
}

// ---------- Mitteilungen ----------
#[cfg(target_os = "macos")]
fn mitteilung(app: AppHandle, titel: String, text: String, url: String) {
    // Eigener Thread: wartet auf den Klick (oder das Schliessen) der Mitteilung, ohne das Fenster zu blockieren
    std::thread::spawn(move || {
        use mac_notification_sys::{Notification, NotificationResponse};
        let antwort = Notification::new().title(&titel).message(&text).sound("default").wait_for_click(true).send();
        if let Ok(NotificationResponse::Click) = antwort {
            let a = app.clone();
            let _ = app.run_on_main_thread(move || navigieren(&a, &url));
        }
    });
}
#[cfg(not(target_os = "macos"))]
fn mitteilung(_app: AppHandle, _titel: String, _text: String, _url: String) {}

#[tauri::command]
fn mitteilung_zeigen(app: AppHandle, titel: String, text: String, url: String) {
    let titel: String = titel.chars().take(80).collect();
    let text: String = text.chars().take(160).collect();
    mitteilung(app, titel, text, url);
}

#[tauri::command]
fn badge_setzen(app: AppHandle, anzahl: i64) {
    if let Some(w) = haupt(&app) {
        let _ = w.set_badge_count(if anzahl > 0 { Some(anzahl.min(999)) } else { None });
    }
}

/// Backend ist angemeldet und bereit: gesammelte Navigationen (Klick auf Mitteilung/Widget vor dem Laden) zustellen.
#[tauri::command]
fn bereit(app: AppHandle) {
    let st = app.state::<Zustand>();
    *st.bereit.lock().unwrap() = true;
    let liste: Vec<String> = std::mem::take(&mut *st.wartend.lock().unwrap());
    if let Some(letzte) = liste.last() {
        navigieren(&app, letzte);
    }
}

/// Klick im Widget: Seite im Hauptfenster öffnen und das Fenster nach vorn holen.
#[tauri::command]
fn haupt_oeffnen(app: AppHandle, pfad: String) {
    if pfad.starts_with("/admin/login") {
        return zeigen(&app); // Anmeldung: nur das Hauptfenster nach vorn
    }
    navigieren(&app, &pfad);
}

/// Erlaubte Endungen für datei_speichern. Keine ausführbaren Dateien.
const ERLAUBTE_ENDUNGEN: &[&str] = &["pdf", "csv", "png", "jpg", "jpeg", "ics", "txt", "xml", "zip"];

/// Freier Dateiname in «Downloads» («Rechnung-RE-2026-0001 (2).pdf»).
fn freier_pfad(app: &AppHandle, name: &str) -> Result<std::path::PathBuf, String> {
    let sauber: String = name.chars().map(|c| if c.is_control() || matches!(c, '/' | '\\' | ':') { '-' } else { c }).collect();
    let sauber = sauber.trim().trim_start_matches('.').chars().take(150).collect::<String>();
    let sauber = if sauber.is_empty() { "Download".to_string() } else { sauber };
    let ordner = app.path().download_dir().map_err(|e| e.to_string())?;
    let p = std::path::Path::new(&sauber);
    let stamm = p.file_stem().and_then(|s| s.to_str()).unwrap_or("Download").to_string();
    let endung = p.extension().and_then(|s| s.to_str()).map(|e| format!(".{e}")).unwrap_or_default();
    let mut ziel = ordner.join(&sauber);
    let mut n = 2;
    while ziel.exists() {
        ziel = ordner.join(format!("{stamm} ({n}){endung}"));
        n += 1;
    }
    Ok(ziel)
}

fn im_finder_zeigen(pfad: &std::path::Path) {
    let _ = std::process::Command::new("open").arg("-R").arg(pfad).spawn();
}

/// Download aus dem Backend (PDF …): Bytes als Rohdaten, Dateiname im Kopf «x-name» (URL-kodiert). Speichert in «Downloads»
/// und zeigt die Datei im Finder. WKWebView zeigt PDFs sonst selbst an, statt sie zu speichern. Rückgabe: Dateiname.
#[tauri::command]
fn datei_speichern(app: AppHandle, request: tauri::ipc::Request<'_>) -> Result<String, String> {
    let tauri::ipc::InvokeBody::Raw(daten) = request.body() else { return Err("Keine Datei erhalten".into()) };
    let roh = request.headers().get("x-name").and_then(|v| v.to_str().ok()).unwrap_or("Download.pdf");
    let name = percent_decode(roh);
    let endung = std::path::Path::new(&name).extension().and_then(|s| s.to_str()).unwrap_or("").to_ascii_lowercase();
    if !ERLAUBTE_ENDUNGEN.contains(&endung.as_str()) {
        return Err("Dateityp nicht erlaubt".into());
    }
    let ziel = freier_pfad(&app, &name)?;
    std::fs::write(&ziel, daten).map_err(|e| e.to_string())?;
    im_finder_zeigen(&ziel);
    Ok(ziel.file_name().and_then(|s| s.to_str()).unwrap_or("Download").to_string())
}

/// %XX-Folgen (UTF-8) dekodieren; ungültige Folgen bleiben stehen.
fn percent_decode(s: &str) -> String {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' && i + 2 < b.len() {
            if let Some(v) = std::str::from_utf8(&b[i + 1..i + 3]).ok().and_then(|h| u8::from_str_radix(h, 16).ok()) {
                out.push(v);
                i += 3;
                continue;
            }
        }
        out.push(b[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

// ---------- Widget ----------
fn widget_datei(app: &AppHandle) -> Option<std::path::PathBuf> {
    app.path().app_config_dir().ok().map(|d| d.join("widget.json"))
}

/// Widget an oder aus (gemerkt in widget.json). Standard: an.
fn widget_an(app: &AppHandle) -> bool {
    widget_datei(app)
        .and_then(|p| std::fs::read_to_string(p).ok())
        .and_then(|t| serde_json::from_str::<serde_json::Value>(&t).ok())
        .and_then(|v| v.get("sichtbar").and_then(|b| b.as_bool()))
        .unwrap_or(true)
}

fn widget_merken(app: &AppHandle, an: bool) {
    if let Some(p) = widget_datei(app) {
        if let Some(d) = p.parent() {
            let _ = std::fs::create_dir_all(d);
        }
        let _ = std::fs::write(p, json!({ "sichtbar": an }).to_string());
    }
}

fn widget_bauen(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    let basis = app_url();
    let url = basis.join("/admin/widget/").unwrap_or(basis.clone());
    let ursprung = basis.origin();
    let app_nav = app.clone();
    let b = WebviewWindowBuilder::new(app, WIDGET, WebviewUrl::External(url))
        .title("The Sartorialist – Widget")
        .inner_size(340.0, 470.0)
        .resizable(false)
        .decorations(false)
        .shadow(false)
        .always_on_bottom(true)
        .visible_on_all_workspaces(true)
        .skip_taskbar(true)
        .focused(false)
        .accept_first_mouse(true)
        .visible(false)
        .user_agent(&user_agent(app));
    #[cfg(target_os = "macos")]
    let b = b.transparent(true);
    let w = b
        .on_navigation(move |u| {
            // Nur das Widget selbst; alles andere öffnet im Hauptfenster bzw. im Browser
            if u.origin() == ursprung && u.path().starts_with("/admin/widget") {
                return true;
            }
            if u.origin() == ursprung && u.path().starts_with("/admin/") {
                let a = app_nav.clone();
                let p = u.path().to_string();
                let _ = app_nav.run_on_main_thread(move || navigieren(&a, &p));
            } else if matches!(u.scheme(), "https" | "http" | "mailto" | "tel") {
                let _ = app_nav.opener().open_url(u.as_str(), None::<&str>);
            }
            false
        })
        .on_new_window(|_, _| NewWindowResponse::Deny)
        .build()?;
    // Standardplatz oben rechts auf dem Hauptbildschirm; ein gemerkter Platz (window-state) geht vor
    if let Ok(Some(m)) = w.primary_monitor() {
        let f = m.scale_factor();
        let gr = m.size().to_logical::<f64>(f);
        let pos = m.position().to_logical::<f64>(f);
        let _ = w.set_position(tauri::LogicalPosition::new(pos.x + gr.width - 340.0 - 28.0, pos.y + 64.0));
    }
    let _ = w.restore_state(StateFlags::POSITION);
    Ok(w)
}

fn widget_setzen(app: &AppHandle, an: bool) {
    widget_merken(app, an);
    if an {
        let w = app.get_webview_window(WIDGET).or_else(|| widget_bauen(app).ok());
        if let Some(w) = w {
            let _ = w.show();
            let _ = w.eval("window.dispatchEvent(new Event('focus'))");
        }
    } else if let Some(w) = app.get_webview_window(WIDGET) {
        let _ = app.save_window_state(StateFlags::POSITION);
        let _ = w.hide();
    }
    for h in app.state::<Zustand>().widget_haken.lock().unwrap().iter() {
        let _ = h.set_checked(an);
    }
}

// ---------- Menü ----------
fn menue(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let autostart = app.autolaunch().is_enabled().unwrap_or(false);
    let ueber = AboutMetadataBuilder::new()
        .name(Some(NAME))
        .version(Some(app.package_info().version.to_string()))
        .copyright(Some("© 2026 The Sartorialist · DLM Digital"))
        .website(Some("https://thesartorialist.ch"))
        .website_label(Some("thesartorialist.ch"))
        .build();
    let haken_auto = CheckMenuItemBuilder::with_id("autostart", "Bei der Anmeldung starten").checked(autostart).build(app)?;
    let haken_widget = CheckMenuItemBuilder::with_id("widget", "Widget auf dem Schreibtisch").checked(widget_an(app)).build(app)?;
    {
        let st = app.state::<Zustand>();
        st.autostart_haken.lock().unwrap().push(haken_auto.clone());
        st.widget_haken.lock().unwrap().push(haken_widget.clone());
    }
    let app_menue = SubmenuBuilder::new(app, NAME)
        .item(&PredefinedMenuItem::about(app, Some("Über The Sartorialist"), Some(ueber))?)
        .separator()
        .item(&MenuItemBuilder::with_id("gehe:/admin/einstellungen/", "Einstellungen …").accelerator("CmdOrCtrl+,").build(app)?)
        .item(&haken_auto)
        .separator()
        .item(&PredefinedMenuItem::services(app, Some("Dienste"))?)
        .separator()
        .item(&PredefinedMenuItem::hide(app, Some("The Sartorialist ausblenden"))?)
        .item(&PredefinedMenuItem::hide_others(app, Some("Andere ausblenden"))?)
        .item(&PredefinedMenuItem::show_all(app, Some("Alle einblenden"))?)
        .separator()
        .item(&PredefinedMenuItem::quit(app, Some("The Sartorialist beenden"))?)
        .build()?;
    let ablage = SubmenuBuilder::new(app, "Ablage")
        .item(&MenuItemBuilder::with_id("neu-angebot", "Neues Angebot …").accelerator("CmdOrCtrl+N").build(app)?)
        .item(&MenuItemBuilder::with_id("gehe:/admin/massblaetter/neu/", "Neues Massblatt").accelerator("CmdOrCtrl+Shift+M").build(app)?)
        .separator()
        .item(&PredefinedMenuItem::close_window(app, Some("Fenster schliessen"))?)
        .build()?;
    let bearbeiten = SubmenuBuilder::new(app, "Bearbeiten")
        .item(&PredefinedMenuItem::undo(app, Some("Widerrufen"))?)
        .item(&PredefinedMenuItem::redo(app, Some("Wiederholen"))?)
        .separator()
        .item(&PredefinedMenuItem::cut(app, Some("Ausschneiden"))?)
        .item(&PredefinedMenuItem::copy(app, Some("Kopieren"))?)
        .item(&PredefinedMenuItem::paste(app, Some("Einsetzen"))?)
        .item(&PredefinedMenuItem::select_all(app, Some("Alles auswählen"))?)
        .build()?;
    let mut darstellung = SubmenuBuilder::new(app, "Darstellung")
        .item(&MenuItemBuilder::with_id("zurueck", "Zurück").accelerator("CmdOrCtrl+[").build(app)?)
        .item(&MenuItemBuilder::with_id("vor", "Vorwärts").accelerator("CmdOrCtrl+]").build(app)?)
        .separator();
    for (pfad, label, kurz) in BEREICHE {
        let mut e = MenuItemBuilder::with_id(format!("gehe:{pfad}"), *label);
        if let Some(k) = kurz {
            e = e.accelerator(*k);
        }
        darstellung = darstellung.item(&e.build(app)?);
    }
    let darstellung = darstellung
        .separator()
        .item(&MenuItemBuilder::with_id("neu-laden", "Neu laden").accelerator("CmdOrCtrl+R").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("zoom-gross", "Vergrössern").accelerator("CmdOrCtrl+Plus").build(app)?)
        .item(&MenuItemBuilder::with_id("zoom-klein", "Verkleinern").accelerator("CmdOrCtrl+-").build(app)?)
        .item(&MenuItemBuilder::with_id("zoom-normal", "Originalgrösse").accelerator("CmdOrCtrl+0").build(app)?)
        .separator()
        .item(&PredefinedMenuItem::fullscreen(app, Some("Vollbild"))?)
        .build()?;
    let fenster = SubmenuBuilder::new(app, "Fenster")
        .item(&PredefinedMenuItem::minimize(app, Some("Im Dock ablegen"))?)
        .item(&PredefinedMenuItem::maximize(app, Some("Zoomen"))?)
        .separator()
        .item(&haken_widget)
        .item(&MenuItemBuilder::with_id("zeigen", NAME).accelerator("CmdOrCtrl+Alt+0").build(app)?)
        .build()?;
    let hilfe = SubmenuBuilder::new(app, "Hilfe")
        .item(&MenuItemBuilder::with_id("hilfe-web", "Website thesartorialist.ch").build(app)?)
        .item(&MenuItemBuilder::with_id("hilfe-mail", "Support kontaktieren …").build(app)?)
        .build()?;
    #[cfg(target_os = "macos")]
    {
        let _ = fenster.set_as_windows_menu_for_nsapp();
        let _ = hilfe.set_as_help_menu_for_nsapp();
    }
    MenuBuilder::new(app).items(&[&app_menue, &ablage, &bearbeiten, &darstellung, &fenster, &hilfe]).build()
}

/// Gemeinsam für Menüleiste und Menüleisten-Symbol.
fn aktion(app: &AppHandle, id: &str) {
    match id {
        "neu-angebot" => ereignis(app, "ts:neu-angebot"),
        "zurueck" => js(app, "history.back()"),
        "vor" => js(app, "history.forward()"),
        "neu-laden" => js(app, "location.reload()"),
        "zoom-gross" => zoomen(app, Some(1.1)),
        "zoom-klein" => zoomen(app, Some(1.0 / 1.1)),
        "zoom-normal" => zoomen(app, None),
        "zeigen" => zeigen(app),
        "widget" => {
            let an = app.get_webview_window(WIDGET).and_then(|w| w.is_visible().ok()).unwrap_or(false);
            widget_setzen(app, !an);
        }
        "hilfe-web" => {
            let _ = app.opener().open_url("https://thesartorialist.ch", None::<&str>);
        }
        "hilfe-mail" => {
            let _ = app.opener().open_url("mailto:s.nikolic@dlm-digital.ch?subject=The%20Sartorialist%20Mac-App", None::<&str>);
        }
        "beenden" => app.exit(0),
        "autostart" => {
            let al = app.autolaunch();
            let an = al.is_enabled().unwrap_or(false);
            let _ = if an { al.disable() } else { al.enable() };
            let jetzt = al.is_enabled().unwrap_or(!an);
            for h in app.state::<Zustand>().autostart_haken.lock().unwrap().iter() {
                let _ = h.set_checked(jetzt);
            }
        }
        _ => {
            if let Some(pfad) = id.strip_prefix("gehe:") {
                navigieren(app, pfad);
            }
        }
    }
}

fn tray(app: &AppHandle) -> tauri::Result<()> {
    let haken_widget = CheckMenuItemBuilder::with_id("widget", "Widget auf dem Schreibtisch").checked(widget_an(app)).build(app)?;
    let haken_auto = CheckMenuItemBuilder::with_id("autostart", "Bei der Anmeldung starten").checked(app.autolaunch().is_enabled().unwrap_or(false)).build(app)?;
    {
        let st = app.state::<Zustand>();
        st.widget_haken.lock().unwrap().push(haken_widget.clone());
        st.autostart_haken.lock().unwrap().push(haken_auto.clone());
    }
    let menue = MenuBuilder::new(app)
        .item(&MenuItemBuilder::with_id("zeigen", "The Sartorialist öffnen").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("gehe:/admin/uebersicht/", "Übersicht").build(app)?)
        .item(&MenuItemBuilder::with_id("gehe:/admin/termine/", "Termine und Anfragen").build(app)?)
        .item(&MenuItemBuilder::with_id("gehe:/admin/auftraege/", "Aufträge").build(app)?)
        .item(&MenuItemBuilder::with_id("gehe:/admin/rechnungen/", "Rechnungen").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("neu-angebot", "Neues Angebot …").build(app)?)
        .separator()
        .item(&haken_widget)
        .item(&haken_auto)
        .separator()
        .item(&MenuItemBuilder::with_id("beenden", "The Sartorialist beenden").build(app)?)
        .build()?;
    TrayIconBuilder::with_id("tray")
        .icon(tauri::image::Image::from_bytes(include_bytes!("../icons/tray-vorlage@2x.png"))?)
        .icon_as_template(true)
        .tooltip(NAME)
        .menu(&menue)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, e| aktion(app, e.id().as_ref()))
        .build(app)?;
    Ok(())
}

// ---------- Fenster ----------
fn user_agent(app: &AppHandle) -> String {
    // WKWebView meldet sich sonst ohne «Safari»; Zusatz für Server-Logs und Geräte-Erkennung
    format!(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15 Sartorialist-Mac/{}",
        app.package_info().version
    )
}

/// Eigene Seiten (Backend, API, Startseite der App, about:/blob:/data:) bleiben im Fenster, alles andere (auch die
/// öffentliche Website) öffnet im Standardbrowser.
fn navigation_erlaubt(app: &AppHandle, ursprung: &url::Origin, url: &Url) -> bool {
    if matches!(url.scheme(), "tauri" | "about" | "blob" | "data") || url.host_str() == Some("tauri.localhost") {
        return true;
    }
    if url.origin() == *ursprung && (url.path().starts_with("/admin") || url.path().starts_with("/api/")) {
        return true;
    }
    if matches!(url.scheme(), "https" | "http" | "mailto" | "tel" | "sms") {
        let _ = app.opener().open_url(url.as_str(), None::<&str>);
    }
    false
}

/// Dokument-Fenster (PDF über window.open/target=_blank, falls lib/admin/mac-app.ts den Download nicht abfängt).
fn dokument_fenster(app: &AppHandle, u: Url) {
    let label = format!("dokument-{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0));
    let ursprung = app_url().origin();
    let app_nav = app.clone();
    let _ = WebviewWindowBuilder::new(app, label, WebviewUrl::External(u))
        .title(NAME)
        .inner_size(900.0, 1000.0)
        .on_navigation(move |url| navigation_erlaubt(&app_nav, &ursprung, url))
        .on_new_window(|_, _| NewWindowResponse::Deny)
        .build();
}

/// IPC-Rechte für das lokale Backend (http://localhost:3000): nur in Debug-Builds (npm run dev) oder wenn die Adresse beim
/// Bauen festgelegt wurde (build:lokal). Auslieferungen geben localhost keine Rechte (capabilities/default.json).
fn lokale_rechte(app: &AppHandle) {
    let mut adressen: Vec<String> = Vec::new();
    if cfg!(debug_assertions) {
        adressen.push("http://localhost:3000".into());
        adressen.push(app_url().origin().ascii_serialization());
    } else if let Some(fest) = option_env!("TS_APP_URL").and_then(|u| Url::parse(u).ok()) {
        adressen.push(fest.origin().ascii_serialization());
    }
    adressen.retain(|a| a != "https://thesartorialist.ch" && a != "null");
    adressen.sort();
    adressen.dedup();
    if adressen.is_empty() {
        return;
    }
    let mut cap = tauri::ipc::CapabilityBuilder::new("sartorialist-lokal").window(HAUPT).window(WIDGET);
    for a in &adressen {
        cap = cap.remote(format!("{a}/*"));
    }
    for p in [
        "core:event:default", "core:window:allow-start-dragging", "core:window:allow-toggle-maximize", "core:window:allow-internal-toggle-maximize",
        "allow-mitteilung-zeigen", "allow-badge-setzen", "allow-bereit", "allow-datei-speichern", "allow-haupt-oeffnen",
    ] {
        cap = cap.permission(p);
    }
    if let Err(e) = app.add_capability(cap) {
        eprintln!("Lokale Rechte: {e}");
    }
}

fn fenster_bauen(app: &AppHandle, versteckt: bool) -> tauri::Result<WebviewWindow> {
    let basis = app_url();
    let start = json!(basis.as_str()).to_string();
    let ursprung = basis.origin();
    let app_nav = app.clone();
    let app_neu = app.clone();
    let app_laden = app.clone();
    let b = WebviewWindowBuilder::new(app, HAUPT, WebviewUrl::App("index.html".into()))
        .title(NAME)
        .inner_size(1360.0, 880.0)
        // Mindestbreite > 900 px: das Backend bleibt in der Desktop-Ansicht mit Seitenleiste
        .min_inner_size(1000.0, 640.0)
        .center()
        .visible(false);
    // Transparente Titelleiste mit Ampel-Knöpfen über der dunklen Seitenleiste. Die Sicherheitszone (40 px, Rand statt
    // Innenabstand) steht in app/admin/mac-app.css und greift nur mit html.mac-app. Klasse und Zugfläche setzt dieses Skript
    // erst nach dem Laden (nach der Hydration von React), damit das DOM beim Hydrieren unverändert ist.
    #[cfg(target_os = "macos")]
    let b = b
        .title_bar_style(TitleBarStyle::Overlay)
        .hidden_title(true)
        .traffic_light_position(tauri::LogicalPosition::new(18.0, 22.0))
        .initialization_script(format!(
            "if (location.origin === {o}) {{ const ein = () => setTimeout(() => {{ document.documentElement.classList.add('mac-app'); \
             if (!document.querySelector('.mac-zug-global')) {{ const z = document.createElement('div'); z.className = 'mac-zug mac-zug-global'; z.setAttribute('data-tauri-drag-region', ''); z.setAttribute('aria-hidden', 'true'); document.body.appendChild(z); }} }}, 50); \
             if (document.readyState === 'complete') ein(); else window.addEventListener('load', ein); }}",
            o = json!(ursprung.ascii_serialization())
        ));
    let w = b
        .background_color(tauri::window::Color(13, 13, 13, 255))
        .user_agent(&user_agent(app))
        .initialization_script(format!("window.__TS_START = {start};"))
        .on_navigation(move |url| navigation_erlaubt(&app_nav, &ursprung, url))
        .on_new_window(move |url, _| {
            // PDF und Dokumente des Backends in einem eigenen App-Fenster, fremde Seiten im Browser
            if url.origin() == app_url().origin() && url.path().starts_with("/api/admin/") {
                let a = app_neu.clone();
                let u = url.clone();
                let _ = app_neu.run_on_main_thread(move || dokument_fenster(&a, u));
            } else if matches!(url.scheme(), "https" | "http" | "mailto" | "tel" | "sms") {
                let _ = app_neu.opener().open_url(url.as_str(), None::<&str>);
            }
            NewWindowResponse::Deny
        })
        .on_download(|webview, event| {
            // Rückfall für Downloads, die nicht über datei_speichern laufen: in «Downloads», danach im Finder zeigen
            match event {
                DownloadEvent::Requested { url, destination } => {
                    let name = url.path_segments().and_then(|mut s| s.next_back().map(String::from)).filter(|s| !s.is_empty()).unwrap_or_else(|| "Download".into());
                    if let Ok(p) = freier_pfad(webview.app_handle(), &percent_decode(&name)) {
                        *destination = p;
                    }
                }
                DownloadEvent::Finished { path: Some(p), success: true, .. } => im_finder_zeigen(&p),
                _ => {}
            }
            true
        })
        .on_page_load(move |_, p| {
            if p.event() == PageLoadEvent::Started {
                // Neue Seite: bis lib/admin/mac-app.ts «bereit» meldet, Navigationen sammeln
                *app_laden.state::<Zustand>().bereit.lock().unwrap() = false;
            }
        })
        .build()?;
    let _ = w.restore_state(StateFlags::all() & !StateFlags::VISIBLE);
    if !versteckt {
        let _ = w.show();
        let _ = w.set_focus();
    }
    Ok(w)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let im_hintergrund = std::env::args().any(|a| a == AUTOSTART_ARG);
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![AUTOSTART_ARG])))
        .plugin(tauri_plugin_window_state::Builder::default().with_state_flags(StateFlags::all() & !StateFlags::VISIBLE).with_denylist(&["dokument-*"]).build())
        .manage(Zustand { zoom: Mutex::new(1.0), ..Default::default() })
        .invoke_handler(tauri::generate_handler![mitteilung_zeigen, badge_setzen, bereit, datei_speichern, haupt_oeffnen])
        .setup(move |app| {
            let h = app.handle().clone();
            #[cfg(target_os = "macos")]
            if std::env::current_exe().map(|p| p.to_string_lossy().contains(".app/Contents/MacOS")).unwrap_or(false) {
                let _ = mac_notification_sys::set_application(&app.config().identifier);
            }
            app.set_menu(menue(&h)?)?;
            app.on_menu_event(|app, e| aktion(app, e.id().as_ref()));
            tray(&h)?;
            lokale_rechte(&h);
            fenster_bauen(&h, im_hintergrund)?;
            if widget_an(&h) {
                widget_setzen(&h, true);
            }
            #[cfg(feature = "pruefen")]
            pruefen::starten(h.clone());
            Ok(())
        })
        .on_window_event(|w, e| {
            // Fenster schliessen (rot, ⌘W) = ausblenden: die App läuft in der Menüleiste weiter und meldet Neues
            if let WindowEvent::CloseRequested { api, .. } = e {
                if w.label() == HAUPT || w.label() == WIDGET {
                    api.prevent_close();
                    let _ = w.app_handle().save_window_state(StateFlags::all() & !StateFlags::VISIBLE);
                    let _ = w.hide();
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("The Sartorialist liess sich nicht starten");

    app.run(|app, e| match e {
        // Klick auf das Dock-Symbol bei verstecktem Fenster
        #[cfg(target_os = "macos")]
        RunEvent::Reopen { .. } => zeigen(app),
        RunEvent::ExitRequested { .. } => {
            let _ = app.save_window_state(StateFlags::all() & !StateFlags::VISIBLE);
        }
        _ => {}
    });
}
