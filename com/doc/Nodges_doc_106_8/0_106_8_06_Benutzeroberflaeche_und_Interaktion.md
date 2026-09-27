# 06 Benutzeroberflaeche und Interaktion

Dieses Kapitel beschreibt das User-Interface-Design, die Interaktionsarchitektur und die UX-Konzepte von Nodges in Version **0.106.8**. Im Zentrum steht das Prinzip der "Progressiven Offenlegung" (*Progressive Disclosure*), um hoechste funktionale Dichte bei minimaler kognitiver Belastung zu realisieren.

---

## 1. Design System und visuelle Aesthetik

> **Visualisierung:** Siehe [06_UIKomponentenStruktur_001.mmd](06_UIKomponentenStruktur_001.mmd)

Das visuelle Erscheinungsbild von Nodges folgt einer modernen, transparenten Designsprache, die sich harmonisch ueber den 3D-Datenraum legt.

### 1.1 Glassmorphismus und Tiefenwirkung
- **Semi-transparente Overlays:** Saemtliche Dialoge, Modals und Sidebar-Container nutzen `backdrop-filter: blur(12px)` in Kombination mit dezenten, halbtransparenten Hintergrundfarben (`rgba(18, 24, 38, 0.75)`). Dadurch bleibt die 3D-Szene selbst bei geoeffneten Menues im peripheren Sichtfeld praesent.
- **Reines Vanilla CSS (`index.css`):** Nodges verzichtet bewusst auf CSS-Frameworks wie TailwindCSS. Alle Layouts basieren auf modularem CSS-Grid und Flexbox mit CSS-Variablen fuer Themes, Kantenradien und Schatten.
- **Mikro-Animationen:** Zustandswechsel (Hover-Effekte, Akkordeon-Aufklappen, Fokus-Highlights) sind mit weichen Transitions (200 ms bis 300 ms, `cubic-bezier(0.16, 1, 0.3, 1)`) versehen, was dem Interface ein praezises, taktiles Feedback verleiht.

### 1.2 Die lil-gui Sidebar-Integration
Fuer das interaktive Parameter-Tuning nutzt Nodges die Bibliothek **lil-gui 0.19.1**:
- Extrem schlank, DOM-effizient und ohne Virtual-DOM-Overhead direkt an den Anwendungs-State angebunden.
- Dynamische Generierung von Kontrollgruppen (Ordner, Slider, Farbwahl-Elemente, Dropdowns), die sich bei Datenwechseln automatisch rekonfigurieren.

---

## 2. Die Decoupled Mapping UI

> **Visualisierung:** Siehe [06_DecoupledMappingUI_003.mmd](06_DecoupledMappingUI_003.mmd)

Klassische Datenwerkzeuge verlangen oft die manuelle Eingabe abstrakter Attributnamen. Nodges implementiert eine entkoppelte, introspektive Mapping-UI:

### 2.1 Dynamische Attribut-Erkennung
Sobald ein Graph geladen wird, durchsucht das System die `properties`-Dictionaries aller Entitaeten und Kanten. Das Mapping-Panel erzeugt automatisch kontextbezogene Auswahllisten:
- **Numerische Attribute:** Werden fuer Skalierung (Groesse), Kantenbreite, Gravitationsstaerke oder Achsenkoordinaten angeboten.
- **Kategoriale Attribute:** Werden fuer diskrete Farbpaletten oder geometrische Formen (Kugel, Wuerfel) vorgeschlagen.

### 2.2 Der raeumliche Positions-Kanal
Die Positionierung im 3D-Raum wird als gebuendelte Eigenschaft verwaltet. Waehlt der Nutzer ein Datenfeld (z. B. "Gruendungsjahr" oder "Budget"), erlaubt ein kompakter Achsen-Umschalter die direkte Zuweisung auf die X-, Y- oder Z-Achse. Dies ermoeglicht den blitzschnellen Wechsel zwischen freien physikalischen Clustern und strukturierten Koordinatengittern.

---

## 3. Das CreatePanel (Pipeline-Orchestrierung)

Das `CreatePanel` bildet die Steuerzentrale fuer generative KI-Workflows:

### 3.1 Konfigurator fuer modulare Pipelines
Der Nutzer stellt den Generierungsprozess interaktiv zusammen:
- **Provider-Auswahl:** Umschalten zwischen Cloud-Providern (OpenRouter, OpenAI, Anthropic via BYOK) und lokalen Inferenz-Servern (Ollama unter `http://localhost:11434`, LM Studio) fuer maximale Datensouveraenitaet.
- **Grounding-Optionen:** Zukonfigurieren von Faktenpruefungen ueber Wikidata-SPARQL oder lokale Dokumenten-RAG-Dienste.
- **Kanten-Metrik:** Festlegung, ob Beziehungen heuristisch abgeschaetzt oder ueber Kosinus-Distanzen berechnet werden sollen.

### 3.2 Human-in-the-Loop (Das Review-Modal)

> **Visualisierung:** Siehe [06_HumanInTheLoopWorkflow_002.mmd](06_HumanInTheLoopWorkflow_002.mmd)

Ist die Qualitaetssicherungsstufe "Human-in-the-Loop" aktiv, wird das Generierungsergebnis vor dem 3D-Rendering in einem Pruefdialog abgefangen:
1. Das Rendering neuer Elemente wird pausiert.
2. Ein modales Glassmorphism-Fenster praesentiert Entitaeten und Relationen in tabellarischer Uebersicht.
3. Der Benutzer kann fehlerhafte Knoten loeschen, Bezeichnungen korrigieren oder Kantenrelationen nachjustieren.
4. Erst mit der expliziten Bestaetigung ("Visualisieren") werden die bereinigten Daten an den `StateManager` uebergeben.

---

## 4. Status- und Feedback-Systeme

Da KI-Inferenz und RAG-Extraktionen mehrsekundige Berechnungszeiten beanspruchen koennen, informiert ein mehrstufiges Feedback-System den Nutzer:
- **Toast-Benachrichtigungen:** Nicht-blockierende Meldungen fuer Hintergrundereignisse (Erfolg = Gruen, Warnungen/Rate-Limits = Gelb, Validierungsfehler = Rot).
- **Fortschritts-Overlays:** Feingliedrige Statusanzeigen waehrend der Pipeline-Phasen ("Ontologie wird analysiert...", "SPARQL-Tripel werden verifiziert...", "3D-Instanzen werden aufgebaut...").
- **Fehlerresilienz:** Im Falle ungueltiger Payloads stuerzt das Frontend nicht ab; die bestehende 3D-Szene bleibt vollstaendig erhalten.
