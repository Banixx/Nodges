--- KAPITEL: 00_inhalt.md ---

# Inhaltsverzeichnis der Dokumentation

Dieses Dokument bietet eine strukturierte Übersicht über die gesamte technische und konzeptionelle Dokumentation des Projekts "Nodges" (3D Network Visualization with Three.js).

- [01 Einführung und Projektvision](01_Einfuehrung_und_Projektvision.md)
- [02 Systemarchitektur und Design-Prinzipien](02_Systemarchitektur_und_Design_Prinzipien.md)
- [03 Datenmanagement und Validierung](03_Datenmanagement_und_Validierung.md)
- [04 3D-Rendering und Szenen-Management](04_3D_Rendering_und_Szenen_Management.md)
- [05 Visuelle Effekte und Feedback-Systeme](05_Visuelle_Effekte_und_Feedback_Systeme.md)
- [06 Interaktions-Design und Input-Processing](06_Interaktions_Design_und_Input_Processing.md)
- [07 Algorithmen und Layout Engine](07_Algorithmen_und_Layout_Engine.md)
- [08 Benutzeroberfläche (UI) und UX-Design](08_Benutzeroberflaeche_und_UX.md)
- [09 Utilities und Hilfssysteme](09_Utilities_und_Hilfssysteme.md)
- [10 Entwicklungs-Guide und Deployment](10_Entwicklungs_Guide_und_Deployment.md)
- [11 Node und Edge Erstellung: Technischer Deep-Dive](11_Node_Edge_Mesh_Creation_Report.md)
- [12 Historie und Entscheidungen (ADRs)](12_Historie_und_Entscheidungen.md)
- [13 Glossar und technische Begriffe](13_Glossar.md)
- [14 Troubleshooting und FAQ](14_Troubleshooting_und_FAQ.md)
- [15 Quickstart und Tutorial-Guide](15_Quickstart_und_Tutorial.md)
- [17 Wireframe-Kanten-Vorschau](17_Wireframe_Kanten_Vorschau.md)


--- KAPITEL: 01_Einfuehrung_und_Projektvision.md ---

# 01 Einführung und Projektvision

## 1.1 Identität und Daseinsberechtigung

### Was ist Nodges?

**Nodges** (ein Portmanteau aus **NO**des und e**DGES**) definiert die Netzwerkanalyse neu. Es ist nicht nur ein weiterer Graph-Viewer, sondern eine hochspezialisierte **Spatial Analytics Engine** für den Browser. In einer Ära, in der Datensätze nicht nur größer, sondern auch komplexer und vernetzter werden ("Hyperconnected Data"), versagen klassische 2D-Ansätze oft. Nodges nutzt die dritte Dimension nicht als Gimmick, sondern als notwendigen Freiheitsgrad, um dichte Topologien zu entflechten.

### Die Philosophie: "Spatial Literacy"

Wir glauben daran, dass der Mensch räumlich denkt. Unser Gehirn ist darauf trainiert, Muster in 3D-Umgebungen zu erkennen, Tiefe einzuschätzen und "hinter" Dinge zu blicken. Nodges übersetzt abstrakte mathematische Graphen in eine **greifbare, räumliche Umgebung**.

* **Immersion statt Abstraktion**: Der Nutzer blickt nicht *auf* die Daten, er befindet sich *inmitten* der Daten.
* **Intuition statt Berechnung**: Komplexe Cluster werden nicht durch Zahlenkolonnen, sondern durch visuelle Dichte und räumliche Nähe erfahrbar.

### Das "Hairball-Problem" als Gegner

In der 2D-Visualisierung führen schon wenige hundert Knoten mit starken Verbindungen zum sogenannten "Hairball-Effekt": Ein undurchdringliches schwarzes Knäuel aus Linien, in dem jede Information verloren geht.
**Nodges löst dies radikal:**

1. **Explosion in Z**: Wir entzerren den Graphen entlang der Tiefenachse. Was in 2D übereinander liegt, schwebt in 3D hintereinander.
2. **Dynamische Perspektive**: Durch die Orbit-Steuerung kann der Analyst den "Blickwinkel des Verständnisses" selbst wählen. Verdeckungen lösen sich durch eine leichte Drehung der Maus auf.

---

## 1.2 Die Drei Säulen der Architektur

Nodges ruht auf drei fundamentalen Prinzipien, die jede technische Entscheidung leiten:

### I. Kompromisslose Performance ("Scale Matters")

Ein Analyse-Tool darf nicht ruckeln. Niemals. Wenn die Framerate einbricht, bricht der gedankliche Flow des Analysten.

* **Technik**: Wir nutzen **Hardware Instancing** (`THREE.InstancedMesh`) für Knoten. Das erlaubt es der GPU, 50.000 Kugeln mit einem einzigen Draw-Call zu zeichnen, statt 50.000 einzelne Befehle zu verarbeiten.
* **Memory Management**: Wir implementieren striktes Resource Disposal. Geometrien und Materialien werden explizit aus dem VRAM der Grafikkarte entfernt, sobald sie nicht mehr benötigt werden.

### II. Haptische Interaktivität ("Touch the Data")

Daten müssen sich "echt" anfühlen.

* **Präzision**: Unser eigens entwickeltes Raycasting-System (`RaycastManager.ts`) "fängt" den Mauszeiger auch auf dünnen Linien oder kleinen Knoten ein, indem es intelligente Toleranzbereiche nutzt.
* **Feedback**: Jede Interaktion löst eine mikroskopische Reaktion aus – ein Aufleuchten, ein Pulsieren, eine Cursor-Änderung. Das System "lebt".

### III. Ästhetische Reduktion ("Clarity through Beauty")

Hässliche Tools machen müde. Ein unruhiges Interface erhöht die kognitive Last ("Cognitive Load").

* **Glassmorphism**: Wir nutzen moderne CSS-Techniken (`backdrop-filter: blur`), um UI-Elemente wie Milchglas über der 3D-Szene schweben zu lassen. Das erhält den Kontext.
* **Color Theory**: Wir arbeiten im HSL-Farbraum, um harmonische Farbverläufe zu generieren, die wissenschaftlich lesbar sind (z.B. perzeptiv gleichförmige Helligkeit).

---

## 1.3 Technologisches Fundament

Nodges basiert auf einem "Bleeding Edge" Stack, der auf Langlebigkeit und Typsicherheit ausgelegt ist.

### Der Core-Stack (Stand v0.101.3)

* **TypeScript (v5.3.3)**: Unsere Versicherung gegen Laufzeitfehler. Strenge Typisierung verhindert "undefined is not a function" Crashes und ermöglicht den massiven Einsatz von Intellisense.
* **Three.js (v0.161.0)**: Die mächtigste WebGL-Library der Welt. Wir nutzen nicht nur den Standard-Renderer, sondern greifen tief in die Shader-Pipeline ein.
* **Vite (v5.1.4)**: Unser Build-Tool der Wahl. Es bietet Hot-Module-Replacement (HMR) im Millisekunden-Bereich, was rapid-prototyping von Shadern ermöglicht.
* **Zod (v3.22.4)**: Der Gatekeeper. Importierte JSON-Daten werden zur Laufzeit validiert. Wenn ein Datensatz defekt ist (z.B. fehlende IDs), fängt Zod dies ab und liefert eine präzise Fehlermeldung, bevor die App abstürzen kann.

### Architektur-Muster

Wir verfolgen einen strikten **Manager-Orchestrator-Ansatz**:

1. **`App.ts`**: Der Dirigent. Initialisiert die Engine und hält die Instanzen.
2. **`StateManager.ts`**: Die "Single Source of Truth". Alle Änderungen (Selektion, Farben, Layout-Modus, UI-Komplexitätsmodus) fließen hier zusammen. Komponenten abonnieren Änderungen (Observer Pattern).
3. **`CentralEventManager.ts`**: Ein Event-Bus, der Input-Signale (Mausklicks, Tasten) in semantische Aktionen übersetzt ("Node Selected" statt "Click at 500,300").
4. **`Worker Threads`**: Rechenintensive Aufgaben, wie die $O(n^2)$ Berechnungen des Force-Directed Layouts, werden in Web Worker ausgelagert, damit das UI im Main-Thread responsive bleibt.

---

## 1.4 Funktionen und Features

### Navigation & Exploration

* **Cinematic Camera**: "Fly-to" Animationen interpolieren sanft zwischen Positionen (Spherical Linear Interpolation), um Übelkeit (Motion Sickness) zu vermeiden und die räumliche Orientierung zu bewahren.
* **Tastatur-Shortcuts**: Power-User können die App komplett ohne Maus steuern (z.B. `Space` für Pause, `R` für Reset).

### Visualisierung & Visual Mapping Engine

* **Tube-Edges**: Kanten sind keine einfachen Linien (`gl.LINES`), sondern volumetrische Röhren (`TubeGeometry`). Das sieht nicht nur besser aus, sondern erlaubt auch korrekte Beleuchtung und Schattenwurf.
* **Smart Halos**: Selektierte Objekte erhalten einen "Heiligenschein" (Halo), der mittels eines invertierten, transparenten Shell-Meshes erzeugt wird. Dieser ist immer "hinter" dem Objekt sichtbar, egal wie die Kamera steht.
* **Dynamisches Visual Mapping**: Die `VisualMappingEngine` ordnet Datenattributen (z.B. `age`, `region`, `type`) dynamisch Farben (Heatmaps, Kategorien), Größen oder visuelle Presets zu.

### Benutzeroberfläche & Dateimanagement

* **Drei-Stufen-Modus (UI Complexity Mode)**: Das Interface kann zwischen "Simple", "Expert" und "Dev" umgeschaltet werden. Die Sichtbarkeit von Tabs und Controls wird dynamisch über CSS-Regeln (`data-min-mode`) gesteuert.
* **Dateiverwaltung**: Direktes Erstellen ("New"), Laden ("Open") und Exportieren ("Save As") von Graphen über ein benutzerdefiniertes Modal in diversen Formaten wie JSON und Markdown.

### Layout Engine

Während 2D-Tools oft nur Bäume gut darstellen, bietet Nodges Physik:

* **Force-Directed**: Eine Partikelsimulation, die versucht, ein energetisches Gleichgewicht zu finden. Cluster bilden sich organisch.
* **Deterministisch**: Grid, Sphere und Helix-Layouts für strukturierte Daten.

---

## 1.5 Positionierung & Vision

### Warum nicht D3.js oder Cytoscape?

Diese Bibliotheken sind Goldstandards für das Web, aber sie sind 2D-first und DOM/SVG-basiert. Bei 1.000+ Elementen bricht die DOM-Performance ein. Nodges rendert **Pixel, keine HTML-Elemente**. Wir sind keine Konkurrenz für Balkendiagramme, sondern für komplexe Netzwerktopologien.

### Warum keine Game Engine (Unity/Unreal)?

Web-Native ist die Zukunft. Nodges erfordert **keine Installation**, keine 5GB Downloads und keinen speziellen App-Store. Ein Link genügt. Das ermöglicht den Einsatz in strengen IT-Umgebungen (Firmen-Laptops), wo `.exe` Dateien verboten sind.

### Die Zukunft (Roadmap)

* **Kollaboration**: Ein "Google Docs für Graphen", wo mehrere Analysten im selben Raum arbeiten.
* **AI-Support**: "Zeige mir Anomalien": LLMs, die Graphen semantisch verstehen und Filter steuern.

