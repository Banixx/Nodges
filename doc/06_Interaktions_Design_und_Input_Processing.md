# 06 Interaktions-Design und Input-Processing

Eine nahtlose Interaktion ist für die User Experience in einer 3D-Welt entscheidend. Dieses Kapitel beschreibt, wie Nodges abstrakte Benutzereingaben (Maus, Tastatur) in präzise Aktionen innerhalb der visualisierten Daten übersetzt.

## 06.1 Raycasting: Die Brücke zwischen 2D und 3D

Siehe Interaktions-Loop: [mermaid_02.mmd](mermaid_02.mmd)

Das Hauptproblem: Der Monitor ist flach (2D), die Daten sind räumlich (3D). Wir müssen wissen, wohin der User "in die Tiefe" klickt. Nodges nutzt hierfür den **Raycasting-Algorithmus**.

### Der mathematische Prozess
1.  **Normalisierung**: Die Maus-Position (Pixel) wird in Koordinaten von -1 bis +1 umgerechnet.
2.  **Strahl-Projektion**: Von der Kameraposition wird ein unsichtbarer Strahl durch den "Mauspunkt" auf der Linse in die Unendlichkeit geschossen.
3.  **Intersektion**: Die Engine prüft: "Welche Objekte durchschneidet dieser Strahl?"
4.  **Sortierung**: Die Liste der getroffenen Objekte wird nach Entfernung zur Kamera sortiert. Das vorderste Objekt gewinnt.

### Performance-Herausforderung bei InstancedMesh
Da ein `InstancedMesh` (für 10.000 Knoten) nur *ein* Objekt für Three.js ist, liefert ein normaler Raycast nur: "Du hast den InstancedMesh getroffen". 
Nodges nutzt die `instanceId`, um herauszufinden, *welche* der 10.000 Kopien genau getroffen wurde. Dies wird dann blitzschnell auf die ursprüngliche Node-ID zurückgemappt.

## 06.2 Der `CentralEventManager` (CEM)

Siehe System-Sequenz zur Interaktion: [mermaid_08.mmd](mermaid_08.mmd)

Der CEM ist das "Gehirn" der Interaktion. Er sorgt für eine saubere Trennung zwischen Hardware-Events und Logik.

### Intelligente Click-Erkennung ("Click vs. Drag")
Ein Problem in 3D: Wenn ein User die Kamera dreht (Drag), lässt er die Maus oft über einem Knoten los. Ein naiver Event-Handler würde dies als "Klick auf den Knoten" interpretieren.
**Die Lösung**: Nodges misst die Distanz zwischen `mousedown` und `mouseup`. 
*   Distanz < 5 Pixel? -> **Klick** (Selektion auslösen).
*   Distanz > 5 Pixel? -> **Drag** (Kamera drehen, Klick-Event ignorieren).

### Hover-Throttling
Raycasting bei jedem einzelnen Pixel, den die Maus bewegt, ist zu teuer. Wir drosseln (throttlen) die Berechnung auf ca. **10-20ms**. Das ist für den Menschen immer noch verzögerungsfrei, spart aber wertvolle CPU-Zyklen für das Rendering.

## 06.3 Kamera-Steuerung und "Cinematic UI"

Die Kamera wird über `OrbitControls` gesteuert, aber wir haben sie mit UX-Verbesserungen angereichert.

### Auto-Focus & Fly-To Animationen
Wenn ein Benutzer ein Suchergebnis auswählt, springt die Kamera nicht hart dorthin. Sie nutzt eine **sanfte Kamerafahrt**.
*   **Pfad**: Wir berechnen die neue Zielposition und den Zielwinkel.
*   **Easing**: Die Bewegung nutzt "Smooth-Step" Funktionen (langsam starten, schnell in der Mitte, sanft abbremsen).
*   **Kollisionsvermeidung**: Die Kamera fliegt in einem leichten Bogen, um nicht "durch" andere Knoten hindurchzurauschen.

### Kontext-Sensitiver Zoom
Beim Zoomen mit dem Mausrad berechnet Nodges den Zoom-Faktor basierend auf der aktuellen Entfernung zum Objekt. Je näher man ist, desto feingliedriger wird der Zoom, um präzise Navigation im "Mikrokosmos" des Graphen zu ermöglichen.

## 06.4 Keyboard-Shortcuts für Power-User

*   `R`: Kamera-Reset (Vogelperspektive).
*   `Leertaste`: Pause/Start der Layout-Simulation.
*   `H`: UI-HUD (Heads-Up Display) ausblenden für "Immersive Mode".
*   `Entf / Backspace`: (Geplant) Löschen des selektierten Knotens.

---
*Ende Kapitel 06*
