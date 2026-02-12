# 11 Node und Edge Erstellung: Technischer Deep-Dive

Dieses Kapitel ist der abschließende technische Bericht über die präzise Umsetzung der Mesh-Generierung. Es dokumentiert die "Innereien" der Objekt-Manager und dient als Referenz für Optimierungen.

## 11.1 Die Node-Pipeline (`NodeManager.ts`)

Die Erstellung eines Knotens folgt einer strengen Kette von Transformationen.

### 1. Die Gruppierungs-Phase

Anstatt alle Knoten in einen Topf zu werfen, gruppiert der `NodeManager` sie nach ihrem **Geometrie-Typ** (z.B. alle "Sphere"-Nodes, alle "Box"-Nodes). Für jede Gruppe wird ein eigener `InstancedMesh` erstellt.

* **Warum?** Ein `InstancedMesh` kann nur eine einzige Geometrie (z.B. `SphereGeometry`) instanziieren.

### 2. Visuelles Mapping (Die Seele der Node)

Bevor die GPU übernimmt, berechnet die `VisualMappingEngine`:

* **Scale**: Basierend auf Attributen (z.B. "Gewicht").
* **Color**: Hex-Code aus dem JSON wird in ein `THREE.Color` Objekt umgewandelt.
* **Emissive**: Soll der Knoten von sich aus leuchten?

### 3. Matrix-Transformation

Die Position $(x, y, z)$ wird nicht einfach gesetzt, sondern in eine **4x4 Transformations-Matrix** geschrieben. Diese Matrix enthält auch die Skalierung. Dies ist der einzige Weg, wie die GPU effizient hunderte Variationen derselben Kugel gleichzeitig verstehen kann.

## 11.2 Die Edge-Pipeline (`EdgeObjectsManager.ts`)

Kanten sind mathematisch anspruchsvoller, da sie eine **Ausrichtung** im Raum benötigen.

### Kanten-Visualisierung: TubeGeometries (Unified Approach)

Aktuell setzt Nodges einheitlich auf **TubeGeometry** für alle Verbindungen (auch gerade).

* **Warum?** Visuelle Konsistenz und Vereinfachung des Shaders.
* **Ablauf**:
  * Ein **Bezier-Pfad** wird definiert (bei geraden Kanten ist der "Control Point" linear interpoliert).
  * Ein **Mesh-Generator** lässt einen "Schlauch" entlang dieses Pfades wachsen.
  * **Optimierung**: Die Anzahl der Segmente (`tubularSegments`) wird dynamisch angepasst. Kurze Kanten haben weniger Segmente.
* *(Veraltet: Die Optimierung mittels einfacher Zylinder für gerade Kanten ist im Code vorhanden, aber zugunsten der "organischen" Optik deaktiviert.)*

## 11.3 Speicher-Management und Lifecycle

Ein großes Problem bei Single-Page-Apps mit 3D sind **CPU/GPU Memory Leaks**. Wenn man einen neuen Graphen lädt, müssen die alten Daten rückstandslos verschwinden.

Nodges implementiert eine strikte `dispose()` Kette:

1. **Geometrien**: `geometry.dispose()` leert den VBO (Vertex Buffer Object) in der GPU.
2. **Materialien**: `material.dispose()` löscht die Shader-Programm-Instanzen.
3. **Textures**: Falls Bilder genutzt wurden, werden diese aus dem Grafikkartenspeicher entfernt.

Ohne diese expliziten Aufrufe würde der Browser-Tap bei jedem neuen Laden eines Graphen ca. 200-500 MB RAM mehr verbrauchen, bis er schließlich abstürzt.

## 11.4 Zusammenfassung der Performance-Daten

| Methode | Max. Objekte (60 FPS) | Anwendung |
| :--- | :--- | :--- |
| Single Mesh | ~500 | Spezialknoten, UI-Elemente |
| InstancedMesh | ~50.000 | Standard-Knoten, einfache Kanten |
| TubeGeometry | ~2.000 | Komplexe Multi-Edges |
| BufferGeometry | ~200.000 | Nur Punkte (PointClouds, geplant) |

---
*Erstellt am: 30.12.2025*
*Status: Finalisierte Dokumentation V1*
