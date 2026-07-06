# Konzept: Aktive Quellen im Mapping-Panel

## 1. Einleitung und Grundidee
Das bisherige Paradigma des Mapping-Panels ging primär von einer 1:1-Zuweisung statischer Daten aus (z. B. JSON-Attribut `weight` steuert `scale`). Um jedoch komplexe, berechnende Prozesse wie Layout-Algorithmen (z. B. Force-Directed Graphs) nahtlos in die UI zu integrieren, ohne das User Interface mit neuen Menüs zu überladen, wird das Konzept der "Quelle" (Source) abstrahiert.

Die Grundidee lautet: **Das Mapping formt die Visualisierung und zementiert sie nicht.** 
Eine Datenquelle auf der linken Seite des Mapping-Panels kann nicht nur rohe Daten liefern, sondern auch das Resultat eines kontinuierlich rechnenden, aktiven Prozesses sein.

## 2. Das abstrakte Source Interface (Stream statt Lookup)
Anstatt dass die Visual Mapping Engine einmalig Werte nachschlägt ("Welchen Wert hat Knoten A?"), abonniert sie Quellen. Die Quelle wird zu einem **Datenstrom (Stream) oder Signalgeber**.

Jede Quelle muss eine einheitliche Schnittstelle bedienen, unabhängig davon, ob es sich um eine Konstante oder einen komplexen Algorithmus handelt. Diese Schnittstelle definiert:
- **Datentyp:** (z. B. Float, Vector3, Color), um Validierungen gegen Ziel-Eigenschaften (Targets) zu ermöglichen.
- **Wertabfrage:** Die Engine kann die aktuellen Werte für das Netzwerk abfragen.
- **Zustandsmeldung (Dirty Flag):** Die Quelle teilt der Engine mit, ob sich im aktuellen Frame Werte geändert haben, um unnötige Render-Zyklen zu vermeiden.

## 3. Typen von Quellen
Durch diese Abstraktion können völlig unterschiedliche Quellen gleichbehandelt werden:

1.  **Rohe Daten (Statisch):** Werte aus dem geparsten Datensatz (z. B. Gründungsjahr). Sie melden nach dem Laden keine Veränderungen mehr.
2.  **Konstanten / Manuelle Eingaben:** Werte, die der User direkt im UI-Feld justiert. Änderungen fließen nur bei aktiver Nutzerinteraktion.
3.  **Aktive Prozesse (Algorithmen / Physik):** Kontinuierliche Berechnungen wie ein Force-Directed Layout. Sie pushen jeden Frame aktualisierte X/Y/Z-Koordinaten in den Stream, bis die Simulation "abgekühlt" ist oder gestoppt wird.

## 4. Lifecycle Management
Aktive Quellen erfordern Rechenleistung (oft ausgelagert in Web Worker). Daher implementiert das System ein Lifecycle-Management gekoppelt an die User Action im Mapping Panel:
- **Verbinden (`init()` / `play()`):** Zieht der User die Verbindung von z. B. "Force-Directed" zu "Position X", startet die Engine im Hintergrund den Algorithmus.
- **Trennen (`pause()` / `kill()`):** Wird das Mapping gelöscht, stoppt der Prozess, und die Ressourcen werden freigegeben. Die Positionen verbleiben in ihrem letzten Zustand.

## 5. Vorteile der Architektur
- **Einheitliche UX:** Der Anwender nutzt ein vertrautes Werkzeug (Verbindungslinien ziehen) für simple und komplexe Zuweisungen. Algorithmen verstecken sich nicht in Untermenüs.
- **Hybride Mappings:** Erlaubt Kombinationen wie: `Position X/Y` wird berechnet von einem Layout-Algorithmus, während `Position Z` durch ein statisches Daten-Attribut (z. B. zeitliche Achse) determiniert wird.
- **Erweiterbarkeit:** Neue Algorithmen (z. B. hierarchische Layouts, Cluster-Algorithmen) können einfach als neue "Blöcke" auf der Quell-Seite hinzugefügt werden, solange sie das Source Interface erfüllen.
