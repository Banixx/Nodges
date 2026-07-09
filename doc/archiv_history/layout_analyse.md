# Nodges -- Layout-Analyse

Dieses Dokument beschreibt den Ist-Zustand, die Probleme, den Soll-Zustand
und das Potenzial der Layout-Algorithmen in Nodges.

---

## 1. Vorhandene Layouts

| Layout | Algorithmus | Komplexitaet | Web Worker |
|---|---|---|---|
| **Force-Directed** | Abstossung zwischen allen Nodes, Anziehung entlang Edges | O(n^2) pro Iteration | Ja |
| **Fruchterman-Reingold** | Klassischer FR-Algorithmus mit Abkuehlung (temperature cooling) | O(n^2) pro Iteration | Ja |
| **Spring-Embedder** | Federkraefte entlang Edges, Abstossung zwischen allen Nodes | O(n^2) pro Iteration | Ja |
| **Hierarchical** | BFS fuer Ebenen-Zuweisung, horizontale Verteilung pro Ebene | O(n+e) | Nein |
| **Tree** | Identisch zu Hierarchical (Wrapper-Funktion) | O(n+e) | Nein |
| **Circular** | Gleichmaessige Verteilung auf einem Kreis | O(n) | Nein |
| **Grid** | Raster-Anordnung basierend auf Index | O(n) | Nein |
| **Random** | Zufaellige Positionierung im definierten Bereich | O(n) | Nein |

---

## 2. Was machen die Layouts aktuell?

### Force-Directed (+ FR + Spring-Embedder)
- Berechnen physikalische Kraefte zwischen Nodes
- Abstossung: Alle Nodes stossen sich gegenseitig ab (Coulomb-Kraft)
- Anziehung: Verbundene Nodes ziehen sich an (Feder/Hook)
- Iterativ: Position wird ueber viele Iterationen angepasst
- Web Worker: Berechnung im Hintergrund-Thread mit Fortschritts-Reporting
- Nach Berechnung: Normalisierung auf maxExtent=10

### Hierarchical / Tree
- Berechnet "Ebenen" durch BFS von Root-Nodes (keine eingehenden Edges)
- Horizontal: Nodes pro Ebene gleichmaessig verteilt
- Vertikal: Ebenen mit konfigurierbarem Abstand gestapelt
- Z-Achse: Immer 0 (flach, nur X/Y genutzt)

### Circular
- Verteilt alle Nodes gleichmaessig auf einem Kreis
- Fester Radius, Y=0 (XZ-Ebene)
- Keine Beruecksichtigung von Verbindungen

### Grid
- Raster basierend auf Node-Index
- Quadratische Approximation der Grid-Groesse
- Y=0 (XZ-Ebene)

### Random
- Komplett zufaellige Positionen im 3D-Raum

---

## 3. Bekannte Probleme

### 3.1 Architektur-Probleme

1. **Dualitaet der Datenquellen**: Die `LayoutGUI` arbeitet noch mit Legacy-`nodeObjects` und `edgeObjects` anstatt mit dem modernen `StateManager` als Single Source of Truth. Dies fuehrt zu inkonsistenten Positionen.

2. **InstancedMesh-Inkompatibilitaet**: Der `NodeManager` nutzt `InstancedMesh` fuer Performance. Die `LayoutGUI` erwartet aber individuelle `mesh.position`-Zugriffe, was mit Instanzen nicht funktioniert.

3. **Web Worker kommuniziert ueber Index-Mapping**: Der Worker erhaelt Indices statt IDs. Bei Re-Indizierung nach Aenderungen koennen Zuordnungen verloren gehen.

### 3.2 Funktionelle Probleme

1. **Tree === Hierarchical**: Tree ist nur ein Alias, keine eigenstaendige Baumstruktur (kein Tidied-Tree, kein Radial-Tree).

2. **Hierarchical nur 2D**: Nutzt nur X/Y, Z ist immer 0. In einem 3D-Kontext verschenkt.

3. **Circular ignoriert Kanten**: Reihenfolge ist nur Index-basiert, nicht optimiert fuer minimale Kantenkreuzung.

4. **Keine Animation des Uebergangs**: Layout-Wechsel sind sofort, kein sanfter Uebergang zwischen alter und neuer Position.

