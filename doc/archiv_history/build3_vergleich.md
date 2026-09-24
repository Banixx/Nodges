# Vergleich der Build 3 Spezifikation mit dem Code

Dieses Dokument vergleicht die in `C:/Users/ich/Desktop/code/_projects/Nodges/public/nodges_build_3.md` definierte Spezifikation für Build 3 mit dem aktuellen Zustand des Quellcodes.

## 1. Übersicht & Validierung

* **Spezifikation:** Jedes JSON-Dokument muss `schemaVersion` "3.0" besitzen. Pflichtfelder auf der obersten Ebene sind `system`, `metadata`, `dataModel`, `fields` und `data`.
* **Code-Implementierung:** 
  * In `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/DataParser.ts` wird die Schemaversion strikt geprüft. Falls sie ungleich "3.0" ist, bricht der Import ab.
  * In `C:/Users/ich/Desktop/code/_projects/Nodges/src/types.ts` validiert das `GraphDataSchema` (Zod) die Struktur. Aus Robustheitsgründen sind `dataModel` und `fields` im Schema optional deklariert, um bei unvollständigen Dateien nicht abzustürzen, was jedoch voll kompatibel ist.
* **Status:** **Erfüllt.**

---

## 2. Datenflachheit (`stateVector`)

* **Spezifikation:** Alle anwenderspezifischen Attribute müssen flach auf der obersten Ebene des `stateVector`-Objekts liegen.
* **Code-Implementierung:** 
  * Der Code greift über die Hilfsfunktionen in `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/BuildFormatUtils.ts` (`getEntityAttributeValue` und `setEntityAttributeValue`) direkt auf `entity.stateVector` zu.
  * *Auffälligkeit:* Wenn die Visual Mappings den Präfix `"stateVector.health_status"` nutzen (wie in der Anleitung gefordert), sucht `getEntityAttributeValue` fälschlicherweise nach `entity.stateVector.stateVector.health_status`. Die Anwendung stürzt nicht ab, da in `VisualMappingEngine.ts` und `MappingUI.ts` ein Fallback-Verfahren implementiert ist, welches den Pfad auf dem gesamten Knotenobjekt auswertet.
* **Empfehlung:** Anpassung von `getEntityAttributeValue` und `setEntityAttributeValue`, sodass ein führender `"stateVector."` Präfix automatisch abgeschnitten wird.
* **Status:** **Teilweise Erfüllt (mit Fallback-Brücke).**

---

## 3. Topodynamische Kraftfelder (`fields`)

* **Spezifikation:** Definition von `attractor_field` und `gravitational_field`. Unterstützung für euklidischen Mindestabstand, Einflussradius (`influenceRadius`) und selektives Verhalten (`behavior`, z. B. `"attractive_to_leaves"` zieht nur Blätter an).
* **Code-Implementierung (Diskrepanzen):**
  1. **Migration im Parser:** `DataParser.migrateFields` wandelt alle Felder in unsichtbare, unbewegliche Knoten (`system_attractor`) um und löscht anschließend das `fields`-Array (`graphData.fields = []`).
  2. **Verlust des selektiven Verhaltens:** Das `behavior`-Attribut des Feldes wird bei der Migration ignoriert und nicht an den erzeugten Knoten übergeben. Dadurch wirken die Anziehungs-/Abstoßungskräfte über den N-Body-Algorithmus des Workers auf **alle** Knoten des Systems gleichermaßen. Selektive Attraktoren wie `"attractive_to_leaves"` funktionieren im aktuellen Code somit nicht wie spezifiziert.
  3. **Ignorieren des influenceRadius:** Der standardmäßige Coulomb-Kraft-Algorithmus im Worker (`C:/Users/ich/Desktop/code/_projects/Nodges/src/workers/layout-worker.ts`) berechnet die Kräfte über den gesamten Raum (ohne Begrenzung durch einen maximalen Radius) und wendet die euklidischen Feldformeln nicht an. Die in `LayoutManager.ts` eigentlich implementierte thermodynamische Kraftfeldberechnung (mit euklidischen Formeln und Radien) wird im Haupt-Thread nie ausgeführt, da die Feldliste leer ist.
* **Empfehlung:** 
  * Die Migration zu unsichtbaren Knoten deaktivieren oder so anpassen, dass echte euklidische Kraftfelder im Worker (`layout-worker.ts`) und im Haupt-Thread (`LayoutManager.ts`) asynchron berechnet werden.
  * Übergabe von Typ und Verhalten der Knoten an den Worker, damit das selektive `behavior` der Felder ausgewertet werden kann.
* **Status:** **Diskrepanz vorhanden (Spezifikation und Physik-Modell weichen ab).**

---

## 4. Multi-Sensorisches Mapping (`visualMappings`)

* **Spezifikation:** Bevorzugung des Schlüssels `field` vor `source` in den Mappings.
* **Code-Implementierung:** In `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/VisualMappingEngine.ts` liest die Engine sauber `mapping.field || mapping.source` aus.
* **Status:** **Erfüllt.**
