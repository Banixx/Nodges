# Kritische Projektanalyse: Antworten (Gemini High)

Basierend auf der Analyse der Codebasis von **Nodges** (Stand v0.97.5) folgen hier die Antworten auf die im Projekt hinterlegten kritischen Fragen.

---

### 1. Höchstes Risiko für Fehler oder Regressionen?

Das größte Risiko liegt in der **engen Kopplung in `App.ts`**. Da fast alle Manager (`NodeManager`, `EdgeObjectsManager`, `InteractionManager`, etc.) direkt in der zentralen `App`-Klasse instanziiert und manuell miteinander verdrahtet werden, können Änderungen an einer Komponente unvorhersehbare Seiteneffekte in anderen Bereichen haben. Insbesondere das Zusammenspiel von `StateManager`, `CentralEventManager` und dem Rendering-Zyklus ist fehleranfällig, wenn Events nicht sauber deabonniert werden.

### 2. Wo ansetzen zur Vereinfachung?

Ich würde bei der **UI-Integration** ansetzen. Aktuell ist die UI-Logik über `index.html`, `src/ui/` und direktes DOM-Manipulation in den Managern verteilt. Die Einführung eines leichtgewichtigen Komponenten-Systems (oder die konsequente Nutzung von Web Components) würde die `UIManager`-Logik drastisch vereinfachen und die Trennung von Darstellung und Logik (Separation of Concerns) stärken.

### 3. Probleme bei zunehmender Projektgröße?

* **Performance des Raycastings**: Bei 10.000+ Objekten wird die aktuelle Implementierung des `RaycastManager` (kontinuierliche Prüfung) zum Flaschenhals. Hier wären räumliche Partitionierungskonzepte (wie Octrees) notwendig.
* **Zustandskomplexität**: Mit mehr Features wird der globale `StateManager` ohne striktere Unterteilung (Sub-States) unübersichtlich.

### 4. Technische Entscheidungen, die Skalierbarkeit einschränken?

Die Entscheidung für eine **monolithische Manager-Architektur ohne Dependency Injection**. Es ist schwer, einzelne Teile des Systems isoliert zu testen oder auszutauschen, da sie oft direkte Referenzen auf `window.app` oder andere Instanzen benötigen.

### 5. Priorität für Isolation, Dokumentation und Tests?

Zuerst die **VisualMappingEngine** und der **DataParser**. Dies sind die "reinen" Logik-Einheiten der Applikation. Wenn hier Fehler im Mapping-Algorithmus auftreten, ist die gesamte Visualisierung korrupt. Diese sollten isoliert (Unit Tests) und deren Mapping-Funktionen (linear, exponentiell, etc.) mathematisch dokumentiert werden.

### 6. Abweichung zwischen Verhalten und Absicht?

Gefahr besteht bei der **automatischen Layout-Engine**. Die Interaktion zwischen Benutzer-Verschiebungen (Manuelles Layout) und der Physik-Engine (`LayoutManager`) führt oft zu "kämpfenden" Systemen, bei denen Knoten unerwartet springen, wenn die Absicht des Nutzers (Fixieren) nicht korrekt mit der Physik-Instanz synchronisiert ist.

### 7. Muster zur Reduktion der Gesamtkomplexität?

* **Strategy Pattern**: Für die verschiedenen Layout-Algorithmen und Visual-Mapping-Funktionen.
* **Observer Pattern**: Den `CentralEventManager` noch konsequenter nutzen, um direkte Manager-zu-Manager Aufrufe zu eliminieren.
* **Command Pattern**: Für Nutzeraktionen (Move, Delete, Create), um eine Undo/Redo-Funktionalität zu ermöglichen und die Interaktionslogik zu entzerren.

### 8. Probleme bei Übernahme durch Dritte?

Ein neuer Entwickler würde über die **impliziten Abhängigkeiten** stolpern. Viele Manager erwarten, dass bestimmte Three.js Objekte (wie die `scene`) bereits in einem bestimmten Zustand sind. Ohne eine klare `Lifecycle`-Dokumentation (Init -> Load -> Render) ist der Einstieg schwer.

### 9. Bestes Verhältnis von Aufwand zu Nutzen?

Die Implementierung von **Schema-Tests für den Datenimport (Zod)** ist bereits ein guter Schritt. Als nächstes würde die Einführung von **E2E-Tests für die Kern-Interaktionen** (Laden -> Selektieren -> Info anzeigen) mit Playwright oder Cypress den größten Stabilitätsgewinn bei moderatem Aufwand bringen.

### 10. Hindernis für Produktionsreife?

* **Robustes Fehlerhandling**: Die App stürzt bei fehlerhaften JSON-Strukturen oder fehlenden WebGL-Features teilweise "blind" ab (nur Konsolenfehler).
* **Testabdeckung**: Es fehlen automatisierte Regressionstests.
* **State-Persistenz**: Einstellungen im UI (Mappings, Environment) gehen beim Refresh verloren, sofern sie nicht im JSON gespeichert sind.

---
*Analyse abgeschlossen am: 10.01.2026 von Gemini High*
