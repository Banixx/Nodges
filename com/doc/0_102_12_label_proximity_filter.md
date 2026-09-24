# Label Proximity Filtering & Distance Fade-out Configuration

## Problem
In früheren Versionen wurden Node-Labels bei einer Kamera-Distanz > 60 sowie bei einer Bildschirmgröße < 7px ausgeblendet. Edge-Labels wurden bereits ab einer Kamera-Distanz > 15 ausgeblendet. Dies führte dazu, dass Labels beim Herauszoomen schlagartig verschwanden.

## Lösung
1. Entfernen der starr kodierten Distanz-Grenzwerte (`distanceThreshold` = 60 für Knoten, 15 für Kanten) und der Bildschirmgrößen-Beschränkung (`f_screen < 7`).
2. Einführung eines einstellbaren **Proximity Filters** (`labelMaxClosest`, Standard z.B. 50):
   - Wenn der Proximity Filter aktiv ist, werden exakt die N kamera-nächsten Labels (Knoten und Kanten) angezeigt.
   - Wenn der Wert auf 0/unbegrenzt gesetzt ist, bleiben alle Labels unabhängig von der Kamera-Distanz sichtbar.
3. **Wiederherstellung des "Label"-Schalters (`showLabelsAlways`)**:
   - Die Durchsetzung von `showLabelsAlways` und `showLabelsOnHover` wurde in den Update-Loops von `NodeLabelManager` und `EdgeLabelManager` verankert. Dadurch schaltet der "Label"-Schalter im UI dauerhafte Labels wie erwartet vollstaendig ein und aus.
4. **Klare Trennung im UI**:
   - Der Regler **"Proximity Limit (Kamera-Nähe)"** wurde oberhalb von "Label Filter (Datenbasiert)" platziert, um Missverstaendnisse und Ueberlappungen mit dem datenbasierten Attribut-Filter zu vermeiden.
