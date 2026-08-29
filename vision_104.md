# Plan 104: Umfassende interaktive Projektdarstellung für Nodges

## Ziel

Nodges soll nicht nur Wissensgraphen visualisieren, sondern auch seine eigene Softwarearchitektur, Datenflüsse und Entwicklungsgeschichte als interaktives 3D-Netzwerk darstellen.

Die Anwendung soll dadurch gleichzeitig als:

- 3D-Codekarte
- Architektur-Dokumentation
- Abhängigkeitsanalyse
- Debugging-Werkzeug
- Wissensbasis
- Präsentationsoberfläche

dienen.

## Ausgangslage

Nodges besitzt bereits eine geeignete technische Grundlage:

- TypeScript und Vite
- Three.js für die 3D-Darstellung
- `GraphData` als einheitliches Datenmodell
- Zod-Schemas zur Validierung
- `DataParser` zur Normalisierung
- `StateManager` für den Anwendungszustand
- `LayoutManager` für räumliche Anordnung
- `VisualMappingEngine` für visuelle Zuordnungen
- `NodeManager` und `EdgeObjectsManager` für Knoten und Kanten
- `SelectionManager`, `PathFinder` und `NetworkAnalyzer`
- `ImportManager` und `ExportManager`
- `LightRAGService` und FastAPI-Backend
- bestehende UI-Komponenten für Auswahl, Suche, Minimap und Details

Die vorhandene Graphengine sollte daher als Darstellungsschicht wiederverwendet und um projektspezifische Metadaten erweitert werden.

## Zielbild

Die Projektdarstellung wird in mehrere Ebenen gegliedert:

### 1. Projektübersicht

Eine Übersicht mit verständlicher Zusammenfassung und Kennzahlen:

- Projektname und Beschreibung
- verwendete Technologien
- Anzahl der Dateien
- Anzahl der TypeScript-Dateien
- Anzahl der UI-Komponenten
- Anzahl der Core-Services
- Anzahl der Tests
- Anzahl der Backend-Endpunkte
- Anzahl der Knoten und Kanten im Projektgraphen

Beispielhafte Projektbereiche:

```text
Projekt
├── Frontend
│   ├── Core
│   ├── UI
│   ├── Utilities
│   ├── Effects
│   └── Workers
├── Backend
├── Tests
├── Prompts
└── Konfiguration
```

### 2. Architekturkarte

Die Architektur wird als Netzwerk aus Modulen, Dateien und Komponenten dargestellt.

Beispiel:

```text
App
├── StateManager
├── SceneFactory
├── NodeManager
├── EdgeObjectsManager
├── LayoutManager
├── UIManager
├── InteractionManager
├── LightRAGService
└── DataParser
```

Beziehungstypen:

- `imports`
- `initializes`
- `uses`
- `extends`
- `communicates-with`
- `transforms`
- `renders`
- `tests`

Die Darstellung erfolgt hierarchisch und wird über Drill-down schrittweise detaillierter.

### 3. Modul- und Dateidetails

Beim Anklicken eines Knotens wird ein Detailpanel geöffnet.

Mögliche Informationen:

- Name
- Typ
- Dateipfad
- Beschreibung
- Verantwortlichkeit
- öffentliche und interne Methoden
- verwendete Typen
- Abhängigkeiten
- abhängige Module
- API-Aufrufe
- zugehörige Tests
- Testabdeckung
- Performance-Relevanz
- Änderungsverlauf
- potenzielle Risiken

Für Kanten werden Quelle, Ziel, Beziehungstyp und Bedeutung angezeigt.

### 4. Datenflussdarstellung

Wichtige Verarbeitungsketten werden sichtbar und animierbar gemacht.

#### Graphimport

```text
JSON-Datei
   ↓
ImportManager
   ↓
DataParser
   ↓
GraphDataSchema / Zod
   ↓
StateManager
   ↓
VisualMappingEngine
   ↓
NodeManager + EdgeObjectsManager
   ↓
Three.js-Szene
```

#### LightRAG-Abfrage

```text
Benutzerfrage
   ↓
SuggestionUI / LLMService
   ↓
LightRAGService
   ↓
HTTP /query
   ↓
FastAPI
   ↓
LightRAG
   ↓
Antwort + Graphkontext
   ↓
GraphData
   ↓
3D-Visualisierung
```

### 5. Laufzeitvisualisierung

Die 3D-Darstellung kann zusätzlich den aktuellen Systemzustand zeigen:

- aktive Komponenten leuchten auf
- ausgeführte Methoden werden animiert
- Datenflüsse bewegen sich entlang der Kanten
- Fehler werden rot markiert
- langsame Komponenten erhalten Warnfarben
- häufig verwendete Module werden größer dargestellt
- stark gekoppelte Module werden räumlich gruppiert

Vorgeschlagene visuelle Mappings:

```text
Node-Größe       = Anzahl abhängiger Module
Node-Farbe       = Projektschicht
Edge-Dicke       = Kommunikationshäufigkeit
Glow             = aktuell aktive Komponente
Position         = Architekturgruppe
Animation        = Datenfluss oder Prozessaktivität
```