5. **Layout-Engine default deaktiviert**: User muss Layout erst einschalten, kennt aber den Schalter moeglicherweise nicht.

6. **Fehlende Rueckmeldung**: Kein visueller Fortschrittsbalken fuer Worker-Berechnungen.

---

## 4. Soll-Zustand

### 4.1 Korrekte Integration mit StateManager

```
JSON-Daten → StateManager (positions) → NodeManager (render)
                   ↑
          LayoutManager (neue Positionen berechnen)
```

Statt:
```
JSON-Daten → nodeObjects → LayoutGUI → direkte mesh.position-Manipulation
```

### 4.2 Animierter Layout-Wechsel

- Alte Position merken
- Neue Position berechnen
- Per `requestAnimationFrame` interpolieren (LERP/SLERP)
- Einstellbare Dauer (bereits im State als `animationSpeed`)

### 4.3 Robuste Hierarchie

- Mehrere Root-Erkennung
- Zyklenerkennung und -behandlung
- Sugiyama-Algorithmus fuer minimale Kantenkreuzungen
- 3D-Hierarchie: Ebenen entlang Y-Achse, Geschwister in XZ-Ebene

### 4.4 Erweiterte Layout-Algorithmen

- Radial Tree (von Zentrum ausgehend)
- Sphere Layout (Nodes auf einer Kugeloberflaeche)
- Layered Layout (Ebenen basierend auf Typ oder Attribut)
- Geographisches Layout (Lat/Long → XZ-Ebene)
- Zeitachsen-Layout (X = Zeit, Y = Kategorie)

---

## 5. Potenzial der Layouts

### 5.1 Analytisches Potenzial

| Layout | Was es offenbart |
|---|---|
| **Force-Directed** | Natuerliche Cluster, isolierte Nodes, Bruecken-Nodes |
| **Hierarchical** | Hierarchie, Abhaengigkeitsketten, Einflusswege |
| **Circular** | Gleichmaessige Uebersicht, schneller Vergleich aller Nodes |
| **Grid** | Ordnung, Sortierbarkeit, Vergleichbarkeit |
| **Random** | Baseline, zeigt ob Struktur von Position abhaengt |

### 5.2 Kombinationspotenzial

- **Layout + Ebenen**: Hierarchisches Layout mit Layer-Filterung zeigt "Schnitte durch die Hierarchie"
- **Layout + Farbe**: Force-Directed mit Farbcodierung nach Typ zeigt Cluster-Zusammensetzung
- **Layout + Animation**: Zeitgesteuertes Durchlaufen verschiedener Layouts zeigt das System aus verschiedenen Perspektiven
- **Layout + Groesse**: Grid-Layout mit Groessen-Mapping zeigt Verteilung visuell und raeumlich

### 5.3 Semantisches Layout

Das groesste ungehobene Potenzial: **Layouts die Bedeutung tragen**.

| Layout-Idee | Semantik |
|---|---|
| **Attribut-Achsen** | X-Achse = ein Attribut, Y-Achse = anderes Attribut → Scatter-Plot im 3D-Raum |
| **Cluster-Layout** | Nodes gleichen Typs/Gruppe raeumlich zusammen, verschiedene auseinander |
| **Zeitachsen-Layout** | Temporal sortiert entlang einer Achse |
| **Gewichtetes Layout** | "Wichtige" Nodes im Zentrum, unwichtige am Rand |
| **Geographisches Layout** | Wenn Geodaten vorhanden: reale raeumliche Anordnung |
| **Radiales Ego-Netzwerk** | Ausgewaehlter Node im Zentrum, 1-Hop-Nachbarn nahe, 2-Hop weiter weg |

---

## 6. Layout als Explorationswerkzeug

Layouts sind nicht nur "Anordnung", sondern **Erkenntnisgewinn-Werkzeuge**:

1. **Hypothese pruefen**: "Hangen diese Typen zusammen?" → Cluster-Layout zeigt es
2. **Anomalien finden**: "Was gehoert hier nicht hin?" → Isolierte Nodes im Force-Layout
3. **Muster erkennen**: "Gibt es Hierarchien?" → Hierarchical Layout macht sie sichtbar
4. **Vergleichen**: "Wie war es vorher?" → Layout-Animation zwischen Zustaenden
5. **Navigieren**: "Wo ist was?" → Geographisches oder semantisches Layout als Karte
