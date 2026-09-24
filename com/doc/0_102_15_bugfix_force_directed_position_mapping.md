# Ursachenanalyse: Sanduhr-Abbruch beim Force-Directed Layout in Nodges

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Problembeschreibung

Beim Klick auf den Play-Button `▶` in der Layout-Engine erscheint fuer ca. 1 Sekunde die Sanduhr `⏳`, springt dann jedoch wieder auf `▶` zurueck, ohne dass sich die Knoten im 3D-Raum verteilen.

---

## 2. Technische Ursachenanalyse

1. **Mapping-Erfassung in `VisualMappingEngine.ts`:**
   Wenn die Kachel `force-directed` im Mapping-Panel mit dem Feld `Position` verbunden wird, interpretiert die Engine `force-directed` als Knoten-Attribut. Da dieses Attribut auf den Entitaeten nicht existiert, wird als Fallback `positionX = 0, positionY = 0, positionZ = 0` gesetzt.

2. **Fixierungs-Flag in `LayoutManager.ts`:**
   In `LayoutManager.ts` (Zeilen 278--280) wird geprüft:
   ```typescript
   fixedX: forceFixed || visual.positionX !== undefined,
   fixedY: forceFixed || visual.positionY !== undefined,
   fixedZ: forceFixed || visual.positionZ !== undefined,
   ```
   Da `visual.positionX` auf `0` gesetzt wurde, liefert `visual.positionX !== undefined` den Wert `true`.

3. **Verhalten des LayoutWorkers:**
   Der Worker erhaelt fuer alle Knoten das Signal `fixedX: true, fixedY: true, fixedZ: true`. Da alle Knoten starr fixiert sind, gibt es fuer den Worker keine beweglichen Punkte. Er bricht die Berechnung nach 0 Iterationen sofort erfolgreich ab (Sanduhr schliesst nach 1 Sekunde).

---

## 3. Loesung fuer den Anwender

1. **Verbindung zu `Position` loeschen:**
   Klicken Sie im Mapping-Panel auf die Linie zwischen `force-directed` und `Position` und loeschen Sie diese Verbindung. Das Feld `Position` muss **unbelegt (leer)** sein.

2. **Layout-Engine starten:**
   In der Sektion `Layout-Engine` ganz unten stellen Sie das Dropdown auf `force-directed` und klicken erneut auf **`▶`**.

3. **Ergebnis:**
   Da `Position` nun unbelegt ist, sind die Knoten unfixiert. Der LayoutWorker berechnet die Bewegung und verteilt die Knoten im 3D-Raum.
