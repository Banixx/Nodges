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

### Der Core-Stack (Stand v0.101.1)

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
*Geprüft gegen Build: 0.101.1*
