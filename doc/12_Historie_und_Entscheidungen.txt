# 12 Historie und Entscheidungen (ADRs)

Dieses Dokument erfasst die wichtigsten architektonischen Entscheidungen (Architecture Decision Records) und die Meilensteine in der Entwicklung von Nodges. Es dient dazu, nachzuvollziehen, *warum* bestimmte technische Wege gewählt wurden.

## Meilensteine

* **v1.0 (Geplant)**: Produktionsreife, saubere Trennung des `InteractionManager` und `StateManager`.
* **v0.101.0**: Einführung des Drei-Stufen-Modus für die UI-Komplexität (Simple, Expert, Dev), des Sidebar File Managements (New, Open, Save As mit Custom Modal) und Optimierungen der Visual Mapping Engine (Heatmaps für kontinuierliche Werte).
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

### ADR-05: Drei-Stufen-Modus für UI Komplexität
* **Kontext**: Die steigende Anzahl von Analyse- und Layout-Steuerungen überforderte Erstnutzer und reine Betrachter ("Cognitive Load").
* **Entscheidung**: Implementierung eines Drei-Stufen-Systems ("Simple", "Expert", "Dev") über den `StateManager`.
* **Konsequenz**: Die Benutzeroberfläche bleibt standardmäßig im "Simple"-Modus sauber und fokussiert. Fortgeschrittene Registerkarten (wie Mappings, Ebenen und Layout) oder Entwicklerwerkzeuge (wie Create, Dev) werden erst bei Bedarf eingeblendet. Die Steuerung erfolgt deklarativ per CSS-Klassen (`data-min-mode`).

### ADR-06: Sidebar File Management mit Custom Save As Modal
* **Kontext**: Das Speichern und Exportieren von modifizierten Graphen bzw. das Erstellen neuer Graphen war nur umständlich über die Konsole oder Entwickler-Tools möglich.
* **Entscheidung**: Integration von "New", "Open" und "Save As" Schaltflächen direkt in der Sidebar (Files-Tab) sowie Entwicklung eines anwendungsnahen Custom-Modals für den Dateiexport.
* **Konsequenz**: Benutzer können Graphen direkt verwerfen, neu laden oder im standardisierten JSON- sowie Markdown-Format exportieren. Die Logik kapselt sich sauber im `FileHandler` und im `UIManager`.

### ADR-07: Visual Mapping Engine
* **Kontext**: Zuvor waren Farben und Größen der Knoten und Kanten starr codiert. Benutzer benötigten eine dynamische Zuweisung von Farbskalen und Skalierungen basierend auf Datenattributen (z.B. kontinuierliche Heatmaps für `age`).
* **Entscheidung**: Entwicklung der `VisualMappingEngine` als eigenständiger Manager im Core-System.
* **Konsequenz**: Datensätze können ohne Änderung der Strukturdaten flexibel visualisiert werden. Die Engine unterstützt kategoriale Mappings, kontinuierliche Heatmaps (z.B. von Blau zu Rot) und visuelle Presets mit automatischer Legenden-Aktualisierung.

---
*Dokumentations-Status: V2.1 (ADRs Updated)*
*Geprüft gegen Build: 0.101.0*
