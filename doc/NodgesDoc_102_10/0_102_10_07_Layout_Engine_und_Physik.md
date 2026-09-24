# 06 Algorithmen, Layout Engine und Physik

Die räumliche Anordnung (Layout) von Graphen ist eines der komplexesten Themen der Informationsvisualisierung. Dieses Kapitel detailliert, wie Nodges klassische Physik-Simulationen mit direktem Daten-Mapping und semantischer Algorithmik kombiniert.

---

## 1. Die Rolle der Physik-Engine

> **Visualisierung:** Siehe [07_PhysikMappingEntflechtung_001.mmd](07_PhysikMappingEntflechtung_001.mmd)

In klassischen Graph-Viewern (wie Gephi oder alten D3.js Demos) bestimmt ausschließlich eine physikalische Simulation (Force-Directed Graph), wo ein Knoten im Raum liegt. Nodges bricht mit diesem Paradigma, da Position (`X`, `Y`, `Z`) hier ein First-Class Channel für Daten ist.

### 1.1 Physik als intelligentes Fallback
Die Physik-Engine (oft implementiert über Repulsion/Attraction-Kräfte, ähnlich dem Barnes-Hut-Algorithmus oder D3-Force 3D) wird **nur dann und genau dort** angewendet, wo der Nutzer keine expliziten Daten gemappt hat.

- **Szenario A (Vollständiges Mapping):** Der Nutzer mappt "Jahresumsatz" auf Y und "Gründungsjahr" auf X. Die Physik-Engine wird für diese Knoten auf der X- und Y-Achse hart deaktiviert (die Koordinaten sind gesperrt).
- **Szenario B (Teilweises Mapping):** Z bleibt ungemappt. Die Physik-Engine darf die Knoten nur noch auf der Z-Achse verschieben (1D-Force-Layout), um Überlappungen auf der Z-Ebene zu vermeiden.
- **Szenario C (Kein Mapping):** Das System operiert im klassischen Modus. Knoten stoßen sich gegenseitig ab (Charge), während Kanten sie wie Federn zusammenziehen (Link Force). Das Ergebnis ist ein organisches, topologisches Cluster.

Dieses Entflechten von Mapping und Layout-Simulation verhindert das chaotische "Herumfliegen" von Knoten, wenn feste Koordinaten gefordert sind.

---

## 2. Dimensionalitätsreduktion und semantische Algorithmen

> **Visualisierung:** Siehe [07_KosinusAehnlichkeitPipeline_002.mmd](07_KosinusAehnlichkeitPipeline_002.mmd)

Mit dem Sprung zu Build 9 und Build 10 wurde das Algorithmik-Portfolio von Nodges um maschinelles Lernen (NLP/Embeddings) erweitert, um nicht nur quantitative, sondern semantische Zusammenhänge berechnen zu können.

### 2.1 Vektor-Embeddings
Nodges kann Texte (z.B. die `description` oder das `label` eines Knotens) durch ein Embedding-Modell (z.B. `text-embedding-3-small` von OpenAI oder via Ollama lokal) in hochdimensionale Vektoren übersetzen. Ein Vektor ist eine Liste von Fließkommazahlen (oft 1536 Dimensionen), die die exakte semantische Bedeutung des Wortes repräsentiert.

### 2.2 Kosinus-Ähnlichkeit (Cosine Similarity)
Sobald Vektoren vorliegen, nutzt Nodges die Kosinus-Ähnlichkeit, um den Winkel zwischen zwei Vektoren zu berechnen. 
Die Formel: `similarity = cos(θ) = (A · B) / (||A|| ||B||)`
Dies liefert einen Wert zwischen -1 (komplett gegensätzlich) und 1 (identisch).

**Anwendung in Nodges (Build 10 Edge Weighting):**
- Das System berechnet die Kosinus-Ähnlichkeit zwischen zwei verbundenen Entitäten.
- Der Wert wird normalisiert (z.B. auf eine Skala von 0-100).
- Dieser errechnete Score wird direkt als Eigenschaft (z.B. `semantic_weight`) auf die Kante geschrieben.
- Das Visual Mapping greift diesen Score auf und zeichnet hoch-ähnliche Kanten dicker, dunkler oder leuchtender. So offenbart die Layout-Engine verborgene semantische Verwandtschaften, die das LLM in der bloßen Taxonomie vielleicht übersehen hätte.

### 2.3 Deduplizierung (Build 9 Ansatz)
Derselbe Algorithmus wird genutzt, um LLM-Halluzinationen (Duplikate) zu bereinigen. Iteriert die Engine über den Graphen und findet zwei Knoten (z.B. "USA" und "United States of America") mit einer Kosinus-Ähnlichkeit > 0.95, fusioniert (mergt) der Algorithmus die beiden Knoten und leitet alle eingehenden und ausgehenden Kanten auf den verbleibenden Knoten um.

---

## 3. Zukünftige algorithmische Potenziale

> **Visualisierung:** Siehe [07_NetzwerkMetrikenPotenzial_003.mmd](07_NetzwerkMetrikenPotenzial_003.mmd)

Die Architektur von Nodges ist darauf vorbereitet, klassische Netzwerk-Metriken lokal im Browser zu berechnen (z.B. via WebWorkers, um den Main-Thread nicht zu blockieren):
- **PageRank:** Identifikation der wichtigsten Knoten basierend auf der Kanten-Topologie.
- **Betweenness Centrality:** Finden von Knoten, die als "Brücken" zwischen verschiedenen Clustern fungieren.
- Diese errechneten Metriken können wiederum als neue `properties` in den Datenbestand injiziert und visuell gemappt werden.
