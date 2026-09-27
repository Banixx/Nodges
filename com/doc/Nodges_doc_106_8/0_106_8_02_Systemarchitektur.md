# 02 Vision und Systemarchitektur

Dieses Kapitel beschreibt die technische Kernarchitektur, die Infrastrukturprinzipien und die Systemkomponenten von Nodges in der Version **0.106.8**. Es erlaeutert die strukturelle Trennung zwischen Daten und Visualisierung, die Multi-Harness-Betriebsumgebung und das Zusammenspiel der zentralen Manager-Klassen.

---

## 1. Die Drei-Saeulen-Architektur (Der Build 5 Pivot)

> **Visualisierung:** Siehe [02_DreiSaeulenArchitektur_001.mmd](02_DreiSaeulenArchitektur_001.mmd) und [02_Build5PivotEntkopplung_003.mmd](02_Build5PivotEntkopplung_003.mmd)

Ein fundamentaler Architekturmeilenstein von Nodges ist die strikte funktionale Entflechtung von Ontologie, Instanzdaten und visueller Praesentation:

```
┌────────────────────────────────────────────────────────┐
│ 1. Ontologie (Metadaten & Taxonomie)                   │
│    Definiert Typen, Kategorieregeln und Attribute      │
└───────────────────────────┬────────────────────────────┘
                            │ strukturiert
┌───────────────────────────▼────────────────────────────┐
│ 2. Flache Daten (Entities & Relationships)             │
│    Reine Faktenebene ohne implizite Styling-Vorgaben   │
└───────────────────────────┬────────────────────────────┘
                            │ wird interpretiert durch
┌───────────────────────────▼────────────────────────────┐
│ 3. Visual Mapping Engine (Dynamische Repraesentation)  │
│    Uebersetzt Daten live in Geometrie, Farbe & Glow    │
└────────────────────────────────────────────────────────┘
```

### 1.1 Die Ontologie (Schema-Ebene)
Definiert die Struktur der modellierten Welt: Welche Entitaetstypen existieren? Welche Relationstypen sind zulaessig? Welche Datenfelder muessen oder koennen vorhanden sein? Die Ontologie enthaelt keinerlei Vorschriften ueber 3D-Geometrien, Koordinaten oder Farben.

### 1.2 Die Rohdaten (Graph-Instanzen)
Die Datenstruktur ist vollstaendig flach (`flat graph structure`). Verschachtelte Sub-Objekte innerhalb von Knoten sind unzulaessig; hierarchische Beziehungen werden ueber explizite Kanten abgebildet. Jeder Knoten traegt ein generisches `properties`-Dictionary fuer semantischen Detailreichtum.

### 1.3 Die Visual Mapping Engine (Darstellungsebene)
Die `VisualMappingEngine` bildet Rohdaten dynamisch auf 3D-Eigenschaften ab. Veraendert der Nutzer in der Benutzeroberflaeche das Farbschema oder die Groessenmetrik, wird ausschliesslich das Mapping neu berechnet. Der Graph selbst bleibt unveraendert im Speicher erhalten.

---

## 2. Multi-Harness-Infrastruktur und Single Source of Truth (SSoT)

