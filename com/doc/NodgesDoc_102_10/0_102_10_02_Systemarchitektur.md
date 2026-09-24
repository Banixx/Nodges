# 01 Vision und Systemarchitektur

## 1. Grundlegende Philosophie und Kognition

Nodges ist nicht einfach eine weitere Dashboard-Anwendung zur Betrachtung tabellarischer Daten. Nodges ist als dreidimensionale, kognitive Explorationsplattform konzipiert. Die grundlegende Vision besteht darin, abstrakte Zusammenhänge, Wissensgraphen und komplexe, multidimensionale Datensätze intuitiv und visuell erfahrbar zu machen.

### 1.1 Die Überwindung von Flat-Data
Klassische Datenstrukturen (SQL, Excel) zwingen multidimensionale Zusammenhänge in zweidimensionale Tabellen. Nodges bricht mit diesem Paradigma. Durch die Nutzung der räumlichen Dimension (X, Y, Z) gepaart mit visuellen Eigenschaften (Größe, Farbe, Form, Transparenz, Bewegung) ermöglicht Nodges die simultane Wahrnehmung von bis zu sieben Informationsdimensionen. 
Der Mensch ist evolutionär darauf trainiert, räumliche Muster, Cluster und Ausreißer im dreidimensionalen Raum in Bruchteilen von Sekunden zu erkennen. Nodges nutzt diese kognitiven Fähigkeiten, um "Sensemaking" in komplexen Systemen zu beschleunigen.

### 1.2 Die Symbiose aus KI und 3D-Engine
Nodges vereint zwei hochmoderne Technologien zu einem einzigartigen Werkzeug:
- **Large Language Models (LLMs):** Fungieren als "Ontologie-Architekten" und Kuratoren. Sie haben die Aufgabe, Themen semantisch so tief wie möglich zu erschließen, Entitäten zu identifizieren und ihre Beziehungsgeflechte (Taxonomien, Kausalitäten, zeitliche Abläufe) zu extrahieren.
- **Three.js (WebGL):** Dient als extrem performante Visualisierungsebene, die die vom LLM generierten Graphen in Echtzeit rendert, filtert und physikalisch simuliert.

---

## 2. Die 7 Dimensionen der Kommunikation

Jedes Element (Knoten oder Kante) in Nodges ist nicht nur ein visuelles Objekt, sondern ein Informationsträger. Die Architektur unterstützt das Mapping von Daten auf folgende sieben Kanäle:

1. **Raum (Position X, Y, Z):** Der stärkste kognitive Kanal. Erlaubt Kategorisierung (z.B. X=Zeit, Y=Relevanz, Z=Geografie).
2. **Größe (Skalierung):** Ideal für kontinuierliche, numerische Metriken (z.B. Umsatz, Einflusswert, Bevölkerung).
3. **Farbe (Hue, Saturation, Lightness):** Hervorragend für diskrete Kategorien (z.B. Status: Rot/Grün, Typ: Firma/Person) oder Heatmaps.
4. **Form (Geometrie):** Kugeln, Würfel, Kapseln zur Unterscheidung von Entitätstypen.
5. **Bewegung (Animation / Flow):** Pulsieren oder fließende Partikel auf Kanten zur Darstellung von Datenfluss, Transaktionen oder zeitlicher Dynamik.
6. **Transparenz (Opacity):** Zur Darstellung von Unsicherheit, Vergangenen oder Herausfiltern irrelevanter Daten.
7. **Text (Label):** Die explizite, textuelle Beschreibung.

> [!IMPORTANT]
> **Kognitive Belastung (Goldene Regel):** Es dürfen maximal 4 Dimensionen gleichzeitig intensiv genutzt werden. Werden alle 7 Kanäle gleichzeitig mit verschiedenen Datenpunkten gemappt, entsteht ein kognitiver Overload ("Cluttering"). Die Architektur von Nodges empfiehlt als Best-Practice: Position + Farbe + Größe + 1 Detail.

---

## 3. Strikte Trennung von Ontologie, Daten und Visual Mapping (Die Build 5 Revolution)

> **Visualisierung:** Siehe [02_DreiSaeulenArchitektur_001.mmd](02_DreiSaeulenArchitektur_001.mmd) und [02_Build5PivotEntkopplung_003.mmd](02_Build5PivotEntkopplung_003.mmd)

