# Analyse: Datentypen, Skalierung, Domain und Normalisierung in Nodges

## 1. Die 6 Attribut-Typen im PropertySchema

Nodges definiert in [types.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/types.ts#L10) genau **6 Datentypen** fuer Attribute:

| Typ | Dimensionen | Beispiel | Skalierung | Aktuell implementiert? |
|-----|------------|----------|------------|----------------------|
| `continuous` | **1D** (Skalar) | `age: 28`, `trust: 0.8` | Numerisch, optional `range: [min, max]` | Voll |
| `categorical` | **1D** (Diskret) | `department: "IT"`, `domain: "Meer"` | Endliche Wertemenge (`values: [...]`) | Voll |
| `boolean` | **1D** (Binaer) | `hat_ringe: true` | `true / false` | Teilweise (DataEditor) |
| `vector` | **N-dimensional** | `personality: {openness: 0.8, extraversion: 0.4}` | Objekt mit benannten `dimensions`, gemeinsamer `range` | Parsing ja, Mapping **nein** |
| `spatial` | **3D** (Koordinaten) | `position: {x: 0, y: 5, z: -3}` | Objekt mit benannten `coordinates` | Parsing ja, Mapping ueber positionX/Y/Z getrennt |
| `temporal` | **1D** (Zeit) | `last_sync: "2026-01-01T22:00:00Z"` | String -> `Date.getTime()` (Millisekunden) | Parsing ja, visuelles Mapping **nein** |

---

## 2. Was bedeutet "Domain" im Kontext von Nodges?

Die **Domain** ist der **Eingabebereich** eines Mappings -- also der Wertebereich der *Quelldaten*, aus dem gelesen wird.

```
Domain (Daten-Seite)          ->   Range (Visuelle Seite)
[domainMin, domainMax]             [rangeMin, rangeMax]

Beispiel:
age: [18, 70]                 ->   size: [0.5, 3.0]
trust: [0, 1]                 ->   thickness: [0.05, 0.8]
```

Die Domain wird entweder:
1. **Aus dem DataModel gelesen** (`PropertySchema.range`)
2. **Automatisch berechnet** via `getAttributeDataBounds()` beim Verbinden im MappingUI
3. **Manuell eingestellt** ueber die Slider im MappingUI

> [!IMPORTANT]
> "Domain" ist hier *nicht* die inhaltliche Domain (wie "Meer" oder "Krieg" in der Mythologie), sondern ein mathematischer Begriff aus der Datenvisualisierung: der Definitionsbereich der Abbildungsfunktion.

---

## 3. Was bedeutet "Normalisierung"?

Normalisierung in Nodges passiert in **zwei Kontexten**:

### 3.1 Datenwert-Normalisierung (VisualMappingEngine)

In [VisualMappingEngine.ts:227-243](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/VisualMappingEngine.ts#L227-L243) wird jeder Rohwert auf **[0, 1]** normalisiert:

```typescript
// Linear: numValue = (numValue - domainMin) / (domainMax - domainMin)
// Logarithmisch: via log10-Transformation
// Dann: numValue = clamp(numValue, 0, 1)
```

Danach wird der normalisierte Wert ueber die Mapping-Funktion (linear, exponential, etc.) auf den visuellen `range` abgebildet.

### 3.2 Koordinaten-Normalisierung (LayoutManager / VisualOptimizer)

Raeumliche Positionen werden optional auf einen definierten Extent normalisiert (`normalizeCoordinates`), damit Nodes im 3D-Raum sinnvoll verteilt sind.

---

## 4. Ist aktuell alles eindimensional skaliert?

**Ja, fast ausschliesslich.** Die gesamte Mapping-Pipeline arbeitet mit **skalaren [min, max]-Paaren**:

```
VisualMappingSchema = {
    source: string,            // Attributname
    function: MappingFunction, // linear, exponential, logarithmic, ...
    domain: [number, number],  // Eingabebereich (1D)
    range: [number, number],   // Ausgabebereich (1D)
}
```

Jede Ziel-Eigenschaft erhaelt genau **einen Skalar**:
- `size` -> 1 Zahl
- `positionX` -> 1 Zahl
- `positionY` -> 1 Zahl
- `positionZ` -> 1 Zahl
- `thickness` -> 1 Zahl
- `opacity` -> 1 Zahl
- `glow` -> 1 Zahl

Selbst die 3D-Position wird auf **drei getrennte 1D-Mappings** aufgeteilt.

### Mehrdimensionale Datentypen existieren im Schema, aber nicht in der Pipeline:

- **`vector`** (z.B. Big-Five Persoenlichkeit mit 5 Dimensionen): Der DataParser parst das Objekt, aber die MappingEngine greift nur ueber Dot-Notation auf einzelne Skalare zu (`personality.extraversion`). Das Gesamtbild geht verloren.

- **`spatial`** mit 3 Koordinaten: Wird ebenfalls auf einzelne X/Y/Z-Skalare zerlegt.

---

## 5. Gibt es 2- oder mehrdimensionale Attribute?

**Im Schema: Ja. In der Praxis: Nein.**

| Typ | Schema-Definition | Tatsaechliche Nutzung |
|-----|------------------|-----------------------|
| `vector` | `dimensions: ["openness", "conscientiousness", ...]`, `range: [0, 1]` | Jede Dimension wird einzeln ueber Dot-Notation angesprochen |
| `spatial` | `coordinates: ["x", "y", "z"]` | Position wird direkt als `{x,y,z}` gespeichert, Mapping auf positionX/Y/Z |

Das Problem: Ein 5D-Persoenlichkeitsvektor wird nie als **Ganzes** verarbeitet. Es gibt keinen Mechanismus, der z.B.:
- Die Distanz zwischen zwei Persoenlichkeitsvektoren berechnet
- Eine Dimensionsreduktion (PCA, t-SNE, UMAP) durchfuehrt
- Den Vektor als Ganzes auf eine visuelle Eigenschaft abbildet

---

## 6. Geht es darum, die "kleinsten Teiler" zu finden?

Ja, genau das ist die aktuelle Philosophie: **Jede Information wird auf atomare Skalare heruntergebrochen.** Position -> X, Y, Z. Persoenlichkeit -> openness, conscientiousness, extraversion, agreeableness, neuroticism. Jeder Skalar wird dann individuell auf eine visuelle Eigenschaft gemappt.

Das ist konzeptionell eine **Faktorisierung**: Finde die kleinsten, unabhaengigen Dimensionen und mappe jede einzeln.

---

## 7. Ueber den Tellerrand: Alternative Ansaetze

### 7.1 Mehrdimensionale Mappings (Vektor -> Visuell)

Statt Position als 3 getrennte Skalare zu behandeln, koennte ein **Vektor-Mapping** existieren:

```json
{
  "positionXYZ": {
    "source": "personality",
    "function": "dimensionReduce",
    "params": {
      "method": "umap",
      "targetDimensions": 3
    }
  }
}
```

**Vorteil:** 5 Persoenlichkeitsdimensionen -> 3D-Position, wobei aehnliche Persoenlichkeiten raeumlich nahe beieinander liegen. Das geht mit Einzelmappings nicht.

### 7.2 Relationale / Komparative Skalierung

Aktuell skaliert jeder Wert absolut innerhalb seiner Domain. Alternative: **relative Skalierung** basierend auf dem Netzwerk.

```
node.size = f(node.degree / max_degree)          // Schon moeglich
node.color = f(node.betweenness_centrality)       // Netzwerkmetrik
edge.thickness = f(cosine_similarity(source.personality, target.personality))
```

**Der letzte Punkt ist entscheidend:** Edge-Attribute koennten aus dem *Verhaeltnis* der verbundenen Nodes berechnet werden, statt statisch definiert zu sein.

### 7.3 Komposite / Aggregierte Attribute

Statt nur atomare Attribute zu mappen, koennten zusammengesetzte Metriken definiert werden:

```json
{
  "source": "composite",
  "formula": "(trust + collaboration - conflict) / 3",
  "function": "linear",
  "range": [0.1, 1.0]
}
```

Oder fuer Nodes:
```json
{
  "source": "magnitude",
  "vector": "personality",
  "function": "linear",
  "range": [0.5, 3.0]
}
```
-> Die **Laenge** des Persoenlichkeitsvektors bestimmt die Groesse.

### 7.4 Polarkoordinaten statt kartesisch

Position muss nicht `{x, y, z}` sein. Alternativen:

| Koordinatensystem | Beschreibung | Anwendungsfall |
|-------------------|-------------|----------------|
| Kartesisch | `{x, y, z}` | Standard, aktuell |
| Sphaerisch | `{radius, theta, phi}` | Sonnensystem (Entfernung + Winkel) |
| Zylindrisch | `{radius, angle, height}` | Hierarchie + Gruppierung |
| Hyperbolisch | Poincare-Disk | Baumstrukturen, Taxonomien |

Beispiel Sonnensystem:
```json
{
  "positionR": { "source": "entfernung_sonne_mio_km", "function": "logarithmic" },
  "positionTheta": { "source": "orbital_phase", "function": "linear" },
  "positionPhi": { "source": "inklination", "function": "linear" }
}
```

### 7.5 Zeitliche Dimension (4D)

`temporal` existiert als Typ, wird aber nur auf Millisekunden reduziert. Alternative:

- **Animation entlang der Zeitachse**: Nodes erscheinen/verschwinden basierend auf Zeitstempel
- **Trajectory-Mapping**: Position veraendert sich ueber Zeit (z.B. Orbit-Animation)
- **Zeitfenster-Filter**: Nur Beziehungen eines bestimmten Zeitraums anzeigen

### 7.6 Semantische Naeheraeume statt explizite Koordinaten

Statt Positionen manuell oder per Attribut zu setzen:

```json
{
  "layout": "semantic",
  "distanceMetric": "attribute_similarity",
  "attributes": ["personality", "department", "age"],
  "weights": [0.5, 0.3, 0.2]
}
```

Nodes, die sich in mehreren Attributen aehneln, landen automatisch nahe beieinander -- eine Art **Force-Directed Layout basierend auf Attributaehnlichkeit**, nicht auf Kanten.

---

## 8. Zusammenfassung: Status Quo vs. Potenzial

```
IST-Zustand:
+-----------+    1D-Normalisierung    +-----------+
|  Daten    | ---- [min, max] -----> | Visuell   |
| (Skalar)  |    domain -> range     | (Skalar)  |
+-----------+                        +-----------+
   Jede Dimension einzeln gemappt

POTENTIAL:
+-----------+    N-D Transformation   +-----------+
|  Daten    | ---- UMAP/PCA -------> | Position  |
| (Vektor)  |    Cosine Sim          | (3D)      |
+-----------+    Formel-Engine       +-----------+
   Mehrere Dimensionen gleichzeitig verarbeitet
```

Die fundamentale Erweiterung waere der Schritt von **"1 Attribut -> 1 Eigenschaft"** zu **"N Attribute -> M Eigenschaften"**, wobei die Transformationsfunktion die eigentliche Intelligenz traegt.
