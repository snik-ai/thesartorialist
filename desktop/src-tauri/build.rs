fn main() {
    // Eigene Befehle für die WebView freigeben (Rechte in capabilities/default.json, nur für die App-Adresse)
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&["mitteilung_zeigen", "badge_setzen", "bereit", "datei_speichern", "haupt_oeffnen"]),
    ))
    .expect("tauri-build fehlgeschlagen");
}
