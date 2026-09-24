# Nodeline - Zusammenfassung der Fixes

## 1. Bugfix: Knoten in einer Reihe (Layout-Explosion)
**Problem:** Beim Laden von Dateien ohne vordefinierte Positionsdaten (wie `test104.json`) reihten sich die Knoten auf einer diagonalen Linie auf.
**Ursache:** Im `layout-worker.ts` führte die fehlende Begrenzung bei extrem geringen Distanzen (`F = k / d^2`) zu unendlichen Abstoßungskräften (Coulomb-Kraft). Die Koordinaten explodierten auf Werte wie `1e+28`. Bei der anschließenden Normalisierung in `LayoutManager.ts` führte dies zu einem kompletten Verlust der Fließkommapräzision.
**Lösung:** Ein "Softening Factor" (`distance * distance + 1.0`) wurde in den Nenner der Kraftberechnung eingefügt, um Divisionen durch Null (oder fast Null) zu verhindern. Zusätzlich wurde ein "Velocity-Capping" (`MAX_VELOCITY = 10.0`) bei der Positionsaktualisierung implementiert, um eine Koordinatenexplosion physikalisch zu unterbinden. Das Layout berechnet nun erfolgreich 3D-Cluster.

## 2. Bugfix: Fehlende Kanten-Attribute im Mapping-Editor
**Problem:** Das Attribut `label` war bei Kanten (Edges) in der linken Spalte (Attribute) des Mapping-Panels nicht sichtbar. Folglich funktionierte das Einfärben der Kanten (wie in `nodges_101.json` definiert) nicht standardmäßig.
**Ursache:** Die Funktion `getAvailableProperties` in `BuildFormatUtils.ts` durchsuchte beim Extrahieren der Eigenschaften aus dem Datenmodell ausschließlich `dm.entities` und ignorierte `dm.relationships`.
**Lösung:** Die Funktion wurde so erweitert, dass sie nun auch Eigenschaften aus `dm.relationships` abruft. Edge-Attribute wie `label` werden jetzt korrekt in der linken Spalte aufgelistet, und die entsprechenden Mappings für Kanten-Farben können nahtlos übernommen werden.

## 3. UI-Verbesserung: Physikalische Mapping-Ziele
**Problem:** Die physikalischen Eigenschaften `attraction`, `repulsion` und `inertia` waren im Mapping-Editor fälschlicherweise standardmäßig als Quell-Attribute (links) gelistet, fehlten jedoch als Ziel-Visualisierungen (rechts).
**Ursache:** In `UIManager.ts` wurden diese Attribute hartkodiert in die Liste der Standard-Quell-Attribute eingefügt. In `MappingUI.ts` fehlten sie jedoch in der Liste der verfügbaren visuellen Ziele (`visualProps`).
**Lösung:** Die Eigenschaften wurden aus der standardmäßigen Quell-Liste in `UIManager.ts` entfernt (sie erscheinen dort ab jetzt nur noch dynamisch, wenn sie tatsächlich in den JSON-Daten vorhanden sind). In `MappingUI.ts` wurden sie zu den `visualProps` hinzugefügt, sodass "Anziehungskraft", "Abstoßungskraft" und "Trägheit" nun korrekterweise auf der rechten Seite als steuerbare Mapping-Ziele zur Verfügung stehen.