### 6. Erklärende Dokumentation

Zu jeder Ebene und jedem Knoten sollen verständliche Erklärungen verfügbar sein:

- Was macht dieses Modul?
- Warum besteht diese Abhängigkeit?
- Was passiert beim Datenimport?
- Welche Komponenten sind für das Rendering verantwortlich?
- Welche Teile benötigen das LightRAG-Backend?
- Welche Auswirkungen hat eine Änderung an diesem Typ?

Mögliche Quellen:

- manuelle Beschreibungen
- JSDoc-Kommentare
- Tests
- Importbeziehungen
- Git-Historie
- KI-Analyse
- vorhandene Prompt-Dateien

## Darstellungsmodi

### Architekturmodus

Zeigt Module, Dateien, Abhängigkeiten, Schichten und Verantwortlichkeiten.

### Funktionsmodus

Gruppiert Komponenten nach Aufgaben:

- Datenimport
- Visualisierung
- Interaktion
- Analyse
- KI
- Export
- Performance
- Tests

### Datenflussmodus

Zeigt, wie Daten durch Import, Parsing, Validierung, Mapping, Rendering und Export fließen.

### Benutzerflussmodus

Zeigt den Ablauf aus Anwendersicht:

```text
Anwendung öffnen
   ↓
Graph laden
   ↓
Knoten auswählen
   ↓
Nachbarschaft untersuchen
   ↓
Layout ändern
   ↓
Frage an LightRAG stellen
   ↓
Ergebnis als Teilgraph visualisieren
   ↓
Daten exportieren
```

### Qualitäts- und Risikomodus

Zeigt unter anderem:

- ungetestete Module
- hohe Komplexität
- viele Abhängigkeiten
- stark gekoppelte Komponenten
- Performance-Engpässe
- Backend-Abhängigkeiten
- Fehlerzustände

### Zeitmodus

Kann mit der bestehenden `TimePlayerUI` verbunden werden:

- Einführung einer Komponente
- Architekturänderungen
- neue Build-Versionen
- Entwicklung der Abhängigkeiten
- historische Änderungen an Dateien

## Projektgraph als GraphData

Die Projektstruktur soll in das vorhandene `GraphData`-Format überführt werden.

Beispiel:

```json
{
  "system": "Nodges Project Architecture",
  "metadata": {
    "schemaVersion": "5.2",
    "description": "Automatisch erzeugte Architekturkarte des Projekts"
  },
  "dataModel": {
    "properties": {
      "layer": {
        "type": "categorical",
        "values": ["frontend", "core", "ui", "utility", "backend", "test"]
      },
      "complexity": {
        "type": "number"
      },
      "fileSize": {
        "type": "number"
      }
    }
  },
  "data": {
    "entities": [
      {
        "id": "src_App",
        "label": "App.ts",
        "kind": "file",
        "layer": "core",
        "filePath": "src/App.ts",
        "complexity": 42,
        "lines": 1400
      }
    ],
    "relationships": [
      {
        "id": "rel_App_StateManager",
        "source": "src_App",
        "target": "src_core_StateManager",
        "relation": "imports"
      }
    ]
  }
}
```

## Automatische Extraktion

Ein Generator soll den Projektgraphen automatisch erstellen:

```text
scripts/generate-project-graph.ts
```

Auszuwertende Datenquellen:

- Dateisystem
- TypeScript-Importe und -Exporte
- Klassen, Interfaces und Funktionen
- Tests
- `package.json`
- Python-Imports
- FastAPI-Routen
- Git-Historie
- JSDoc-Kommentare

Ergebnis:

```text
project-graph.json
```

Dieses JSON kann anschließend über den bestehenden `ImportManager` geladen werden.

Für TypeScript sollte nach Möglichkeit die TypeScript Compiler API eingesetzt werden, damit Importe, Symbole und Abhängigkeiten zuverlässig erkannt werden.

## Backend-Darstellung

Das FastAPI- und LightRAG-Backend soll als eigener Teilgraph erscheinen.

Wichtige Knoten:

- FastAPI
- LightRAG
- OpenAI-kompatible API
- Embedding-Modell
- RAG Storage
- Datenbankverwaltung
- LightRAGService

Wichtige Beziehungen:

- FastAPI initialisiert LightRAG
- LightRAG verwendet das LLM
- LightRAG verwendet Embeddings
- Backend speichert Daten im RAG Storage
- Frontend fragt `/query` ab
- Frontend sendet Daten an `/insert`

Zu erfassende API-Endpunkte:

- `GET /health`
- `POST /query`
- `POST /insert`
- `GET /databases`
- `POST /databases/select`
- `POST /databases/create`

## Benutzeroberfläche

Vorgeschlagene neue Komponenten:

```text
src/ui/ProjectOverviewPanel.ts
src/ui/ProjectDetailPanel.ts
src/ui/ProjectSearchUI.ts
src/ui/ProjectFilterUI.ts
src/ui/DependencyPanel.ts
src/ui/DataFlowPanel.ts
src/ui/ProjectLegend.ts
```

