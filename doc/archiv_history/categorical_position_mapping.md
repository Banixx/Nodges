# Kategoriales Positions-Mapping

Dieses Dokument beschreibt die Implementierung von kategorialen Mappings für Positionsachsen und andere numerische Visualisierungseigenschaften in Nodges.

## Zielsetzung
Benutzer sollen Entitätsattribute wie `type` oder `category` (z. B. "brand", "component", "model", "supplier") auf Positionsachsen wie `positionX` ziehen können. Anstatt eines alphabetischen Fallbacks sollen die Gruppen mit benutzerdefinierten, konfigurierbaren X-Koordinaten versehen werden, um sie klar getrennt nebeneinander aufzustellen.

## Implementierungsdetails

### 1. Erweiterung der Engine (VisualMappingEngine)
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/VisualMappingEngine.ts` wurde die Methode `applyMapping` erweitert:
* Die Methode nimmt nun optional den Ziel-Property-Namen (`propName?: string`) entgegen.
* Wenn die Mapping-Funktion `categorical` ist und es sich nicht um die Eigenschaften `color` oder `geometry` handelt, wird der String-Wert der Entität in den Kategorien (`mapping.params.categories`) gesucht.
* Der gefundene Wert wird als Zahl zurückgegeben. So können Koordinaten auf Achsen direkt aufgelöst werden.

### 2. UI-Anpassungen (MappingUI)
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts` wurden folgende Änderungen vorgenommen:
* **Funktionsauswahl**: Die Funktion `categorical` steht nun auch für alle numerischen Eigenschaften (wie `positionX`, `positionY`, `positionZ`, `size`, `glow`, `opacity`, `attraction`, `repulsion`, `inertia`) zur Verfügung.
* **Auto-Initialisierung**: Beim Verbinden oder Auswählen der Funktion `categorical` für ein numerisches Feld werden die Kategorien automatisch ermittelt. Die Werte werden gleichmäßig über den Wertebereich der Eigenschaft verteilt initialisiert (z. B. zwischen -50 und +50 für Positionsachsen).
* **Dynamische Eingabefelder**: Im rechten Einstellungs-Panel wird für jede Kategorie ein passender Input gerendert:
  * Für `color`: Ein Farbwähler (`type="color"`).
  * Für `geometry`: Ein Dropdown-Menü mit verfügbaren Formen.
  * Für numerische Eigenschaften (z. B. `positionX`): Ein Nummernfeld (`type="number"`), mit dem die genaue Koordinate bzw. der Wert direkt justiert werden kann.

## Verwendung
1. Ziehen Sie ein kategoriales Attribut (z. B. `type` mit den Werten `brand`, `model`, `component`, `supplier`) auf die X-Achse (`positionX`).
2. Die Funktion wechselt automatisch auf `categorical`.
3. Im rechten Bereich des Mapping-Panels erscheinen Eingabefelder für alle vier Gruppen.
4. Tragen Sie die gewünschten X-Koordinaten ein (z. B. -40, -15, 15, 40). Die Knoten ordnen sich sofort entsprechend an, während die Y- und Z-Achsen weiterhin über das Force-Directed-Layout berechnet werden.
