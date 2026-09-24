# 14 Ideen und Roadmap (Future Concepts)

> **Visualisierung:** Siehe [14_RoadmapFeatureHorizonte_001.mmd](14_RoadmapFeatureHorizonte_001.mmd)

Dieses Kapitel sammelt Konzepte, Evaluierungen und Architektur-Entwürfe, die zwar im Projektverlauf extrem detailliert ausgearbeitet, aber im aktuellen Build (10.x) **noch nicht oder nur teilweise implementiert** wurden. Sie dienen als Nordstern und Roadmap für künftige Erweiterungen.

---

## 1. Die Zeitdimension und Systemsimulation (TimeEngine)

> **Visualisierung:** Siehe [14_TimeEngineSimulation_002.mmd](14_TimeEngineSimulation_002.mmd)

Nodges ist aktuell primär ein statischer Viewer für Momentaufnahmen. Die größte anstehende Evolution ist die Transformation in einen lebendigen **Simulator**.

### Das Konzept
- **Zeit-Parameter:** Knoten erhalten dynamische Verfallsraten (`decay`) und Schwellwerte (`thresholds`). Kanten erhalten Intervalle und Effekte.
- **Edge-Effekte:** Eine Kante (z.B. "verschmutzt") sendet Impulse in einem `interval` an den Zielknoten und reduziert dort beispielsweise einen Wert (z.B. "Gesundheit" via `operation: subtract`).
- **Visuelles Feedback:** Das System reagiert auf diese Veränderungen in Echtzeit. Sinkt der Wert eines Knotens, schrumpft er; fällt er unter einen Schwellwert, wechselt er die Farbe oder stirbt (Fade-Out).
- **Time Slider UI:** Ein dediziertes Premium-Panel am unteren Rand mit Play/Pause, Rewind und Geschwindigkeits-Reglern (Time-Warp), um den Lauf der Dinge (z.B. hunderte Jahre Evolution oder Millisekunden eines Server-Angriffs) zu steuern.

---

## 2. Geospatial Mapping (Karten-Integration)

> **Visualisierung:** Siehe [14_GeospatialMappingArchitektur_004.mmd](14_GeospatialMappingArchitektur_004.mmd)

Die Physik-Engine (Force-Directed) ist perfekt für abstrakte Topologien. Für Daten mit echtem geografischen Bezug (z.B. globale Lieferketten) greift jedoch ein anderes Konzept:

- **Das `metadata.map` Objekt:** Im JSON kann eine Referenzkarte (z.B. Weltkarte) hinterlegt werden.
- **Starre Koordinaten (`mapX`, `mapY`):** Knoten erhalten feste 2D-Koordinaten. Die Physik-Engine wird für diese Knoten deaktiviert, sie werden auf der Karte "festgepinnt".
- **3D-Bögen:** Während die Knoten flach auf der Karte liegen, wölben sich die Verbindungskanten (TubeGeometries) als parabolische Kurven im 3D-Raum darüber, um Verdeckungen zu vermeiden.

---

## 3. Externe Physik-Bibliothek zur Skalierung (`d3-force-3d`)

> **Visualisierung:** Siehe [14_BarnesHutSkalierung_003.mmd](14_BarnesHutSkalierung_003.mmd)

Aktuell berechnet ein nativer Web Worker die Abstoßung der Knoten mit einer $O(N^2)$ Komplexität.
- **Das Problem:** Bei über 2.000 Knoten führt dies zu Performance-Engpässen im Layout-Thread.
- **Die Idee:** Die Implementierung der Bibliothek `d3-force-3d`. Diese nutzt den Barnes-Hut-Algorithmus (Octree), um die Berechnungs-Komplexität auf $O(N \log N)$ zu reduzieren, wodurch selbst 50.000 Knoten flüssig simuliert werden könnten, ohne dass eine Heavy-Weight Game-Engine (wie Cannon.js) benötigt wird.

