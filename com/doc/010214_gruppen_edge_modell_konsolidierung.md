# Gruppen als Edge-basiertes Modell: Konsolidierung und Ausbau

## Zusammenfassung

Nodges besitzt aktuell **zwei parallele, inkompatible Gruppen-Systeme**:

1. **NodeGroupManager** (alt, manuell, Map-basiert) -- verwaltet Gruppen zur Laufzeit ueber interne Maps, nicht persistiert, nicht ins Datenmodell integriert, teilweise defekt (InstancedMesh-Inkompatibilitaet).
2. **Edge-basiertes Modell** (ontologisch, bereits teilweise implementiert) -- Gruppen als Nodes mit `type: "group"/"cloud"`, Mitgliedschaft ueber Edges. Bereits in NodeManager (Cloud-Material, `updateCloudPositions()`), LLM-Prompts und Architektur-Dokumentation verankert.

**Ziel:** Den alten `NodeGroupManager` entfernen und das Edge-basierte Modell als einziges Gruppen-System etablieren. Dazu gehoert eine neue UI zum Verwalten von Gruppen sowie die Sicherstellung, dass alle bestehenden Gruppen-Funktionen (Farbe, Highlight, Erstellen, Hinzufuegen) ueber das Datenmodell (Entities + Relationships im StateManager) laufen.

---

## Historischer Kontext

Die Architektur-Entscheidung fuer "Ansatz A" wurde in folgenden Sessions getroffen und dokumentiert:

| Session | Dokument | Kerninhalt |
|---------|----------|------------|
| 0_102_0 | [0_102_0_konzept_gruppen_verschachtelte_nodes.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/doc/archiv_history/0_102_0_konzept_gruppen_verschachtelte_nodes.md) | Erstkonzept: Flaches Modell, Subscriber-Ansatz |
| 0_102_8 | [0_102_8_architektur_gruppenmitgliedschaft.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/doc/archiv_history/0_102_8_architektur_gruppenmitgliedschaft.md) | Vergleich 4 Ansaetze, Beschluss fuer Ansatz A |
| 0_102_10 | [0_102_10_weltabbildung_sammlung.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_10_weltabbildung_sammlung.md) | "Cloud-Entitaet" als philosophischer Durchbruch |

---

## Kritische Bewertung des Edge-basierten Ansatzes

Du hast Kritik erlaubt -- hier ist meine ehrliche Einschaetzung:

### Was fuer den Edge-Ansatz spricht

- **Konsistenz:** Gruppen sind ganz normale Graph-Elemente. Kein Sondersystem, keine Parallelstruktur. Alles fliesst durch denselben StateManager, dieselbe Persistierung, dasselbe Undo/Redo.
- **Metadaten-Heimat:** Die Gruppe hat als Node eigene Attribute (Beschreibung, Typ, Farbe, Wichtigkeit). Bei einem reinen Attribut-Ansatz (`group: "Bundesrat"` auf jedem Knoten) gaebe es keinen Ort fuer diese Metadaten.
- **LLM-Kompatibilitaet:** LLMs verstehen "Entity A gehoert zu Entity B" fehlerfrei. Es ist das natuerlichste relationale Muster.
- **Duale Verbindungen:** Sowohl die Gruppe selbst als auch ihre Mitglieder koennen eigene Kanten zu anderen Knoten haben -- ein wichtiger Vorteil gegenueber verschachtelten Modellen.
- **Bereits teilweise implementiert:** `updateCloudPositions()` berechnet schon jetzt dynamisch den Schwerpunkt und Radius aus den verbundenen Knoten.

### Was gegen den Edge-Ansatz spricht (und Loesungsansaetze)

> [!WARNING]
> **1. Force-Layout Knaeuel-Problem**
> Wenn 20+ Knoten alle mit derselben Gruppen-Node verbunden sind, kollabieren sie im Force-Directed Layout auf einen Punkt. Die in Session 0_102_8 beschriebene "Dynamische Repulsion" ist noch nicht implementiert.
> **Loesung:** Nicht Teil dieses Plans -- wird als separates Feature behandelt (Cloud Repulsion Slider, fokus-basiertes Drift).

> [!NOTE]
> **2. Zusaetzliche Kanten im Graphen**
> Jede Mitgliedschaft erzeugt eine sichtbare Kante, die den Graphen visuell "verschmutzen" kann, besonders wenn man sich nicht fuer die Gruppenzugehoerigkeit interessiert.
> **Loesung:** Mitgliedschafts-Kanten (`belongs_to`, `member_of`) koennen ueber das Layer-System oder einen dedizierten Toggle ein-/ausgeblendet werden. Das ist ein natuerlicher Anwendungsfall fuer die bestehenden Ebenen.

