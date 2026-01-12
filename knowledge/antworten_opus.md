# Antworten auf die Projektfragen - Nodges

**Datum:** 2026-01-10  
**Analyst:** Antigravity (Google DeepMind)

---

## 1. Welche Teile des Projekts bergen aktuell das höchste Risiko für Fehler oder Regressionen?

### Höchste Risikobereiche

1. **`InteractionManager.ts` (814 Zeilen)** – Diese Datei ist die größte Manager-Komponente und enthält:
   - Raycasting-Logik für Hover/Click-Detection
   - Box-Selection-Implementierung
   - Kontextmenü-Steuerung
   - Node/Edge-Erstellung und -Löschung
   - Tastatur-Event-Handler

   > [!WARNING]
   > Diese Datei hat zu viele Verantwortlichkeiten (Single Responsibility Principle verletzt). Änderungen hier haben hohes Potential für Seiteneffekte.

2. **`App.ts` (546 Zeilen)** – Die zentrale Orchestrierungsklasse koordiniert alle Manager. Änderungen an der Initialisierungsreihenfolge können kaskadierende Fehler verursachen.

3. **State-Synchronisation zwischen `StateManager` und `CentralEventManager`** – Beide Systeme (Observer + Pub/Sub) laufen parallel. Inkonsistenzen zwischen State und Events sind schwer zu debuggen.

---

## 2. Wenn Sie dieses Projekt vereinfachen müssten, ohne die Funktionalität einzuschränken, wo würden Sie ansetzen und warum?

### Empfohlene Vereinfachungen

1. **`InteractionManager` aufteilen:**
   - `SelectionManager` – Nur Selektion/Deselektion-Logik
   - `HoverManager` – Nur Hover-Effekte und Tooltips
   - `InputEventManager` – Nur Tastatur/Maus-Events
   - `NodeEdgeCreator` – Nur Erstellung neuer Elemente

2. **Event-System konsolidieren:**
   - Entweder `StateManager` ODER `CentralEventManager` als primäres Kommunikationssystem wählen, nicht beide parallel.

3. **UI-Logik aus `App.ts` extrahieren:**
   - Die `loadGraphData`-Methode (63 Zeilen) enthält UI-Updates – diese gehören in den `UIManager`.

---

## 3. Welche Probleme sind noch nicht sichtbar, werden aber mit zunehmender Projektgröße auftreten?

### Skalierungsprobleme

| Problem | Auswirkung bei Wachstum |
|---------|------------------------|
| **Keine Lazy-Loading für Nodes** | Bei >10.000 Nodes wird die initiale Ladezeit kritisch |
| **Force-Directed Layout ist synchron** | Blockiert UI bei großen Graphen (Worker existiert, aber nicht voll integriert) |
| **Alle Manager werden in `App.constructor` erstellt** | Speicherverbrauch steigt linear, auch wenn Features nicht genutzt werden |
| **`passthrough()` in Zod-Schemas** | Erlaubt beliebige Properties – macht Type-Safety bei Erweiterungen schwächer |
| **Kein Memory-Management für 3D-Objekte** | Three.js Geometrie/Material werden bei `clearScene()` nicht explizit disposed |

---

## 4. Welche aktuellen technischen Entscheidungen schränken Skalierbarkeit oder Wartbarkeit ein?

### Einschränkende Entscheidungen

1. **Vanilla HTML/CSS UI statt Komponenten-Framework:**
   - Pro: Keine Abhängigkeit
   - Contra: UI-Logik in `UIManager.ts` (29.047 Bytes) wird unübersichtlich

2. **Globales `window.app`-Pattern:**

   ```typescript
   window.app = new App();
   ```

   - Erschwert Testing und Modularisierung

3. **Tight Coupling zwischen Managern:**
   - `InteractionManager` braucht Referenzen zu: `CentralEventManager`, `StateManager`, `HighlightManager`, `Camera`, `Controls`, `Scene`, `Renderer`
   - 8 Abhängigkeiten im Konstruktor!

4. **Keine Dependency Injection:**
   - Manager werden direkt in `App.initManagers()` instanziiert
   - Mock-Testing ist schwierig

---

## 5. Welche Teile des Codes oder der Architektur sollten zuerst isoliert, dokumentiert oder getestet werden?

### Prioritätenliste

| Priorität | Komponente | Grund |
|-----------|-----------|-------|
| 🔴 **1** | `types.ts` + Zod-Schemas | Fundament des Datenmodells – hier beginnt alles |
| 🔴 **2** | `StateManager.ts` | Zentraler State – muss vorhersehbar sein |
| 🟡 **3** | `VisualMappingEngine.ts` | Komplexe Mapping-Logik (linear, heatmap, etc.) |
| 🟡 **4** | `LayoutManager.ts` | Verschiedene Layout-Algorithmen (Force, Grid, etc.) |
| 🟢 **5** | `DataParser.ts` | Datenvalidierung und -transformation |

### Empfohlene Test-Strategie

- **Unit-Tests** für `types.ts` (Zod-Validierung)
- **Integration-Tests** für `StateManager` ↔ `CentralEventManager`
- **Snapshot-Tests** für Layout-Algorithmen (deterministische Ausgabe)

---

## 6. Wo kann das tatsächliche Verhalten des Projekts von der ursprünglichen Absicht der Entwickler abweichen?

