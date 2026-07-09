# Nodges -- Darstellungsmoeglichkeiten

Dieses Dokument inventarisiert alle vorhandenen und denkbaren visuellen Parameter,
mit denen Nodes (Entities) und Edges (Relationships) in Nodges abgebildet werden koennen.

---

## 1. Nodes (Entities)

### 1.1 Vorhandene Darstellungsparameter

| Parameter | Quelle | Status | Beschreibung |
|---|---|---|---|
| **Position (x, y, z)** | `EntityData.position` | Implementiert | 3D-Position im Raum. Kann manuell, per JSON oder per Layout gesetzt werden. |
| **Groesse / Skalierung** | `VisualMapping.size` | Implementiert | Skalar, gesteuert durch `visualScaleExponent` und `visualScaleMultiplier`. Mapping-Funktionen: linear, exponential, logarithmic. |
| **Farbe** | `VisualMapping.color` | Implementiert | Kategorisch (Hash auf Farbpalette), Heatmap (Wert zu Farbverlauf), Bipolar (Negativ/Positiv-Pole), direkte Hex-Werte. |
| **Geometrie / Form** | `VisualMapping.geometry` | Implementiert | sphere, cube, cylinder, cone, torus. Wahl via `geometryType` oder Mapping. |
| **Glow / Leuchtkraft** | `VisualMapping.glow` | Implementiert | Emissive-Intensitaet am Material. Pulsierender Glow bei Selektion. |
| **Opacity / Sichtbarkeit** | Ebenen-System | Implementiert | Ueber Layer-Opacity (0.0-1.0) gesteuert. Simuliert durch Farb-Abdunklung wegen InstancedMesh-Einschraenkung. |
| **Label / Beschriftung** | `NodeLabelManager` | Implementiert | CSS2DObject-Labels. Konfigurierbar: immer sichtbar, nur bei Hover, oder ausgeblendet. |
| **Outline / Umriss** | `HighlightManager` | Implementiert | Aura-Mesh um den Node bei Hover (blau) oder Selektion (cyan). |
| **Ebenen-Zugehoerigkeit** | Layer-System | Implementiert | Dynamisch waehlbares Gruppierungsattribut. 4 Ebenen mit ein-/ausblendbarkeit und Opacity. |
| **Gruppen-Zugehoerigkeit** | `NodeGroupManager` | Implementiert | Farbcodierung und Outline fuer Gruppen. Manuelle Zuweisung. |

### 1.2 Denkbare weitere Darstellungsparameter

| Parameter | Konzept | Mapping-Typ | Potenzial |
|---|---|---|---|
| **Rotation** | Node dreht sich um eigene Achse | Kontinuierlich (Drehgeschwindigkeit) oder kategorisch (Ausrichtung) | Kann "Aktivitaet" oder "Unruhe" visuell kommunizieren |
| **Textur / Material** | Verschiedene Oberflaechen (matt, glanzend, Glas, Metall, Wireframe) | Kategorisch | Unterscheidung von Zustaenden: aktiv/inaktiv, gesund/krank, gesichert/unsicher |
| **Icon / Emblem** | Sprite oder Decal auf der Node-Oberflaeche | Kategorisch | Typ-Kommunikation ohne Label (Zahnrad = Prozess, Herz = Beziehung) |
| **Pulsation** | Rhythmisches Groesser/Kleiner-Werden | Kontinuierlich (Frequenz) | Herzschlag-Metapher fuer Vitalitaet, Taktgeber |
| **Partikeleffekt** | Partikel um den Node herum | Kategorisch/Kontinuierlich | "Strahlung", "Einfluss", "Energie" visuell zeigen |
| **Trail / Spur** | Nachzieheffekt bei Bewegung | Kontinuierlich | Zeigt Bewegungshistorie, Migrationsrichtung |
| **Schattenwurf** | Unterschiedliche Schattenintensitaet | Kontinuierlich | Vermittelt "Gewicht" oder "Bedeutung" |
| **Vibration / Jitter** | Hochfrequente Positionsveraenderung | Kontinuierlich | Instabilitaet, Stress, Warnung |
| **Transparenz-Gradient** | Radiale Transparenz (Kern fest, Rand durchsichtig) | Kontinuierlich | Einflusssphaeere oder Unsicherheitsbereich |
| **Mehrstufige Geometrie** | Verschachtelte Formen (Kern + Huelle) | Kategorisch | Schutzschicht, Kapselung, innere/aeussere Identitaet |
| **Magnetfeld-Linien** | Visualisierung von Einflusszonen | Kontinuierlich | Zeigt Reichweite des Einflusses |
| **Farb-Gradient** | Farbverlauf auf der Node-Oberflaeche | Bipolar | Zeigt innere Spannung, gemischte Zugehoerigkeit |
| **Hoehe (Y-Offset)** | Vertikale Positionierung | Kontinuierlich | Hierarchie, Rang, Zeitachse |
| **Sound-Zuordnung** | Klang bei Hover/Selektion | Kategorisch | Auditive Differenzierung, Barrierefreiheit |
| **Annotation** | Mehrzeilige Zusatzinfo als Popup | Textuell | Detailinformation on-demand |
| **Badge / Zaehler** | Kleine Zahl-Anzeige am Node | Numerisch | Anzahl Verbindungen, Score, Benachrichtigung |
| **Formdeformation** | Verzerrung der Grundform | Kontinuierlich | Zeigt Belastung, Druck, aeusseren Einfluss |