---

## 4. Erweiterung der Beziehungsstrukturen (1-zu-n)

Aktuell unterstützt Nodges nur 1-zu-1 Kanten (`source` und `target`).
- **Die Idee:** Einführung eines `targets`-Arrays in den Edges. Im 3D-Raum würde dies als echtes sternförmiges Kraftmodell visualisiert (Eine dicke Hauptkante, die sich in mehrere kleine Kanten zu den Empfängern auffächert). Dies ist besonders für Broadcast-Systeme (z.B. "Server sendet an 50 Clients") essenziell.

---

## 5. RAG-Integration und Knowledge Graphs

Während Build 9 die Vektor-Deduplizierung einführte, geht die Vision weiter:
- **Die Idee:** Direkte Anbindung von Nodges an Vektordatenbanken (wie Pinecone oder ChromaDB).
- **Interaktion:** Der Nutzer klickt auf einen Knoten (z.B. "Künstliche Intelligenz") und drückt einen "Explore"-Button. Nodges feuert eine Vektorsuche ab, lädt die semantisch nahesten Konzepte live aus der Datenbank nach und instanziiert sie dynamisch im 3D-Raum ("Infinite Canvas").

---

## 6. Interoperabilität (GEXF Export für Gephi)

Eine weitreichende historische Evaluierung hat gezeigt, dass Nodges keine Insel sein darf.
- **Die Idee:** Eine Export-Funktion für das XML-basierte **GEXF-Format**. Dies erlaubt es Akademikern und Datenanalysten, einen via LLM in Nodges erschaffenen Graphen zu exportieren, um ihn in wissenschaftlichen 2D-Werkzeugen (wie *Gephi*) mathematisch auf Eigenvector-Centrality oder Betweenness zu analysieren.
- Ein bidirektionaler Import (Gephi -> Nodges) würde zudem ermöglichen, klassische, visuell unattraktive Graphen im Nodges-3D-System mit Glassmorphism-Ästhetik für Präsentationen aufzuwerten.

---

## 7. Modus-basiertes UI (Edit vs. View)

Aktuell verdecken Sidebar und Panels oft den majestätischen 3D-Graphen.
- **Die Idee:** Ein dezenter Toggle zwischen "Edit" und "View". Im View-Modus fährt die komplette GUI weich aus dem Bildschirm und rollt sich zu minimalen Indikatoren am unteren Bildschirmrand zusammen. Das Resultat ist eine kinoreife, ablenkungsfreie Immersions-Präsentation.

---

## 8. Unkonventionelle Kommunikations-Pfade

> **Visualisierung:** Siehe [14_NegativeDarstellung_005.mmd](14_NegativeDarstellung_005.mmd)

Die Limitierung auf optische Eindrücke ist nur der Anfang. Das Archiv beschreibt tiefergehende, sinnesübergreifende UX-Experimente:
- **Audio-visuelle Synopsie:** Knoten erzeugen beim Hovern eigene Klänge (tiefe Frequenzen für große Knoten, Dissonanz für "rote" Status-Knoten). Das Netzwerk wird hörbar.
- **Haptisches Feedback (VR/XR):** Vorbereitung für WebXR. Controller vibrieren beim Durchschneiden von High-Traffic-Kanten, Knoten bieten physischen "Widerstand" beim Greifen.
- **Fraktale Nodes:** Ein Knoten ist nicht nur ein Endpunkt. Beim extremen Heranzoomen entpuppt sich ein Knoten als komplettes eigenes Sub-Netzwerk (System-in-System Darstellung).
- **Negative Darstellung (Was fehlt?):** Das System invertieren. Anstatt "Was ist da?" zeigt Nodges die Phantome von zu erwartenden, aber fehlenden Verbindungen als gestrichelte, geisterhafte Linien (besonders wertvoll für Cybersecurity oder Supply-Chain Ausfälle).
