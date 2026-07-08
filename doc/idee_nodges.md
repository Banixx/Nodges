# Nodges: Projektvision, Ideen und gesammelte Konzepte

Dieses Dokument fasst die zentralen Visionen, theoretischen Grundlagen, UI/UX-Konzepte und Architekturpläne zusammen, die in verschiedenen Dokumentationen (wie `Nodges_Idee.md`, `01_Einfuehrung_und_Projektvision.md`, `nodges_ideen_mapping.md` und anderen) festgehalten wurden.

## 1. Die Kernvision: Spatial Analytics im Web
Nodges (aus **NO**des und e**DGES**) ist nicht nur ein Graph-Viewer, sondern eine hochspezialisierte **Spatial Analytics Engine** für den Browser. Die Grundidee basiert auf "Spatial Literacy": Der Mensch denkt räumlich. Nodges übersetzt abstrakte Netzwerke in greifbare 3D-Umgebungen und löst das 2D-"Hairball-Problem" (undurchdringbare Knotenknäuel) durch eine Entzerrung in der Z-Achse. Der Nutzer blickt nicht *auf* die Daten, sondern bewegt sich *inmitten* der Daten.

### "Executable Storytelling" und der Bruch des Monologs
Ein zentraler Gedanke ist der holistische Ansatz zwischen Autor und Nutzer:
- **Die kuratierte Basis:** Der Autor eines Datensatzes definiert im JSON-File bereits eine intentionale Darstellung (ein "Cold Start"-Setup). Er führt den Nutzer durch das System.
- **Interaktiver Diskurs:** Nodges bricht den passiven Medienkonsum auf. Der Nutzer kann die "Show" jederzeit pausieren, das Mapping ändern und das System durch "Inquiry-based Learning" eigenständig explorieren. Hypothesen können direkt im 3D-Raum visuell getestet werden.

## 2. Visuelles Mapping und Semantik
Das visuelle System in Nodges ist darauf ausgelegt, maximale kognitive Entlastung ("Cognitive Offloading") zu bieten. Das Gehirn soll keine Text-Panels lesen müssen, um Zusammenhänge zu verstehen.

- **Visuelle Metaphern & Semantisches Mapping:** Abstrakte Daten (z.B. Einfluss, Netzwerkstatus, Ausfälle) werden direkt auf physikalische Eigenschaften (Knotengröße, Liniendicke, Leuchteffekte/Glow, Animationspulse) gemappt. Eine hauchdünne Linie steht intuitiv für eine schwache oder abbrechende Verbindung.
- **Gestaltgesetze in 3D:** Durch das physikbasierte Layout (Force-Directed) und farbliches Mapping gruppiert das System Daten automatisch. Knoten mit ähnlichen Eigenschaften bilden räumlich und farblich erkennbare Wolken (Gesetz der Nähe und Ähnlichkeit).
- **Signal-Rausch-Verhältnis:** Unwichtige oder inaktive Knoten werden nicht hart gelöscht, sondern per `opacity`-Mapping fast unsichtbar (z.B. 10 % Deckkraft) gemacht. Der Gesamtkontext bleibt erhalten, während das relevante "Signal" kristallklar hervortritt.

## 3. Architektur und Technologie
Nodges ist "Web-Native" und erfordert keine Installation, was den Einsatz in restriktiven IT-Umgebungen ermöglicht.

- **Tech-Stack:** TypeScript, Three.js, Vite, Zod (für strikte Laufzeitvalidierung von JSON-Daten).
- **Manager-Orchestrator-Muster:** Eine saubere Trennung von State und Rendering. 
  - Der `StateManager` fungiert als "Single Source of Truth" inklusive Undo/Redo.
  - Der `CentralEventManager` übersetzt rohe Browser-Eingaben in semantische Aktionen.
  - Rechenintensive Layouts laufen parallel in **Web Workern**, um die UI performant zu halten.
- **Kompromisslose Performance:** Nutzung von Hardware-Instancing (`THREE.InstancedMesh`), um 50.000+ Knoten in einem einzigen Draw-Call auf der GPU zu rendern.

