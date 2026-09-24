# Analyse der visuellen Pipeline: Sizing, Mapping und Kamera

Basierend auf dem aktuellen Code (Build 0.102.7) sowie den referenzierten Dokumenten (13_Glossar und 17_Wireframe_Kanten_Vorschau) folgt hier eine holistische Betrachtung der visuellen Pipeline von Nodges.

## 1. Sizing und Mapping der Nodes
Die Groessenbestimmung (Sizing) von Nodes durchlaeuft einen strikten mehrstufigen Prozess, um visuelle Ausreisser durch die unberechenbaren KI-Daten zu verhindern:

1. **Mapping Engine (`VisualMappingEngine.ts`)**: 
   Hier werden Rohdaten auf Werte zwischen `0.0` und `1.0` normiert und anschließend einer Funktion (linear, exponentiell, logarithmisch) unterworfen. Für das Attribut `size` greift ein erstes hartes Clamping: `Math.max(0.3, Math.min(3.0, visual.size))`.
2. **Rendering Engine (`NodeManager.ts`)**:
   Der ermittelte Size-Wert dient als Basis. Erst hier greifen die globalen UI-Parameter des Benutzers (`visualScaleExponent` und `visualScaleMultiplier`). 
   Die Berechnung `rawScale = Math.pow(validSize, state.visualScaleExponent) * state.visualScaleMultiplier * 0.5` sorgt für eine dynamische Skalierung.
3. **Zweites Clamping**: 
   Damit keine Kugel verschwindet oder den Canvas komplett überdeckt, wird final auf den absolut erlaubten Radius begrenzt: `Math.max(0.3, Math.min(15.0, rawScale))`.

## 2. Die Pipeline der Edges
Die Edges folgen denselben Mustern (SSOT aus dem `StateManager`, Observer Pattern, siehe *13_Glossar*), jedoch mit eigenen Limitierungen und Besonderheiten:

1. **Mapping**: 
   In der `VisualMappingEngine` wird die `thickness` der Edges exakt zwischen `0.01` und `0.3` geclampt.
2. **Bezier-Kurven (`EdgeObjectsManager.ts`)**:
   Anstatt gerader Linien werden die Edges als gebogene `TubeGeometry` gezeichnet. Ihre finale Dicke wird parallel zu den Nodes über den globalen Scale-Exponenten berechnet. Bei parallelen Kanten zwischen identischen Nodes wird die Krümmungshöhe modifiziert (`curveFactor = 2.8 + (edgeIndex * 0.5)`), um Überlappungen zu vermeiden.
3. **Verhinderung des "Abreissens" (*17_Wireframe_Kanten_Vorschau*)**:
   Beim interaktiven Verschieben von Nodes werden dank einer synchronisierten Pipeline transiente Vorschaukanten aus den Original-Geometrieparametern berechnet, die dem verschobenen Objekt in Echtzeit folgen.

## 3. Kamera-Logik und "Leerraum-Anflug"
Das Anvisieren der Knotenpunkte (Fokus) wird zentral im `CameraManager.ts` durch die Methode `fitToBoundingBox` gesteuert. Diese Regelung funktioniert technisch sehr elegant und robust:

- **Radius-Berechnung**: Zuerst wird das genaue Zentrum und der maximale Ausdehnungsradius (`maxRadius`) des zu fokussierenden Graphen berechnet.
- **FOV-Abgleich**: Über trigonometrische Funktionen (unter Einbeziehung des Field of View `fov` der Kamera) wird die Minimaldistanz berechnet, die nötig ist, um diesen `maxRadius` vollständig im Sichtbereich zu platzieren.
- **Der Margin (Leerraum)**: Der berechneten Distanz wird ein Multiplikator (`margin = 1.2`) beigefuegt. Dieser sorgt dafuer, dass exakt **20 % Leerraum (Padding)** um das anvisierte Objekt auf dem Bildschirm verbleiben.
- **Cinematische Animation**: TWEEN sorgt für einen zweistufigen Kamera-Flug (Phase 1: 180° Orbit, Phase 2: Absinken auf 35° über dem Horizont), was den räumlichen 3D-Kontext optimal erhält und sehr organisch wirkt.

## Zusammenfassung des Codes
Der vorhandene Code als Ganzes zeichnet sich durch eine sehr klare Trennung ("Separation of Concerns") aus. Die Architektur profitiert enorm von der strikten Trennung der logischen Datenaufbereitung (`VisualMappingEngine`) und der reinen grafischen Darstellung (`NodeManager` / `EdgeObjectsManager`). Das Clamping-System erweist sich über alle Ebenen hinweg als effektive Brandmauer gegen defekte oder ungewöhnliche KI-Daten-Mappings.
