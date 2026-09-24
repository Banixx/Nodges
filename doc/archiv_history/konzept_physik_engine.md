# Konzept: Physik-Engine und dynamische Visualisierung in Nodges

## 1. Die Vision: Vom statischen Graphen zum dynamischen System
Die zentrale Weichenstellung für Nodges ist die Verschmelzung der reinen Datenvisualisierung mit einer echten physikalischen Simulation. Nodges baut künftig nicht mehr nur "bunte Graphen", sondern erzeugt lebendige, dynamische Systeme. Isolierte, unsichtbare "Globale Felder" (wie bisher in der JSON als `fields` definiert) werden abgeschafft. Stattdessen wirken Daten direkt als physikalische Kräfte: Knoten ziehen sich basierend auf harten Metriken an oder stoßen sich ab.

## 2. Architektur und Integration ins Mapping-Panel
Die physikalischen Eigenschaften **Anziehung (Pull)** und **Abstoßung (Push)** werden architektonisch exakt wie visuelle Eigenschaften (z. B. "Größe" oder "Farbe") behandelt.

* **Schema-Erweiterung:** Das JSON-Schema der Visualisierung wird um Eigenschaften wie `attraction` und `repulsion` in den Visualisierungs-Presets erweitert.
* **Das Mapping-Panel:** Im rechten Mapping-Panel erscheinen diese neuen Eigenschaften als reguläre, ansteuerbare Ziele. 
* **Der Workflow:** Der Nutzer kann ein beliebiges Daten-Attribut aus der JSON (z.B. "Umsatz", "Einfluss" oder "Risiko") einfach per Drag-and-Drop auf das Ziel "Anziehung (Pull)" oder "Abstoßung (Push)" ziehen.
* **Layout-Worker:** Die Physik-Engine (Layout-Worker) liest diese gemappten Werte dynamisch in Echtzeit aus und verleiht genau diesem Knoten die entsprechende Gravitation.

## 3. Implizite physikalische Kräfte statt expliziter Kanten
Ein entscheidender Faktor für die Performance und die konzeptionelle Klarheit ist die Unterscheidung zwischen physikalischen Kräften und Beziehungs-Kanten:

* **Keine Kanten für Kräfte:** Es entstehen **keine** neuen Edges zwischen einem Attraktor und den von ihm angezogenen Knoten. Wenn ein Attraktor 1.000 Knoten anzieht, würde das Erstellen physischer Linien die Framerate zerstören.
* **Der dreidimensionale Raum als Medium:** Physikalische Kräfte wirken im Layout-Worker implizit durch den Raum – ähnlich wie ein reales Gravitations- oder Magnetfeld.
* **Die Rolle der Edges:** Eine Edge (Kante) in Nodges bleibt eine rein **semantische Beziehung** (z. B. "zahlt an", "kennt", "gehört zu"). Sie repräsentiert keine physikalische Kraftvektor-Linie.

## 4. Echtzeit-Berechnung abgeleiteter Daten (Derived Data)
Um diese dynamischen Systeme mit den richtigen Metriken zu füttern, berechnet Nodges abgeleitete Daten direkt in der Engine:

* **Keine Speicherung in JSON:** Sekundäre oder abgeleitete Daten (wie `degree`, `outbound`, `inbound`) werden niemals in der primären JSON-Datei gespeichert.
* **Dynamische Generierung:** Beim Einlesen der Rohdaten liest die Engine die definierten Kanten, zählt diese beim Start durch und generiert die entsprechenden Attribute in Echtzeit.
* **Sofortige Verfügbarkeit:** Diese berechneten Metriken stehen dem Nutzer sofort links im Mapping-Panel zur Verfügung und können wiederum als Quelle für visuelle oder physikalische Mappings (z. B. "Hoher Degree = Starke Anziehung") genutzt werden.
