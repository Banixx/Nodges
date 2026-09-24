# Walkthrough: Universelle Textattribut-Normalisierung (0 bis 100)

## Umgesetzte Aenderungen

### 1. VisualMappingEngine (`src/core/VisualMappingEngine.ts`)
- **Category Cache**: `categoryCache` speichert alle eindeutigen Textkategorien eines Attributs.
- **Normalisierungsfunktion (`getCategoryNormalizedValue`)**: Rechnet Textwerte automatisch in einen gleichmaessig verteilten Bereich von `0` bis `100` (`[0.0, 1.0]`) um.
- **Integration in `applyMapping`**: Sobald ein Textattribut auf eine kontinuierliche numerische Visualisierungseigenschaft (`positionX`, `positionY`, `positionZ`, `size`, `glow`, `attraction`, `repulsion`, `inertia`, `thickness`, `opacity`, `curvature`) gemappt wird, wird der Wert auf den Bereich `0..100` umgewandelt und anschliessend auf den Ziel-Range der Eigenschaft skaliert.
- **Ausnahmen**: `geometry` behaelt das direkte diskrete Zuordnungsschema fuer Formnamen (`sphere`, `cube` etc.).

### 2. DataParser (`src/core/DataParser.ts`)
- Standard-Range fuer kategoriale Positions-Mappings von `[-60, 60]` auf `[0, 100]` angepasst.

### 3. Automated Tests (`src/tests/VisualMappingEngine.test.ts`)
- Neuer Unit-Test `Text-Attribute Normalisierung (0 bis 100)` hinzugefuegt.

## Testergebnisse
- `npx vitest run src/tests/VisualMappingEngine.test.ts` wurde erfolgreich ausgefuehrt (13/13 Tests bestanden).