> [!NOTE]
> **3. Performance bei vielen Gruppen**
> `updateCloudPositions()` iteriert bei jedem Aufruf ueber alle Relationships. Bei sehr grossen Graphen (1000+ Kanten) koennte das zum Flaschenhals werden.
> **Loesung:** Lookup-Map (childrenOf: Map<cloudId, Set<nodeId>>) die nur bei `data_changed` neu aufgebaut wird. Nicht Teil dieses Plans, aber gute Vorbereitung.

### Fazit der Bewertung

Der Edge-basierte Ansatz ist architektonisch klar der richtige Weg. Die Gegenargumente sind loesbar und betreffen primaer Visualisierung/Performance, nicht das Datenmodell selbst. Die Konsolidierung auf ein einziges System beseitigt technische Schulden und schafft eine saubere Grundlage.

---

## User Review Required

> [!IMPORTANT]
> **Edge-Label/Typ fuer Mitgliedschaft:** Welchen Standard-Kantenlabel soll die UI verwenden, wenn man einen Knoten zu einer Gruppe hinzufuegt? Vorschlag: `"belongs_to"` (konsistent mit den LLM-Prompts und der Architektur-Dokumentation). Alternative: `"member_of"`. Soll die Richtung `member -> group` oder `group -> member` sein?

> [!IMPORTANT]
> **Cloud-Material beibehalten?** Soll der halbtransparente Wolken-Look (`opacity: 0.2, DoubleSide`) fuer Gruppen-Nodes beibehalten werden? Oder soll die visuelle Darstellung konfigurierbar sein (z.B. ueber ein `geometry: "cloud"` Mapping)?

---

## Open Questions

1. **Soll der "Gruppe erstellen"-Button im Multi-Selection-Panel erhalten bleiben?** Aktuell erstellt er eine `NodeGroupManager`-Gruppe. Kuenftig wuerde er stattdessen: (a) eine neue Gruppen-Node im StateManager anlegen, (b) fuer jeden selektierten Knoten eine `belongs_to`-Edge erstellen. Ist dieses Verhalten gewuenscht?

2. **Soll es eine dedizierte Gruppen-Uebersicht in der UI geben?** Z.B. ein Panel das alle Gruppen-Nodes auflistet, ihre Mitglieder zeigt, und Drag-and-Drop-Zuweisungen erlaubt? Oder reicht die bestehende Graph-Interaktion (Klick auf Gruppen-Node, InfoPanel zeigt Mitglieder)?

3. **Bestehende Daten:** Gibt es gespeicherte Graphen, die den alten `NodeGroupManager` nutzen und migriert werden muessen?

---

## Proposed Changes

### Datenmodell und StateManager

Keine Aenderungen am Zod-Schema noetig. Das bestehende Schema unterstuetzt bereits alles:
- Gruppen-Nodes: `{ id: "bundesrat", type: "group", label: "Bundesrat", ... }` (ueber `passthrough()`)
- Mitgliedschafts-Edges: `{ source: "roesti", target: "bundesrat", label: "belongs_to", type: "membership" }` (ueber `passthrough()`)

#### [MODIFY] [StateManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts)
- Neue Hilfsmethoden hinzufuegen:
  - `createGroupNode(label: string, attributes?: Record<string, unknown>): EntityData` -- erzeugt eine neue Entity mit `type: "group"` und fuegt sie den Entities hinzu
  - `addNodeToGroup(nodeId: string, groupId: string, edgeLabel?: string): RelationshipData` -- erzeugt eine `belongs_to`-Edge von `nodeId` nach `groupId`
  - `removeNodeFromGroup(nodeId: string, groupId: string)` -- entfernt die Mitgliedschafts-Edge
  - `getGroupMembers(groupId: string): EntityData[]` -- gibt alle Mitglieder einer Gruppe zurueck (folgt den eingehenden Mitgliedschafts-Kanten)
  - `getNodeGroups(nodeId: string): EntityData[]` -- gibt alle Gruppen zurueck, denen ein Knoten angehoert
  - `isGroupNode(nodeId: string): boolean` -- prueft ob `type === "group" || type === "cloud"`
- Diese Methoden nutzen intern `addNode()`, `addEdge()`, `removeEdge()` und laufen damit automatisch durch Undo/Redo und Event-Propagation.

