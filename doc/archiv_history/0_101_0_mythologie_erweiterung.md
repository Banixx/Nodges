# Erweiterung der mythology.json

Die Datei `mythology.json` wurde weiter ausgebaut und den Anforderungen der Build 4 Architektur entsprechend erweitert.

## 1. Metadaten & Datentypen
*   **Datentyp Korrektur:** Das Attribut `Generation` wurde im `dataModel` erfolgreich von `continuous` auf `categorical` geändert, da es sich um feste Abstammungsstufen handelt (Werte 0 bis 4).
*   **Temporale Metadaten (Epochen):** Ein neues Attribut `Epoch` wurde eingeführt (Werte: "Creation", "Golden Age", "Silver Age", "Bronze Age", "Heroic Age"). Die Entitäten wurden basierend auf ihrer Generation und Fraktion automatisch in die jeweiligen Zeitalter einsortiert. Für Orte wurde standardmäßig "Creation" verwendet, da diese permanent existieren.

## 2. Visual Mappings & Hierarchien
*   **Edge-Animationen:** Für die Beziehung `ParentOf` wurde eine `animation_flow` (Fließ-Animation) hinzugefügt, um die Abstammungslinie dynamisch sichtbar zu machen. Die Beziehung `MarriedTo` hat eine `animation_pulse` erhalten, um diese Bindungen pulsierend darzustellen.
*   **Visuelle Hierarchien:** Das Mapping für die Größe (`size`) der Deities wurde von einer linearen Funktion auf eine `exponential` Funktion umgestellt. Zusätzlich wurde der Wertebereich (`range`) auf `[2, 9]` vergrößert. Die Machtwerte (`Power`) der Hauptgötter (Zeus, Poseidon, Hades, Hera, Athena, Apollo) wurden um +5 Punkte angehoben, damit diese noch stärker hervorstechen.

## 3. Datenanreicherung (Multi-Perspective)
*   **Neue Facette (Nature):** Ein neues Attribut `Nature` ermöglicht eine zusätzliche Perspektive auf die Entitäten. Die Entitäten wurden klassifiziert in: "Abstract Principle" (für Primordials), "Personified Deity" (für Götter), "Mortal Hero" (für Helden), "Creature" (für Monster) und "Mythical Place" (für Orte).
*   **Zusätzliche Entitäten:** "Chaos" wurde als ursprüngliche Entität der Generation 0 hinzugefügt. Von "Chaos" wurden zudem die Elternschafts-Beziehungen (`ParentOf`) zu "Gaia", "Tartarus", "Eros", "Erebus" und "Nyx" ergänzt, um den Stammbaum zu komplettieren.
