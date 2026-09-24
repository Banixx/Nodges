# `/such` Bericht: Abbildung der Welt in Nodges (Ontologie, Nodes, Edges & JSON)

## 1. Kontext & Suchergebnisse
Der Befehl `/[such]` wurde ausgeführt, um herauszufinden, wie die hochfliegenden Konzepte aus Kapitel 1 (Kognition, Cognitive Offloading, Sensemaking) in die harte, technische Realität von Nodges übersetzt werden. Wie wird unsere komplexe, reale Welt in das Nodges-JSON (Nodes, Edges, Attribute) gepresst?

**Gefundene historische Referenzen:**
- `0_102_7_ontologie_erklaerung.md` (Erklärung des "harten Korsetts")
- `0_102_8_architektur_gruppenmitgliedschaft.md` ("Gruppen als Entitäten")
- `Nodges_gesamt_105.md` (Historische Definition des Build-3/Build-5 Schemas)
- Diverse Scratchpads und Prompt-Historien zur Zod-Validierung.

---

## 2. Von der Philosophie zur Ontologie

Die Philosophie von Nodges besagt: **Wir wollen das Gehirn entlasten (Cognitive Offloading)**. Damit die 3D-Engine abstrakte Daten in physisch greifbare Größen (Farbe, Leuchtkraft, Volumen) übersetzen kann, darf die Datenstruktur nicht chaotisch sein. Die Welt muss stark abstrahiert und kategorisiert werden.

Dies geschieht in Nodges über die **Ontologie**. Sie ist das Regelwerk, nach dem die Welt gebaut wird, *bevor* der erste Knoten überhaupt existiert.

### Der Paradigmen-Wechsel: Der 2-Stufen-Prozess
Nodges zwingt das LLM in einen strukturierten Welterschaffungs-Prozess:
1. **Die Gesetze der Welt (Schema/Ontologie):** Zuerst muss das System definieren, welche *Konzepte* überhaupt existieren. Welche Arten von Knoten gibt es? Welche messbaren Eigenschaften (Attribute) haben sie?
2. **Die Instanziierung (Daten):** Erst im zweiten Schritt werden die tatsächlichen Akteure als konkrete `Nodes` und `Edges` in die Welt gesetzt. Sie müssen sich exakt an die zuvor definierten Gesetze halten.

---

## 3. Die Bausteine der Welt (Das JSON Datenmodell)

Das Nodges-JSON ist extrem restriktiv (überprüft durch Zod), um diese Weltsicht zu erzwingen.

### 3.1 Entities (Nodes / Knoten)
Knoten sind die physischen oder konzeptionellen Akteure der Welt (Menschen, Firmen, Ideen, Server).
* **Flache Wahrheit:** Ein Knoten darf keine verschachtelten Unter-Objekte haben. Seine Realität wird durch ein flaches Objekt (`properties` oder ehemals `stateVector`) abgebildet.
* **Gruppen als Entitäten (Die Cloud):** Ein wichtiger philosophischer Durchbruch in Build 8: Auch abstrakte Konzepte oder Gruppierungen (z.B. "Die Europäische Union" oder "Die IT-Abteilung") werden als echte, physisch greifbare Knoten (`type: group`) in der 3D-Welt erschaffen. Sie sind nicht nur unsichtbare Metadaten, sondern Dinge, die man anklicken, untersuchen und mit denen andere Knoten interagieren können.

### 3.2 Relationships (Edges / Kanten)
Kanten sind das Bindegewebe der Welt. Sie definieren, wie Akteure zueinander stehen.
* In Nodges ist jede komplexe Abhängigkeit eine eigene, isolierte Kante (`source` zu `target`).
* **Qualifizierung von Beziehungen:** Kanten sind nicht nur dumme Linien. Genau wie Knoten können auch Kanten Attribute besitzen (z.B. "Intensität", "Dauer", "Finanzielles Volumen"). Dadurch lässt sich z.B. eine Geldfluss-Kante visuell viel dicker darstellen (TubeGeometry) als eine einfache Kommunikations-Kante.

### 3.3 Attribute und ihre Werte (Die Quantifizierung)
Die reale Welt ist bunt und chaotisch. Die Ontologie zwingt das System, diese Welt in zwei harte Variablen-Typen zu unterteilen:
* **Categorical (Kategorisch):** Werte, die sich in Eimer sortieren lassen (z.B. "Status: Aktiv/Inaktiv", "Tierart: Vogel/Fisch"). Diese Werte sind perfekt geeignet, um in der 3D-Welt die **Farbe** oder **Form** eines Knotens zu steuern.
* **Continuous (Kontinuierlich):** Messbare Werte (z.B. "Alter: 45", "Budget: 1.000.000"). Diese Werte übersetzt Nodges nativ in physische Eigenschaften wie **Größe/Volumen** (Scale), **Schwerkraft** oder **Leuchtintensität** (Glow).

---

## 4. Fazit: Der Kreis schließt sich

Aus der Kombination dieser Bausteine entsteht das "Executable Storytelling", das in Kapitel 1 beschrieben wurde. 

1. **Philosophie:** Wir wollen komplexe Zusammenhänge ohne langes Lesen erfassbar machen.
2. **Abbildung:** Wir zwingen die Welt in ein flaches, striktes JSON-Schema (Nodes, Edges, Categorical/Continuous).
3. **Ergebnis:** Das `visualMappings`-Objekt im JSON kann nun diese aufgeräumten Daten nehmen und sie deterministisch in die Three.js-Engine pumpen. Ein hohes Budget wird automatisch zu einer riesigen Kugel, eine wichtige Verbindung wird automatisch zu einem dicken, leuchtenden Kabel.

**Das JSON ist somit keine bloße Datenbank, sondern das physikalische Drehbuch der 3D-Welt.**
