# 14 Ideen und Roadmap (Future Concepts)

> **Visualisierung:** Siehe [14_RoadmapFeatureHorizonte_001.mmd](14_RoadmapFeatureHorizonte_001.mmd)

Dieses Kapitel buendelt Zukunftskonzepte, methodische Erweiterungen und experimentelle Architektur-Entwuerfe fuer Nodges jenseits der Version **0.106.8**. Es dient als strategischer Leitfaden fuer kommende Entwicklungszyklen.

---

## 1. Die Zeitdimension und Systemsimulation (TimeEngine)

> **Visualisierung:** Siehe [14_TimeEngineSimulation_002.mmd](14_TimeEngineSimulation_002.mmd)

Waehrend Version 0.106.8 temporale Datenstrukturen (`validFrom`, `validTo`, Keyframe-Deltas) schemaseitig validiert und im Time-Player abbildet, zielt die naechste Ausbaustufe auf eine interaktive **Echtzeit-Systemsimulation**:

- **Dynamische Attribut-Deltas:** Knoten erhalten Zerfallsraten (*Decay Rate*), Kanten uebertragen kausale Impulse in periodischen Intervallen.
- **Kaskadeneffekte:** Faellt ein zentraler Netzknoten aus oder ueberschreitet eine definierte Lastgrenze (*Threshold*), propagiert der Schaden ueber inzidente Relationen durch das Gesamtsystem.
- **Time-Warp Steuerung:** Eine Scrubbing-Zeitleiste erlaubt das stufenlose Vor- und Zurueckspulen von Systemzustaenden mit automatischer Interpolation zwischen diskreten Messpunkten.

---

## 2. Geospatial Mapping (Hybride 3D-Kartenwelten)

> **Visualisierung:** Siehe [14_GeospatialMappingArchitektur_004.mmd](14_GeospatialMappingArchitektur_004.mmd)

Fuer Datensaetze mit realer geografischer Verankerung (z. B. internationale Lieferketten, Unterseekabel oder Flugrouten) wird das klassische topologische Layout durch Geokoordinaten ergaenzt:

- **Geodaten-Fixierung (`mapX`, `mapY` / Lat-Long):** Knoten werden auf einer referenzierten 2D-/3D-Weltkarte arretiert.
- **Parabolische 3D-Boegen:** Um Ueberlappungen und Sichtblockaden auf der Kartenoberflaeche zu vermeiden, woelben sich Kanten als Hoehenkurven (Bezier-Splines) in den Z-Raum. Die Scheitelpunkthoehe kodiert zusaetzliche Metriken wie Distanz oder Transportvolumen.

---

## 3. High-Scale Physik-Optimierung via Barnes-Hut (`d3-force-3d`)

> **Visualisierung:** Siehe [14_BarnesHutSkalierung_003.mmd](14_BarnesHutSkalierung_003.mmd)

Die native Web-Worker-Kraefterechnung skaliert aktuell bei dichten Netzwerken mit quadratischem Aufwand $\mathcal{O}(N^2)$.
- **Ziel:** Integration des Barnes-Hut-Algorithmus unter Verwendung von dreidimensionalen Octrees (`d3-force-3d`).
- **Wirkung:** Reduktion der Rechenkomplexitaet auf $\mathcal{O}(N \log N)$. Dies ermoeglicht die simultane raeumliche Anordnung von ueber 50.000 Knoten im Browser ohne spuerbaren Bildratenverlust.

---

## 4. Hyperkanten und 1-zu-N-Beziehungsstrukturen

Aktuell unterstuetzt das Graphmodell binaere Relationen (`source` und `target`).
- **Erweiterung:** Einfuehrung von Hyperedges mit einem `targets`-Array.
- **Visualisierung:** Sternfoermige Kantenverzweigungen mit dynamischen Knotenweichen zur adquaten Modellierung von Broadcast-Netzwerken, Konsortien oder multilateralen Vertraegen.

---

## 5. Vollintegrierte Graph-RAG Wissensspeicher

Aufbauend auf dem in Version 0.106.8 etablierten LightRAG-Backend soll die semantische Wissensexploration weiter automatisiert werden:
- **Live-Nachladen ("Infinite Graph Canvas"):** Durch Klick auf einen Randknoten fragt das System aehnliche Vektoren aus dem lokalen RAG-Speicher ab und erweitert den Graphen nahtlos um neue Satellitenknoten.
- **Multi-Dokumenten Ingestion:** Direktes Einlesen ganzer PDF- und Markdown-Verzeichnisse in den Vektorspeicher mit automatischer Tripel-Extraktion.

---

## 6. Unkonventionelle Wahrnehmungskanaele und Spatial Computing

> **Visualisierung:** Siehe [14_NegativeDarstellung_005.mmd](14_NegativeDarstellung_005.mmd)

- **WebXR / Spatial Immersion:** Portierung der Three.js-Szenensteuerung auf immersive Headsets (Apple Vision Pro, Meta Quest). Anwender koennen Graphen physisch greifen, durchschreiten und raeumlich skalieren.
- **Audio-visuelle Synaesthesie:** Prozedurale Klangsynthese beim Ueberstreichen von Clustern. Dichte Knotenverbunde erzeugen harmonische Akkorde, waehrend Fehler- und Ueberlastungszustaende dissonante Frequenzen emittieren.
- **Fraktale Sub-Netzwerke:** Zoomen in einen Knoten oeffnet nahtlos dessen innere Systemarchitektur (*System-in-System* Abstraktion).
- **Negative Darstellung (Phantom-Kanten):** Visualisierung antizipierter, aber tatsaechlich fehlender Relationen als gestrichelte "Geisterkanten" fuer Sicherheits- und Lueckenanalysen.