## 4. Konkrete Pläne und UI-Konzepte

### Hybrides Rendermodell (Auto-FPS-Fallback)
Ein konkreter Plan für das Rendering ist die parallele Unterstützung von `THREE.Mesh` und `THREE.InstancedMesh` (`plan_rendermode.md`).
- **Mesh-Modus:** Bietet maximale Flexibilität und wird standardmäßig genutzt.
- **Auto-Modus:** Ein Performance-Monitor überwacht die Framerate. Fällt diese für mehr als 2 Sekunden unter 15 FPS, wechselt Nodges automatisch und nahtlos auf `InstancedMesh`, um massiv Performance zu sparen, bis ein neuer Graph geladen wird.

### Gestufte UI-Komplexität
Um unterschiedlichen Nutzergruppen gerecht zu werden, bietet die Oberfläche drei Modi:
1. **Simple:** Für reine Betrachter.
2. **Expert:** Für Analysten, die tief ins visuelle Mapping eingreifen wollen.
3. **Dev:** Bietet vollständigen Zugriff auf Systemvariablen, FPS-Monitore und Debug-Tools.

### Mapping-Panel Interaktion (Drill-Down / Filter-Idee)
Die Kacheln im Mapping-Panel (linke Seitenleiste) listen die Attribute des Systems auf. Klickt man auf eine Kachel (z.B. `type`), entfalten sich die spezifischen Untergruppen bzw. Werte (z.B. "Mensch", "Tier", "Pflanze").
**Zukünftige Idee:** Mit einem weiteren Klick auf einen spezifischen Wert (z.B. "Mensch") könnte eine exklusive Visualisierung/Filterung angestoßen werden, sodass nur noch Nodes dieses Typs hervorgehoben oder isoliert dargestellt werden.
**Herausforderung:** Diese direkte Filterung aus dem Mapping-Panel heraus kann schnell zu Verwirrung führen (z.B. wenn Nutzer den Graphen als unvollständig wahrnehmen, weil sie den aktiven Filter vergessen). Eine sehr klare UI-Rückmeldung (z.B. ein auffälliges "Filter aktiv"-Badge) wäre hier zwingend erforderlich.

---
*Dieses Dokument bündelt die verstreuten konzeptionellen Pläne und dient als Nordstern für zukünftige Architektur- und Design-Entscheidungen.*

## 5. Externe Physik-Bibliothek zur Skalierung (d3-force-3d)
**Problem:** Der N-Body-Algorithmus (Force-Directed Layout) im Worker berechnet Kräfte aktuell in einer $O(N^2)$ Schleife, was bei großen Graphen (z.B. > 1000 Knoten) zu Ruckeln und Performance-Einbrüchen führt.
**Lösungsansatz:** Sobald Skalierungsprobleme auftreten, soll die Vektormathematik im Web-Worker durch eine graphenspezifische Physik-Bibliothek wie `d3-force-3d` ersetzt werden. Diese nutzt den Barnes-Hut-Algorithmus (Octree), um die Komplexität auf $O(N \log N)$ zu reduzieren, wodurch selbst zehntausende Knoten in Echtzeit flüssig simuliert werden können. Auf echte Rigid-Body Engines (wie Cannon.js) soll explizit verzichtet werden, da deren Verhalten (Schwerkraft, Rotation, "Umfallen" von Objekten) ungeeignet für Netzwerk-Topologien ist.

