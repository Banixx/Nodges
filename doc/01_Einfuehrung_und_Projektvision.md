# 01 Einführung und Projektvision

## 01.1 Projektidentität

### Was ist Nodges?
**Nodges** (eine Wortschöpfung aus **NO**des und e**DGES**) ist eine fortschrittliche Softwarelösung zur Visualisierung komplexer Netzwerke im dreidimensionalen Raum. Anders als herkömmliche 2D-Graphen nutzt Nodges die dritte Dimension, um dichte Informationsstrukturen zu entflechten und intuitiv erfassbar zu machen.

Das Projekt versteht sich nicht nur als Viewer, sondern als interaktives Analysewerkzeug. Es wurde entwickelt, um die Lücke zwischen abstrakten Datenstrukturen und menschlicher Wahrnehmung zu schließen. Durch den Einsatz modernster Web-Technologien (**Three.js**, **WebGL**) läuft Nodges performant direkt im Browser, ohne dass zusätzliche Software installiert werden muss.

### Kernziele
Die Entwicklung von Nodges folgt drei primären Leitlinien:

1.  **Räumliche Übersichtlichkeit**: Nutzung des 3D-Raums, um Überlappungen ("Hairball-Effekt"), die in 2D-Graphen häufig auftreten, zu minimieren.
2.  **Performance**: Flüssige Darstellung auch bei tausenden von Knoten und Kanten durch Einsatz von Hardware-Instancing (`InstancedMesh`).
3.  **Interaktivität**: Jedes Element ist anfassbar. Benutzer sollen den Graphen nicht nur betrachten, sondern ihn durch Selektion, Highlighting und Filterung aktiv explorieren.

### Abgrenzung zu 2D-Lösungen
Während 2D-Lösungen (wie D3.js oder Cytoscape.js) hervorragend für hierarchische oder kleinere Netze geeignet sind, stoßen sie bei hochgradig vernetzten Daten schnell an Grenzen. Nodges positioniert sich hier als spezialisierte Lösung für Szenarien, in denen die Topologie komplex ist und die räumliche Anordnung (Layout) eine entscheidende Rolle für das Verständnis spielt.

## 01.2 Features und Funktionsumfang

Nodges bietet eine reichhaltige Palette an Funktionen, die in fünf Kernbereiche unterteilt sind:

### Interaktive 3D-Welt
*   **Orbit-Navigation**: Freie Rotation, Zoom und Pan-Bewegungen ermöglichen die Betrachtung aus jedem Winkel.
*   **Raycasting-Selektion**: Präzise Auswahl von Objekten im 3D-Raum per Mausklick.
*   **Fokus-System**: Automatische Kamerafahrten zu ausgewählten Knoten.

### Visuelle Feedback-Systeme
*   **Highlighting**: Ein ausgeklügeltes System mit 5 Modi (`HOVER`, `SELECTION`, `SEARCH`, `PATH`, `GROUP`) sorgt für sofortiges visuelles Feedback.
*   **Glow-Effekte**: Animierte, pulsierende Emissionen lenken die Aufmerksamkeit des Benutzers auf relevante Bereiche.
*   **Dynamische Materialien**: Farben und Transparenzen passen sich dem Status (z.B. aktiv/inaktiv) an.

### Layout-Automatisierung
Eine integrierte Layout-Engine berechnet Positionen basierend auf Algorithmen:
*   **Physik-Simulationen** (Force-Directed) für organische Strukturen.
*   **Geometrische Anordnungen** (Kreis, Raster, Sphäre, Helix) für strukturierte Daten.
*   **Hierarchische Layouts** für Baumstrukturen.

### Daten-Flexibilität
*   Unterstützung für das klassische **Legacy-Format** (einfache Node/Edge-Listen).
*   Umfassendes **Future-Format** mit Metadaten, Typisierung und visuellen Mappings.
*   Echtzeit-Validierung beim Import.

## 01.3 Technologie-Stack und Voraussetzungen

Nodges basiert auf einem modernen, typ-sicheren Tech-Stack:

### Core Technologies
*   **Language**: **TypeScript** (v5.3.3) - Für robuste, wartbare Codebasis und Typsicherheit.
*   **Rendering**: **Three.js** (v0.161.0) - Der Industriestandard für WebGL. Nodges nutzt fortgeschrittene Features wie `BufferGeometry`, `InstancedMesh` und Custom Shader Materials.
*   **Build Tool**: **Vite** (v5.1.4) - Für extrem schnelle Entwicklungszyklen (HMR) und optimierte Production-Builds.

### Datenintegrität & Validierung
*   **Zod** (v3.22.4): Fungiert als "Gatekeeper". Jede importierte Datei wird gegen ein striktes Schema validiert. Dies verhindert Laufzeitfehler (`undefined is not an object`) und garantiert, dass die internen Datenstrukturen immer konsistent sind. Zod generiert zudem automatisch die TypeScript-Typen für die Datenmodelle.

### User Interface (UI)
*   **HTML/CSS**: Das Overlay-UI (Panels, Buttons) ist in sauberem, performantem Vanilla HTML/CSS gehalten, um den Rendering-Thread der 3D-Engine nicht zu blockieren.
*   **lil-gui** (v0.19.1): Für Entwickler-Tools und Parameter-Steuerung (z.B. Layout-Kräfte justieren) wird diese leichtgewichtige Library eingesetzt.

## 01.4 Anwendungsbereiche

Nodges ist branchenneutral konzipiert, eignet sich aber besonders für:

*   **IT-Sicherheit & Netzwerkanalyse**: Visualisierung von Server-Kommunikation, Angriffspfaden oder Botnet-Strukturen.
*   **Wissensmanagement**: Darstellung von Knowledge Graphs, Ontologien und semantischen Beziehungen.
*   **Software-Architektur**: Visualisierung von Microservices, Abhängigkeiten zwischen Modulen oder Datenbank-Schemata.
*   **Bioinformatik**: Darstellung von Protein-Interaktions-Netzwerken oder metabolischen Pfaden.
*   **Social Network Analysis**: Untersuchung von Communities, Influencern und Informationsflüssen in sozialen Gruppen.

---
*Ende Kapitel 01*
