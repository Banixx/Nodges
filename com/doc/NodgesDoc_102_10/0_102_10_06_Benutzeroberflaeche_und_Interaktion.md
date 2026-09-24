# 05 Benutzeroberfläche und Interaktion

Das Interface-Design von Nodges zeichnet sich durch die Philosophie der "Progressiven Offenlegung" (Progressive Disclosure) aus. Komplexe Datengraphen erfordern ein UI, das die kognitive Last des Nutzers minimiert. Dieses Kapitel beschreibt den technischen Aufbau und die UX-Konzepte der Benutzeroberfläche.

---

## 1. Design System und Ästhetik

> **Visualisierung:** Siehe [06_UIKomponentenStruktur_001.mmd](06_UIKomponentenStruktur_001.mmd)

### 1.1 Glassmorphismus und Premium-Feel
Nodges verwendet eine moderne, transparente Designsprache.
- **Glassmorphism:** UI-Panels (Sidebar, Modals) wirken transparent, durchbrochen von subtilem `backdrop-filter: blur(10px)`. Dies stellt sicher, dass die 3D-Szene im Hintergrund stets sichtbar bleibt und das Interface nicht isoliert vom Datenraum wirkt.
- **Vanilla CSS (`index.css`):** Um absolute Kontrolle über das Rendering und die Transitions zu behalten, verzichtet Nodges auf Utility-Frameworks wie TailwindCSS. Alle Layouts werden über natives CSS-Grid und Flexbox gesteuert.
- **Micro-Animations:** Hover-Zustände, Klicks auf Buttons oder das Aufklappen von Dropdowns werden von 200ms bis 300ms Transitions (z.B. ease-out) begleitet. Dies verleiht der Applikation ein "lebendiges" Premium-Gefühl.

### 1.2 Die lil-gui Integration
Für die technische Umsetzung des Sidebars setzt Nodges massiv auf die Bibliothek `lil-gui` (den spirituellen Nachfolger von `dat.gui`).
- `lil-gui` ist extrem performant, DOM-effizient und der De-facto-Standard in der Three.js-Community für Parameter-Tuning.
- Es ermöglicht das schnelle Prototyping und dynamische Rendern von Slidern, Farbpipetten und Dropdowns, direkt gekoppelt an den internen State des `GraphDataManager`.

---

## 2. Die Decoupled Mapping UI

> **Visualisierung:** Siehe [06_DecoupledMappingUI_003.mmd](06_DecoupledMappingUI_003.mmd)

In traditionellen Daten-Tools muss der User oft kryptische Pfade oder feste Bezeichner in Textfelder tippen, um Daten an visuelle Eigenschaften zu koppeln. Nodges dreht diesen Spieß um.

### 2.1 Dynamische Ontologie-Vorschläge
Das Mapping-UI in Nodges ist *decoupled* – es kennt keine harten Variablen. 
Wenn ein neuer Graph geladen wird, analysiert ein Background-Skript die `properties` aller Knoten.
Die UI generiert daraufhin Dropdown-Menüs (z.B. für die Farbe). Anstatt ein leeres Feld anzubieten, zeigt das Dropdown exakt die Felder an, die im Datensatz existieren (z.B. "Jahresumsatz", "Kategorie", "Region").

### 2.2 Positionierung: Ein First-Class Channel
Eine Besonderheit der UI ist die Behandlung räumlicher Koordinaten.
- Früher gab es für X, Y und Z jeweils eine eigene, verwirrende Dropdown-Reihe.
- Heute bietet die UI eine gebündelte 'Position'-Eigenschaftsbox an. Wählt der Nutzer ein Datenfeld aus (z.B. "Gründungsjahr"), erscheint dynamisch ein Toggle, mit dem er bestimmen kann, auf welche Achse (oder Achsenkombination) dieser Wert gemappt werden soll. Das räumt die UI drastisch auf.

---

## 3. Das CreatePanel (Pipeline-Steuerung)

Das `CreatePanel` ist das Herzstück der Datengenerierung. Hier orchestriert der Nutzer das LLM.

### 3.1 Build 10 Modul-Konfigurator
Wählt der Nutzer die "Build 10" Pipeline aus, entfaltet sich der dynamische `build10ConfigContainer`. Dieser Container ist das Kontrollzentrum der agentischen Workflow-Konfiguration.
Der Nutzer konfiguriert:
- **Provider-Toggle:** Ein Switch zwischen "Cloud" (OpenRouter) und "Local" (Ollama). Wird "Local" gewählt, blendet die UI automatisch das API-Key-Feld aus, da es nicht benötigt wird.
- **Grounding-Select:** Auswahl zwischen Wikidata-Live-Abfrage, Deduplizierung oder purem LLM-Wissen.
- **Evaluations-Methode:** Aktivieren der Kosinus-Ähnlichkeit für semantische Kantenstärken.

### 3.2 Human-in-the-loop (Das Review Modal)
Ein kritischer Interaktions-Workflow ist die Qualitätssicherung.

> **Visualisierung:** Siehe [06_HumanInTheLoopWorkflow_002.mmd](06_HumanInTheLoopWorkflow_002.mmd)

Ist das "Human-in-the-loop"-Modul aktiv, darf das System nach der LLM-Generierung nicht direkt in die 3D-Szene rendern.
1. Die App friert den Render-Prozess ein.
2. Ein HTML-Modal überlagert die Szene (Glassmorphism-Overlay).
3. Zwei tabellarische Listen werden gerendert: Entitäten und Relationen.
4. Der User fungiert als "Kritiker". Er kann direkt in der Tabelle fehlerhafte Halluzinationen löschen oder neue Entitäten hinzufügen.
5. Erst der Klick auf "Visualisieren" gibt den State an den `GraphDataManager` frei.

---

## 4. Feedback-Systeme (Toasts & Loading)

Da LLM-Anfragen teilweise 10 bis 40 Sekunden dauern können (besonders bei lokalen Modellen oder komplexen Wikidata-SPARQL-Ketten), ist Nutzer-Feedback unerlässlich.
- Nodges nutzt ein asynchrones Toast-Notification-System.
- Warnungen (Ratelimits) sind gelb/orange, kritische Zod-Validierungsfehler rot, Erfolge grün.
- Eine Spinner-Overlay-Komponente mit Statusmeldungen (z.B. "Generiere Ontologie...", "Frage Wikidata ab...", "Generiere Embeddings...") hält den Nutzer über den exakten Schritt der Pipeline informiert.
