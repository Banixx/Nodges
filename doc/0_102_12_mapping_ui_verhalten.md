# Analyse: Mapping-UI Verhalten und Node-Sichtbarkeit

## Das (2)-Boxen Prinzip
Wenn im Mapping-UI zusätzliche Boxen wie `Position (2)`, `Grösse (2)` oder `Farbe (2)` erscheinen, ist dies ein gewolltes Verhalten der Benutzeroberfläche. 
Es bedeutet **nicht**, dass ein Mapping fehlgeschlagen ist. Im Gegenteil: Die UI generiert diese sekundären Eingänge automatisch in dem Moment, in dem der primäre Eingang (z.B. `Grösse`) erfolgreich mit einem Datenattribut verbunden wurde. Dies ermöglicht das Kombinieren mehrerer Attribute für denselben visuellen Kanal (Multi-Mapping).

## Sind die Nodes nicht erzeugt worden?
Die Annahme, dass die Nodes gar nicht erst erzeugt wurden, ist falsch. Der eindeutige Beweis für ihre Existenz sind die Text-Labels (Sonne, Erde, Mars etc.), die im 3D-Raum an den Koordinaten der jeweiligen Nodes gerendert werden.

## Wahre Ursachen für die Unsichtbarkeit der 3D-Meshes
Da die Nodes existieren und das Mapping verbunden ist, liegen die wahren Ursachen in der Verarbeitung der Datenwerte:

1. **Extreme Datenwerte ohne Normalisierung**:
   Das Attribut `masse` beinhaltet astronomische Werte im Bereich von `10^22` bis `10^30`. Wenn ein solches Attribut direkt auf den visuellen Kanal `Grösse` gemappt wird, ohne eine geeignete mathematische Funktion (wie `logarithmic`) oder eine korrekte Domain-Einschränkung festzulegen, kann die Skalierungsberechnung fehlschlagen (z.B. NaN, Unendlich oder Null), wodurch die Meshes nicht gerendert werden.

2. **Positions-Überlappung**:
   Durch die aktuelle Beschaltung des `Position`-Kanals werden sämtliche Nodes zwingend auf einer einzigen mathematischen Geraden (der blauen Linie) platziert. Selbst wenn die Nodes korrekt skaliert wären, würden sie exakt ineinander stecken und sich gegenseitig verdecken (Z-Fighting / Overdraw).