### Potenzielle Diskrepanzen

1. **`passthrough()` in Zod-Schemas:**

   ```typescript
   EntityDataSchema.passthrough(); // Allow extra properties!
   ```

   - Absicht: Flexibilität
   - Realität: Beliebige Properties werden akzeptiert, auch fehlerhafte

2. **Glow-Animation im StateManager:**

   ```typescript
   updateGlowState(deltaTime: number) // Zeilen 211-240
   ```

   - Der StateManager verwaltet Animations-Logik – das sollte ein `AnimationManager` tun

3. **`@ts-ignore` Kommentare in `App.ts`:**

   ```typescript
   // @ts-ignore
   // @ts-ignore
   ```

   - Zweimal hintereinander – TypeScript-Probleme wurden ignoriert statt gelöst

4. **Nicht verwendete Abhängigkeiten:**
   - `Tween.js` und `lil-gui` sind in den Dependencies, aber deren Integration ist unklar

---

## 7. Welche Muster, Abstraktionen oder Konventionen könnten die Gesamtkomplexität reduzieren?

### Empfohlene Patterns

1. **Command Pattern für Undo/Redo:**

   ```typescript
   interface Command {
     execute(): void;
     undo(): void;
   }
   ```

   - Aktuell gibt es keine Undo-Funktionalität

2. **Factory Pattern für Node-Erstellung:**
   - `NodeManager.createNodes()` direkt in `App.ts` aufgerufen
   - Besser: `NodeFactory.create(entityData)` mit konsistenter Logik

3. **Mediator Pattern statt direkter Manager-Kommunikation:**
   - `CentralEventManager` ist bereits ein Ansatz, wird aber inkonsistent genutzt

4. **State Machine für Interaktions-Modi:**

   ```typescript
   type InteractionMode = 'select' | 'create-node' | 'create-edge' | 'pan';
   ```

   - Aktuell: String-basierte Tool-Verwaltung (`setCurrentTool(tool: string)`)

---

## 8. Wenn jemand anderes dieses Projekt morgen übernehmen müsste, welche Probleme würden zuerst auftreten?

### Onboarding-Hürden

1. **Keine README mit Architektur-Übersicht:**
   - Die `project_analysis.md` im `knowledge/`-Ordner ist gut, aber nicht im Root-Verzeichnis

2. **Zwei Event-Systeme parallel:**
   - Neuer Entwickler fragt: "Wann nutze ich `stateManager.update()` vs. `eventManager.emit()`?"

3. **Keine Inline-Dokumentation für Kernmethoden:**
   - `loadGraphData()` in `App.ts` hat 63 Zeilen ohne Kommentare dazwischen

4. **Versteckte Abhängigkeiten:**
   - `InteractionManager` erwartet, dass `HighlightManager` vor ihm initialisiert wurde
   - Diese Reihenfolge ist nur in `App.initManagers()` implizit definiert

5. **Gemischte Sprache:**
   - Kommentare teils Deutsch ("Loescht selektierte Objekte"), teils Englisch
   - Konsistenz fehlt

---

## 9. Welche Verbesserungen würden kurzfristig das beste Verhältnis von Aufwand zu Nutzen bieten?

### Quick Wins

| Verbesserung | Aufwand | Nutzen |
|-------------|---------|--------|
| 📝 README.md mit Architektur-Diagramm | 1-2h | Hoch – beschleunigt Onboarding |
| 🧹 `@ts-ignore` entfernen und Typen fixen | 2-3h | Mittel – verhindert versteckte Fehler |
| 📦 Memory-Dispose in `clearScene()` | 1h | Hoch – verhindert Memory-Leaks |
| 🔧 Einheitliche Kommentarsprache (EN) | 2h | Mittel – Konsistenz |
| ✅ Basis-Unit-Tests für Zod-Schemas | 2-3h | Hoch – sichert Datenvalidierung ab |

---

## 10. Was hindert dieses Projekt aktuell daran, ein produktionsreifes Niveau zu erreichen?

### Produktions-Blocker

1. **Keine Test-Suite:**
   - Kein `tests/`-Verzeichnis gefunden
   - Keine CI/CD-Pipeline

2. **Error-Handling ist minimal:**
   - `try/catch` nur in `App`-Initialisierung
   - Keine User-facing Fehlermeldungen bei ungültigen Daten

3. **Performance bei großen Graphen:**
   - Kein Level-of-Detail (LOD) für entfernte Nodes
   - Keine Viewport-Culling-Optimierung

4. **Sicherheit:**
   - Keine Validierung von externen JSON-Dateien außer Zod-Schema
   - `passthrough()` erlaubt potenziell schädliche Properties

5. **Accessibility:**
   - 3D-Visualisierung ohne Tastatur-Navigation
   - Keine ARIA-Labels für UI-Elemente

6. **Build/Deploy-Dokumentation:**
   - Keine `Dockerfile` oder Deployment-Anweisungen
   - Nur `npm run dev` ist dokumentiert (Production-Build?)

---

> [!TIP]
> **Empfohlene nächste Schritte:**
>
> 1. Unit-Tests für `types.ts` schreiben
> 2. `InteractionManager` in 3-4 kleinere Klassen aufteilen
> 3. Memory-Dispose für Three.js-Objekte implementieren
> 4. README.md mit Mermaid-Architektur-Diagramm erstellen
