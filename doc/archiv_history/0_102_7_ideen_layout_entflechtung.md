# Ideen zur Entflechtung von dichten Clustern (Knäuel-Problem)

Das Bild zeigt ein typisches Problem bei Force-Directed-Layouts: Stark vernetzte Knotenpunkte (wie das Sonnensystem) werden durch die Kanten-Anziehung (Attraction) extrem nah aneinandergezogen, waehrend die Abstossung (Repulsion) nicht stark genug ist. Das resultiert in einem visuellen Knäuel, bei dem Nodes, Edges und vor allem die Labels stark ueberlappen und unleserlich werden.

Hier sind konzeptionelle und technische Loesungsansaetze auf verschiedenen Architekturebenen:

## 1. Anpassungen am Layout-Algorithmus (Physik-Engine)
*   **Dynamische Abstossung (Degree-based Repulsion)**: Knoten mit vielen Verbindungen (z.B. ein Zentralstern) sollten eine exponentiell hoehere Abstossungskraft (`repulsion`) aufweisen als Randknoten. Dadurch werden "Satelliten" automatisch weiter nach aussen gedrueckt und der Cluster atmet auf.
*   **Mindestabstand (Collision Detection)**: Integration einer harten Kollisionserkennung in den Layout-Worker. Knoten verhalten sich wie solide Kugeln mit einem definierten Radius (inklusive Padding), die sich physisch nicht durchdringen duerfen.
*   **Topologie-spezifische Layouts**: Fuer sternfoermige Daten (Zentrum + Trabanten) eignet sich ein `Radial Layout` oder `Spherical Layout` weitaus besser als ein reines Force-Directed-Layout, da es die Planeten geordnet auf "Orbits" platziert.

## 2. Label-Decluttering und Screen-Space-Optimierung
*   **Label-Kollisionserkennung (Frustum Culling fuer Text)**: Bevor ein Label im 2D-DOM (HTML/CSS) gezeichnet wird, wird die Bounding-Box geprueft. Ueberlappen zwei Labels, wird nur das des "wichtigeren" oder groesseren Knotens angezeigt.
*   **Spider-Labels (Leader Lines)**: Anstatt die Labels direkt an den 3D-Koordinaten kleben zu lassen, werden sie kreisfoermig ausserhalb des dichten Knäuels platziert. Eine feine Linie (Leader Line) verbindet das Label mit dem echten Knoten im Zentrum.
*   **Semantic Zoom (LoD)**: Labels von kleineren Objekten (z.B. "Vesta", "Ceres") verschwinden ab einer gewissen Kamera-Distanz vollstaendig in die Transparenz und tauchen erst auf, wenn man extrem nah heranzoomt oder den Knoten mit der Maus beruehrt (Hover).

## 3. Visuelle Beruhigung der Edges
*   **Adaptive Transparenz**: Je kuerzer und dichter Kanten zusammenliegen, desto transparenter sollten sie gerendert werden. Ein "Edge-Fade" basierend auf der Laenge oder der lokalen Kantendichte beruhigt das Bild enorm.
*   **Hover-Fokus (Focus + Context)**: Im Normalzustand sind die Kanten innerhalb des Clusters kaum sichtbar (z.B. 10% Opacity). Faehrt der Nutzer mit der Maus ueber den Zentral-Node (z.B. Jupiter), leuchten alle zugehoerigen Kanten stark auf.

## 4. Semantisches Clustering (Interaktion)
*   **Meta-Nodes (Kollabieren)**: Das gesamte Planetensystem wird ab einer bestimmten Zoom-Stufe oder bei Bedarf zu einem einzigen "Meta-Node" (z.B. "Sonnensystem") zusammengefasst. Ein Klick darauf expandiert den Cluster, wobei andere Systeme in den Hintergrund treten.

## Sofortmassnahme fuer das aktuelle Projekt
Als schnellste Loesung im aktuellen Code (in `LayoutManager.ts`) kann die Basis-Abstossung (`repulsionConstant` oder `repulsionStrength`) drastisch erhoeht oder die Feder-Laenge (`naturalLength`) verlaengert werden. Zudem hilft es, globale Text-Labels standardmaessig auszublenden und nur im Hover-Zustand (`UIManager` / `InteractionManager`) zu rendern.
