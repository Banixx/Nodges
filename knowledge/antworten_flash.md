# Projekt-Analyse: Antworten auf die Kernfragen

Dieses Dokument enthält die fundierten Antworten auf die Fragen aus dem `/fragen`-Workflow für das Projekt **Nodges**, basierend auf einer detaillierten Analyse der Architektur und des Quellcodes.

---

### 1. Welche Teile des Projekts bergen aktuell das höchste Risiko für Fehler oder Regressionen?

Das höchste Risiko liegt im **Zusammenspiel zwischen `CentralEventManager` (CEM) und `StateManager` (SM)**. Aktuell existieren zwei parallele Systeme zur Statusverfolgung und Event-Verarbeitung.

- **Risiko:** Manager abonnieren oft beide Systeme. Da der CEM teilweise den SM aktualisiert, bevor er eigene Events feuert, können Race Conditions oder doppelte Status-Updates auftreten.
- **Folge:** Inkonsistente UI-Zustände oder "Ghost-Highlights" in der 3D-Szene, die schwer zu debuggen sind.

### 2. Wenn Sie dieses Projekt vereinfachen müssten, ohne die Funktionalität einzuschränken, wo würden Sie ansetzen und warum?

Die **Zentralisierung der Orchestrierung in `App.ts`**. Aktuell instanziiert `App.ts` über 20 Manager direkt und reicht Abhängigkeiten in tief verschachtelten Konstruktoren weiter.

- **Ansatz:** Einführung eines einfachen Service-Locator- oder DI-Patterns.
- **Warum:** Dies würde die `App.ts` von ca. 550 auf unter 200 Zeilen reduzieren und die Entkopplung der Manager massiv verbessern, was isolierte Tests erst ermöglicht.

### 3. Welche Probleme sind noch nicht sichtbar, werden aber mit zunehmender Projektgröße auftreten?

**Memory-Management bei Three.js-Ressourcen.** Aktuell gibt es keine explizite Logik zum Disposen von Geometrien und Materialien, wenn die Szene geleert oder Daten neu geladen werden (`clearScene`).

- **Problem:** Bei häufigem Laden großer Graphen wird der Grafikspeicher (VRAM) sukzessive vollgeschrieben, was nach einiger Zeit zu Browser-Crashes oder Performance-Einbußen führt.

### 4. Welche aktuellen technischen Entscheidungen schränken Skalierbarkeit oder Wartbarkeit ein?

Die Entscheidung, **`passthrough()` in den Zod-Schemas** für Entitäten und Relationen zu verwenden.

- **Auswirkung:** Es erlaubt unvalidierte Zusatzdaten im Graphen. Was kurzfristig flexibel wirkt, führt langfristig dazu, dass sich "Datenmüll" ansammelt, auf den sich Teile der App verlassen, ohne dass dies durch Typen oder Validierung abgesichert ist.
- **Wartbarkeit:** Refactorings der Datenstruktur werden extrem riskant, da nicht klar ist, welche "versteckten" Properties aktiv genutzt werden.

### 5. Welche Teile des Codes oder der Architektur sollten zuerst isoliert, dokumentiert oder getestet werden?

Der **`InteractionManager`**. Mit über 800 Zeilen vereint er zu viele Verantwortlichkeiten (Selektion, Hover, Erstellung von Nodes/Edges, Keyboard-Handler).

- **Priorität:** Er sollte in spezialisierte Manager (`SelectionManager`, `CreationManager`, `InputRouter`) aufgeteilt und die Kernlogik der Selektion mit Unit-Tests abgesichert werden.

### 6. Wo kann das tatsächliche Verhalten des Projekts von der ursprünglichen Absicht der Entwickler abweichen?

Beim **Highlighting-System**. Im `InteractionManager` wird nach einer Selektion manuell `updateHighlights()` aufgerufen, obwohl der `HighlightManager` bereits den `StateManager` abonniert hat und auf Änderungen reagieren sollte.

- **Abweichung:** Das führt zu redundanten Berechnungen. Wenn die manuelle und die automatisierte Logik leicht divergieren (z.B. unterschiedliche Timings), sieht der User kurzes Flackern oder falsche Farben.

### 7. Welche Muster, Abstraktionen oder Konventionen könnten die Gesamtkomplexität reduzieren?

Die strikte Einhaltung des **Unidirectional Data Flow (UDF)**:

- CEM erfasst ausschließlich Input (Maus/Tastatur).
- Ein dedizierter Router/Handler übersetzt Input in State-Änderungen.
- State-Änderungen triggern die Visualisierung.
Aktuell "darf" fast jeder Manager alles triggern, was die Kausalketten unüberschaubar macht.

### 8. Wenn jemand anderes dieses Projekt morgen übernehmen müsste, welche Probleme würden zuerst auftreten?

Das **"Missing Test-Suite" Problem**. Ohne automatisierte Tests kann ein neuer Entwickler keine Änderung vornehmen, ohne Angst zu haben, das empfindliche Gleichgewicht der Manager-Interaktionen zu stören.

- **Herausforderung:** Das Verständnis der Abhängigkeitsgrafen zwischen den Managern ist ohne grafische Dokumentation (oder DI-Konfiguration) extrem zeitaufwendig.

### 9. Welche Verbesserungen würden kurzfristig das beste Verhältnis von Aufwand zu Nutzen bieten?

Die **Beseitigung der 15 `@ts-ignore` Kommentare**.

- **Aufwand:** Gering (ca. 4h).
- **Nutzen:** Es deckt sofort fundamentale Typ-Fehler auf, die aktuell nur durch Glück nicht zu Laufzeitfehlern führen (besonders im CEM und RaycastManager).

### 10. Was hindert dieses Projekt aktuell daran, ein produktionsreifes Niveau zu erreichen?

Das Fehlen einer **Error-Handling-Strategie**. Wenn ein Manager abstürzt oder die WebGL-Instanz verloren geht (Context Loss), friert die App ohne Fehlermeldung ein.

- **Bedarf:** Eine globale Error-Boundary für die UI und ein robuster Fallback-Mechanismus für den Renderer sind für den Produktionseinsatz unerlässlich.