---

### Entfernung des alten NodeGroupManager

#### [DELETE] [NodeGroupManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/NodeGroupManager.ts)
- Die gesamte Datei wird entfernt. Ihre Funktionalitaet wird durch die neuen StateManager-Methoden ersetzt.

#### [MODIFY] [App.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts) (oder Hauptinitialisierung)
- Entfernung der `NodeGroupManager`-Instanziierung und aller Referenzen (`this.nodeGroupManager`).
- Entfernung aus dem ServiceContainer / DI-Registrierung falls vorhanden.

#### [MODIFY] [BatchOperations.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/BatchOperations.ts) (falls vorhanden)
- `addToGroup()`-Methode anpassen: Statt `NodeGroupManager.addNodeToGroup()` wird `StateManager.addNodeToGroup()` aufgerufen.

---

### UI-Anpassungen

#### [MODIFY] [InfoPanelUI.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/InfoPanelUI.ts)
- **"Gruppe erstellen"-Button** (Zeile 223-224): Logik umschreiben.
  - Statt `nodeGroupManager.createGroup()` + `batchOperations.addToGroup()`:
  - Neu: `stateManager.createGroupNode("Neue Gruppe")`, dann fuer jeden selektierten Knoten `stateManager.addNodeToGroup(nodeId, groupNodeId)`.
- **Einzelknoten-Ansicht:** Wenn ein Knoten selektiert ist, anzeigen zu welchen Gruppen er gehoert (via `stateManager.getNodeGroups(nodeId)`).
- **Gruppen-Node-Ansicht:** Wenn eine Gruppen-Node selektiert ist, Liste der Mitglieder anzeigen (via `stateManager.getGroupMembers(groupId)`), mit Moeglichkeit Mitglieder zu entfernen.

---

### Rendering (NodeManager)

#### [MODIFY] [NodeManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts)
- **Keine grundlegenden Aenderungen noetig.** Die bestehende Logik fuer `cloud`/`group`-Typen (halbtransparentes Material, `updateCloudPositions()`) funktioniert bereits korrekt mit dem Edge-basierten Modell.
- Einzige Anpassung: Sicherstellen, dass `updateCloudPositions()` nach jedem `data_changed`-Event aufgerufen wird (falls nicht bereits der Fall).

---

### Highlight-System

#### [MODIFY] [HighlightManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/effects/HighlightManager.ts)
- Die bestehende `GROUP`-Highlight-Logik kann bleiben. Sie wird kuenftig ueber die Gruppen-Mitgliedschafts-Abfrage im StateManager gespeist statt ueber den NodeGroupManager.
- `highlightGroup()` erhaelt die Mitglieder-Meshes ueber `stateManager.getGroupMembers()` + `nodeManager.getMeshForNode()`.

---

### LLM-Prompts

Keine Aenderungen noetig. Die bestehenden Ontologie-Prompts ([build_5_ontology_prompt.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_5_ontology_prompt.md), [build_6_prompt.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_6_prompt.md), [build_10_prompt.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_10_prompt.md)) definieren bereits, dass Gruppen als Entities mit `type: "group"` und Mitgliedschaft ueber `belongs_to`-Edges modelliert werden.

---

## Verification Plan

### Automated Tests
- `npx vitest run` -- bestehende Tests muessen weiterhin bestehen
- Neue Unit-Tests fuer die StateManager-Gruppenmethoden:
  - `createGroupNode()` erzeugt Entity mit `type: "group"`
  - `addNodeToGroup()` erzeugt korrekte Edge
  - `removeNodeFromGroup()` entfernt nur die Mitgliedschafts-Edge
  - `getGroupMembers()` gibt korrekte Mitglieder zurueck
  - `getNodeGroups()` gibt korrekte Gruppen zurueck
  - Undo/Redo funktioniert fuer alle Gruppen-Operationen

### Manual Verification
1. Graph laden, der Gruppen-Nodes und `belongs_to`-Edges enthaelt (z.B. Bundesrat-Beispiel)
2. Pruefen, dass Cloud-Rendering (halbtransparente Huelle, dynamische Position/Radius) korrekt funktioniert
3. Mehrere Knoten selektieren, "Gruppe erstellen" klicken, pruefen dass Gruppen-Node und Edges erstellt werden
4. Pruefen, dass Undo die Gruppen-Erstellung rueckgaengig macht
5. Pruefen, dass kein Verweis auf den alten NodeGroupManager mehr existiert (Build ohne Fehler)
