# Walkthrough: Edge-basiertes Gruppen-Modell & Schema-Konsolidierung

## Zusammenfassung der Aenderungen

Das alte, unvollstaendige und inkompatible `NodeGroupManager`-System (Map-basiert) wurde aus Nodges entfernt. Gruppen werden nun **einheitlich und rein strukturell über Kanten (Edges)** im Datenmodell und StateManager abgebildet.

---

## Geänderte & Erstellte Komponenten

### 1. Datenmodell & Schema (`src/types.ts`)
- `RelationshipDataSchema` angepasst:
  - **Pflichtfelder:** `id`, `source`, `target`, `relation` (Kanten ohne diese 4 Felder werden abgewiesen).
  - **Optional:** `label`, `temporal`, `nodes`.
  - `relation` beschreibt die Beziehungsart (z.B. `"belongs_to"`, `"connects_to"`).

### 2. DataParser (`src/core/DataParser.ts`)
- Synthetisiert fehlende Edge-Attribute bei älteren Datenbeständen vor der Validierung (`relation` aus `type` / `label`, `id` falls unvollständig).
- Implementiert den `label`-Fallback: Wenn `label` in der JSON fehlt, wird initial der Wert von `relation` übernommen.

### 3. StateManager (`src/core/StateManager.ts`)
- Neue Gruppen-Management-Methoden (vollständig im Datenmodell & Undo/Redo integriert):
  - `isGroupNode(nodeId)`: Prüft strukturell, ob mindestens 1 eingehende Edge mit `relation === 'belongs_to'` existiert (oder `type === 'group'/'cloud'`).
  - `createGroupNode(label, attributes)`: Erstellt neue Gruppen-Entity.
  - `addNodeToGroup(nodeId, groupId)`: Erstellt Edge `nodeId --belongs_to--> groupId`.
  - `removeNodeFromGroup(nodeId, groupId)`: Entfernt die Mitgliedschafts-Edge.
  - `getGroupMembers(groupId)`: Gibt Mitglieder einer Gruppe zurück.
  - `getNodeGroups(nodeId)`: Gibt Gruppen eines Knotens zurück.
  - `getAllGroups()`: Gibt alle Gruppen-Knoten im Graphen zurück.

### 4. Entfernung des alten `NodeGroupManager`
- `NodeGroupManager.ts` wurde vollständig gelöscht.
- `App.ts`: Imports, Properties und Instanziierung gelöscht.
- `BatchOperations.ts`: `addToGroup()` und `removeFromGroups()` auf `StateManager` umgestellt.

### 5. UI (`src/ui/InfoPanelUI.ts`)
- "Gruppe erstellen"-Button im Multiselect-Panel umgestellt auf `StateManager.createGroupNode()` + `StateManager.addNodeToGroup()`.

### 6. 3D-Rendering (`src/core/NodeManager.ts`)
- `updateCloudPositions()` nutzt nun strukturelle Gruppen-Erkennung über eingehende `belongs_to`-Kanten.
- Hardcodiertes halbtransparentes Wolken-Material entfernt – die Visualisierung von Gruppen-Nodes läuft wie bei allen anderen Nodes über das Mapping/Ansicht-Tab.

### 7. LLM-Prompts (`src/prompts/`)
- `build_5_data_prompt.md`, `build_6_prompt.md`, `build_10_prompt.md` aktualisiert:
  - `relation` als Pflichtfeld auf Kanten dokumentiert.
  - `belongs_to` als Standard für Gruppenmitgliedschaft verankert.

---

## Verifikation & Tests

### Automated Unit Tests
- `npx vitest run src/tests/StateManagerGroups.test.ts src/tests/types_5.test.ts src/tests/DataParser.test.ts`
  - **Ergebnis:** 3 Test-Suites, 32 Tests bestanden (**100% PASS**).

### Production Build
- `npx vite build`
  - **Ergebnis:** Erfolgreich gebaut (**Clean Build** ohne Fehler).