> **Visualisierung:** Siehe [W:/AGENTS.md](file:///W:/AGENTS.md) und [02_TechStackUebersicht_002.mmd](02_TechStackUebersicht_002.mmd)

Ab Version 0.106.x setzt Nodges auf ein deterministisches Multi-Harness-Entwicklungsmodell mit einem einzigen lokalen Wahrheitsort:

```
        /home/unixusername/nodges   (WSL2 Linux, ext4)  <── Single Source of Truth
                    │
        ┌───────────┴───────────┐
        │                       │
   /workspace                  W:/  (Netzlaufwerk)
  [piCon im Container]        [conT in Antigravity Windows 11]
        │                       │
        └───────────┬───────────┘
                    │
              GitHub Remote
         (git@github.com:Banixx/Nodges.git)
```

- **Dateisystem-Identitaet:** conT (ueber Netzlaufwerk `W:/`) und piCon (im Docker-Container unter `/workspace`) arbeiten auf denselben physischen ext4-Inodes. Lokale Aenderungen sind auf beiden Seiten ohne Git-Sync sofort sichtbar.
- **Abkopplung von winAnt:** Das fruehere, fehleranfaellige Setup mit getrenntem Windows-Host-Checkout wurde vollstaendig eliminiert.
- **Git-Branch-Strategie:** Der alleinige Entwicklungszweig ist `main` (Branch `pi` ist geloescht). Versionierte Zwischenschritte werden per `tools/nodges-git.sh save` als Patch-Commits lokal gesichert; nur qualitaetsgepruefte Releases (`release`) gehen nach GitHub.
- **COM-Bus:** Inter-Harness-Kommunikation erfolgt ueber Dateisystem-Waechter (`tools/watch_com.mjs` und `W:/tools/watch_com.ps1`) auf Basis des Verzeichnisses `W:/com/`.

---

## 3. Frontend- und Engine-Architektur

Das Frontend ist als hochperformante Single-Page-Applikation ohne schwere UI-Frameworks konzipiert:

### 3.1 Technologie-Stack
- **TypeScript 5.3.3:** Gewaehrleistet durchgaengige Typsicherheit ueber Datenmodelle, Events und Three.js-Bindings.
- **Three.js 0.161.0:** Kern der 3D-Visualisierung mit InstancedMesh fuer Tausende Knoten, TubeGeometrien fuer Kanten und Raycasting.
- **Vite 5.1.4:** Ultraschneller Entwicklungsserver mit Hot-Module-Replacement und integrierter Reverse-Proxy-Kette fuer Backend-Dienste.
- **Biome 1.9.4:** Blitzschnelles Tooling fuer Linting (`npm run lint`) und Quelltext-Formatierung (`npm run format`).
- **lil-gui 0.19.1:** Schlanke, direkt in den Render-Kontext integrierte Steuerungspanels ohne DOM-Overhead.
- **Vanilla CSS (`index.css`):** Reines Modern-CSS mit Glassmorphism-Design fuer Dialoge, HUD und Overlays.

### 3.2 Modulare Manager-Architektur (ServiceContainer)
Die Anwendungslogik in `src/App.ts` und den zugeordneten Modulen ist modular aufgebaut:

| Manager / Service | Primaere Verantwortung |
|---|---|
| `StateManager` | Zentrale Zustandsverwaltung (Graphdaten, Filter, Selektionen, UI-Flags) mit typisierten Subscriber-Kategorien. |
| `CentralEventManager` | Entkoppeltes Event-Bussystem fuer Benutzerinteraktionen, Klicks und Tastaturereignisse. |
| `VisualMappingEngine` | Dynamische Transformation von Datenwerten in Farben, Skalierungen, Geometrien und Transparenzen. |
| `NodeManager` | Instanziierung, Transformation und Lifecycle-Verwaltung der 3D-Knoten (InstancedMesh). |
| `EdgeObjectsManager` | Generierung von 3D-Kanten (Linien, Splines, Zylinder) mit Pfeilspitzen und Flussanimationen. |
| `LayoutManager` | Ausfuehrung von Layout-Algorithmen (u. a. Force-Directed 3D) ueber dedizierte Background-Worker. |
| `CameraManager` | Orbit-Steuerung, Fokus-Fahrten, sanfte Tweenings und Minimap-Ausrichtung. |
| `SelectionManager` | Verwaltung selektierter Knoten, Kanten, Nachbarschafts-Highlights und Box-Auswahl. |
| `TimeManager` | 4D-Temporalleiste, Keyframe-Interpolation und zeitliches Ein-/Ausblenden von Entitaeten. |
| `MinimapManager` | Orthografische Szenenprojektion zur Orientierung in weitlaeufigen 3D-Raeumen. |
| `LLMService` | Kommunikationsbruecke zu Inferenz-Providern (OpenRouter, OpenAI, Anthropic, Ollama). |

---

## 4. Backend- und KI-Architektur

Ergaenzend zum reinen Browser-Client verfuegt Nodges ueber optionale, modulare Backend-Dienste:

### 4.1 LightRAG Backend (Graph Retrieval Augmented Generation)
- **Umgebung:** Python 3.10+ Virtual Environment in `lightrag-backend/venv`.
- **Server:** FastAPI mit Uvicorn auf Port 8000.
- **Vite Proxy:** Zugriff ueber den Vite-Dev-Server auf `http://localhost:5173/lightrag-api`.
- **Embeddings:** OpenRouter Modell `qwen/qwen3-embedding-8b` (Vektordimension 4096).
- **Speicher:** Lokale Vektordatenbank im Container unter `lightrag-backend/rag_storage`.

### 4.2 BYOK-Prinzip (Bring Your Own Key)
Nodges speichert keine API-Schluessel serverseitig. Nutzer tragen ihre Schluessel direkt im Frontend ein, wo sie verschluesselt im `localStorage` verbleiben.