---

## 2. Edges (Relationships)

### 2.1 Vorhandene Darstellungsparameter

| Parameter | Quelle | Status | Beschreibung |
|---|---|---|---|
| **Dicke** | `VisualMapping.thickness` | Implementiert | Radius der TubeGeometry. Skaliert mit `edgeThickness`, `visualScaleExponent`, `visualScaleMultiplier`. |
| **Farbe** | `VisualMapping.color` | Implementiert | Kategorisch, Heatmap, Bipolar, direkte Hex-Werte. Vertex-Farben fuer Animationen. |
| **Kruemmung** | `edgeCurveFactor` | Implementiert | QuadraticBezierCurve3. Bei Mehrfachkanten automatisch rotiert. |
| **Opacity** | `VisualMapping.opacity` | Implementiert | Material-Transparenz. Kombiniert mit Layer-Opacity. |
| **Glow** | `GlowEffect` | Implementiert | Emissive-Effekt bei Hover/Selektion. |
| **Outline** | `HighlightManager` | Implementiert | Groessere TubeGeometry-Huelle bei Hover/Selektion. |
| **Pulse-Animation** | `EdgeObjectsManager.animate()` | Implementiert | Gesamte Edge pulsiert rhythmisch (Farbe schwingt). |
| **Wave/Sequential** | `EdgeObjectsManager.animate()` | Implementiert | Welle laeuft Segment fuer Segment entlang der Edge. Phasenverschiebung pro Segment. |
| **Flow-Animation** | `EdgeObjectsManager.animate()` | Implementiert | Einzelnes Lichtpaket wandert entlang der Kurve. Lauflicht-Effekt. |
| **Segments-Animation** | `EdgeObjectsManager.animate()` | Implementiert | Jedes Segment erhaelt eigene Farbe (HSL-Rotation). Regenbogen-artiger Effekt. |
| **Animations-Geschwindigkeit** | `edgePulseSpeed` | Implementiert | Globaler Multiplikator fuer alle Edge-Animationen. |
| **Label** | `EdgeLabelManager` | Implementiert | CSS2D-Beschriftung an der Edge-Mitte. |

### 2.2 Denkbare weitere Darstellungsparameter

