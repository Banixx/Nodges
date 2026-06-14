# 12 Historie und Entscheidungen (ADRs)

Dieses Dokument erfasst die wichtigsten architektonischen Entscheidungen (Architecture Decision Records) und die Meilensteine in der Entwicklung von Nodges. Es dient dazu, nachzuvollziehen, *warum* bestimmte technische Wege gewählt wurden.

## Meilensteine

* **v1.0 (Geplant)**: Produktionsreife, saubere Trennung des `InteractionManager` und `StateManager`.
* **v0.98.x**: Einführung von Web Workern für Layout-Berechnungen, Refactoring der Monolithen (`App.ts`).
* **v0.97.0**: Grundlagen der Hardware-Instanzierung (InstancedMesh) für massives Rendering implementiert.

## Architecture Decision Records (ADRs)

### ADR-01: Nutzung von Three.js InstancedMesh
* **Kontext**: Das Rendern von zehntausenden Knotenpunkten als individuelle `THREE.Mesh`-Objekte führte zu dramatischen Einbrüchen der Framerate (CPU / Draw Call Bottleneck).
* **Entscheidung**: Umstellung auf `THREE.InstancedMesh`.
* **Konsequenz**: Die GPU rendert alle Knoten durch einen einzigen Draw Call. Dies erzwingt allerdings ein komplexeres Datenmanagement (Buffer-Updates statt direkter Objekt-Manipulation), ermöglicht aber die gewünschte Skalierbarkeit.

### ADR-02: Zod für Runtime-Validierung
* **Kontext**: Beim Import von proprietären Graph-Daten (JSON) traten häufig Laufzeitfehler durch inkonsistente oder fehlende Pflichtfelder auf (z.B. fehlende `source`/`target` bei Edges).
* **Entscheidung**: Einführung der `Zod`-Bibliothek als "Gatekeeper".
* **Konsequenz**: Jeder Datensatz wird beim Laden streng typgeprüft. Fehler werden frühzeitig als lesbare Exceptions ausgeworfen, bevor sie tiefer im System zu Korruption führen. Die Validierung großer Datensätze muss perspektivisch in Web Worker ausgelagert werden.

### ADR-03: Web Worker für Layout-Algorithmen
* **Kontext**: Force-Directed-Layouts erfordern $O(n^2)$ Berechnungen und blockierten den UI-Thread bei großen Graphen, was zu "Freezes" führte.
* **Entscheidung**: Auslagerung der Layout-Berechnungen (`layout-worker.ts`).
* **Konsequenz**: Das UI bleibt flüssig, während die Layout-Simulation asynchron im Hintergrund läuft. Die Kommunikation erfordert Message-Passing via `postMessage`.

### ADR-04: Monolithische "App.ts" entflechten
* **Kontext**: `App.ts` und `InteractionManager.ts` waren zu "Gott-Klassen" herangewachsen, die nahezu alle Bereiche kontrollierten.
* **Entscheidung**: Aufteilen in dedizierte Handler (`SelectionHandler`, `HoverHandler`) und Manager (`SceneManager`, `RenderEngine`).
* **Konsequenz**: Bessere Testbarkeit und leichtere Einarbeitung (Onboarding) für neue Entwickler.

---
*Dokumentations-Status: V2.0 (ADRs)*
*Geprüft gegen Build: 0.98.0*
