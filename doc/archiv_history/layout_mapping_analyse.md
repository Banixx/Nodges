# Analyse der Visualisierungs- und Mapping-Probleme bei test104.json

## 1. Warum keine gestrichelten Linien oder Übernahme-Buttons angezeigt werden

Die Ursache liegt in der Behandlung von konstanten Mappings (`"source": "constant"`) in `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/MappingUI.ts`:

1. **Gestrichelte Linien (Verbindungslinien)**:
   Gestrichelte Linien repräsentieren nicht übernommene Mappings von Datenattributen (linke Spalte) auf visuelle Eigenschaften (rechte Spalte). Da in `C:/Users/ich/Desktop/code/_projects/Nodges/public/data/test104.json` alle Voreinstellungen als Konstanten (`"source": "constant"`) definiert sind, gibt es kein Datenfeld auf der linken Seite. Es kann somit keine Verbindungskurve gezeichnet werden.

2. **Übernahme-Button (`#btnTakeoverMapping`)**:
   Die Funktion `hasOriginalMappingsToTakeover()` prüft in `MappingUI.ts`, ob importierte Mappings vorhanden sind, die *nicht* konstant sind (`sourceAttr !== 'constant'`). Da `test104.json` ausschließlich konstante Voreinstellungen besitzt, wird der Button ausgeblendet und die Mappings können nicht manuell importiert werden.

3. **Keine Anzeige bei Edges (Beziehungen)**:
   In `test104.json` sind in `visualMappings.defaultPresets` ausschließlich Voreinstellungen für die Knotentypen (`brand`, `model`, `component`, `supplier`) vorhanden. Da die Datei keine Voreinstellungen für Beziehungstypen (Kanten) definiert, bleibt diese Ansicht leer.

---

## 2. Warum die Knoten in einer Reihe aufgereiht sind

Dies wird durch eine Kombination aus unvollständigem Mapping-Import, fehlender Parameter-Auswertung und dem Kräftegleichgewicht im Layout-Worker verursacht:

1. **Nicht übernommene Konstanten**:
   Da der Übernahme-Button nicht erscheint, werden die physikalischen Konstanten (wie `repulsion = 300` für `brand`) nicht in die aktiven Mappings übernommen.

2. **Fehlende Auswertung von `params.value`**:
   Selbst wenn die Mappings aktiv wären, liest `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/VisualMappingEngine.ts` in `applyMapping()` den Wert `params.value` für Konstanten nicht aus. Die Engine fällt auf den Standardwert `1.0` für `attraction`, `repulsion` und `inertia` zurück.

3. **Kollaps im Layout-Worker**:
   Im Layout-Worker (`C:/Users/ich/Desktop/code/_projects/Nodges/src/workers/layout-worker.ts`) wird die Netto-Kraft zwischen zwei Knoten als `repulsion - attraction` berechnet.
   Da beide Eigenschaften als `1.0` ausgewertet werden, beträgt die Netto-Kraft `1.0 - 1.0 = 0.0`.
   Ohne Abstoßungskraft ziehen die Kanten-Federn alle Knoten zusammen, was zu einem Koordinatenkollaps (alle Knoten auf einem Punkt oder auf einer geraden Achse nach Normalisierung) führt.

---

## 3. Integration der physikalischen Attribute im Mapping Panel

Die physikalischen Attribute `attraction` (Anziehung), `repulsion` (Abstoßung) und `inertia` (Trägheit/Masse) sind bereits als visuelle Eigenschaften im System vorgesehen, aber die UI weist zwei Lücken auf:

1. **Fehlende Input-Felder**:
   In `MappingUI.ts` (Zeile 1009) fehlen `attraction`, `repulsion` und `inertia` in der Liste der nummerischen Eigenschaften, weshalb für sie kein Eingabefeld für "Konstanter Wert" gerendert wird.

2. **Vorschlag zur Darstellung**:
   - Die Eigenschaften sollten im Mapping-Panel als vollwertige visuelle Zieleigenschaften (wie Größe oder Farbe) editierbar sein.
   - Der Übernahme-Button sollte auch dann erscheinen, wenn sich konstante Mappings in der importierten Datei von den aktuellen Standardwerten unterscheiden.
