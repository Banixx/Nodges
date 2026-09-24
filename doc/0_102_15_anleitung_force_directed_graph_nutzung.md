# Anleitung: Nutzung des Force-Directed Graphs in Nodges

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Schritt-fuer-Schritt-Anleitung

Damit der Force-Directed Graph (Kanten-Feder-Physikmodell) Ihre Knoten im 3D-Raum verteilt, gehen Sie wie folgt vor:

### Schritt 1: Algorithmus mit Position verbinden
- Auf der linken Seite unter **ATTRIBUTE (DATEN)** das Element **`force-directed`** per Drag-and-Drop auf das Feld **`Position`** auf der rechten Seite (**VISUALISIERUNG**) ziehen. *(Dies haben Sie im Screenshot bereits korrekt getan).*

### Schritt 2: Achsen-Einstellung waehlen
- Rechts bei **`Position`** im Dropdown-Menue die gewuenschte Dimension einstellen:
  - **`Alle Achsen (XYZ)`**: Volle dreidimensionale Raumverteilung.
  - **`XY-Ebene` / `XZ-Ebene`**: Beschraenkt das Physik-Layout auf zwei Raumachsen.

### Schritt 3: Layout-Engine ausfuehren (WICHTIG!)
- Die Berechnung laeuft im Hintergrund in einem WebWorker und startet nicht automatisch bei der Verbindung.
- Klicken Sie ganz unten in der rechten Spalte bei **`Layout-Engine`** auf den **`▶` (Play-Button)**.
- Erst durch diesen Klick berechnet die Physics-Engine die Abstoessung aller Knoten sowie die Anziehung der Kanten und entfaltet das Kugel-Knaeuel im 3D-Viewport.

---

## 2. Feinjustierung der Kraefte

Nachdem die Layout-Engine laeuft, koennen Sie zusaetzliche Attribute oder Regler auf folgende Felder verbinden:

- **`Anziehungskraft (Pull)`:** Wie stark Kanten verbundene Knoten zusammenziehen.
- **`Abstoessungskraft (Push)`:** Wie stark sich alle Knoten gegenseitig abstoessen (fuer groesseren Abstand).
- **`Traegheit (Mass)`:** Beeinflusst die Bewegungsgeschwindigkeit und Daempfung während der Berechnung.
