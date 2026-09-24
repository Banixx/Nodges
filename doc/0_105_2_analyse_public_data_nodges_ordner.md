# Analyse: Ordner public/data/nodges

Dokumentenversion: 0.105.2
Pfad: C:/Users/ich/Desktop/code/_projects/Nodges/public/data/nodges
Datum: 2026-09-22

---

## 1. Hintergrund und Zweck des Ordners

Der Ordner `C:/Users/ich/Desktop/code/_projects/Nodges/public/data/nodges` enthaelt eine fruehere Konzeptarbeit, mit der die eigene Systemarchitektur von Nodges als 3D-Graph in Nodges selbst visualisiert werden sollte.

### Enthaltene Dateien:
1. `nodges_system.json`: Ein 3D-Graph-Datensatz gemaess Schema Version 4.0 mit Nodes (`m_core`, `m_engine`, `m_ui`, `m_data`, `c_llm`, `c_parser`, etc.) und Relationships (`contains`, `depends_on`).
2. Sechs Markdown-Dateien (`root_structure.md`, `node_coreArchitecture.md`, `node_dataSchemas.md`, `node_llmCapabilities.md`, `node_uiComponents.md`, `node_visualMappingEngine.md`): Enthalten Dokumentationstexte und JSON-Fragmente zur Beschreibung der jeweiligen Systemkomponenten.

---

## 2. Bewertung der Platzierung

- **Dokumentationsmaterial:** Die Markdown-Dateien sind reine Entwickler- und Systemdokumentation und gehoeren thematisch in den Ordner `C:/Users/ich/Desktop/code/_projects/Nodges/doc/`.
- **Oeffentlicher Auslieferungsordner:** Dateien in `public/` werden von Vite unveraendert an den Webbrowser ausgeliefert. Interne Konzept-Notizen sollten nicht ueber den Webserver ausgeliefert werden.
- **Code-Referenzen:** Weder der Quellcode in `src/` noch Tests referenzieren Dateien aus `public/data/nodges`.

---

## 3. Handlungsempfehlung

1. Die Markdown-Dateien (`node_*.md`, `root_structure.md`) in den Projektordner `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` verschieben oder entfernen.
2. Falls `nodges_system.json` als Architektur-Beispielgrafik erhalten bleiben soll, kann diese nach `C:/Users/ich/Desktop/code/_projects/Nodges/public/data/archiv/` oder `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` wandern.
3. Der Ordner `C:/Users/ich/Desktop/code/_projects/Nodges/public/data/nodges` kann danach vollstaendig entfernt werden.