---
*Dokumentations-Status: V2.1 (Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 02_Systemarchitektur_und_Design_Prinzipien.md ---

# 02 Systemarchitektur und Design-Prinzipien

Dieses Kapitel widmet sich dem technischen Fundament von Nodges. Die Architektur folgt strikten Prinzipien der **Modularisierung** (`Separation of Concerns`) und **Entkopplung**, um Wartbarkeit, Testbarkeit und Erweiterbarkeit über Jahre hinweg zu gewährleisten.

## 02.1 Architektur-Überblick: Das "Manager-Orchestrator-Pattern"

Nodges vermeidet monolithischen Code ("God Classes"). Stattdessen implementiert es eine Architektur, die wir als **Manager-Orchestrator-Pattern** bezeichnen.

### Die Rolle der `App`-Klasse

Die Klasse `App.ts` ist der **Orchestrator**. Sie enthält kaum eigene Geschäftslogik. Ihre Aufgaben sind:

1. **Bootstrapping**: Initialisierung der 3D-Szene (Three.js) und des DOM.
2. **Dependency Injection**: Instanziierung aller Manager und Injektion der Abhängigkeiten (z.B. bekommt der `RaycastManager` Zugriff auf die `Camera`).
3. **Loop-Management**: Steuerung des zentralen Render-Loops (`requestAnimationFrame`).

### Das Manager-Ecosystem

Jeder funktionale Aspekt der Anwendung wird in eine spezialisierte Manager-Klasse gekapselt. Ein Manager kümmert sich um *genau eine* Domäne:

| Manager | Verzeichnis | Verantwortlichkeit |
| :--- | :--- | :--- |
| `StateManager` | core/ | Single Source of Truth, Observer-Pattern, State-Subscriptions. Verwaltet auch UI Complexity Mode und File-State. |
| `CentralEventManager` | core/ | Event-Bus, Abstraktion von Browser-Events, semantische Aktionen. |
| `NodeManager` | core/ | Erstellung, Update und Rendering der Knoten (InstancedMeshes). |
| `EdgeObjectsManager` | core/ | Verwaltung der Kanten (Tubes), Handling von Kurvengeometrien. |
| `LayoutManager` | core/ | Berechnung von Positionen ($x, y, z$), Steuerung von Physik-Simulationen. |
| `UIManager` | core/ | Steuerung des HTML-Overlays (Panels, Tabs, Ladebalken), Modus-Umschaltung, Brücke zum DOM. |
| `InteractionManager` | core/ | Interpretation von User-Inputs (Klick, Drag) in Aktionen. |
| `DataParser` | core/ | Format-Erkennung, Zod-Validierung, Normalisierung. |
| `VisualMappingEngine` | core/ | Übersetzung von Datenwerten in visuelle Eigenschaften. |
| `HighlightManager` | effects/ | Visuelle Effekte (Selektion, Hover, Glow), Materialzustände. |
| `RaycastManager` | utils/ | Mathematische Berechnung von Schnittpunkten Maus ↔ 3D-Welt. |

Siehe Architektur-Diagramm: [mermaid_03.mmd](mermaid_03.mmd)

### Vermeidung von "Spaghetti-Code"

Um eine zu enge Kopplung zu vermeiden, dürfen Manager (mit wenigen Ausnahmen) nicht direkt aufeinander zugreifen. Wenn der `LayoutManager` fertig ist, ruft er nicht direkt `NodeManager.update()` auf. Stattdessen nutzen sie zwei Kommunikationswege:

1. **Shared State** (via `StateManager`)
2. **Events** (via `CentralEventManager`)

## 02.2 Zentrales Zustandsmanagement (`StateManager`)

Der `StateManager` ist das Herzstück der Reaktivität in Nodges ("Single Source of Truth").

### Reaktives State-Design

Ähnlich wie Redux oder Vuex hält der `StateManager` den kompletten relevanten Anwendungszustand in einem zentralen Objekt. Dazu gehören:

* `selectedObject`: Welcher Knoten ist gerade aktiv?
* `hoveredObject`: Wo ist die Maus?
* `graphData`: Die aktuellen Rohdaten.
* `config`: Visuelle Einstellungen (Farben, Größen).
* `uiMode`: Aktueller UI-Komplexitätsmodus ("simple", "expert", "dev").

### Observer-Pattern

Der Manager implementiert ein **Publish/Subscribe** System. Komponenten können sich auf spezifische State-Änderungen abonnieren.

```typescript
// Beispiel: Der UIManager lauscht auf Selektions-Änderungen
stateManager.subscribe('selection', (newState) => {
    if (newState.selectedObject) {
       uiManager.openPanel(newState.selectedObject);
    } else {
       uiManager.closePanel();
    }
});
```

### Batch-Updates & Performance

Jede State-Änderung könnte potenziell teure Render-Updates auslösen. Der `StateManager` unterstützt daher **Batch-Updates**. Mehrere logische Änderungen (z.B. "Selektiere Node A" UND "Setze Kamera-Fokus auf A" UND "Ändere UI-Text") werden gesammelt und lösen nur *ein* Benachrichtigungs-Event ("Tick") aus. Dies verhindert unnötige Zyklen ("Data Thrashing").

## 02.3 Event-Driven Architecture (`CentralEventManager`)

Der `CentralEventManager` (CEM) ist die Abstraktionsschicht zwischen dem Browser (DOM) und der Applikationslogik.

### Abstraktion von Raw Inputs

Der CEM fängt rohe Browser-Events (`mousemove`, `pointerdown`, `keydown`) ab. Er normalisiert diese – z.B. rechnet er Pixel-Koordinaten in relative Screen-Koordinaten um – und reichert sie mit Kontext an. Er fungiert als "Pförtner": Kein anderer Manager sollte direkt `document.addEventListener` aufrufen.

### Der globale Event-Bus

Über Input-Events hinaus dient der CEM als systemweiter Event-Bus für entkoppelte Kommunikation ("Fire and Forget").

* Module A feuert: `CEM.emit('DATA_LOADED', { nodes: 500 })`
* Module B (z.B. ein Logging-Service) hört zu: `CEM.on('DATA_LOADED', ...)`

So kann man neue Funktionen hinzufügen (z.B. Analytics), ohne den bestehenden Code (den Loading-Prozess) ändern zu müssen.

## 02.4 Datenfluss-Diagramme

Der Datenfluss in Nodges ist streng **unidirektional** konzipiert, um Seiteneffekte zu minimieren und den Status deterministisch zu halten.

### Flow 1: Daten-Import bis Rendering

Dieser Prozess beschreibt, wie aus einer JSON-Datei ein 3D-Bild wird.

Siehe Diagramm: [mermaid_01.mmd](mermaid_01.mmd)

### Flow 2: User-Interaktion (Loop of Interaction)

Wie ein Mausklick verarbeitet wird.

Siehe Diagramm: [mermaid_02.mmd](mermaid_02.mmd)

## 02.5 Design-Prinzipien im Detail

### 1. "Prefer Immutability where possible"

Auch wenn JavaScript Objekte per Reference übergibt, versuchen wir im State-Management, Daten nicht "in place" zu mutieren, sondern neue State-Objekte zu erzeugen. Dies erleichtert das Debugging (Time-Travel) und verhindert "Spooky Action at a Distance".

### 2. "Graceful Degradation"

Wenn ein Feature auf dem System des Nutzers nicht verfügbar ist (z.B. WebGL 2.0 Features oder Web Workers), sollte die App nicht abstürzen, sondern auf einen einfacheren Modus zurückfallen (z.B. einfacheres Rendering, synchrone Berechnung).

### 3. "Configuration over Code"

Das System ist hochgradig konfigurierbar. Farben, Größenverhältnisse, Physik-Parameter und Rendering-Optionen sind nicht hardcoded, sondern in Config-Objekten zentralisiert. Dies ermöglicht schnelle Anpassungen (auch durch Designer) ohne Code-Eingriffe.

---
*Ende Kapitel 02*


--- KAPITEL: 03_Datenmanagement_und_Validierung.md ---

# 03 Datenmanagement und Validierung

Ein robustes, typ-sicheres Datenmanagement ist das Rückgrat von Nodges. Da die Anwendung Graphen aus völlig unterschiedlichen Quellen verarbeiten muss, ist eine strikte Validierungsstrategie unerlässlich, um die Stabilität der 3D-Engine zu gewährleisten.

## 03.1 Das Datenmodell: Standardisierung auf Build 3

Um die Codebasis sauber und performant zu halten, wurde das Datenmodell von Nodges vollständig standardisiert. Alle Legacy-Formate (Build 1 und Build 2) wurden komplett aus dem System entfernt.

### Der Build 3 Standard (Modern Semantic Graph)

Nodges unterstützt ausschließlich das Schema "Build 3" (schemaVersion "3.0"). Es erzwingt eine klare Trennung zwischen Strukturdaten (Topologie), Metadaten (Semantik) und Visuellen Mappings (Style).

**Komponenten:**

1. **System/Metadata**: Beinhaltet Systemidentifikation ("Nodges") und zwingend die `schemaVersion: "3.0"`.
2. **Data Model**: Deklariert die verfügbaren Attribute global unter `properties`. Jedes Attribut wird mit Typ (z.B. `categorical` oder `continuous`) beschrieben.
3. **Data**: Kapselt die konkreten Objekte.
   * `entities` (Knoten): Jede Entity besitzt eine eindeutige `id`, einen `type`, optionale `position`-Koordinaten (x, y, z) und einen `stateVector` (für dynamische Attribute).
   * `relationships` (Kanten): Jede Relationship besitzt einen `type`, eine Quelle (`source` oder `start`), ein Ziel (`target` oder `end`) und einen optionalen `stateVector` (für Kantenattribute).
4. **VisualMappings**: Ein Regelwerk, das Datenattribute via vordefinierte Presets (`defaultPresets`) in Grafik-Eigenschaften (z.B. Farben, Größen, Linienstärken) übersetzt.

Beispiel für ein valides Build 3 JSON:

```json
{
  "system": "Nodges",
  "metadata": {
    "created": "2026-07-01",
    "schemaVersion": "3.0"
  },
  "dataModel": {
    "properties": {
      "status": { "type": "categorical", "description": "Status des Knotens" },
      "load": { "type": "continuous", "description": "Aktuelle Systemlast" }
    }
  },
  "data": {
    "entities": [
      {
        "id": "node_01",
        "type": "server",
        "stateVector": {
          "status": "online",
          "load": 82.5
        }
      }
    ],
    "relationships": [
      {
        "type": "connection",
        "source": "node_01",
        "target": "node_02"
      }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "global_node": {
        "color": { "source": "categorical", "function": "categorical", "field": "status", "palette": "category10" },
        "size": { "source": "continuous", "function": "linear", "field": "load", "range": [0.5, 3.0] }
      }
    }
  }
}
```

## 03.2 Schema-Validierung mit Zod (The Gatekeeper)

Nodges vertraut keinen externen Daten. Um Laufzeitfehler der Rendering-Engine zu verhindern, wird **Zod** eingesetzt. Zod ist eine Schema-Validierungs-Bibliothek für TypeScript.

### Warum Zod?

In reinem TypeScript sind Typen zur Laufzeit nicht mehr vorhanden. Ein `JSON.parse()` liefert `any`. Wenn das JSON fehlerhaft ist, merkt man es erst, wenn die App abstürzt. Zod prüft die Daten zur Laufzeit Byte für Byte gegen das Build 3 Schema.

### Schema-Definition & Type Inference

Die TypeScript-Typen werden in `types.ts` direkt aus dem Zod-Schema abgeleitet. Das verhindert, dass Validierungscode und Type-Interfaces asynchron werden.

*(Ausschnitt aus `types.ts`)*

```typescript
export const PropertySchema = z.object({
    type: z.enum(['categorical', 'continuous']),
    description: z.string().optional()
});

export const DataModelSchema = z.object({
    properties: z.record(PropertySchema).optional()
});

export const EntitySchema = z.object({
    id: z.coerce.string(),
    type: z.string(),
    label: z.string().optional(),
    position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0)
    }).optional(),
    stateVector: z.record(z.any()).optional()
}).passthrough();
```

### Error-Handling

Wenn Zod einen Fehler findet, fängt Nodges dieses `ZodError`-Objekt ab und generiert lesbare Fehlermeldungen für den Benutzer, anstatt kryptische Stacktraces im Browser anzuzeigen.

## 03.3 Der `DataParser` & Normalisierung

Der `DataParser.ts` ist die zentrale Validierungsklasse.

### Pipeline-Schritte

1. **Schema-Verifikation**: Der Parser prüft explizit die `schemaVersion` in den Metadaten. Entspricht diese nicht exakt `"3.0"`, wird die Datei sofort abgelehnt.
2. **Validierung**: Das Build 3 Zod-Schema wird auf den Datensatz angewendet.
3. **Normalisierung**: Fehlende oder unvollständige Felder werden normalisiert (z.B. Fallbacks für Metadaten gesetzt, IDs in Strings konvertiert).
4. **Indexing**: Um den Zugriff in O(1) zu ermöglichen, werden Arrays in Maps umgewandelt.

## 03.4 Zukünftige Entwürfe (Build 4)

Entwürfe für ein zukünftiges temporales Format ("Build 4") werden getrennt gepflegt und dienen als Richtlinie für künftige Erweiterungen (z.B. zur Verwaltung historischer Zustände und Zeitachsen-Visualisierungen), haben jedoch keinen Einfluss auf das aktive Build 3 System.

---
*Ende Kapitel 03*


--- KAPITEL: 04_3D_Rendering_und_Szenen_Management.md ---

# 04 3D-Rendering und Szenen-Management

Die grafische Darstellung ist das Herzstück von Nodges. Dieses Kapitel taucht tief in die Implementierung der 3D-Engine mittels **Three.js** ein und erläutert die Strategien, mit denen wir tausende Objekte flüssig (60 FPS) im Browser rendern.

## 04.1 Three.js Integration & Setup

Nodges nutzt Three.js als Abstraktionsschicht über WebGL. Der Renderer wird vollständig in der `App`-Klasse gekapselt und initialisiert.

### Der Szenen-Graph (Scene Graph)

* **Scene**: Die Wurzel aller Objekte.
* **Camera**: Wir nutzen eine `PerspectiveCamera` (FOV 75°). Die `Far`-Clipping-Plane wird dynamisch angepasst, um auch riesige Graphen vollständig darzustellen, ohne Z-Fighting Fehler bei nahen Objekten zu riskieren.
* **Renderer**: Der `WebGLRenderer` ist konfiguriert für:
  * `antialias: true`: Glättung von Treppchen-Effekten (MSAA).
  * `alpha: true`: Transparenter Hintergrund (falls nötig).
  * `logarithmicDepthBuffer: true`: Essentiell für Netzwerke mit extremen Größenunterschieden, um Flackern bei überlappenden Geometrien zu verhindern.

### Beleuchtung (Lighting Strategy)

Licht ist nicht nur Ästhetik, es ist Information (Tiefe, Form). Wir nutzen ein **3-Punkt-Setup**:

1. **AmbientLight**: Weiches Grundlicht, hellt Schatten auf (Intensität 0.4).
2. **DirectionalLight (Key Light)**: Simuliert Sonnenlicht, wirft Schatten, definiert die Form der Kugeln (Specular Highlights).
3. **HemisphereLight**: Simuliert Himmels- und Boden-Reflektion für natürlicheren Look.

## 04.2 High-Performance Rendering: Instancing

Wenn ein Graph 10.000 Knoten hat, darf Three.js nicht 10.000 einzelne `Mesh`-Objekte erstellen. Jeder `Mesh` erzeugt einen "Draw Call" an die GPU (CPU-Overhead). Das würde den Browser bei ~1000 Objekten in die Knie zwingen.

### Die Lösung: `InstancedMesh`

Nodges nutzt aggressiv **Instancing**.

* **Konzept**: Wir senden die Geometrie (z.B. eine Kugel mit vielen Polygonen) *einmal* an die Grafikkarte.
* **Instanzen**: Dann senden wir eine Liste von Transformationen (Position, Rotation, Skalierung) und Farben.
* **Resultat**: Die GPU zeichnet alle 10.000 Knoten in einem *einzigen* Draw Call.

### Implementation Details (`NodeManager`)

Die Verwaltung ist komplex:

1. **Dummy Object**: Ein temporäres `Object3D` ("Dummy") wird genutzt, um Positionen zu berechnen.
2. **Matrix Updates**: `dummy.updateMatrix()` generiert eine 4x4 Matrix.
3. **Buffer Write**: Diese Matrix wird in den Buffer des `InstancedMesh` an Index `i` geschrieben (`setMatrixAt(i, matrix)`).
4. **Flags**: `instanceMatrix.needsUpdate = true` signalisiert Three.js, die Daten bei nächten Frame an die GPU zu pushen.

*Herausforderung*: Da Instancing alles zusammenfasst, ist individuelles Picking ("Welche Kugel habe ich geklickt?") schwieriger. Node-IDs müssen auf `instanceId`-Indizes gemappt werden.

## 04.3 Kanten-Visualisierung: Die Königsdisziplin

Siehe Diagramm zur Rendering-Strategie: [mermaid_05.mmd](mermaid_05.mmd)

Kanten (Edges) sind komplexer als Knoten, da sie sich verformen müssen und Abhängigkeiten zu *zwei* Knoten haben.

### Kanten-Visualisierung: TubeGeometries

Aktuell setzt Nodges einheitlich auf **TubeGeometry** für alle Verbindungen.

* **Kurven-Logik**: Wir berechnen eine **Bézier-Kurve** (`QuadraticBezierCurve3`) zwischen Start und Ziel.
* **Multi-Edge Support**: Wenn zwei Knoten durch *mehrere* Kanten verbunden sind, bekommt jede Kante einen anderen Offset (Control Point), sodass sie wie Kabelstränge nebeneinander liegen ("Bauchig").
* **Visuelle Qualität**: Dies erlaubt organische, gut lesbare Verbindungen, ist jedoch rechenintensiver als einfache Linien.
* *(Hinweis: Eine Optimierung mittels Instanced Cylinders für einfache Verbindungen ist als zukünftige Performance-Maßnahme denkbar, aktuell aber zugunsten der visuellen Konsistenz nicht aktiv.)*

## 04.4 Render-Loop Optimierung

Der Render-Loop (`animate()`) ist heilig. Er muss in < 16ms fertig sein (für 60 FPS).

* **Keine Garbage Collection**: Wir vermeiden es tunlichst, im Loop neue Objekte (Vektoren, Materialien) mit `new` zu erstellen. Nodges nutzt stattdessen Objekt-Pools oder wiederverwendbare, statische Hilfsvariablen (`_tempVector`), um den Garbage Collector nicht zu wecken (was Ruckler verursachen würde).
* **Frustum Culling**: Three.js prüft automatisch, ob Objekte im Sichtfeld der Kamera sind. Wir unterstützen dies, indem wir Bounding-Spheres korrekt berechnen.
* **On-Demand Rendering**: (Geplant) Wenn sich nichts bewegt (kein Layout, keine Mausbewegung), stoppt der Loop, um Laptop-Batterien zu schonen.

### Zusammenfassung des 3D-Datenflusses

Siehe Diagramm: [mermaid_07.mmd](mermaid_07.mmd)

---
*Ende Kapitel 04*


--- KAPITEL: 05_Visuelle_Effekte_und_Feedback_Systeme.md ---

# 05 Visuelle Effekte und Feedback-Systeme

Ein intuitives visuelles Feedback ist entscheidend, um dem Benutzer Orientierung in der komplexen 3D-Welt zu geben. Nodges implementiert hierfür ein mehrschichtiges System aus Highlights, Animationen und atmosphärischen Effekten.

## 05.1 Das Highlight-System (`HighlightManager`)

Der `HighlightManager` ist die zentrale Instanz für alle visuellen Hervorhebungen. Er stellt sicher, dass sich verschiedene Interaktionszustände (z.B. "Ich fahre über einen Knoten" vs. "Ich habe diesen Knoten markiert") nicht gegenseitig visuell zerstören.

### Architektur der Highlight-Verwaltung

Siehe Sequenz-Diagramm zum Highlight-Prozess: [mermaid_06.mmd](mermaid_06.mmd)

Das System basiert auf einer internen **Highlight-Registry** (`Map<Object3D, HighlightData>`).

* **Zustandssicherung**: Bevor ein Objekt visuell verändert wird, legt der Manager ein Backup des originalen Materials an. Beim Entfernen des Highlights wird dieser Originalzustand exakt wiederhergestellt. Das verhindert "Geister-Materialien", bei denen Objekte versehentlich in der Highlight-Farbe verweilen.
* **Vermeidung von Farbsprüngen**: Übergänge zwischen Zuständen (z.B. Hover-Ende bei gleichzeitigem Search-Highlight) werden logisch aufgelöst. Das System prüft: "Gibt es noch einen anderen Grund, warum dieses Objekt leuchten sollte?"

### Prioritäten-Kaskade

Da ein Objekt mehrere Gründe haben kann, hervorgehoben zu werden, gibt es eine Priorisierung:

1. **SELECTION** (Höchste Prio): Der Benutzer fokussiert dieses Objekt aktiv.
2. **SEARCH**: Das Objekt ist Teil eines Suchergebnisses.
3. **PATH**: Das Objekt liegt auf einem berechneten Pfad.
4. **HOVER** (Niedrigste Prio): Die Maus ist nur kurzzeitig über dem Objekt.

## 05.2 Highlight-Modi im Detail

### 1. HOVER-Modus (Feedback der Erreichbarkeit)

* **Zweck**: Signalisiert dem User: "Dieses Objekt ist anfassbar".
* **Visuell (Nodes)**: Helligkeitsboost (+30%) und ein cyanfarbener, transparenter Halo-Umriss.
* **Visuell (Edges)**: Die Kante wird "dicker" (durch Einblenden einer Tube-Geometrie) und leuchtet bläulich.

### 2. SELECTION-Modus (Der Fokus)

* **Zweck**: Dauerhafte Markierung für Detailanalyse.
* **Visuell**: Ein kräftiger grüner Glow-Effekt (Emissive Color).
* **Besonderheit**: Selektierte Objekte "atmen" (Pulsation der Leuchtintensität), um sie vom statischen Rest des Graphen abzuheben.

### 3. SEARCH & PATH (Semantische Highlights)

* **SEARCH**: Nutzt Kontrastfarben (Gelb/Magenta), um Treffer in der Weite des Raums schnell auffindbar zu machen.
* **PATH**: Markiert Ketten von Kanten und Knoten. Hier ist besonders die **Durchsichtigkeit** wichtig: Damit ein Pfad durch den ganzen Graphen verfolgt werden kann, werden nicht-beteiligte Knoten oft leicht ausgegraut (Ghosting-Effekt).

## 05.3 Der "Breathing" Glow-Effekt

Anstatt statischer Farben nutzt Nodges dynamisches Leuchten. Dies erzeugt einen organischen, hochwertigen Look ("Premium Aesthetics").

### Die Mathematik dahinter

Die Pulsation wird über einen **Sinus-Oszillator** gesteuert:
`Intensity = Base + Amplitude * sin(Time * Frequency)`

* **Base**: Die minimale Helligkeit (z.B. 0.2).
* **Amplitude**: Wie stark schlägt das Blinken aus?
* **Frequency**: Wie schnell atmet das Objekt? (Standard: 0.5 Hz für beruhigende Wirkung).

Diese Werte werden in jedem Frame an die `emissiveIntensity` des Materials übergeben.

### 05.4 Halo-Technik (Outline Rendering)

Echte Outlines sind in WebGL schwierig (erfordern oft Post-Processing Shader). Nodges nutzt eine performante geometrische Alternative:

* Wir erzeugen ein zweites Mesh (Klon), das ca. 40% größer ist als das Originalobjekt.
* Dieses Mesh erhält ein transparentes Material (`opacity: 0.3`) mit `depthWrite: false`.
* Dadurch wird der "Halo" immer hinter dem eigentlichen Objekt gerendert, aber über dem Hintergrund, was einen weichen, geisterhaften Schein erzeugt.
* Für Kanten wird eine separate Tube-Geometrie erzeugt, die die ursprüngliche Kurve umschließt.

---
*Ende Kapitel 05*


--- KAPITEL: 06_Interaktions_Design_und_Input_Processing.md ---

# 06 Interaktions-Design und Input-Processing

Eine nahtlose Interaktion ist für die User Experience in einer 3D-Welt entscheidend. Dieses Kapitel beschreibt, wie Nodges abstrakte Benutzereingaben (Maus, Tastatur) in präzise Aktionen innerhalb der visualisierten Daten übersetzt.

## 06.1 Raycasting: Die Brücke zwischen 2D und 3D

Siehe Interaktions-Loop: [mermaid_02.mmd](mermaid_02.mmd)

Das Hauptproblem: Der Monitor ist flach (2D), die Daten sind räumlich (3D). Wir müssen wissen, wohin der User "in die Tiefe" klickt. Nodges nutzt hierfür den **Raycasting-Algorithmus**.

### Der mathematische Prozess

1. **Normalisierung**: Die Maus-Position (Pixel) wird in Koordinaten von -1 bis +1 umgerechnet.
2. **Strahl-Projektion**: Von der Kameraposition wird ein unsichtbarer Strahl durch den "Mauspunkt" auf der Linse in die Unendlichkeit geschossen.
3. **Intersektion**: Die Engine prüft: "Welche Objekte durchschneidet dieser Strahl?"
4. **Sortierung**: Die Liste der getroffenen Objekte wird nach Entfernung zur Kamera sortiert. Das vorderste Objekt gewinnt.

### Performance-Herausforderung bei InstancedMesh

Da ein `InstancedMesh` (für 10.000 Knoten) nur *ein* Objekt für Three.js ist, liefert ein normaler Raycast nur: "Du hast den InstancedMesh getroffen".
Nodges nutzt die `instanceId`, um herauszufinden, *welche* der 10.000 Kopien genau getroffen wurde. Dies wird dann blitzschnell auf die ursprüngliche Node-ID zurückgemappt.

## 06.2 Der `CentralEventManager` (CEM)

Siehe System-Sequenz zur Interaktion: [mermaid_08.mmd](mermaid_08.mmd)

Der CEM ist das "Gehirn" der Interaktion. Er sorgt für eine saubere Trennung zwischen Hardware-Events und Logik.

### Intelligente Click-Erkennung ("Click vs. Drag")

Ein Problem in 3D: Wenn ein User die Kamera dreht (Drag), lässt er die Maus oft über einem Knoten los. Ein naiver Event-Handler würde dies als "Klick auf den Knoten" interpretieren.
**Die Lösung**: Nodges misst die Distanz zwischen `mousedown` und `mouseup`.

* Distanz < 5 Pixel? -> **Klick** (Selektion auslösen).
* Distanz > 5 Pixel? -> **Drag** (Kamera drehen, Klick-Event ignorieren).

### Hover-Throttling

Raycasting bei jedem einzelnen Pixel, den die Maus bewegt, ist zu teuer. Wir drosseln (throttlen) die Berechnung auf ca. **50ms** (20 FPS). Das ist für den Menschen immer noch flüssig genug, spart aber wertvolle CPU-Zyklen für das Rendering.

## 06.3 Kamera-Steuerung und "Cinematic UI"

Die Kamera wird über `OrbitControls` gesteuert, aber wir haben sie mit UX-Verbesserungen angereichert.

### Auto-Focus & Fly-To Animationen

Wenn ein Benutzer ein Suchergebnis auswählt, springt die Kamera nicht hart dorthin. Sie nutzt eine **sanfte Kamerafahrt**.

* **Pfad**: Wir berechnen die neue Zielposition und den Zielwinkel.
* **Easing**: Die Bewegung nutzt "Smooth-Step" Funktionen (langsam starten, schnell in der Mitte, sanft abbremsen).
* **Kollisionsvermeidung**: Die Kamera fliegt in einem leichten Bogen, um nicht "durch" andere Knoten hindurchzurauschen.

### Kontext-Sensitiver Zoom

Beim Zoomen mit dem Mausrad berechnet Nodges den Zoom-Faktor basierend auf der aktuellen Entfernung zum Objekt. Je näher man ist, desto feingliedriger wird der Zoom, um präzise Navigation im "Mikrokosmos" des Graphen zu ermöglichen.

## 06.4 Keyboard-Shortcuts für Power-User

* `R`: Kamera-Reset (Vogelperspektive).
* `Leertaste`: Pause/Start der Layout-Simulation.
* `H`: UI-HUD (Heads-Up Display) ausblenden für "Immersive Mode".
* `Entf / Backspace`: (Geplant) Löschen des selektierten Knotens.

---
*Ende Kapitel 06*


--- KAPITEL: 07_Algorithmen_und_Layout_Engine.md ---

# 07 Algorithmen und Layout Engine

## 7.1 Die Physik-Engine (Deep Dive)

Nodges nutzt eine eigens geschriebene, Web-Worker-basierte Physik-Simulation, um organische Strukturen zu erzeugen. Wir verlassen uns nicht auf Black-Box-Bibliotheken wie `d3-force-3d`, sondern implementieren die Kräfte "from scratch" für maximale Kontrolle.

### Die Kräfte

Das System basiert auf zwei gegensätzlichen Kräften, die ein energetisches Gleichgewicht suchen:

1. **Coulomb-Abstoßung (Node-Repulsion)**
    * Jeder Knoten ist ein geladenes Teilchen, das alle anderen abstößt.
    * **Formel**: $F = \frac{k_{rep}}{d^2}$
    * Hierbei ist $k_{rep}$ die `repulsionStrength` (Standard: 50) und $d$ die Distanz.
    * **Effekt**: Verhindert, dass Knoten überlappen und drückt unverbundene Cluster auseinander.

2. **Hooke-Anziehung (Spring-Attraction)**
    * Kanten verhalten sich wie mechanische Federn.
    * **Formel**: $F = k_{att} \cdot d$
    * Hierbei ist $k_{att}$ die `attractionStrength` (Standard: 0.5).
    * **Effekt**: Zieht verbundene Knoten zusammen.

### Der Integrator (Euler vs. Verlet)

Aktuell nutzen wir eine **Euler-Integration** für die Bewegungsgleichungen:

1. Summiere alle Kräfte auf einen Knoten (Vektor-Addition).
2. `Velocity = (Velocity + Force) * Damping`
3. `Position = Position + Velocity`

Der `Damping`-Faktor (Standard: 0.8) wirkt wie Luftwiderstand und verhindert, dass das System explodiert oder ewig schwingt. Es entzieht dem System kinetische Energie, bis es friert ("Freezing").

---

## 7.2 Web Worker Architektur & Protokoll

Um den Main-Thread (und damit das Rendering) nicht zu blockieren, läuft die gesamte Physik $O(n^2)$ in einem isolierten Thread (`src/workers/layout-worker.js`).

### Das Kommunikations-Protokoll

Der Datenaustausch ist leistungsoptimiert. Wir senden keine komplexen Objekte, sondern flache Arrays.

**1. Main -> Worker (Initialisierung)**
Bevor der Worker startet, mappt der `LayoutManager` alle String-IDs (z.B. "Server_01") auf Integer-Indizes (0, 1, 2...). Das beschleunigt Array-Zugriffe im Worker massiv.

```javascript
{
  nodes: [{ x, y, z, index: 0 }, ...],
  edges: [{ start: 0, end: 5 }, ...], // Nur Indizes!
  options: { repulsionStrength: 50, ... }
}
```

**2. Worker -> Main (Pro Frame)**
Der Worker sendet nach jeder Iteration (oder am Ende) die neuen Koordinaten zurück:

```javascript
{
  positions: [{ x: 10.5, y: -2.1, z: 5.0 }, ...] // Array-Reihenfolge entspricht Input
}
```

Der Main-Thread appliziert diese dann direkt auf die `Object3D.position` der Three.js Meshes.

---

## 7.3 Komplexität und Skalierungs-Grenzen

### Das $O(n^2)$ Problem

Unsere aktuelle Implementierung ist ein "All-Pairs" Algorithmus.

* Bei 1.000 Knoten: $1.000^2 = 1.000.000$ Vergleiche pro Iteration.
* Bei 10.000 Knoten: $100.000.000$ Vergleiche.

Ab ca. 2.000 Knoten sinkt die Berechnungsgeschwindigkeit unter 60 HZ. Da dies aber im Worker geschieht, bleibt die UI responsive – die Simulation läuft nur "in Zeitlupe" ab.

### Geplante Optimierung: Barnes-Hut (Octree)

Um auf 100.000 Knoten zu skalieren, ist die Implementierung des Barnes-Hut Algorithmus geplant.

* **Idee**: Teile den Raum rekursiv in 8 Würfel (Octree).
* **Trick**: Wenn ein Würfel weit weg ist, behandle alle Knoten darin als einen einzigen "Super-Knoten" (Schwerpunkt).
* **Gewinn**: Reduziert die Komplexität auf $O(n \log n)$.

---

## 7.4 Deterministische Layouts

Neben der Physik bietet Nodges mathematisch exakte Layouts für strukturierte Daten:

* **Grid**: Ordnet Knoten in einem 3D-Gitter an. Perfekt, um einfach nur "alle Daten" zu sehen.
* **Sphere**: Projiziert Knoten auf die Oberfläche einer Kugel.
* **Helix**: Anordnung in einer Spirale (z.B. für Zeitreihen geeignet).
* **Hierarchical (Tree)**: Klassischer Baum, aber in 3D (Kegel-Baum). Wichtig für Org-Charts oder Verzeichnis-Strukturen.

*(Hinweis: Im UI-Komplexitätsmodus "Simple" ist die Layout-Steuerung ausgeblendet. Volle Kontrolle über Layout-Typen und Parameter ist ab dem Modus "Expert" im Layout-Tab verfügbar.)*

---
*Dokumentations-Status: V2.1 (Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 08_Benutzeroberflaeche_und_UX.md ---

# 08 Benutzeroberfläche (UI) und UX-Design

In Nodges ist das UI kein Selbstzweck, sondern das Navigationsinstrument für die 3D-Welt. Wir verfolgen eine "Canvas-First"-Strategie: Die Daten stehen im Mittelpunkt, das Interface ordnet sich unter.

## 08.1 Die Hybrid-Architektur (DOM + WebGL)

Nodges nutzt zwei Welten gleichzeitig:

1. **WebGL (Canvas)**: Für das High-Performance Rendering der 3D-Daten.
2. **HTML/CSS (DOM)**: Für Texte, Formulare und komplexe Layouts.

**Der Vorteil**: HTML ist unschlagbar flexibel für Textdarstellung und Accessibility. Durch die Überlagerung (Z-Index) können wir die Vorteile beider Welten nutzen, ohne die Performance der 3D-Engine durch teure "Text-in-WebGL"-Tricks zu belasten.

## 08.2 Das "Glassmorphism" Design-Konzept

Um den futuristischen und leitenden Charakter einer 3D-Anwendung zu unterstreichen, nutzt Nodges ein modernes **Glassmorphism-Design**:

* **Transparenz**: Panels sind leicht durchsichtig (`backdrop-filter: blur(10px)`). Man sieht den Graphen "hinter" dem Menü noch leicht durchschimmern.
* **Kontrast**: Dunkle Hintergründe mit neonfarbenen Akzenten sorgen für maximale Lesbarkeit in dunklen Arbeitsumgebungen.

---

## 08.3 Kern-Komponenten des Interfaces

### 1. Main-Sidebar (Rechts) und Tab-System

Die Sidebar ist die Steuerungszentrale der Applikation. Sie beherbergt die verschiedenen Einstellungen, unterteilt in thematische Tabs:

* **Tab-Navigation**: Ein horizontales Tab-Menü mit Custom-Scrollbar und horizontalem Scroll-Support (z.B. per Mausrad).
* **Tab-Inhalte**:
    * **System**: Zeigt den UI-Modus-Umschalter sowie allgemeine Datei-Informationen (Knoten, Kanten, FPS) und die Farblegende.
    * **Ebenen (Expert)**: Steuerung der Transparenz und Sichtbarkeit einzelner Ebenen/Gruppen basierend auf Attributen.
    * **Files (Simple)**: Der Dateimanager mit direktem Zugriff auf Beispieldateien sowie Aktionen zur Erstellung neuer Graphen ("New"), dem Öffnen von Dateien ("Open") und dem Exportieren ("Save As").
    * **Ansicht (Simple)**: Steuerung der 3D-Umgebung und Rendering-Optionen (Kanten-Dicke, Highlight-Effekte).
    * **Create (Dev)**: Werkzeuge zum manuellen Hinzufügen von Knoten und Kanten.
    * **Mappings (Expert)**: Konfiguration des dynamischen Visual Mappings (Kanal-Mapping für Farbe, Größe und Presets).
    * **Layout (Expert)**: Auswahl des Layout-Verfahrens (Force-Directed, Grid, Sphere, Helix) und Tuning der Physik-Simulation.
    * **Dev (Dev)**: Spezifische Debugging-Optionen für Entwickler.

### 2. Drei-Stufen-Modus (UI Complexity Mode)

Um den Benutzer nicht mit Optionen zu überladen, implementiert Nodges drei Komplexitätsstufen, die über den `StateManager` gesteuert werden:

* **Simple**: Standardmodus für Betrachter. Zeigt nur die Tabs "System", "Files" und "Ansicht" sowie grundlegende Info-Zeilen.
* **Expert**: Für fortgeschrittene Analysten. Schaltet zusätzlich "Ebenen", "Mappings" und "Layout" sowie erweiterte Info-Zeilen (z.B. Achsenbereiche) frei.
* **Dev**: Für Entwickler. Schaltet alle Steuerungselemente und die Tabs "Create" und "Dev" frei.
* **Implementierung**: Elemente im HTML werden mit `data-min-mode` annotiert (z.B. `data-min-mode="expert"`). Die Sichtbarkeit wird über CSS-Regeln gesteuert.

### 3. Dateimanager & Custom Save As Modal

* **New / Open**: Löscht das aktuelle System oder öffnet einen systemeigenen Datei-Dialog zum Laden valider JSON-Daten.
* **Save As**: Öffnet ein maßgeschneidertes, im Glassmorphism-Stil gehaltenes Modal, das den Export des aktuellen Graphen in den Formaten JSON (Future-Format) und Markdown ermöglicht.

### 4. Floating Panels (Legend, Info)

* **Legend Panel**: Zeigt dynamisch die Farbkodierung und Größen-Mappings an.
* **Info Inspector Panel**: Sobald ein Objekt im 3D-Raum angeklickt wird, öffnet sich dieses schwebende Panel und stellt alle Attribute als Key-Value-Paare dar. Ein automatischer Textumbruch (Word-Wrap) verhindert Clipping bei langen Werten oder tief verschachtelten JSON-Objekten.

---

## 08.4 UX-Leitsätze in Nodges

### "Never lose context"

In 3D verliert man schnell die Orientierung. Unser UI hilft:

* **Minimap**: Eine Echtzeit-Übersichtskarte des Graphen zur Orientierung in der 3D-Szene.
* **Fokus-Zoom**: Doppelklick auf ein Objekt zoomt die Kamera sanft auf das Ziel (Cinematic Camera Fly-to).

### "Meaningful Motion"

Animationen sind nicht nur Zierde. Wenn sich ein Panel öffnet, schiebt es sich sanft ins Bild. Wenn Daten geladen werden, gibt es einen Fortschrittsbalken. Jede Bewegung signalisiert dem User: "Hier passiert etwas".

### "Fail Fast, Show Clear"

Wenn eine Datei fehlerhaft ist, erscheint kein "Error 500", sondern ein informatives Overlay: "Fehler in Zeile 45: Koordinate 'z' fehlt". Wir führen den User zur Lösung.

---
*Dokumentations-Status: V2.1 (Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 09_Utilities_und_Hilfssysteme.md ---

# 09 Utilities und Hilfssysteme

Unter der Haube von Nodges arbeiten zahlreiche "Stille Helfer" – Utility-Bibliotheken und mathematische Assistenten, die komplexe Aufgaben vereinfachen und für eine saubere Codebasis sorgen.

## 09.1 Die Mathe-Toolbox (Integrated Logic)

Graphenvisualisierung in 3D ist pure Mathematik. Unsere Utilities abstrahieren die harten Formeln (implizit in `LayoutManager` und `VisualMappingEngine`):

### 1. Distanz-Berechnungen (Performance-Trick)

In Layout-Algorithmen müssen wir Millionen Mal den Abstand zwischen Knoten berechnen. Normalerweise nutzt man den Satz des Pythagoras ($a^2 + b^2 + c^2 = d^2$), was eine teure Quadratwurzel (`Math.sqrt`) erfordert.
**Der Utility-Trick**: Wir vergleichen oft nur die **quadrierten Distanzen**. Wenn $d1^2 > d2^2$, dann ist auch $d1 > d2$. Wir sparen uns die Wurzelziehung und gewinnen massiv an Performance.

### 2. Lineare Interpolation (Lerp)

Für flüssige Animationen (z.B. Farbübergänge oder Kamerafahrten) nutzen wir die `lerp`-Funktion:
`Result = Start + (End - Start) * Alpha`
Dies erlaubt uns, jeden Wert über die Zeit sanft von A nach B wandern zu lassen.

## 09.2 Das Farb-System (`src/core/VisualMappingEngine.ts`)

Farben sind in Nodges mehr als nur Deko. Sie sind Datenträger.

### HSL over RGB

Wir arbeiten intern bevorzugt im **HSL-Farbraum** (Hue, Saturation, Lightness):

* **Hue (Farbton)**: Perfekt für Kategorien (z.B. Server = Blau, PC = Grün).
* **Saturation (Sättigung)**: Kann die Wichtigkeit eines Knotens darstellen.
* **Lightness (Helligkeit)**: Ideal für Highlights. "Mach den Knoten 20% heller bei Hover" ist in HSL eine simple Addition, in RGB eine komplexe Matrix-Rechnung.

### Heatmap-Generator

Die `VisualMappingEngine` erlaubt es, Wertebereiche (z.B. 0.0 bis 1.0) auf Farbskalen zu mappen (z.B. von kühlem Blau zu heißem Rot). Dies wird für das "Visual Mapping" intensiv genutzt.

## 09.3 Performance-Monitoring & Debugging

Nodges hat ein eingebautes Bewusstsein für seine eigene Leistung.

* **FPS-Meter**: Überwacht die Frames pro Sekunde. Fällt der Wert unter 30, können automatisch Details reduziert werden (z.B. Schatten aus, Kurven weniger fein).
* **Memory Tracking**: (In Entwicklung) Überwacht, ob Three.js Objekte korrekt aus dem Speicher gelöscht wurden (Garbage Collection Monitoring), um Memory Leaks zu verhindern.

## 09.4 Datei-Manager & Export

* **Screenshot-Tool (`src/utils/ExportManager.ts`)**: Erlaubt es, den aktuellen Zustand als PNG zu exportieren (`exportPNG`), indem der WebGL-Canvas direkt ausgelesen wird.
* **JSON-Schema Generator**: (Konzept) Ein Tool, das aus unseren TypeScript-Interfaces automatisch JSON-Schema Dateien erstellt, damit User in ihren Editoren (wie VS Code) Autocomplete-Support beim Erstellen von Graphen-Dateien haben.

---
*Ende Kapitel 09*


--- KAPITEL: 10_Entwicklungs_Guide_und_Deployment.md ---

# 10 Entwicklungs-Guide und Deployment

Dieses Handbuch richtet sich an Entwickler, die Nodges erweitern, warten oder deployen moechten. Es spiegelt den Architektur-Stand nach dem grossen Refactoring (Juni 2026) wider.

## 10.1 Schnellstart

### Voraussetzungen

- Node.js >= 18
- npm >= 9

### Setup

```bash
# 1. Repository klonen
git clone <repo-url>
cd Nodges

# 2. Abhaengigkeiten installieren
npm install

# 3. Development-Server starten
npm run dev
# -> http://localhost:5173
```

### Build & Deploy

```bash
# Production-Build erstellen
npm run build
# -> Erstellt /dist Ordner (statische Dateien)

# Lokal testen (Preview)
npm run preview
```

## 10.2 Architektur und Konzepte

Nodges basiert auf **Vanilla TypeScript (OOP)** und **THREE.js**, ohne schwergewichtiges Frontend-Framework (wie React oder Vue). Die Architektur ist modular aufgebaut.

### Wichtige Diagramme (in /_assets/Nodges/)

- **Architektur-Uebersicht**: `N_arch_dependencies.mmd`
- **Initialisierungs-Sequenz**: `N_init_sequence.mmd`
- **Typisiertes Event-System**: `N_event_types.mmd`
- **Fehlerbehandlung**: `N_fehlerbehandlung.mmd`

### Kern-Konzepte

1. **Service Container (DI)**
   - Alle Manager werden in `App.ts` initialisiert und im `ServiceContainer` registriert.
   - Zugriff ueber `this.container.get<T>('Name')` moeglich (aber Dependency Injection im Constructor bevorzugt).

2. **Event-Driven Architecture**
   - `CentralEventManager` fungiert als Bus.
   - Events sind streng typisiert (`EventTypes.ts`).
   - Komponenten abonnieren Events statt direkt miteinander zu kommunizieren (lose Kopplung).

3. **State Management**
   - `StateManager` haelt den gesamten Anwendungszustand (einschließlich `uiMode` für Simple, Expert, Dev).
   - Unterstuetzt **Undo/Redo** durch Kapselung von Zustandsaenderungen.
   - UI reagiert auf State-Changes, nicht umgekehrt.

4. **Web Worker**
   - Rechenintensive Layouts (Force-Directed) laufen im Hintergrund (`layout-worker.ts`).
   - Kommunikation via typisierte Messages (`WorkerTypes.ts`).
   - Automatischer Timeout nach 30s.

## 10.3 Fehlerbehandlung und Debugging

### Error Handling

Statt `console.error` nutzen wir den zentralen `ErrorHandler`:

```typescript
import { errorHandler } from './core/ErrorHandler';

try {
    // ...
} catch (e) {
    errorHandler.handle(e, {
        category: 'import',
        severity: 'error',
        userMessage: 'Datei konnte nicht geladen werden'
    });
}
```

Dies triggert automatisch eine **Toast-Notification** (via `NotificationService`) fuer den Benutzer.

### DOM-Referenzen

Vermeide harte DOM-Zugriffe. Wenn noetig, pruefe `/_assets/Nodges/N_dom_id_registry.md` fuer eine Liste aller gueltigen IDs.
Zur Einbindung neuer Controls sollte das `data-min-mode` Attribut verwendet werden, um die korrekte Modus-Filterung ("Simple", "Expert", "Dev") sicherzustellen.

### Debugging-Tools

- **Stats**: FPS und Node-Data in der System-Spalte.
- **Visual Helpers**: Grid und Axes (in `App.ts` aktivierbar).
- **Log-Level**: Der NotificationService loggt Details in die Konsole, auch wenn nur eine kurze Toast-Nachricht erscheint.

## 10.4 Tests

Wir nutzen **Vitest** fuer Unit- und Integrationstests.

```bash
# Alle Tests ausfuehren
npm test

# Tests mit UI (Watch-Mode)
npm run test:ui

# Coverage Report
npm run coverage
```

**Wichtig:** Neue Features muessen getestet werden. Mocking von THREE.js und DOM ist in der Test-Umgebung vorbereitet.

## 10.5 Deployment

Nodges ist eine **Static Web App**. Der Inhalt des `/dist` Ordners kann auf jedem statischen Webserver gehostet werden:

- **Vercel / Netlify**: Einfach Repository verbinden (Build Command: `npm run build`, Output: `dist`).
- **GitHub Pages**: Via Actions deploybar.
- **Docker / Nginx**: Copy `/dist` to `/usr/share/nginx/html`.

## 10.6 Coding Guidelines

- **Kein `any`**: Nutze Interfaces und Typen (`src/types.ts` oder spezifische Dateien).
- **Async/Await**: Bevorzuge async/await gegenueber `.then()`.
- **Dateistruktur**:
  - `src/core/`: Singleton-Manager und Kernlogik (z.B. `VisualMappingEngine.ts`, `StateManager.ts`)
  - `src/utils/`: Hilfsklassen (Import, Export, Math, `FileHandler.ts`)
  - `src/ui/`: UI-Logik und Manager (z.B. `UIManager.ts`, Modals)
  - `src/effects/`: Visuelle Effekte (Shader, Post-Processing)

---
*Stand: 19.06.2026 - Version 0.101.3*


--- KAPITEL: 11_Node_Edge_Mesh_Creation_Report.md ---

# 11 Node und Edge Erstellung: Technischer Deep-Dive

Dieses Kapitel ist der abschließende technische Bericht über die präzise Umsetzung der Mesh-Generierung. Es dokumentiert die "Innereien" der Objekt-Manager und dient als Referenz für Optimierungen.

## 11.1 Die Node-Pipeline (`NodeManager.ts`)

Die Erstellung eines Knotens folgt einer strengen Kette von Transformationen.

### 1. Die Gruppierungs-Phase

Anstatt alle Knoten in einen Topf zu werfen, gruppiert der `NodeManager` sie nach ihrem **Geometrie-Typ** (z.B. alle "Sphere"-Nodes, alle "Box"-Nodes). Für jede Gruppe wird ein eigener `InstancedMesh` erstellt.

* **Warum?** Ein `InstancedMesh` kann nur eine einzige Geometrie (z.B. `SphereGeometry`) instanziieren.

### 2. Visuelles Mapping (Die Seele der Node)

Bevor die GPU übernimmt, berechnet die `VisualMappingEngine`:

* **Scale**: Basierend auf Attributen (z.B. "Gewicht").
* **Color**: Hex-Code aus dem JSON wird in ein `THREE.Color` Objekt umgewandelt.
* **Emissive**: Soll der Knoten von sich aus leuchten?

### 3. Matrix-Transformation

Die Position $(x, y, z)$ wird nicht einfach gesetzt, sondern in eine **4x4 Transformations-Matrix** geschrieben. Diese Matrix enthält auch die Skalierung. Dies ist der einzige Weg, wie die GPU effizient hunderte Variationen derselben Kugel gleichzeitig verstehen kann.

## 11.2 Die Edge-Pipeline (`EdgeObjectsManager.ts`)

Kanten sind mathematisch anspruchsvoller, da sie eine **Ausrichtung** im Raum benötigen.

### Kanten-Visualisierung: TubeGeometries (Unified Approach)

Aktuell setzt Nodges einheitlich auf **TubeGeometry** für alle Verbindungen (auch gerade).

* **Warum?** Visuelle Konsistenz und Vereinfachung des Shaders.
* **Ablauf**:
  * Ein **Bezier-Pfad** wird definiert (bei geraden Kanten ist der "Control Point" linear interpoliert).
  * Ein **Mesh-Generator** lässt einen "Schlauch" entlang dieses Pfades wachsen.
  * **Optimierung & Live Tuning**: Parameter wie Dicke (`Edge Thickness`), Kurvensegmente (`Curve Segments`), Rohr-Facetten (`Tube Facets`) und Animationen (Pulse, sequential, flow) können im UI-Komplexitätsmodus "Dev" live angepasst werden. Die Engine aktualisiert die Geometrien im laufenden Betrieb.
* *(Veraltet: Die Optimierung mittels einfacher Zylinder für gerade Kanten ist im Code vorhanden, aber zugunsten der "organischen" Optik deaktiviert.)*

## 11.3 Speicher-Management und Lifecycle

Ein großes Problem bei Single-Page-Apps mit 3D sind **CPU/GPU Memory Leaks**. Wenn man einen neuen Graphen lädt (z.B. beim Auslösen der "New" oder "Open" Aktion im Dateimanager), müssen die alten Daten rückstandslos verschwinden.

Nodges implementiert eine strikte `dispose()` Kette:

1. **Geometrien**: `geometry.dispose()` leert den VBO (Vertex Buffer Object) in der GPU.
2. **Materialien**: `material.dispose()` löscht die Shader-Programm-Instanzen.
3. **Textures**: Falls Bilder genutzt wurden, werden diese aus dem Grafikkartenspeicher entfernt.

Ohne diese expliziten Aufrufe würde der Browser-Tab bei jedem neuen Laden eines Graphen ca. 200-500 MB RAM mehr verbrauchen, bis er schließlich abstürzt.

## 11.4 Zusammenfassung der Performance-Daten

| Methode | Max. Objekte (60 FPS) | Anwendung |
| :--- | :--- | :--- |
| Single Mesh | ~500 | Spezialknoten, UI-Elemente |
| InstancedMesh | ~50.000 | Standard-Knoten, einfache Kanten |
| TubeGeometry | ~2.000 | Komplexe Multi-Edges |
| BufferGeometry | ~200.000 | Nur Punkte (PointClouds, geplant) |

---
*Dokumentations-Status: V2.1 (Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 12_Historie_und_Entscheidungen.md ---

# 12 Historie und Entscheidungen (ADRs)

Dieses Dokument erfasst die wichtigsten architektonischen Entscheidungen (Architecture Decision Records) und die Meilensteine in der Entwicklung von Nodges. Es dient dazu, nachzuvollziehen, *warum* bestimmte technische Wege gewählt wurden.

## Meilensteine

* **v1.0 (Geplant)**: Produktionsreife, saubere Trennung des `InteractionManager` und `StateManager`.
* **v0.101.3**: Einführung des Drei-Stufen-Modus für die UI-Komplexität (Simple, Expert, Dev), des Sidebar File Managements (New, Open, Save As mit Custom Modal) und Optimierungen der Visual Mapping Engine (Heatmaps für kontinuierliche Werte).
* **v0.98.x**: Einführung von Web Workern für Layout-Berechnungen, Refactoring der Monolithen (`App.ts`).
* **v0.97.0**: Grundlagen der Hardware-Instanzierung (InstancedMesh) für massives Rendering implementiert.

## Architecture Decision Records (ADRs)

### ADR-01: Nutzung von Three.js InstancedMesh
* **Kontext**: Das Rendern von zehntausenden Knotenpunkten als individuelle `THREE.Mesh`-Objekte führte zu dramatischen Einbrüchen der Framerate (CPU / Draw Call Bottleneck).
* **Entscheidung**: Umstellung auf `THREE.InstancedMesh`.
* **Konsequenz**: Die GPU rendert alle Knoten durch einen einzigen Draw Call. Dies erzwingt allerdings ein komplexeres Datenmanagement (Buffer-Updates statt direkter Objekt-Manipulation), ermöglicht aber die gewünschte Skalierbarkeit.

### ADR-02: Zod für Runtime-Validierung
* **Kontext**: Beim Import von proprietären Graph-Daten (JSON) traten häufig Laufzeitfehler durch inkonsistente oder fehlende Pflichtfelder auf (z.B. fehlende `source`/`target` bei Edges).
* **Entscheidung**: Einführung der `Zod`-Bibliothek als "Gatekeeper".
* **Konsequenz**: Jeder Datensatz wird beim Laden streng typgeprüft. Fehler werden frühzeitig als lesbare Exceptions ausgeworfen, bevor sie tiefer im System zu Korruption führen. Die Validierung großer Datensätze muss perspektivisch in Web Worker ausgelagert werden.

### ADR-03: Web Worker für Layout-Algorithmen
* **Kontext**: Force-Directed-Layouts erfordern $O(n^2)$ Berechnungen und blockierten den UI-Thread bei großen Graphen, was zu "Freezes" führte.
* **Entscheidung**: Auslagerung der Layout-Berechnungen (`layout-worker.ts`).
* **Konsequenz**: Das UI bleibt flüssig, während die Layout-Simulation asynchron im Hintergrund läuft. Die Kommunikation erfordert Message-Passing via `postMessage`.

### ADR-04: Monolithische "App.ts" entflechten
* **Kontext**: `App.ts` und `InteractionManager.ts` waren zu "Gott-Klassen" herangewachsen, die nahezu alle Bereiche kontrollierten.
* **Entscheidung**: Aufteilen in dedizierte Handler (`SelectionHandler`, `HoverHandler`) und Manager (`SceneManager`, `RenderEngine`).
* **Konsequenz**: Bessere Testbarkeit und leichtere Einarbeitung (Onboarding) für neue Entwickler.

### ADR-05: Drei-Stufen-Modus für UI Komplexität
* **Kontext**: Die steigende Anzahl von Analyse- und Layout-Steuerungen überforderte Erstnutzer und reine Betrachter ("Cognitive Load").
* **Entscheidung**: Implementierung eines Drei-Stufen-Systems ("Simple", "Expert", "Dev") über den `StateManager`.
* **Konsequenz**: Die Benutzeroberfläche bleibt standardmäßig im "Simple"-Modus sauber und fokussiert. Fortgeschrittene Registerkarten (wie Mappings, Ebenen und Layout) oder Entwicklerwerkzeuge (wie Create, Dev) werden erst bei Bedarf eingeblendet. Die Steuerung erfolgt deklarativ per CSS-Klassen (`data-min-mode`).

### ADR-06: Sidebar File Management mit Custom Save As Modal
* **Kontext**: Das Speichern und Exportieren von modifizierten Graphen bzw. das Erstellen neuer Graphen war nur umständlich über die Konsole oder Entwickler-Tools möglich.
* **Entscheidung**: Integration von "New", "Open" und "Save As" Schaltflächen direkt in der Sidebar (Files-Tab) sowie Entwicklung eines anwendungsnahen Custom-Modals für den Dateiexport.
* **Konsequenz**: Benutzer können Graphen direkt verwerfen, neu laden oder im standardisierten JSON- sowie Markdown-Format exportieren. Die Logik kapselt sich sauber im `FileHandler` und im `UIManager`.

### ADR-07: Visual Mapping Engine
* **Kontext**: Zuvor waren Farben und Größen der Knoten und Kanten starr codiert. Benutzer benötigten eine dynamische Zuweisung von Farbskalen und Skalierungen basierend auf Datenattributen (z.B. kontinuierliche Heatmaps für `age`).
* **Entscheidung**: Entwicklung der `VisualMappingEngine` als eigenständiger Manager im Core-System.
* **Konsequenz**: Datensätze können ohne Änderung der Strukturdaten flexibel visualisiert werden. Die Engine unterstützt kategoriale Mappings, kontinuierliche Heatmaps (z.B. von Blau zu Rot) und visuelle Presets mit automatischer Legenden-Aktualisierung.

---
*Dokumentations-Status: V2.1 (ADRs Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 13_Glossar.md ---

# 13 Glossar und technische Begriffe

Dieses Glossar definiert die wichtigsten Konzepte, Technologien und wiederkehrende Begriffe im Nodges-Projekt, um allen Beteiligten ein gemeinsames Verständnis der Architektur ("Shared Vocabulary") zu ermöglichen.

## 3D & Rendering (WebGL / Three.js)

*   **Draw Call**: Ein Befehl der CPU an die Grafikkarte (GPU), ein Element zu rendern. Zu viele individuelle Draw Calls pro Frame sind der Hauptgrund für Frame-Drops in 3D-Anwendungen. Nodges versucht, diese durch Instancing auf ein Minimum zu reduzieren.
*   **Hardware Instancing (`THREE.InstancedMesh`)**: Eine Technik in WebGL, um dieselbe Geometrie (z.B. eine Kugel) mit demselben Material vieltausendfach mit nur *einem einzigen* Draw Call auf den Bildschirm zu bringen. Jede Instanz kann eine eigene Transformationsmatrix (Position, Rotation, Skalierung) und Farbe erhalten.
*   **Raycasting**: Eine Methode zur Bestimmung, worauf der Mauszeiger im 3D-Raum zeigt. Ein unsichtbarer "Laserstrahl" wird von der Kamera durch die Mausposition (2D-Koordinate) in den 3D-Raum geschossen. Getroffene Objekte können dann manipuliert werden.
*   **Z-Fighting**: Ein Grafik-Artefakt, das entsteht, wenn zwei Flächen im 3D-Raum exakt am selben Ort liegen und der Tiefen-Puffer (Z-Buffer) der GPU nicht entscheiden kann, welche Fläche vorne liegt. Äußert sich oftmals als störendes "Flackern".

## Graphen und Datenstruktur

*   **Node (Knotenpunkt)**: Ein einzelnes Objekt oder eine Entität in einem Netzwerk. Visuell meist durch eine Sphäre/Kugel in der 3D-Ansicht repräsentiert.
*   **Edge (Kante / Verbindung)**: Eine Verbindung zwischen zwei Nodes. Repräsentiert eine Beziehung ("Kennt", "Fließt zu", "Basiert auf"). In Nodges visuell oft durch 3D-Röhren (`TubeGeometry`) oder Linien dargestellt.
*   **Graph**: Die Gesamtheit aus Nodes und Edges, die zusammen eine Topologie bilden.
*   **Force-Directed Layout**: Ein Algorithmus zur Anordnung von Graphen. Er simuliert physikalische Kräfte (Knoten stoßen sich ab wie Magnete, Kanten ziehen sie zusammen wie Federn). Das System rechnet, bis ein energetisch stabiler Zustand erreicht ist, wodurch organisch wirkende Cluster entstehen.

## Projekt-Architektur (TypeScript / Core)

*   **Gott-Klasse (God Object)**: Ein Anti-Pattern in der Softwareentwicklung (ursprünglich in der alten `App.ts` vorhanden). Eine Klasse, die viel zu viele Verantwortlichkeiten auf sich vereint ("allwissend" und "allmächtig" ist). In Nodges durch Refactoring in spezialisierte Manager aufgelöst.
*   **Zod**: Eine TypeScript-First-Schema-Deklarations- und Validierungsbibliothek. Nodges nutzt Zod, um eingehende JSON-Graph-Daten strikt zu prüfen (Fehlen IDs? Sind Edges referenziell intakt?), bevor sie in die State-Engine geladen werden.
*   **Observer Pattern**: Ein Software-Entwurfsmuster. Der `StateManager` (Subject) hält den Zustand. Andere Komponenten (Observer) wie die UI oder die Render-Engine "abonnieren" diesen Zustand (`subscribe`) und werden benachrichtigt, sobald sich etwas ändert.
*   **Web Worker**: Eine JavaScript-Technologie, mit der Skripte in Hintergrund-Threads ausgeführt werden können (abseits des Main-UI-Threads). Nodges nutzt Worker, um rechenintensive Array-Sortierungen oder Layout-Simulationen ($O(n^2)$ Komplexität) auszuführen, ohne dass die Nutzeroberfläche "einfriert".
*   **Single Source of Truth (SSOT)**: Ein Architekturprinzip, bei dem jeder Datenpunkt nur an einem zentralen Ort gespeichert wird. In Nodges ist der `StateManager` die SSOT. Visuelle Komponenten fragen diesen ab, statt eigene Kopien der Datenstruktur ('state') zu halten.
*   **UI-Komplexitätsmodus**: Ein dreistufiges Steuerungssystem ("Simple", "Expert", "Dev") zur bedarfsgerechten Ein- und Ausblendung von Sidebar-Tabs und Info-Elementen im DOM.
*   **Visual Mapping**: Die dynamische Übersetzung von Datenattributen (wie `age` oder `region`) in grafische Eigenschaften (wie Farb-Heatmaps von Blau nach Rot oder Knotengrößen).
*   **Save As Modal**: Ein interaktives, im Glassmorphism-Design gestaltetes Overlay zum Exportieren der Graph-Daten in JSON- oder Markdown-Dateien.

---
*Dokumentations-Status: V2.1 (Glossar Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 14_Troubleshooting_und_FAQ.md ---

# 14 Troubleshooting und FAQ

Dieses Dokument sammelt typische Probleme und Fragestellungen auf Entwicklungs- oder Anwendungsseite, inklusive diagnostischer Schritte und Lösungsansätzen.

## A. Allgemeine Lade- und Performance-Probleme

### Symptom: Der Browser "friert ein" (UI blockiert), wenn extrem große Graphen (>20.000 Knoten) geladen werden.
*   **Ursache**: Die JSON-Validierung durch `Zod` oder das Parsing via JSON.parse blockiert synchron den Main-Thread.
*   **Diagnose**: Überprüfe das Performance-Tab in den Chrome DevTools. Zeigt der Main-Thread einen langen, ununterbrochenen Block während des Datei-Uploads?
*   **Lösung (kurzfristig)**: Auf kleinere Graphenausschnitte ausweichen.
*   **Lösung (architektonisch)**: Validierung (Parsing, Zod-Prüfung) muss konsequent in den `import-worker.ts` asynchron ausgelagert werden.

### Symptom: Starke Frame-Drops nach längerem Laufen der Anwendung oder wiederholtem Neu-Laden (Memory Leak).
*   **Ursache**: WebGL/Three.js Ressourcen (Geometrien, Materialien, Texturen) werden im VRAM nicht korrekt aufgeräumt.
*   **Diagnose**: Chrome DevTools befragen: "Memory" -> "Allocation instrumentation on timeline". Alternativ in Three.js die `renderer.info.memory` Konstanten ausgeben. 
*   **Lösung**: Stelle sicher, dass an jedem `NodeManager`, `EdgeObjectsManager` oder in Hilfssystemen (`GlowEffect`) beim Wechseln der Szene (wie durch die "New" oder "Open" Aktionen) explizit `dispose()` auf allen Materials und Geometries aufgerufen wird, und dass Mesh-Referenzen auf `null` gesetzt werden, damit der Garbage Collector greifen kann.

## B. Visuelles Rendering

### Symptom: "Z-Fighting" oder extremes Flackern an Kanten und überlappenden Knotenrändern.
*   **Ursache**: Identische Tiefenwerte im Z-Buffer bei sich streng überlappenden Meshes.
*   **Lösung**: Bei Highlights oder Halos, deren Geometry oft exakt skaliert über den Basis-Nodes liegt: Verwende `depthWrite = false` oder `depthTest = false` auf dem Material des Halos, oder verschiebe Render-Reihenfolgen durch Manipulation des `renderOrder`-Eigenschafts (z.B. Hintergrund = 0, BasisNodes = 1, Halos = 2, UI = 3).
*   **Alternativ**: Sicherstellen, dass instanzierte Sphären eine mikroskopisch vergrößerte Hitbox / Halo-Größe haben (`scale * 1.05`), um den Puffer zu trennen.

### Symptom: Knoten sind unsichtbar, obwohl laut Konsole Daten im `StateManager` geladen sind.
*   **Ursache**: Der `InstancedMesh`-Buffer (`instanceMatrix`) fordert oft manuell an, geupdated zu werden.
*   **Diagnose**: Prüfe in `NodeManager`: Ist `mesh.instanceMatrix.needsUpdate = true` aufgerufen worden, nachdem Positionen verändert wurden?
*   **Lösung**: Sobald die Float32-Buffer eines InstancedMesh beschrieben sind, **muss** Three.js benachrichtigt werden, diese Buffers final zur GPU zu flushen. Das Setzen von `needsUpdate` ist hierfür zwingend.

## C. Setup und DevContainer

### Symptom: WebGL wird nicht genutzt, stattdessen Fallback auf langsame Software-Renderer im Container (`llvmpipe`), kein NVIDIA Support.
*   **Ursache**: Der Docker-Daemon reicht die GPU-Geräte nicht in den DevContainer durch. 
*   **Lösung**: Stelle sicher, dass `nvidia-container-toolkit` auf dem Host installiert ist und überprüfe in der `devcontainer.json`, dass die Hardwarebeschleunigung in den Docker-Args steht (`--gpus all`).

### Symptom: `npm run dev` startet, aber HMR (Hot Module Replacement) von Vite funktioniert nicht. Veränderungen im Code laden die Seite nicht neu.
*   **Ursache**: Im Container (insbesondere Windows WSL) funktionieren File-Watch-Events (inotify) partiell nicht.
*   **Lösung**: Füge in der `vite.config.ts` die Polling-Optionen für den Entwicklungs-Server ein, falls nötig:
    ```json
    server: {
      watch: {
        usePolling: true
      }
    }
    ```

## D. Benutzeroberfläche & UI-Komplexitätsmodus

### Symptom: Bestimmte Tabs (wie Mappings, Layout, Ebenen) oder erweiterte Info-Zeilen (wie Achsenbereiche) fehlen in der Sidebar.
*   **Ursache**: Der aktive UI-Modus steht auf "Simple".
*   **Lösung**: Im "System"-Tab oben unter "UI-Modus" auf "Expert" oder "Dev" umschalten, um alle erweiterten Steuerungen und Tabs freizuschalten.

### Symptom: Das Save As Modal lädt den Export nicht herunter oder schließt sich nicht.
*   **Ursache**: Scripting-Blockade im Browser oder Validierungsfehler.
*   **Lösung**: Fehlerkonsole (F12) auf Zod-Validierungsfehler prüfen. Falls der Graph ungültige Referenzen aufweist, kann der Export-Parser blockieren. Überprüfe auch Pop-up-Blocker im Browser, da Downloads dynamisch über `Blob` URLs ausgelöst werden.

---
*Dokumentations-Status: V2.1 (FAQ Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 15_Quickstart_und_Tutorial.md ---

# 15 Quickstart und Tutorial-Guide

Willkommen in Nodges. Um die Einstiegshürde in diese Architektur möglichst klein zu halten, zeigt dieser Guide die absoluten Grundlagen: Wie erzeugt man auf dem sichersten Weg ein lauffähiges 3D-Graph-Projekt?

## Schritt 1: Das Projekt Starten

Voraussetzung: Du entwickelst im vorkonfigurierten DevContainer, der alle Dependencies (`npm`, `three`, `vite`) regelt.
Starte einfach den Vite-Dev-Server im Terminal:

```sh
npm run dev
```

Du kannst die App nun unter `http://localhost:5173` im Browser aufrufen.

## Schritt 2: Nutzung des UI-Complexity-Modus und des Dateimanagers

Wenn du die App zum ersten Mal öffnest, befindet sie sich im Modus **Simple**:

1.  **Dateien laden und verwalten**: Wechsle zum Tab **Files** in der rechten Sidebar.
    *   Klicke auf eine der gelisteten Beispieldateien, um sie direkt zu laden.
    *   Nutze den Button **Open**, um eine eigene JSON-Datei von deinem Dateisystem zu öffnen.
    *   Über **New** kannst du den Graphen leeren und ein leeres Projekt starten.
    *   Mit **Save As** kannst du das aktuelle Projekt als JSON oder Markdown exportieren.
2.  **Modus umschalten**: Wechsle zurück zum Tab **System** und klicke unter **UI-Modus** auf **Expert**.
    *   Hierdurch werden die fortgeschrittenen Steuerungsmöglichkeiten (Layout-Algorithmen, Visual Mappings, Transparenz-Ebenen) sichtbar.

## Schritt 3: Die 3 Säulen eines Nodges-Graphen

Ein Graph wird in Nodges aus grundlegend 3 Elementen gesteuert:
1.  **GraphData** (`types/DataFormats.ts`) - Die reine, strukturelle Mathematikebene.
2.  **StateManager** (`core/StateManager.ts`) - Die zentrale Wahrheit über den UI-Zustand.
3.  **App.ts** (`core/App.ts`) - Startet WebGL und delegiert Instanzen an die verschiedenen *Manager*.

### So sieht das minimale Graph-JSON aus ("The Dummy")

Um Nodges überhaupt erst etwas zeichnen zu lassen, laden wir (beispielsweise per "Open" oder aus den Files) strukturierte Daten. Hier ist ein Graph mit genau "2 Punkten und einer Verbindung":

```json
{
  "directed": false,
  "nodes": [
    { "id": "Alpha", "metadata": { "label": "Start", "weight": 5 } },
    { "id": "Beta", "metadata": { "label": "End", "weight": 3 } }
  ],
  "edges": [
    { "source": "Alpha", "target": "Beta", "metadata": { "strength": 1.0 } }
  ]
}
```

Wenn diese Datei geladen wird, feuert der **DataParser**. Er jagt das JSON durch die Zod-Typen. Ist alles valide, reicht er es an das System weiter.

## Schritt 4: Der Weg vom Upload zum Bildschirm (Life-Cycle)

Verstehen des Datenpfades (One-Way Data-Flow):

1.  **State-Update**: `StateManager.update({ graphData: neuesJson })` wird aufgerufen.
2.  **Observer (Der Manager wacht auf)**: Die Manager (`NodeManager`, `EdgeObjectsManager`, `LayoutManager`) überwachen den *GraphData* State und werden getriggert.
3.  **Layout (Mathematik)**: Der `LayoutManager` sieht die Knoten, erkennt, dass noch keine räumlichen X/Y/Z-Koordinaten existieren, und stößt den `layout-worker` (im Hintergrund-Thread) an, ein Grid oder Force-Layout zu erzeugen.
4.  **Koordinaten fließen zurück**: Der Worker liefert `[x, y, z]` Arrays zurück in den State.
5.  **Rendering (Die Grafik)**: Der `NodeManager` holt diese `[x, y, z]` Arrays ab und übersetzt sie in verschobene Transformations-Matrizen (`Matrix4`). Diese lädt er in den instanzierten Float32Array-Buffer (`InstancedMesh`) und "bittet" die Grafikkarte, zu zeichnen.

## Schritt 5: Einfache Eingriffe in den Code

Wie reagiere ich auf **Klicks** auf den neuen "Beta" Knoten?

Alle Benutzer-Inputs laufen über Events durch den `InteractionManager`, damit du nicht selbst nervige Raycasting-Berechnungen machen musst. Willst du reagieren, abonniere einfach den `CentralEventManager`:

```javascript
import { EVENT_TYPES } from './events/EventTypes';

// Irgendwo in deiner Feature-Logik
centralEventManager.subscribe('click', (payload) => {
    const { object } = payload;
    if (object) {
       console.log("Hurra! Es wurde geklickt auf:", object.userData.id);
       
       // Ändere den globalen Zustand:
       stateManager.update({ selection: { hoveredObject: null, selectedObject: object } });
    }
});
```

Dieser einfache Event-Drive garantiert, dass du keine "Manager-Spaghetti" produzierst. Manager müssen sich nicht direkt kennen, sie "hören" und "senden".

## Zusammenfassung
Du baust **keine** Three.js `Meshes` direkt! Formatiere stattdessen Arrays, jage sie durch den *State*, höre auf *Events* und vertraue darauf, dass die Manager die Pixel auf den Bildschirm schieben.

---
*Dokumentations-Status: V2.1 (Quickstart Updated)*
*Geprüft gegen Build: 0.101.3*


--- KAPITEL: 16_Neue_Ideen.md ---

# Nodges: Projektvision, Ideen und gesammelte Konzepte

Dieses Dokument fasst die zentralen Visionen, theoretischen Grundlagen, UI/UX-Konzepte und Architekturpläne zusammen, die in verschiedenen Dokumentationen (wie `Nodges_Idee.md`, `01_Einfuehrung_und_Projektvision.md`, `nodges_ideen_mapping.md` und anderen) festgehalten wurden.

## 1. Die Kernvision: Spatial Analytics im Web
Nodges (aus **NO**des und e**DGES**) ist nicht nur ein Graph-Viewer, sondern eine hochspezialisierte **Spatial Analytics Engine** für den Browser. Die Grundidee basiert auf "Spatial Literacy": Der Mensch denkt räumlich. Nodges übersetzt abstrakte Netzwerke in greifbare 3D-Umgebungen und löst das 2D-"Hairball-Problem" (undurchdringbare Knotenknäuel) durch eine Entzerrung in der Z-Achse. Der Nutzer blickt nicht *auf* die Daten, sondern bewegt sich *inmitten* der Daten.

### "Executable Storytelling" und der Bruch des Monologs
Ein zentraler Gedanke ist der holistische Ansatz zwischen Autor und Nutzer:
- **Die kuratierte Basis:** Der Autor eines Datensatzes definiert im JSON-File bereits eine intentionale Darstellung (ein "Cold Start"-Setup). Er führt den Nutzer durch das System.
- **Interaktiver Diskurs:** Nodges bricht den passiven Medienkonsum auf. Der Nutzer kann die "Show" jederzeit pausieren, das Mapping ändern und das System durch "Inquiry-based Learning" eigenständig explorieren. Hypothesen können direkt im 3D-Raum visuell getestet werden.

## 2. Visuelles Mapping und Semantik
Das visuelle System in Nodges ist darauf ausgelegt, maximale kognitive Entlastung ("Cognitive Offloading") zu bieten. Das Gehirn soll keine Text-Panels lesen müssen, um Zusammenhänge zu verstehen.

- **Visuelle Metaphern & Semantisches Mapping:** Abstrakte Daten (z.B. Einfluss, Netzwerkstatus, Ausfälle) werden direkt auf physikalische Eigenschaften (Knotengröße, Liniendicke, Leuchteffekte/Glow, Animationspulse) gemappt. Eine hauchdünne Linie steht intuitiv für eine schwache oder abbrechende Verbindung.
- **Gestaltgesetze in 3D:** Durch das physikbasierte Layout (Force-Directed) und farbliches Mapping gruppiert das System Daten automatisch. Knoten mit ähnlichen Eigenschaften bilden räumlich und farblich erkennbare Wolken (Gesetz der Nähe und Ähnlichkeit).
- **Signal-Rausch-Verhältnis:** Unwichtige oder inaktive Knoten werden nicht hart gelöscht, sondern per `opacity`-Mapping fast unsichtbar (z.B. 10 % Deckkraft) gemacht. Der Gesamtkontext bleibt erhalten, während das relevante "Signal" kristallklar hervortritt.

## 3. Architektur und Technologie
Nodges ist "Web-Native" und erfordert keine Installation, was den Einsatz in restriktiven IT-Umgebungen ermöglicht.

- **Tech-Stack:** TypeScript, Three.js, Vite, Zod (für strikte Laufzeitvalidierung von JSON-Daten).
- **Manager-Orchestrator-Muster:** Eine saubere Trennung von State und Rendering. 
  - Der `StateManager` fungiert als "Single Source of Truth" inklusive Undo/Redo.
  - Der `CentralEventManager` übersetzt rohe Browser-Eingaben in semantische Aktionen.
  - Rechenintensive Layouts laufen parallel in **Web Workern**, um die UI performant zu halten.
- **Kompromisslose Performance:** Nutzung von Hardware-Instancing (`THREE.InstancedMesh`), um 50.000+ Knoten in einem einzigen Draw-Call auf der GPU zu rendern.

## 4. Konkrete Pläne und UI-Konzepte

### Hybrides Rendermodell (Auto-FPS-Fallback)
Ein konkreter Plan für das Rendering ist die parallele Unterstützung von `THREE.Mesh` und `THREE.InstancedMesh` (`plan_rendermode.md`).
- **Mesh-Modus:** Bietet maximale Flexibilität und wird standardmäßig genutzt.
- **Auto-Modus:** Ein Performance-Monitor überwacht die Framerate. Fällt diese für mehr als 2 Sekunden unter 15 FPS, wechselt Nodges automatisch und nahtlos auf `InstancedMesh`, um massiv Performance zu sparen, bis ein neuer Graph geladen wird.

### Gestufte UI-Komplexität
Um unterschiedlichen Nutzergruppen gerecht zu werden, bietet die Oberfläche drei Modi:
1. **Simple:** Für reine Betrachter.
2. **Expert:** Für Analysten, die tief ins visuelle Mapping eingreifen wollen.
3. **Dev:** Bietet vollständigen Zugriff auf Systemvariablen, FPS-Monitore und Debug-Tools.

### Mapping-Panel Interaktion (Drill-Down / Filter-Idee)
Die Kacheln im Mapping-Panel (linke Seitenleiste) listen die Attribute des Systems auf. Klickt man auf eine Kachel (z.B. `type`), entfalten sich die spezifischen Untergruppen bzw. Werte (z.B. "Mensch", "Tier", "Pflanze").
**Zukünftige Idee:** Mit einem weiteren Klick auf einen spezifischen Wert (z.B. "Mensch") könnte eine exklusive Visualisierung/Filterung angestoßen werden, sodass nur noch Nodes dieses Typs hervorgehoben oder isoliert dargestellt werden.
**Herausforderung:** Diese direkte Filterung aus dem Mapping-Panel heraus kann schnell zu Verwirrung führen (z.B. wenn Nutzer den Graphen als unvollständig wahrnehmen, weil sie den aktiven Filter vergessen). Eine sehr klare UI-Rückmeldung (z.B. ein auffälliges "Filter aktiv"-Badge) wäre hier zwingend erforderlich.

---
*Dieses Dokument bündelt die verstreuten konzeptionellen Pläne und dient als Nordstern für zukünftige Architektur- und Design-Entscheidungen.*

## 5. Externe Physik-Bibliothek zur Skalierung (d3-force-3d)
**Problem:** Der N-Body-Algorithmus (Force-Directed Layout) im Worker berechnet Kräfte aktuell in einer $O(N^2)$ Schleife, was bei großen Graphen (z.B. > 1000 Knoten) zu Ruckeln und Performance-Einbrüchen führt.
**Lösungsansatz:** Sobald Skalierungsprobleme auftreten, soll die Vektormathematik im Web-Worker durch eine graphenspezifische Physik-Bibliothek wie `d3-force-3d` ersetzt werden. Diese nutzt den Barnes-Hut-Algorithmus (Octree), um die Komplexität auf $O(N \log N)$ zu reduzieren, wodurch selbst zehntausende Knoten in Echtzeit flüssig simuliert werden können. Auf echte Rigid-Body Engines (wie Cannon.js) soll explizit verzichtet werden, da deren Verhalten (Schwerkraft, Rotation, "Umfallen" von Objekten) ungeeignet für Netzwerk-Topologien ist.

## 6. Erweiterung der Beziehungsstrukturen (1-zu-n und n-äre Beziehungen)
**Problem/Status quo:** Aktuell unterstützen die physikalischen Layout-Algorithmen und der Layout-Worker in `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/LayoutManager.ts` ausschließlich Kanten mit einem eindeutigen Start- und Endpunkt (`source` und `target`). Zwar erlaubt das Kanten-Schema ein `nodes`-Array (`nodes: string[]`), dieses wird jedoch im Layout verworfen und in der 3D-Visualisierung (`C:/Users/ich/Desktop/code/_projects/Nodges/src/core/EdgeObjectsManager.ts`) als vollständige Clique (jeder mit jedem) gezeichnet, was nicht immer dem semantischen Wunsch einer gerichteten 1-zu-n-Beziehung entspricht.
**Lösungsansatz:** 
- **Nativ geführte 1-zu-n-Beziehungen:** Einführung eines echten 1-zu-n-Datenmodells für Beziehungen (z. B. durch ein `targets`-Array), das sowohl im `LayoutManager` als auch im Layout-Worker als sternförmiges Kraftmodell (Anziehungskraft vom Quellknoten zu allen Zielknoten) abgebildet wird.
- **Unterstützung für Hyperedges/Nodes-Array im Layout:** Integration des bestehenden `nodes`-Arrays in die Layout-Engine, um Gruppenverbindungen oder ungerichtete Cliquen physikalisch zu simulieren, ohne dass diese vom Worker gefiltert und ignoriert werden.