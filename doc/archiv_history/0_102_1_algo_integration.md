# Konzept: Integration von Algorithmen in Nodges

Dieses Dokument stellt zwei konträre Architektur-Ansätze zur Integration von iterativen Layout-Algorithmen (z. B. Force-Directed Graphs) gegenüber und fasst die konzeptionelle Ausrichtung zusammen.

## Ansatz A: Algorithmen als "Aktive Quellen" im Mapping-Panel
*(Abstraktion von Datenquellen zu Streams)*

**Konzept:** Das Mapping-Panel wird so erweitert, dass die linke Spalte (Quellen) nicht nur rohe JSON-Datenfelder, sondern auch "Aktive Prozesse" (Algorithmen) anbieten kann. Zieht der Nutzer eine Verbindung von "Force-Directed" auf die Eigenschaft "Position X", abonniert die Engine einen kontinuierlichen Datenstrom.
* **Vorteile:** 
  * Einheitliche UX (alles wird über Linien verknüpft).
  * Mächtige hybride Mappings (z. B. X und Y werden physikalisch berechnet, Z wird durch ein statisches Attribut wie das "Jahr" fixiert).
* **Nachteile:** 
  * Ein Algorithmus ist kein lokales Knoten-Attribut, sondern ein **netzwerkweiter, iterativer Prozess**. 
  * Er erfordert globale Kontrollen (Abkühlrate, Federstärke, Start/Stopp), die das 1:1-Paradigma und die UI des Mapping-Panels komplett überladen würden.

---

## Ansatz B: Dediziertes "Simulations- und Layout-Panel"
*(Referenz aus dem externen Gemini-Chat)*

**Konzept:** Strikte architektonische Trennung. Das Mapping-Panel bleibt linear und deklarativ (1:1-Datenübersetzung). Für iterative und prozedurale Positionsgenerierung wird ein eigenständiges Panel eingeführt.
* **Vorteile:** Saubere Trennung der UX. Der Nutzer versteht sofort den Unterschied zwischen "Wie sieht der Knoten aus?" (Mapping) und "Wo fliegt der Knoten im System hin?" (Simulation).
* **Architektur-Säulen des neuen Panels:**

### 1. Systemsteuerung und Betrachtungsmodi
Definition der Interaktionsebene des Nutzers mit der laufenden Simulation:
* **Beobachter:** Nur Zuschauen, keine Eingriffe in die laufende Physik.
* **Analyst:** Kamera und Filter ändern, ohne die Berechnung zu stören.
* **Experimentator:** Parameter "on-the-fly" ändern (What-If-Szenarien).
* **Vergleicher:** Paralleles Betrachten von zwei Zuständen.

### 2. Layout-Engine (Die Raum-Dimension)
Steuert die absolute physische Positionierung und überschreibt die Koordinaten im StateManager.
* **Algorithmen:** Auswahl des Layouts (Force-Directed, Fruchterman-Reingold, Hierarchical, etc.).
* **Simulations-Parameter:** Dynamisch eingeblendete Regler (Abstoßungskraft, Federstärke, Kühlungsrate/Abkühlungszeit, Interpolations-Dauer).
* **Semantische Modifikatoren:** Optionale Gewichtung physikalischer Kräfte durch Daten-Attribute (z. B. physikalische Masse = JSON-Attribut "weight").

### 3. TimeEngine (Die Zeit-Dimension)
Steuerung der globalen Systemuhr für Netzwerke mit zeitlicher Dynamik.
* **Transport-Controls:** Play, Pause, Scrubber-Leiste (Timeline), Tick-Rate (Schrittgröße) und Geschwindigkeit (Zeitlupe/Zeitraffer).
* **Experimentelle Eingriffe:** Werkzeuge wie "Freeze Node" (friert Koordinaten eines Knotens ein) oder "Kanten-Manipulation" (visuelles Kappen einer Kante bei laufender Simulation).

---

## Fazit: Gegenüberstellung
Während Ansatz A in der Theorie durch node-basierte Kombinatorik besticht, ist **Ansatz B in der Praxis architektonisch zwingend**. 

Das Mapping-Panel verarbeitet Zustände. Algorithmen *generieren* fortlaufend neue Zustände. Da Force-Directed-Layouts zwingend eine Timeline (Abkühlungsphase) und globale Physik-Variablen benötigen, gehört ihre Steuerung in eine dedizierte Umgebung (Simulations- und Layout-Panel), die direkt mit dem `StateManager` und nicht mit der `VisualMappingEngine` kommuniziert.
