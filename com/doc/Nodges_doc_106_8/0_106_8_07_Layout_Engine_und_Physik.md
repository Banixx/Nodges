# 07 Algorithmen, Layout Engine und Physik

Dieses Kapitel beschreibt die mathematischen und algorithmischen Grundlagen von Nodges in Version **0.106.8**. Es erlaeutert das Zusammenspiel zwischen physikalischer Kraeftesimulation (Force-Directed Layout), selektiver Koordinatenfixierung durch Daten-Mappings und semantischen Vektoralgorithmen (Kosinus-Aehnlichkeit, Deduplizierung).

---

## 1. Die Rolle der Physik-Engine

> **Visualisierung:** Siehe [07_PhysikMappingEntflechtung_001.mmd](07_PhysikMappingEntflechtung_001.mmd)

In herkoemmlichen Graph-Visualisierern entscheidet ausschliesslich eine physikalische Kraeftesimulation (wie Barnes-Hut oder D3-Force 3D) ueber die Raumkoordinaten. In Nodges hingegen ist der dreidimensionale Raum (`X`, `Y`, `Z`) ein primaerer Datenkanal. Die Physik-Engine dient daher als **intelligentes Fallback- und Entflechtungssystem**:

```
                  ┌───────────────────────────────┐
                  │ Eingehender Knoten mit Daten  │
                  └──────────────┬────────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             │ Sind Achsen durch Mappings belegt?    │
             └───────────────────┬───────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
[Vollstaendiges Mapping] [Teilweises Mapping]     [Kein Mapping]
- Alle Achsen fixiert    - z.B. X & Y fixiert,    - Volle 3D-Simulation
- Physik vollstaendig      Z frei fuer Kraefte    - Kantenfedern &
  deaktiviert            - 1D-Kollisionsabbau       Knotenabstossung
```

### 1.1 Entflechtung von Physik und Attribut-Mapping
1. **Szenario A (Vollstaendiges Achsen-Mapping):**  
   Mappt der Nutzer beispielhaft "Jahresumsatz" auf Y und "Gruendungsdatum" auf X sowie "Region" auf Z, werden die Positionen exakt gemaess den Datenskalierungen fixiert. Die physikalische Krafteinwirkung wird fuer diese Entitaeten vollstaendig unterbunden, um ein stabiles Koordinatengitter zu gewaehrleisten.
2. **Szenario B (Partielles Mapping / 1D-Force):**  
   Sind lediglich X und Y durch Attribute festgelegt, bleibt die Z-Achse flexibel. Die Physik-Engine darf Knoten entlang der Z-Achse verschieben, um visuelle Ueberlagerungen aufzuloesen (*Kollisionsvermeidung*).
3. **Szenario C (Topologisches Clustering):**  
   Liegt kein raeumliches Attribut-Mapping vor, greift die klassische 3D-Kraefteraum-Simulation: Knoten stossen sich elektrostatisch ab (*Charge/Repulsion*), waehrend Kanten wie elastische Federn wirken (*Link Tension*). Stark vernetzte Subgraphen bilden organische, topologische Ballungsraeume.

---

## 2. Web Worker Auslagerung fuer ruckelfreie Interaktion

Die Berechnung von $N$-Koerper-Simulationen besitzt typischerweise eine Komplexitaet von $\mathcal{O}(N \log N)$ (Barnes-Hut) oder $\mathcal{O}(N^2)$. Um den JavaScript-Hauptthread (Main Thread) nicht zu blockieren und das 60-FPS-Renderziel nicht zu gefaehrden, ist die Layout-Engine im `LayoutManager` als **Web Worker** gekapselt:
- Der Worker empfaengt Positions- und Topologiematrizen ueber `postMessage` (unter Verwendung von `SharedArrayBuffer` bzw. transferierbaren TypedArrays).
- Er iteriert die physikalischen Zeitschritte (Ticks) asynchron im Hintergrund.
- Nach jedem Rechenschritt oder in festen Intervallen werden die aktualisierten Positionskoordinaten an den `NodeManager` uebertragen, welcher die GPU-Instanzbuffer aktualisiert.

---

## 3. Semantische Vektoralgorithmen und NLP-Verfahren

> **Visualisierung:** Siehe [07_KosinusAehnlichkeitPipeline_002.mmd](07_KosinusAehnlichkeitPipeline_002.mmd)

Zur semantischen Analyse relationaler Netze nutzt Nodges hochdimensionale Embeddings:

### 3.1 Vektor-Repraesentation
Beschreibungen, Bezeichnungen und Kontextdaten werden ueber ein Embedding-Modell (in Version 0.106.8 standardmaessig OpenRouter `qwen/qwen3-embedding-8b` mit 4096 Dimensionen, alternativ lokale Modelle) in Vektoren ueberfuehrt.

### 3.2 Kosinus-Aehnlichkeit (Cosine Similarity)
Fuer je zwei Knotenvektoren $\vec{A}$ und $\vec{B}$ berechnet das System die Aehnlichkeit ueber das Skalarprodukt geteilt durch das Produkt der Normen:

$$\text{similarity} = \cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|}$$

- **Semantische Kantenstaerken:**  
  Der berechnete Aehnlichkeitswert (normiert auf $0$ bis $100$) wird als `semantic_weight` auf Kanten abgelegt. Das Visual Mapping greift diesen Wert auf und verstaerkt hochgradig verwandte Relationen visuell (erhoehte Liniendicke, hellerer Farbton, beschleunigter Kantenfluss).
- **Vektorgestuetzte Deduplizierung:**  
  Bei inkrementellen Wissensgraphen-Importen prueft der Algorithmus die Aehnlichkeit aller neu hinzukommenden Entitaeten. Bei einer Uebereinstimmung von $> 95\,\%$ werden Entitaeten fusioniert, um Duplikate deterministisch zu eliminieren.

---

## 4. Topologische Netzwerkanalysen (Graph-Metriken)

> **Visualisierung:** Siehe [07_NetzwerkMetrikenPotenzial_003.mmd](07_NetzwerkMetrikenPotenzial_003.mmd)

Die Architektur unterstuetzt die lokale Berechnung klassischer Netzwerkkennzahlen direkt im Browser:
- **Degree Centrality:** Anzahl der ein- und ausgehenden Kanten zur schnellen Identifikation hochgradig vernetzter Hubs.
- **Betweenness Centrality:** Haeufigkeit, mit der ein Knoten auf kuerzesten Pfaden zwischen anderen Knotenpaaren liegt (Identifikation von Schluesselbruecken).
- **PageRank:** Rekursive Relevanzbewertung anhand der Qualitaet eingehender Verbindungen.

Errechnete Metriken werden automatisch als neue Eigenschaften in das `properties`-Dictionary der Entitaeten injiziert und stehen sofort fuer Mappings und Filterregeln zur Verfuegung.
