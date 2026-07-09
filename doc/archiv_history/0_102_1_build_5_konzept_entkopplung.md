# Konzept: Vollständige Entkopplung von Schema und Visualisierung (Build 5)

## Leitgedanke (Option D)
Im Projekt *Nodges* existieren konzeptionell nur **Nodes** (Knoten) und **Edges** (Kanten).
Ein Node ist eine Sammlung von Attributen, eine Edge ist eine Sammlung von Attributen, die zwei Nodes verbindet. 
Es gibt keinen Grund, dem Datensatz einen harten "Type" (wie z. B. "Koralle" oder "Fisch") als zwingendes Strukturmerkmal aufzuzwingen, von dem die gesamte Engine abhängig ist. Alle Attribute in einem JSON sollen **gleichwertig** sein. 

Die **Visualisierung** (Farben, Größen, Animationen) darf nicht starr an das Datenschema gebunden sein. Die Zuweisung, wie etwas aussieht, ist ausschließlich Aufgabe der Visualisierungs-Schicht (Mapping Panel, Suggestion Panel) und nicht des LLM-generierten Schemas.

## Bestandsaufnahme: Code-Reste von "Zwang" und Typ-Bindung

Eine Code-Analyse hat ergeben, dass das System aktuell stark auf einem starren `type`-Feld aufbaut. Folgende "Altlasten" aus früheren Architektur-Phasen behindern die konsequente Trennung:

### 1. Zwingende Typ-Bindung in den Daten-Schemas (`src/types.ts`)
Im Kern-Validierungsschema wird `type` als absoluter Zwang ("required") gefordert:
- `EntityDataSchema`: `type: z.string()` (required)
- `RelationshipDataSchema`: `type: z.string()` (required)
*Folge:* Das System lehnt Datensätze ab, die keinen Typ definieren, selbst wenn sie gültige Nodes sind.

### 2. Typen-basierte Visualisierung (`src/core/VisualMappingEngine.ts`)
Die Rendering-Engine sucht beim Zeichnen eines Knotens zuerst nach einem Preset, das exakt so heißt wie der Typ des Knotens:
- `const activeSpecific = this.visualMappings?.defaultPresets?.[type];`
*Problem:* Das verknüpft die Visualisierung starr mit dem Inhalt (Ontologie). Anstatt Mappings dynamisch auf Attribute anzuwenden, baut die Architektur auf einer vordefinierten "Klassen"-Struktur auf.

### 3. UI-Abhängigkeiten (`MappingUI.ts`, `SuggestionUI.ts`, `LegendPanel.ts`)
Die gesamten UI-Komponenten iterieren über ein Objekt namens `defaultPresets`, dessen Keys (Schlüssel) die Typ-Namen (z. B. "God", "Titan", "Fisch") sind:
- `this.mappings.defaultPresets[this.currentType]`
*Problem:* Die UI versucht, für jeden inhaltlichen Typ eigene Visualisierungsregeln zu verwalten, statt globale Regeln für Nodes und Edges bereitzustellen.

## Der Refactoring-Plan (Entkopplung)

Um das Konzept "Alle Attribute sind gleichwertig" umzusetzen, müssen folgende Schritte durchgeführt werden, sobald du grünes Licht für das Refactoring gibst:

### Phase 1: Datenstruktur befreien
1. In `types.ts` wird das Feld `type` optional gemacht (oder komplett in den dynamischen Attribut-Pool `Record<string, unknown>` verschoben).
2. Es gibt nur noch "Node" und "Edge".
3. Das LLM muss keinen `type` mehr generieren; wenn es Kategorien gibt, generiert es einfach ein Feld (z.B. `category: "Fisch"`), das wie jedes andere Feld (z.B. `weight: 50`) behandelt wird.

### Phase 2: Mapping-System zentralisieren
1. In `types.ts` wird `defaultPresets` vereinfacht. Es gibt dort künftig nur noch exakt zwei Keys: `global_node` und `global_edge`.
2. Die `VisualMappingEngine.ts` verliert den Code `defaultPresets[type]`. Sie liest nur noch das globale Node-Mapping und wendet dessen Regeln auf den aktuellen Knoten an. 
3. *Beispiel:* Wenn eine Koralle rot sein soll, dann geschieht dies nicht, weil das Preset "Koralle" rot ist, sondern weil im `global_node` Mapping die Regel steht: "Mappe das Attribut 'Kategorie' auf die Farbe, wobei 'Koralle' -> rot". (Das entspricht der neuen Logik im Mapping Panel).

### Phase 3: UI-Bereinigung
1. Sämtliche Schleifen über "Typen" in `MappingUI`, `SuggestionUI` und `LegendPanel` werden gelöscht.
2. Das Mapping Panel zeigt standardmäßig einfach die globalen Node/Edge Mappings an. 

## Fazit
Durch dieses Refactoring wird das LLM von der Aufgabe befreit, eine starre Klassenhierarchie ("Types") für die Visualisierung zu generieren. Die Daten (Nodes & Edges) sind dann reiner, abstrakter Inhalt. Das Nodges-System (Mapping Panel) übernimmt 100% der Kontrolle darüber, welche Attribute dieser Nodes wie gezeichnet werden.
