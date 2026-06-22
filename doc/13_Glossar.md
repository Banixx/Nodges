# 13 Glossar und technische Begriffe

Dieses Glossar definiert die wichtigsten Konzepte, Technologien und wiederkehrende Begriffe im Nodges-Projekt, um allen Beteiligten ein gemeinsames Verständnis der Architektur ("Shared Vocabulary") zu ermöglichen.

## 3D & Rendering (WebGL / Three.js)

*   **Draw Call**: Ein Befehl der CPU an die Grafikkarte (GPU), ein Element zu rendern. Zu viele individuelle Draw Calls pro Frame sind der Hauptgrund für Frame-Drops in 3D-Anwendungen. Nodges versucht, diese durch Instancing auf ein Minimum zu reduzieren.
*   **Hardware Instancing (`THREE.InstancedMesh`)**: Eine Technik in WebGL, um dieselbe Geometrie (z.B. eine Kugel) mit demselben Material vieltausendfach mit nur *einem einzigen* Draw Call auf den Bildschirm zu bringen. Jede Instanz kann eine eigene Transformationsmatrix (Position, Rotation, Skalierung) und Farbe erhalten.
*   **Raycasting**: Eine Methode zur Bestimmung, worauf der Mauszeiger im 3D-Raum zeigt. Ein unsichtbarer "Laserstrahl" wird von der Kamera durch die Mausposition (2D-Koordinate) in den 3D-Raum geschossen. Getroffene Objekte können dann manipuliert werden.
*   **Z-Fighting**: Ein Grafik-Artefakt, das entsteht, wenn zwei Flächen im 3D-Raum exakt am selben Ort liegen und der Tiefen-Puffer (Z-Buffer) der GPU nicht entscheiden kann, welche Fläche vorne liegt. Äußert sich oftmals als störendes "Flackern".

## Graphen und Datenstruktur

*   **Node (Knotenpunkt)**: Ein einzelnes Objekt oder eine Entität in einem Netzwerk. Visuell meist durch eine Sphäre/Kugel in der 3D-Ansicht repräsentiert.
*   **Edge (Kante / Verbindung)**: Eine Verbindung zwischen zwei Nodes. Repräsentiert eine Beziehung ("Kennt", "Fließt zu", "Basiert auf"). In Nodges visuell oft durch 3D-Röhren (`TubeGeometry`) oder Linien dargestellt.
*   **Graph**: Die Gesamtheit aus Nodes und Edges, die zusammen eine Topologie bilden.
*   **Force-Directed Layout**: Ein Algorithmus zur Anordnung von Graphen. Er simuliert physikalische Kräfte (Knoten stoßen sich ab wie Magnete, Kanten ziehen sie zusammen wie Federn). Das System rechnet, bis ein energetisch stabiler Zustand erreicht ist, wodurch organisch wirkende Cluster entstehen.

## Projekt-Architektur (TypeScript / Core)

*   **Gott-Klasse (God Object)**: Ein Anti-Pattern in der Softwareentwicklung (ursprünglich in der alten `App.ts` vorhanden). Eine Klasse, die viel zu viele Verantwortlichkeiten auf sich vereint ("allwissend" und "allmächtig" ist). In Nodges durch Refactoring in spezialisierte Manager aufgelöst.
*   **Zod**: Eine TypeScript-First-Schema-Deklarations- und Validierungsbibliothek. Nodges nutzt Zod, um eingehende JSON-Graph-Daten strikt zu prüfen (Fehlen IDs? Sind Edges referenziell intakt?), bevor sie in die State-Engine geladen werden.
*   **Observer Pattern**: Ein Software-Entwurfsmuster. Der `StateManager` (Subject) hält den Zustand. Andere Komponenten (Observer) wie die UI oder die Render-Engine "abonnieren" diesen Zustand (`subscribe`) und werden benachrichtigt, sobald sich etwas ändert.
*   **Web Worker**: Eine JavaScript-Technologie, mit der Skripte in Hintergrund-Threads ausgeführt werden können (abseits des Main-UI-Threads). Nodges nutzt Worker, um rechenintensive Array-Sortierungen oder Layout-Simulationen ($O(n^2)$ Komplexität) auszuführen, ohne dass die Nutzeroberfläche "einfriert".
*   **Single Source of Truth (SSOT)**: Ein Architekturprinzip, bei dem jeder Datenpunkt nur an einem zentralen Ort gespeichert wird. In Nodges ist der `StateManager` die SSOT. Visuelle Komponenten fragen diesen ab, statt eigene Kopien der Datenstruktur ('state') zu halten.
*   **UI-Komplexitätsmodus**: Ein dreistufiges Steuerungssystem ("Simple", "Expert", "Dev") zur bedarfsgerechten Ein- und Ausblendung von Sidebar-Tabs und Info-Elementen im DOM.
*   **Visual Mapping**: Die dynamische Übersetzung von Datenattributen (wie `age` oder `region`) in grafische Eigenschaften (wie Farb-Heatmaps von Blau nach Rot oder Knotengrößen).
*   **Save As Modal**: Ein interaktives, im Glassmorphism-Design gestaltetes Overlay zum Exportieren der Graph-Daten in JSON- oder Markdown-Dateien.

---
*Dokumentations-Status: V2.1 (Glossar Updated)*
*Geprüft gegen Build: 0.101.0*
