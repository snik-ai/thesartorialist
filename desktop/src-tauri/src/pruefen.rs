// Automatische Prüfung der Mac-App (nur mit `--features pruefen`, nie in Auslieferungen).
// Ordner aus TS_PRUEFORDNER: liegt dort «auftrag.js», wird es ausgeführt und danach ein Schnappschuss geschrieben:
//   bild.tiff   Inhalt der WebView (WKWebView takeSnapshot – braucht keine Bildschirmaufnahme-Rechte)
//   ampel.json  Lage der drei Fensterknöpfe (Ampel) in WebView-Koordinaten (px von oben links) und Fenstergrösse
// Kopfzeilen im Skript: «// warten 1500» (ms bis zum Schnappschuss), «// fenster widget» (sonst Hauptfenster).
use std::{fs, path::PathBuf, time::Duration};

use tauri::{AppHandle, Manager};

pub fn starten(app: AppHandle) {
    let Ok(ordner) = std::env::var("TS_PRUEFORDNER") else { return };
    let ordner = PathBuf::from(ordner);
    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_millis(400));
        let auftrag = ordner.join("auftrag.js");
        let Ok(js) = fs::read_to_string(&auftrag) else { continue };
        let _ = fs::remove_file(&auftrag);
        let kopf = |s: &str| js.lines().take(4).find_map(|z| z.strip_prefix(s).map(|x| x.trim().to_string()));
        let warten = kopf("// warten ").and_then(|x| x.parse().ok()).unwrap_or(1200);
        let label = kopf("// fenster ").unwrap_or_else(|| "haupt".into());
        // «// aktion gehe:/admin/leads/»: gleicher Weg wie ein Klick in der Menüleiste (lib.rs aktion)
        if let Some(id) = kopf("// aktion ") {
            let a = app.clone();
            let _ = app.run_on_main_thread(move || crate::aktion(&a, &id));
        }
        menue_schreiben(&app, ordner.join("menue.json"));
        if let Some(w) = app.get_webview_window(&label) {
            let _ = w.eval(&js);
        }
        std::thread::sleep(Duration::from_millis(warten));
        let ziel = ordner.join("bild.tiff");
        let fertig = ordner.join("fertig");
        let ampel = ordner.join("ampel.json");
        if let Some(w) = app.get_webview_window(&label) {
            if let Ok(ns) = w.ns_window() {
                let ns = ns as usize;
                let _ = w.run_on_main_thread(move || unsafe { ampel_schreiben(ns as *mut _, ampel) });
            }
            let _ = w.with_webview(move |wv| unsafe { schnappschuss(wv.inner() as *mut _, ziel, fertig) });
        }
    });
}

/// Menüleiste als JSON (Titel, Einträge, Kurzbefehle sind im Code; hier Titel und IDs zur Kontrolle).
fn menue_schreiben(app: &AppHandle, ziel: PathBuf) {
    use tauri::menu::MenuItemKind;
    fn eintraege(items: Vec<MenuItemKind<tauri::Wry>>) -> Vec<serde_json::Value> {
        items
            .into_iter()
            .map(|i| match i {
                MenuItemKind::Submenu(s) => serde_json::json!({ "menue": s.text().unwrap_or_default(), "eintraege": eintraege(s.items().unwrap_or_default()) }),
                MenuItemKind::MenuItem(m) => serde_json::json!(format!("{} [{}]", m.text().unwrap_or_default(), m.id().as_ref())),
                MenuItemKind::Check(m) => serde_json::json!(format!("☑ {} = {}", m.text().unwrap_or_default(), m.is_checked().unwrap_or(false))),
                MenuItemKind::Predefined(m) => serde_json::json!(m.text().unwrap_or_default()),
                _ => serde_json::json!("—"),
            })
            .collect()
    }
    if let Some(m) = app.menu() {
        let _ = fs::write(ziel, serde_json::to_string_pretty(&eintraege(m.items().unwrap_or_default())).unwrap_or_default());
    }
}

unsafe fn ampel_schreiben(ns: *mut std::ffi::c_void, ziel: PathBuf) {
    use objc2_app_kit::{NSWindow, NSWindowButton};
    let w = &*(ns as *const NSWindow);
    let Some(inhalt) = w.contentView() else { return };
    let hoehe = inhalt.bounds().size.height;
    let mut knoepfe = Vec::new();
    for b in [NSWindowButton::CloseButton, NSWindowButton::MiniaturizeButton, NSWindowButton::ZoomButton] {
        if let Some(k) = w.standardWindowButton(b) {
            let r = k.convertRect_toView(k.bounds(), Some(&inhalt));
            // AppKit: Ursprung unten links (ausser bei «flipped» Views) → oben links
            let y = if inhalt.isFlipped() { r.origin.y } else { hoehe - r.origin.y - r.size.height };
            knoepfe.push(serde_json::json!({ "x": r.origin.x, "y": y, "w": r.size.width, "h": r.size.height, "sichtbar": !k.isHidden() }));
        }
    }
    let f = w.frame();
    let _ = fs::write(
        ziel,
        serde_json::json!({
            "breite": inhalt.bounds().size.width, "hoehe": hoehe, "knoepfe": knoepfe,
            // Widget: undurchsichtig? Ebene (0 = normal, −1 = unter normalen Fenstern), Spaces-Verhalten (Bit 0 = alle Spaces)
            "opak": w.isOpaque(), "ebene": w.level(), "verhalten": w.collectionBehavior().0,
            "rahmen": [f.origin.x, f.origin.y, f.size.width, f.size.height]
        })
        .to_string(),
    );
}

unsafe fn schnappschuss(wv: *mut std::ffi::c_void, ziel: PathBuf, fertig: PathBuf) {
    use block2::RcBlock;
    use objc2_app_kit::NSImage;
    use objc2_foundation::{NSError, NSString};
    use objc2_web_kit::WKWebView;
    let wv = &*(wv as *const WKWebView);
    let block = RcBlock::new(move |bild: *mut NSImage, _f: *mut NSError| {
        if let Some(bild) = bild.as_ref() {
            if let Some(daten) = bild.TIFFRepresentation() {
                daten.writeToFile_atomically(&NSString::from_str(&ziel.to_string_lossy()), true);
            }
        }
        let _ = fs::write(&fertig, b"1");
    });
    wv.takeSnapshotWithConfiguration_completionHandler(None, &block);
}