Einer der wichtigsten Paradigmenwechsel in der Geschichte von Nodges (eingeführt mit Build 5) ist die strikte Entkopplung der Datenstruktur von der visuellen Repräsentation. Frühere Versionen verknüpften den `type` eines Objekts hart mit seiner Darstellung (z.B. `if (type === 'Server') renderCube()`). Dies limitierte die Flexibilität extrem.

Die moderne Architektur gliedert sich zwingend in drei unabhängige Säulen:

### 3.1 Die Ontologie (Das Schema)
Definiert die Struktur der Welt. Welche Arten von Knoten (Entities) existieren? Welche Arten von Kanten (Relationships) sind erlaubt? Welche Attribute besitzen sie?
- Die Ontologie ist ein reines Metadaten-Konstrukt.
- Die Eigenschaft `type` dient nur noch der logischen Kategorisierung und Filterung, stellt aber keine visuelle Vorschrift mehr dar.

### 3.2 Die Daten (Der Graph)
Die tatsächlichen Instanzen.
- Die Datenstruktur ist **vollständig flach**.
- Es gibt keine verschachtelten Objekte innerhalb von Knoten. Besitzt ein Knoten "Kinder", so müssen diese Kinder als eigene Knoten angelegt werden, verbunden durch Kanten.
- Jeder Knoten enthält ein `properties`-Objekt, das maximalen Datenreichtum liefert, völlig unabhängig davon, ob diese Daten initial angezeigt werden oder nicht.

### 3.3 Das Visual Mapping (Die Repräsentation)
Die dynamische Brücke zwischen Ontologie/Daten und der 3D-Szene.
- Nodges übernimmt die Regie über die Darstellung der gelieferten Rohdaten durch heuristisches Mapping beim Start.
- Der Nutzer kann das Mapping live in der UI ändern, ohne dass die zugrunde liegenden Rohdaten neu geladen werden müssen.
- Diese Entkopplung ermöglicht es, exakt denselben Datensatz in völlig unterschiedlichen Kontexten zu betrachten (z.B. denselben Unternehmensgraph einmal geclustert nach Abteilung, und danach geclustert nach Budget-Verantwortung).

---

## 4. Tech-Stack und Architektur-Übersicht

> **Visualisierung:** Siehe [02_TechStackUebersicht_002.mmd](02_TechStackUebersicht_002.mmd)

Das Fundament von Nodges besteht aus einer modernen, leichtgewichtigen Toolchain:

### 4.1 Frontend Core
- **HTML5 & Vanilla CSS (`index.css`):** Das Styling nutzt modernes, reines CSS. Auf Frameworks wie Tailwind wird bewusst verzichtet, um die Kontrolle über das Design System (Glassmorphismus, Micro-Animations) maximal zu halten.
- **TypeScript:** Sorgt für strikte Typisierung, die insbesondere bei der Verarbeitung der LLM-Daten durch Interfaces essenziell ist.
- **Vite:** Als extrem schnelles Build-Tool und Dev-Server.

### 4.2 Engine und Rendering
- **Three.js (`^0.161.0`):** Die Kern-Engine für das 3D-Rendering. Verwaltet Szene, Kamera, Beleuchtung und das Instanced-Rendering für hohe Performance bei tausenden Knoten.

### 4.3 Logik und Hilfssysteme
- **Zod (`^3.22.4`) & zod-to-json-schema:** Zuständig für die Laufzeitvalidierung. Definiert das Schema, zwingt das LLM in ein strukturiertes JSON-Format und validiert die Rückgabe.
- **lil-gui (`^0.19.1`):** Steuert das Sidebar-Interface und die Mapping-Kontrollen. Es ist extrem performant, DOM-effizient und fügt sich nahtlos in WebGL-Anwendungen ein.
- **Vitest:** Dient der Quality Assurance, Unit-Testing und Coverage-Analyse (`test:ui`, `test:coverage`).

### 4.4 Architektur-Prinzipien
1. **Zero Data Retention:** Nodges ist eine Frontend-only Applikation. Sie speichert niemals API-Keys im Code oder auf einem Backend-Server. LLM-Provider-Einstellungen werden im LocalStorage des Browsers des Nutzers verwaltet.
2. **Local-First Ready:** Die Architektur unterstützt die nahtlose Umschaltung von Cloud-Inferenz (OpenAI, Anthropic) auf lokale Inferenz (Ollama, LM Studio).
3. **Decoupled UI:** Die Benutzeroberfläche operiert unabhängig von der Render-Schleife (Render-Loop).