Vorgeschlagene Tabs im Detailpanel:

```text
[Übersicht] [Code] [Abhängigkeiten] [Datenfluss] [Tests] [Historie]
```

Zusätzliche Navigation:

- zentrale Suche
- Filter nach Schicht, Typ und Funktion
- Breadcrumb-Navigation
- Drill-down vom Projekt bis zur Methode
- „Nur Nachbarschaft anzeigen“
- „Aufrufpfad anzeigen“
- „Zugehörige Tests anzeigen“
- „KI-Erklärung erzeugen“
- Teilgraph exportieren

Beispiel-Breadcrumb:

```text
Nodges / Frontend / Core / InteractionManager / SelectionHandler
```

## KI-gestützte Erklärung

Die LightRAG-Integration kann um projektspezifische Fragen erweitert werden:

- Wie verarbeitet Nodges einen importierten Graphen?
- Welche Komponenten sind für die Darstellung von Kanten verantwortlich?
- Was passiert, wenn eine LightRAG-Abfrage fehlschlägt?
- Welche Module sind besonders stark gekoppelt?
- Welche Tests prüfen den DataParser?
- Wie kann die Performance bei großen Graphen verbessert werden?

Die KI sollte nicht nur Text liefern, sondern zusätzlich relevante Knoten, Kanten und Verarbeitungsschritte zurückgeben.

Beispiel:

```json
{
  "answer": "...",
  "relevantNodes": [
    "src_App",
    "src_core_DataParser",
    "src_utils_ImportManager"
  ],
  "relevantEdges": [
    "rel_ImportManager_DataParser"
  ],
  "steps": [
    "Datei wird eingelesen",
    "Daten werden normalisiert",
    "Schema wird validiert",
    "Graph wird aufgebaut"
  ]
}
```

Die Anwendung kann die gefundenen Knoten markieren und den erklärten Datenfluss animieren. Quellen und Unsicherheiten sollten angezeigt werden.

## Erweiterungsstruktur

Vorgeschlagene neue Projektmodule:

```text
src/project/
├── ProjectGraphGenerator.ts
├── ProjectGraphTypes.ts
├── ProjectMetadataService.ts
├── ImportGraphAnalyzer.ts
├── ApiGraphAnalyzer.ts
├── TestCoverageAnalyzer.ts
├── GitHistoryAnalyzer.ts
└── ProjectGraphLoader.ts
```

Wiederzuverwendende bestehende Komponenten:

```text
DataParser
StateManager
LayoutManager
VisualMappingEngine
NodeManager
EdgeObjectsManager
SelectionManager
PathFinder
NetworkAnalyzer
LightRAGService
```

## Umsetzungsphasen

### Phase 1: Statische Projektkarte

- Projektdateien erfassen
- Verzeichnisse abbilden
- TypeScript-Imports analysieren
- Projektgraph als `GraphData` erzeugen
- Graph über `ImportManager` laden
- Farben nach Projektschicht vergeben
- Knotengröße anhand der Abhängigkeiten bestimmen

### Phase 2: Detailansichten

- Detailpanel ergänzen
- Datei- und Modulbeschreibungen anzeigen
- Methoden und Abhängigkeiten auflisten
- zugehörige Tests anzeigen
- Suche und Filter implementieren

### Phase 3: Datenfluss

- Importfluss abbilden
- Renderingfluss abbilden
- LightRAG-Fluss abbilden
- Verarbeitungsschritte hervorheben und animieren

### Phase 4: Qualitätsdaten

- Dateigröße und Codezeilen erfassen
- Komplexität bestimmen
- Änderungsfrequenz aus Git auslesen
- Testabdeckung einbinden
- Abhängigkeitstiefe und Kopplung berechnen
- Architekturprobleme markieren

### Phase 5: KI-Erklärungen

- Fragen zum Projekt ermöglichen
- automatische Zusammenfassungen erzeugen
- relevante Teilgraphen markieren
- erklärende Animationen erstellen
- Quellenverweise anzeigen

### Phase 6: Präsentation und Export

- Präsentationsmodus
- geführte Projekttour
- Screenshot-Export
- PDF- oder HTML-Bericht
- JSON-Export von Teilgraphen
- Architekturbericht

## Empfohlener erster Prototyp

Die erste Umsetzung sollte bewusst klein beginnen und die bestehende Infrastruktur nutzen:

1. Projektdateien automatisch erfassen
2. TypeScript-Imports analysieren
3. Projektgraph als `GraphData` erzeugen
4. Graph über `ImportManager` laden
5. Farben nach Projektschicht vergeben
6. Knotengröße anhand der Abhängigkeiten bestimmen
7. Detailpanel für ausgewählte Dateien ergänzen
8. Suche und „Nur Nachbarschaft anzeigen“ hinzufügen

Damit entsteht bereits eine überzeugende technische Projektdarstellung, ohne eine separate Visualisierungsengine entwickeln zu müssen.

## Leitgedanke

> Nodges visualisiert nicht nur Wissensgraphen, sondern auch seine eigene Architektur und seine eigenen Datenflüsse.

