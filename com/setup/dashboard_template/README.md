# Dashboard-Vorlage fuer Multi-Harness & Single-Harness Projekte

Dieses Verzeichnis enthaelt das universelle One-Page Dashboard-Template fuer Nodges-Projekte und neue Arbeitsbereiche.

## Enthaltene Dateien

- **`dashboard.html`**: Universeller One-Page HTML-Dashboard-Viewer (100vh Bildschirmschnitt, responsive Kachelansicht, violette und rosafarbene Typografie, keine externen CDN-Abhaengigkeiten, rein relative Links).
- **`dashboard.md`**: Kompakte Markdown-Tabelle fuer GitHub, VS-Code/Antigravity und Terminal-Reader.

## Warum das Dashboard durch einfaches Hineinkopieren funktioniert

1. **Relative Pfade:** Alle Links zu Markdown, Dokumentation und Nachbardateien (`./dashboard.md`, `./README.md`, `../todo.md`) sind rein relativ formatiert. Es gibt keine festverdrahteten absoluten Laufwerkspfade.
2. **Autarkes CSS & HTML:** Die HTML-Datei verwendet keine externen Schriftarten, Frameworks oder JavaScript-Bibliotheken. Sie laeuft lokal offline ueber `file:///` ebenso wie ueber jeden Webserver.
3. **Fester Bildschirmschnitt:** Das Layout ist auf `height: 100vh` und ein 2x2 Grid ausgelegt, sodass Name, Beschreibung, Ziele sowie Fortschritt/Status auf genau einer Bildschirmseite ohne Scrollen erfassbar sind.

## Verwendung in einem neuen Projekt

### Option A: Manuelles Kopieren
Kopieren Sie `dashboard.html` und `dashboard.md` einfach in den gewuenschten Zielordner des neuen Projekts (z.B. in das Projekt-Root oder in `com/setup/`):

```bash
# Beispiel Linux / WSL:
cp -r /workspace/com/setup/dashboard_template/* /pfad/zum/neuen/projekt/

# Beispiel Windows PowerShell:
Copy-Item -Path "W:/com/setup/dashboard_template/*" -Destination "C:/NeuesProjekt/com/setup/" -Recurse
```

### Option B: Automatische Initialisierung im Multi-Harness-Setup
Die Vorlage ist dauerhaft in `W:/com/setup/dashboard_template/` verankert und wird gemaess `W:/com/setup/multi_harness_setup_und_kommunikation.md` bei jeder Neuinitialisierung eines Multi-Harness-Workspaces standardmaessig mitkopiert.
