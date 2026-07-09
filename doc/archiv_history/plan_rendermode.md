# Plan: Parallele Unterstützung von Mesh und InstancedMesh für Nodes

## Ziel
Der NodeManager soll beide Render-Methoden (`THREE.Mesh` für Flexibilität, `THREE.InstancedMesh` für Performance) unterstützen. Der Nutzer kann im System-Tab zwischen den Modi `Auto`, `Mesh` und `Instance` wählen.

## Anforderungen
1. **Beide Varianten** stehen zur Verfügung.
2. Standardmäßig startet die App im **Mesh**-Modus.
3. Schalter im **System-Tab** (DevPanel/EnvironmentPanel) mit den Optionen: `Auto`, `Mesh`, `Instance`.
4. **Auto-Modus Logik**: 
   - Startet immer mit `Mesh`.
   - Fällt die Framerate (FPS) für **2 Sekunden unter 15**, wird automatisch auf `Instance` gewechselt.
   - Bleibt auf `Instance` bis ein **neues File geladen** wird (oder der Nutzer den Modus manuell ändert).
5. Bei manueller Änderung des Schalters auf `Auto` beginnt der Prozess wieder mit `Mesh`.
6. Die Inkompatibilität der `LayoutGUI` mit `.position` bei Instanzen wird vorerst bewusst ignoriert und **später gelöst**.

## Umsetzungsschritte

### 1. StateManager (State & Typen)
Ergänzung des globalen States um die benötigten Variablen:
- `renderMode`: `'auto' | 'mesh' | 'instance'` (Standard: `'auto'`)
- `activeRenderMode`: `'mesh' | 'instance'` (Der aktuell *wirklich* verwendete Modus, Standard: `'mesh'`)
Diese Werte werden in `StateManager.ts` hinzugefügt.

### 2. UI-Anpassung (DevPanel / EnvironmentPanel)
- Hinzufügen eines stilisierten 3-Wege Toggle-Switches für den `renderMode` im DevPanel oder EnvironmentPanel (unter Tab "System").
  - Positionen: Links (`Mesh`), Mitte (`Auto`), Rechts (`Instance`).
  - Der Switch soll optisch an das bestehende UI-Design von Nodges angepasst sein (ähnlich einem physischen Schieberegler).
- Bei Änderung durch den Nutzer:
  - Wenn auf Position Links (`Mesh`) oder Rechts (`Instance`) geschoben wird, wird `activeRenderMode` entsprechend gesetzt.
  - Wenn auf Position Mitte (`Auto`) geschoben wird, wird `activeRenderMode` auf `'mesh'` zurückgesetzt und der FPS-Timer neu gestartet.

### 3. Performance Überwachung (FPS Tracking)
- In `App.ts` oder `PerformanceMonitor.ts`:
  - Ein Timer-Logik einbauen: Wenn `state.renderMode === 'auto'` und `state.activeRenderMode === 'mesh'`.
  - Unterschreiten die aktuellen FPS den Wert 15, wird ein Timestamp gesetzt (oder hochgezählt).
  - Sind 2 Sekunden vergangen (ohne Unterbrechung über 15 FPS), wird `stateManager.update({ activeRenderMode: 'instance' })` aufgerufen.
  - Dadurch triggert der StateManager ein Re-Render der Nodes.

### 4. File Load Reset
- In `App.ts` (Funktion `loadGraphData`):
  - Wenn `state.renderMode === 'auto'`, setze `activeRenderMode` wieder auf `'mesh'`, bevor die neuen Nodes generiert werden.

### 5. NodeManager Umbau
Der `NodeManager` liest bei jedem `updateNodes()` den `state.activeRenderMode` aus.
- **Bereinigung**: Vor dem Zeichnen müssen sowohl alte Instanzen als auch alte Meshes aus der Szene gelöscht werden.
- **Modus 'instance'**: Beibehaltung des aktuellen Codes (`THREE.InstancedMesh`).
- **Modus 'mesh'**: 
  - Iteration über alle Entities.
  - Für jede Entity wird ein individuelles `THREE.Mesh` erstellt (basierend auf der Geometrie aus `visualMappingEngine`).
  - Position, Skalierung und Farbe werden direkt auf das Mesh angewendet.
  - Die Meshes werden (idealerweise über eine `THREE.Group`) der Szene hinzugefügt.
  - Das `entityIdMap` oder ein neues Mapping muss auf das jeweilige Mesh verweisen, damit `updateNodePositions` und Highlights funktionieren.

### 6. Kompatibilität NodePositions & Color
Die bestehenden Funktionen `updateNodePositions`, `setNodeColor` und `resetNodeColor` im `NodeManager` müssen anpassen, ob sie gerade `activeRenderMode === 'mesh'` oder `'instance'` haben:
- Bei Instanzen: Nutze `setMatrixAt` / `setColorAt` (wie aktuell).
- Bei Meshes: Ändere direkt `mesh.position.set(...)` / `mesh.material.color.set(...)`.

## Fazit
Dieser Plan stellt sicher, dass Nodges standardmäßig die flexible `THREE.Mesh` Struktur nutzt (wodurch auch LayoutGUI vorerst weiterhin direkt Positionen ändern kann) und nur im Notfall bei großen Netzwerken auf `InstancedMesh` zurückfällt.
