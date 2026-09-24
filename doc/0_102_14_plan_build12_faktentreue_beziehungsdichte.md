# Umsetzungsplan: Faktentreue Beziehungsdichte für Build 12 (LightRAG)

## Zielsetzung
Maximale und faktentreue Erfassung aller vielschichtigen Beziehungen (Edges) aus der LightRAG-Datenbank für Build 12, ohne Fakten zu halluzinieren und ohne das Quell-JSON durch synthetische Code-Scanner zu korrumpieren.

## Geplante Änderungen

### 1. LightRAG Backend (`lightrag-backend/main.py`)
- **Extraktions-Prompt anpassen**: Konfiguration des LightRAG-Indexers, um beim Einlesen (`/insert`) gezielt multidimensionale Beziehungsarten (z. B. Leitung, Mitgliedschaft, Parteizugehörigkeit, Unterstellung) zu erfassen.
- **Kanten-Transformation verfeinern**: Überarbeitung des `/query`-Endpunkts in `main.py`, sodass im `graph_context.edges`-Objekt die exakten Beziehungsnamen (`relation`, `keywords`, `description`) ohne Vereinfachung oder Fallbacks ("verknuepft") übergeben werden.

### 2. LightRAG Service (`src/utils/LightRAGService.ts`)
- **Präzise 1:1 Zuordnung**: Aktualisierung der Transformationslogik in `queryGraph()`, um die gelieferten relationalen Attribute aus `edge.properties` vollständig auf `relationship.relation` und `relationship.label` abzubilden.
- **Schema-Konformität**: Beibehaltung aller Pflichtfelder der Nodges-Schemaversion 5.2 ohne synthetische Datenmodifikation.

## Verifikationsplan
1. **Indexierungstest**: Befüllen von LightRAG mit einem komplexen Beispieldokument (z. B. Schweizer Bundesrat & Departemente).
2. **Abfragetest**: Durchführung einer Abfrage und Überprüfung des erzeugten JSON-Graphen auf Beziehungsdichte und Faktenidentität.
