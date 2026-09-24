# Plan: Universelle numerische Normalisierung von Textattributen (Spread: 0 bis 100)

## Zielsetzung
Erweiterung der `VisualMappingEngine` und des `DataParser`s, um Text- und kategoriale Attribute (z. B. `entity_type`, `name`, `source_id`) automatisch in einen numerischen Wertebereich von **0 bis 100** zu konvertieren, sobald sie auf eine Visualisierungseigenschaft gemappt werden, die eine Zahl verlangt.

## Geltungsbereich (Numeric Targets)
Die `0 bis 100`-Normalisierung wird fuer folgende kontinuierliche Visualisierungseigenschaften angewendet:
- **Knoten**: `size` (Groesse), `positionX`, `positionY`, `positionZ` (Positionen), `glow` (Leuchten), `attraction` (Anziehungskraft), `repulsion` (Abstossungskraft), `inertia` (Traegheit).
- **Kanten**: `thickness` (Linien-/Rohrdicke), `opacity` (Transparenz), `curvature` (Kruemmung).

## Ausnahmen
- `geometry`: Verwendet eine diskrete 1-zu-1 Zuordnung auf Formnamen (`sphere`, `cube`, `cone` etc.), da Formen keine fliessenden Zahlen repräsentieren.
- Diskrete Farbkategorien: Werden ueber direkte Farb-Lookups aus einer Palette bedient.

## Technische Umsetzung

1. **Automatische Kategorie-Kompression auf [0, 100]**:
   - Die `VisualMappingEngine` analysiert die im Datensatz vorhandenen eindeutigen Textkategorien eines Attributs.
   - Den Kategorien werden gleichmaessig verteilte Zahlenwerte zwischen `0` und `100` zugewiesen (z. B. bei 5 Kategorien: `0`, `25`, `50`, `75`, `100`).
   - Bei beliebigen Freitexten (z. B. eindeutigen Namen) wird ein deterministischer Hash-Wert im Bereich `0` bis `100` generiert.

2. **Skalierung in `applyMapping`**:
   - Der berechnete `0..100`-Wert wird anschliessend in den jeweiligen Ziel-Wertebereich der Visualisierungseigenschaft umgerechnet (z. B. Groesse `0.3` bis `3.0`, Position `-50` bis `+50`).
