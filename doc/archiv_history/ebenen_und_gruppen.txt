# Nodges -- Ebenen und Gruppen

Dieses Dokument beschreibt die Funktionsweise, den aktuellen Stand
und das Potenzial der Ebenen- und Gruppen-Systeme.

---

## 1. Ebenen (Layers)

### 1.1 Was machen Ebenen?

Ebenen sind ein **Filter- und Sichtbarkeits-System** fuer Nodes (und indirekt fuer Edges).

**Kernmechanik:**
- Es gibt **4 Ebenen** (Layer 1-4)
- Jede Ebene hat einen **Sichtbarkeits-Toggle** (ein/aus)
- Jede Ebene hat einen **Opacity-Slider** (0.0 - 1.0)
- Ein konfigurierbares **Gruppierungsattribut** bestimmt, welche Node-Eigenschaft fuer die Ebenenzuweisung genutzt wird (z.B. `layer`, `type`, oder jedes beliebige Attribut)
- Jede Ebene erhaelt einen **Wert** zugewiesen (z.B. Ebene 1 = "person", Ebene 2 = "organization")
- Nodes deren Attribut-Wert keiner Ebene zugeordnet ist, gehoeren zu **Ebene 0** (immer sichtbar, volle Opacity)

### 1.2 Technische Umsetzung

**State-Felder:**
- `layeringAttribute`: Das Attribut zur Gruppierung (default: `"layer"`)
- `layer1Value` bis `layer4Value`: Der zugeordnete Wert pro Ebene
- `layer1Visible` bis `layer4Visible`: Sichtbarkeits-Toggle
- `layer1Opacity` bis `layer4Opacity`: Opacity-Wert

**Wirkung auf Nodes (NodeManager):**
- Sichtbarkeit = 0: Node-Scale wird auf 0 gesetzt (unsichtbar aber existent)
- Opacity < 1.0: Farbe wird mit `multiplyScalar(opacity)` abgedunkelt
- Scale wird zusaetzlich mit Opacity multipliziert

**Wirkung auf Edges (EdgeObjectsManager):**
- Edge wird nur gerendert wenn BEIDE Nodes sichtbar sind
- Edge-Opacity = Minimum der Opacities beider verbundenen Nodes
- Opacity = 0: Edge wird komplett uebersprungen

**UI (LayersPanel):**
- Dropdown fuer Gruppierungsattribut (sammelt alle Attribute aus geladenen Entities)
- Pro Ebene: Wert-Dropdown, Sichtbarkeits-Toggle, Opacity-Slider
- Wert-Dropdown populiert sich automatisch mit den einzigartigen Werten des gewaehlten Attributs

### 1.3 Einschraenkungen

- Maximal 4 Ebenen (Hardcoded)
- Nodes ohne passenden Wert landen in Ebene 0 (nicht steuerbar)
- Kein Farb-Overlay pro Ebene (Farbe kommt nur aus dem Visual Mapping)
- Keine verschachtelten Ebenen (kein Hierarchie-Baum)
- Keine edge-eigenen Ebenen (Edges erben von Nodes)

---

## 2. Gruppen (NodeGroupManager)

### 2.1 Was machen Gruppen?

Gruppen sind ein **visuelles Markierungs-System** fuer manuell zusammengefasste Nodes.

**Kernmechanik:**
- Gruppen werden dynamisch erstellt (`createGroup()`)
- Nodes werden manuell zu Gruppen hinzugefuegt
- Jede Gruppe hat eine **Farbe** (aus 10 Default-Farben)
- Jede Gruppe hat ein **Outline** (leicht vergroesserte Mesh-Kopie als BackSide-Rendering)
- Gruppen-Farbe ueberschreibt die Node-Farbe
- Beim Entfernen aus der Gruppe wird die Original-Farbe wiederhergestellt

### 2.2 Technische Umsetzung

- `NodeGroupManager` verwaltet eine Map von Gruppen
- `nodeGroups` Map: Node-ID → Group-ID
- `outlineObjects` Map: Node-ID → Outline-Mesh
- `updateOutlines()` muss im Render-Loop aufgerufen werden (Position-Sync)
- Outline-Material: `MeshBasicMaterial` mit `BackSide`, transparent

### 2.3 Einschraenkungen

- **Inkompatibel mit InstancedMesh**: Der NodeGroupManager erwartet individuelle `THREE.Mesh`-Objekte, der aktuelle NodeManager nutzt aber InstancedMesh. Die Outline-Erstellung und Farbzuweisung funktionieren daher nicht.
- Keine UI zur Gruppenverwaltung (nur programmatisch)
- Keine Persistierung (Gruppen gehen beim Reload verloren)
- Kein Export/Import von Gruppenzuweisungen
- Keine Verschachtelung (Gruppe in Gruppe)

---

## 3. Ebenen vs. Gruppen -- Unterschiede

| Aspekt | Ebenen | Gruppen |
|---|---|---|
| **Zweck** | Filter und Sichtbarkeit | Visuelle Markierung |
| **Zuweisung** | Automatisch (basierend auf Attribut) | Manuell |
| **Wirkung** | Sichtbarkeit und Opacity | Farbe und Outline |
| **Anzahl** | 4 (fix) | Unbegrenzt |
| **UI** | Vorhanden (LayersPanel) | Fehlt |
| **Edges betroffen** | Ja (indirekt) | Nein |
| **Persistierung** | Im State (zur Laufzeit) | Nicht persistiert |

---

## 4. Potenzial

### 4.1 Ebenen-Potenzial

- **Dynamische Ebenen-Anzahl**: Nicht auf 4 begrenzt, sondern automatisch basierend auf der Anzahl einzigartiger Werte
- **Ebenen-spezifische Farben**: Farbcodierung pro Ebene (unabhaengig vom Visual Mapping)
- **Ebenen als Z-Achsen-Staffelung**: Jede Ebene auf einer anderen Hoehe im 3D-Raum
- **Ebenen-Animation**: Langsames Ein-/Ausblenden statt hartem Toggle
- **Invertierung**: "Zeige alles AUSSER Ebene 2"
- **Solo-Modus**: "Zeige NUR Ebene 3"
- **Ebenen-Vergleich**: Zwei Ebenen nebeneinander anzeigen

### 4.2 Gruppen-Potenzial

- **Convex Hull**: Transparente Huelle um alle Nodes einer Gruppe
- **Gruppen-Label**: Name der Gruppe als 3D-Text ueber dem Cluster
- **Gruppen-Collapse**: Alle Nodes einer Gruppe zu einem Meta-Node zusammenfassen
- **Gruppen-Layout**: Nodes innerhalb einer Gruppe separat layouten
- **Gruppen-Statistik**: Aggregierte Werte (Summe, Durchschnitt, Min/Max)
- **Automatische Gruppen**: Basierend auf Attributen oder Community-Detection
- **Hierarchische Gruppen**: Gruppen koennen Untergruppen enthalten
