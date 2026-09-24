# Plan: Entfernung des `type` Feldes aus Nodges

## 1. Ausgangslage und Zielsetzung
Das Feld `type` auf der Hauptebene von Entitäten und Beziehungen soll vollständig entfernt werden. 
Das Ziel ist absolute Datenneutralität: Die Engine darf keine ontologische Struktur (wie die Zugehörigkeit zu einer bestimmten Hauptklasse) voraussetzen. Jegliche Information zur Klassifizierung muss als reines Datenattribut innerhalb des `attributes` Objekts existieren.

## 2. Architektonische Änderungen

### 2.1 Datenmodell und Typen (`src/types.ts` & Validierung)
- Entfernen der Eigenschaft `type?: string` aus dem Interface `EntityData`.
- Entfernen der Eigenschaft `type?: string` aus dem Interface `RelationshipData`.
- Anpassen der Validierungs-Logik (z.B. Zod-Schemas, falls genutzt) und der BuildFormatUtils, sodass `type` nicht mehr verarbeitet oder erwartet wird.

### 2.2 UIManager (`src/core/UIManager.ts`)
Die grösste Änderung betrifft das Mapping-Panel. Bisher definierte das `type` Feld die verfügbaren "Reiter" oder Hauptgruppen.
- **Neues Konzept:** Es gibt standardmässig nur noch zwei globale Reiter im UI: "Alle Knoten" und "Alle Kanten".
- **Attribut-Aggregation:** Die linke Spalte zeigt die absolute Vereinigungsmenge aller Attribute an, die im gesamten Graphen über alle Knoten hinweg existieren. Die Funktionen `getAvailableAttributes` müssen entsprechend stark vereinfacht werden.

### 2.3 VisualMappingEngine (`src/core/VisualMappingEngine.ts`)
- Die Methode `getEffectivePreset(isNode, type)` verliert ihren `type` Parameter.
- Alle visuellen Presets (wie Grösse, Farbe) werden standardmässig auf den globalen Scope (`global_node` oder `global_edge`) angewendet.
- Die Fallback-Logik in `applyMapping`, die auf `data.type` zugreift um Schemas auszulesen (Zeile 300), muss entfernt oder auf ein definiertes Standardattribut umgeschrieben werden.

### 2.4 Prompts und Datengenerierung (`public/prompts/`)
- Die LLM-Prompts (insbesondere Build 6 und Build 7 Pipeline) müssen umgeschrieben werden.
- Die Regel, dass `type` ein zwingendes Feld ist, entfällt komplett.
- Neue Regel für das LLM: Es darf auf der Hauptebene ausschliesslich `id`, `label`, `attributes`, `source` und `target` verwenden. Ontologische Kategorien müssen als reguläres Key-Value-Paar (z.B. `"kategorie": "Planet"`) in die `attributes` geschrieben werden.

### 2.5 Tests (`src/tests/`)
- Aktualisierung aller Unit-Tests, insbesondere in `VisualMappingEngine.test.ts`, um Mock-Daten ohne `type` zu verwenden und zu prüfen, dass Mappings rein attributbasiert greifen.

## 3. Risiken und Auswirkungen

- **Verlust an UI-Komfort:** Ohne ein komplexes Filtersystem im Mapping-Panel lassen sich Untergruppen von Knoten (z.B. nur Sterne) nicht mehr unabhängig über separate Menü-Reiter stylen. Eine Änderung im UI betrifft dann primär das gesamte Netzwerk.
- **Workaround über kategoriales Mapping:** Um Knoten weiterhin unterschiedlich einzufärben, muss der Nutzer explizit ein Attribut (wie `kategorie`) per Drag-and-Drop auf die "Farbe" ziehen und dort das "Categorical Mapping" nutzen. Die Engine weist dann pro Wert in `kategorie` eine Farbe aus der Palette zu.
- **Abwärtskompatibilität:** Alte generierte JSON-Graphen, die `type` nutzen, müssen beim Laden durch den Importer migriert werden (indem `type` in `attributes.type` verschoben wird), damit die Daten nicht verloren gehen.

## 4. Umsetzungs-Schritte (Checkliste)

1. [x] **Migration:** Importer-Logik anpassen, um Legacy-`type` Werte ins `attributes` Objekt zu verschieben.
2. [x] **Typen:** `types.ts` bereinigen.
3. [x] **UI:** `UIManager.ts` anpassen (Aggregation der Attribute ohne Typ-Gruppierung).
4. [x] **Engine:** `VisualMappingEngine.ts` anpassen (Entfernen typspezifischer Presets).
5. [x] **LLM:** Prompts in `public/prompts/` aktualisieren.
6. [x] **QA:** Unit-Tests reparieren und Funktionalität prüfen.
