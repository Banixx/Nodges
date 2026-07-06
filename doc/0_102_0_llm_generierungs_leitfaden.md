# Leitfaden: Generierung komplexer Systeme für Nodges

Dieses Dokument beschreibt die Kernproblematik bei der LLM-gestützten Generierung von Netzwerk-Daten für Nodges (Build 4 Schema) und definiert die Lösungsstrategie für optimale Ergebnisse.

## 1. Die Zielsetzung
Das Ziel ist es, ein LLM (Large Language Model) dazu zu bringen, ein komplexes reales System (z.B. das politische System der Schweiz) als strukturierte, interaktive und visuell sprechende Netzwerk-Topologie im Nodges JSON-Format auszugeben. Das System muss semantisch tiefgründig und visuell differenzierbar sein.

## 2. Die Problematik (Was bisher schiefging)
Bisherige Ansätze scheiterten an zwei Extremen:
*   **Zu simpel (Generische Typisierung):** Das LLM warf alle Knoten in generische Kategorien (z.B. "Politiker" oder "Institution") ohne weitere unterscheidbare Merkmale. Das Netzwerk wurde flach und visuell eintönig.
*   **Zu starr (Blinde Attribut-Vererbung):** Der Versuch, dem LLM feste "Blickwinkel" (Facetten) aufzuzwingen, führte zu logischen Fehlern. Wenn der Prompt verlangt, dass *jede* Entität die Attribute "Akteurstyp", "Staatsfunktion" und "Partei" besitzen muss, zwingt dies das LLM, einer Institution wie dem Bundesrat eine Partei zuzuordnen, was ontologisch falsch ist.
*   **Falsche Hierarchien (Nesting):** Das LLM neigte dazu, Zugehörigkeiten (z.B. ein Departement gehört zum Bundesrat) durch Verschachtelung (Nesting) innerhalb der Node-Properties abzubilden, was die Netzwerk-Logik (Edges) von Nodges aushebelt.

## 3. Die Lösungsstrategie (Dynamische Ontologie)
Um ein umfassendes, korrektes und anschauliches System zu generieren, muss das LLM zwingend folgende Architektur-Prinzipien befolgen:

### A. Dynamische Ontologie-Bildung (Das "dataModel")
Das LLM muss den Kontext analysieren und eine massgeschneiderte Ontologie entwerfen. Es identifiziert sinnvolle Entitäts-Klassen (z.B. `Person`, `Institution`, `Dokument`).

### B. Strikte Typ-spezifische Attribute
Anstatt Attribute global zu erzwingen, werden sie strikt an den Entitäts-Typ gebunden. 
*   *Beispiel:* Nur der Typ `Person` erhält das Property `Partei`. Der Typ `Institution` erhält stattdessen das Property `Einflussbereich` (National/Kantonal).

### C. Flache Struktur & Semantische Kanten
Komplexe Zusammenhänge und Hierarchien werden **niemals** in den Properties verschachtelt. Alle Entitäten sind flache, gleichwertige Knotenpunkte im Raum. Die Hierarchie entsteht ausschliesslich durch gerichtete, semantische Kanten (Edges).
*   *Falsch:* Node "Departement XYZ" hat Property "gehörtZu: Bundesrat".
*   *Korrekt:* Edge vom Typ `BELONGS_TO` verbindet "Departement XYZ" mit "Bundesrat".

### D. Visuelle Übersetzung (Das "visualMappings")
Die generierte Ontologie ist wertlos, wenn sie nicht sichtbar wird. Das LLM muss die definierten typ-spezifischen Attribute in das `visualMappings`-Objekt übersetzen:
*   Unterschiedliche Entitäts-Typen (`Person` vs. `Institution`) steuern die `geometry` (Kugel vs. Box).
*   Zentrale kategorische Attribute (z.B. `Staatsfunktion` bei Institutionen oder `Partei` bei Personen) steuern die `color`.
*   Numerische Werte (wie Macht, Budget oder Relevanz) steuern kontinuierlich die `size`.

## 4. Fazit für den Prompt-Aufbau
Der System-Prompt muss dem LLM nicht starre Attribute vorkauen, sondern ihm die Rolle des **Architekten einer relationalen Datenbank** zuweisen. Es muss verstehen, dass die Schönheit und Tiefe der 3D-Visualisierung in Nodges direkt aus einer sauberen, flachen Trennung von Typen, typspezifischen Metadaten und starken semantischen Kanten resultiert.