| Parameter | Konzept | Mapping-Typ | Potenzial |
|---|---|---|---|
| **Pfeilrichtung** | Geometrischer Pfeilkopf am Zielende | Boolesch/Kategorisch | Zeigt Richtung des Flusses, der Kausalitaet, des Einflusses |
| **Strichmuster (Dashed)** | Gestrichelt, gepunktet, strich-punkt | Kategorisch | Unterscheidung: gesichert/vermutet, stark/schwach |
| **Bidirektionale Pfeile** | Pfeile an beiden Enden | Boolesch | Wechselseitige Beziehungen |
| **Bandbreite / Multi-Line** | Mehrere parallele Linien als "Kabel" | Kontinuierlich | Kapazitaet, Datenmenge, Intensitaet |
| **Partikelstrom** | Partikel fliessen entlang der Edge | Kontinuierlich | Fluss, Transport, Datenstrom |
| **Wellenlaenge / Farb-Shift** | Farbe veraendert sich entlang der Edge | Bipolar | Transformation waehrend des Transports |
| **Pendel-Animation** | Edge schwingt seitlich | Kontinuierlich | Vibration, Instabilitaet der Verbindung |
| **Spiral-Form** | Helix statt Bezier-Kurve | Kategorisch | DNA, verflochtene Beziehung, Komplexitaet |
| **Elastizitaet** | Edge "federt" bei Positionsaenderung | Physik-basiert | Spannungsgrad der Beziehung |
| **Schatten** | Edge wirft Schatten auf Umgebung | Kontinuierlich | Gewicht/Bedeutung |
| **Textur / Pattern** | Wiederholendes Muster auf der Oberflaeche | Kategorisch | Typ-Codierung (Elektrizitaet = Blitz, Wasser = Wellen) |
| **Mehrere Kontrollpunkte** | CubicBezier oder Spline statt Quadratic | Geometrisch | Komplexere Verlaeufe, Umgehung von Hindernissen |
| **Frequenz-Variation** | Animation passt sich an Daten-Eigenschaft an | Kontinuierlich | Taktrate, Intervall, Puls-Rhythmus |
| **Akkumulationseffekt** | Edge wird dicker je mehr "durchfliesst" | Zeitabhaengig | Zeigt kumulative Wirkung |
| **Bruch / Unterbrechung** | Edge ist visuell unterbrochen | Boolesch | Stoerung, Blockade, Inkompatibilitaet |
| **Gradient entlang Laenge** | Farbe wechselt von Source zu Target | Bipolar | Transformation, Konversion |

---

## 3. Uebergreifende Darstellungskonzepte

### 3.1 Vorhandene

| Konzept | Beschreibung |
|---|---|
| **Visual Mapping Engine** | Datengetriebenes Mapping: Eigenschaft → visueller Parameter via Funktionen (linear, exponential, logarithmic, heatmap, bipolar, pulse, categorical, constant, sphereComplexity, geographic). |
| **Farbschemata** | 5 vordefinierte Schemes (Start Olive, Light Caramel, Golden Ocher, Soft Aquamarine, Ivory Clean). Steuern Hintergrund, Panel, Akzentfarbe, Textfarbe. |
| **Performance-Optimierung** | Adaptives LOD: Geometrie-Detail wird basierend auf FPS reduziert. InstancedMesh fuer alle Nodes. |
| **Minimap** | Vogelperspektive der Szene via eigenem Kamera-Layer. |
| **HoverInfoPanel** | Detail-Panel bei Klick/Hover mit allen Properties des Objekts. |

### 3.2 Denkbare Erweiterungen

| Konzept | Beschreibung |
|---|---|
| **Lens / Fokusbereich** | Lokale "Lupe" die einen Bereich der Szene vergroessert oder detaillierter zeigt |
| **Fisheye-Verzerrung** | Zentraler Fokus mit verzerrter Peripherie fuer Kontext+Detail |
| **Semantisches Zoom** | Bei Naeherung an eine Node erscheinen mehr Details, Sub-Nodes, innere Struktur |
| **Heatmap-Overlay** | Flaechen-basierte Heatmap ueber die gesamte Szene |
| **Voronoi-Zellen** | Jede Node erhaelt eine Einflussflaeceh basierend auf Naehe |
| **Nebel / Atmosphaere** | Distance-Fog fuer Tiefenwahrnehmung |
| **Skybox / Umgebung** | Hintergrund-Textur fuer raeumliche Orientierung |
| **Schnittebenen** | Clipping-Planes zum "Aufschneiden" des 3D-Graphen |
| **Aggregation** | Nodes clustern sich zu einem Meta-Node (Collapse/Expand) |
| **Vergleichsmodus** | Zwei Zustaende des Systems nebeneinander oder ueberlagert |