## 6. Erweiterung der Beziehungsstrukturen (1-zu-n und n-äre Beziehungen)
**Problem/Status quo:** Aktuell unterstützen die physikalischen Layout-Algorithmen und der Layout-Worker in `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/LayoutManager.ts` ausschließlich Kanten mit einem eindeutigen Start- und Endpunkt (`source` und `target`). Zwar erlaubt das Kanten-Schema ein `nodes`-Array (`nodes: string[]`), dieses wird jedoch im Layout verworfen und in der 3D-Visualisierung (`C:/Users/ich/Desktop/code/_projects/Nodges/src/core/EdgeObjectsManager.ts`) als vollständige Clique (jeder mit jedem) gezeichnet, was nicht immer dem semantischen Wunsch einer gerichteten 1-zu-n-Beziehung entspricht.
**Lösungsansatz:** 
- **Nativ geführte 1-zu-n-Beziehungen:** Einführung eines echten 1-zu-n-Datenmodells für Beziehungen (z. B. durch ein `targets`-Array), das sowohl im `LayoutManager` als auch im Layout-Worker als sternförmiges Kraftmodell (Anziehungskraft vom Quellknoten zu allen Zielknoten) abgebildet wird.
- **Unterstützung für Hyperedges/Nodes-Array im Layout:** Integration des bestehenden `nodes`-Arrays in die Layout-Engine, um Gruppenverbindungen oder ungerichtete Cliquen physikalisch zu simulieren, ohne dass diese vom Worker gefiltert und ignoriert werden.

## 7. Erweiterbares Vorlagen- und Preset-System (Mapping Library)
**Problem/Status quo:** Bisherige visuelle Zuweisungen (Mappings) wurden entweder direkt im Hintergrund angewandt oder mussten manuell über einen einfachen "Übernehmen"-Button aus der JSON-Datei bestätigt werden. Dies bot wenig Flexibilität für Quervergleiche.
**Lösungsansatz:** Nodges erhält in der SuggestionUI eine offene, erweiterbare Vorlagen-Bibliothek für Visual Mappings. Dem Nutzer stehen jederzeit verschiedene Visualisierungs-Ansätze zur Auswahl:
- **Original:** Das vom LLM oder der geladenen Datei generierte, datengetriebene Mapping (wie bisher).
- **Neutral:** Ein minimalistisches Basis-Mapping ohne dynamische Zuweisungen (alles auf Fallback-Konstanten), um visuelles Rauschen gezielt zu reduzieren.
- **Erweiterte Vorlagen (mittelfristig):** Aus den Daten automatisch interpretierte Best-Practice-Mappings, fachspezifische Visualisierungsstandards oder hartcodierte Corporate Identity (CI) Vorlagen.
**Ziel:** Dieses offene System reduziert den Lernaufwand beim Wechsel zwischen Datensätzen drastisch. Nutzer können vertraute visuelle Muster (Vorlagen) konstant auf unterschiedliche Daten anwenden. Einer ersten inhaltlichen Einstiegshürde in den Graphen darf keine zusätzliche Hürde durch inkonsistente oder fremde Darstellungen folgen. Das System bleibt so ansprechend, zielgruppengerecht und optisch stabil.

## 8. Modus-basiertes UI (Edit vs. View) und dynamische Panels
**Problem/Status quo:** Aktuell ist das UI starr. Die Sidebar und schwebende Panels verdecken viel von der 3D-Ansicht, was einer reinen explorativen "View"-Erfahrung (räumliche Immersion) im Weg steht.
**Lösungsansatz:** Einführung verschiedener Arbeits-Modi (Create, Mapping, View) mit einem dezenten Schieberegler (Toggle) zwischen **Edit** und **View**:
- **View-Modus aktivieren:** Die rechte Seitenleiste (Sidebar) fährt weich nach rechts aus dem Bildschirm heraus. Es verbleibt lediglich ein schmaler Indikator (Leiste), um sie bei Bedarf zurückzuholen. Schwebende Panels (wie das Mapping Panel und Suggestion Panel) "rollen sich ein" und minimieren sich als kleine Titelleisten an den unteren Bildschirmrand (neben die Minimap).
- **Edit-Modus aktivieren (Rückkehr):** Klickt der User auf eines der minimierten Panels am unteren Bildschirmrand, wechselt das gesamte System automatisch zurück in den Edit-Modus. Das angeklickte Panel öffnet sich wieder genau an der Position und in der Größe, die es vor dem Verbergen hatte. Die Sidebar fährt wieder in den Bildschirm.
**Ziel:** Die Trennung von Werkzeug ("Edit") und Erlebnis ("View") maximiert die Bildschirmfläche für die Spatial Analytics Engine und liefert eine ablenkungsfreie, immersive Präsentation. Die Panels sind keine störenden Elemente mehr, sondern kontextbezogene Werkzeuge.
