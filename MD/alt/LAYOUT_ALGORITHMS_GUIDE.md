# 🎯 Layout Algorithms System - Nodges 0.80

## Übersicht

Das Layout Algorithms System revolutioniert die Netzwerk-Visualisierung in Nodges 0.80 durch automatische, professionelle Anordnung von Knoten und Kanten. Mit 8 verschiedenen Algorithmen und einer benutzerfreundlichen GUI können Sie Ihre Netzwerke optimal darstellen.

## 🚀 Features

### ✨ 8 Layout-Algorithmen
- **Force-Directed** - Physik-basierte Standardanordnung
- **Fruchterman-Reingold** - Optimierte Force-Directed Variante
- **Spring-Embedder** - Feder-basierte Simulation
- **Hierarchical** - Ebenen-basierte Struktur
- **Tree** - Baum-Darstellung
- **Circular** - Kreisförmige Anordnung
- **Grid** - Raster-Layout
- **Random** - Zufällige Verteilung

### 🎨 Benutzerfreundliche GUI
- Dropdown-Menü für Layout-Auswahl
- Parameter-Einstellungen für jeden Algorithmus
- Animation-Geschwindigkeits-Kontrolle
- Vorgefertigte Presets
- Ein-Klick-Anwendung

### 🎬 Animation-System
- Smooth Transitions zwischen Layouts
- Anpassbare Animation-Geschwindigkeit (0.5-5 Sekunden)
- TWEEN.js Integration für flüssige Bewegungen
- Stop-Funktion für sofortigen Abbruch

## 📖 Verwendung

### GUI öffnen
Klicken Sie auf den **🎯 Layout Algorithmen** Button im linken Kontrollpanel.

### Layout anwenden
1. Wählen Sie einen Algorithmus aus dem Dropdown-Menü
2. Passen Sie die Parameter nach Bedarf an
3. Klicken Sie auf **🚀 Layout anwenden**

### Presets verwenden
Wählen Sie ein vorgefertigtes Preset aus dem Dropdown:
- **Kleine Netzwerke** - Optimiert für <50 Knoten
- **Große Netzwerke** - Optimiert für >500 Knoten
- **Hierarchische Struktur** - Für Organigramme/Bäume
- **Kreisförmig** - Für zyklische Strukturen
- **Raster** - Für gleichmäßige Verteilung

## 🔧 Algorithmus-Details

### Force-Directed Layout
**Verwendung:** Standard-Layout für die meisten Netzwerke
**Parameter:**
- Max. Iterationen (100-2000): Anzahl der Berechnungsschritte
- Abstoßungskraft (100-5000): Stärke der Knoten-Abstoßung
- Anziehungskraft (0.01-1): Stärke der Kanten-Anziehung
- Dämpfung (0.1-1): Stabilisierung der Animation

**Vorteile:** Natürliche Anordnung, zeigt Cluster
**Nachteile:** Kann bei großen Netzwerken langsam sein

### Fruchterman-Reingold Layout
**Verwendung:** Optimierte Version des Force-Directed Layouts
**Parameter:**
- Max. Iterationen (100-1000): Berechnungsschritte
- Fläche (100-1000): Verfügbarer Raum
- Temperatur (1-50): Anfangs-Bewegungsenergie

**Vorteile:** Schneller als Standard Force-Directed
**Nachteile:** Weniger Parameter-Kontrolle

### Spring-Embedder Layout
**Verwendung:** Feder-basierte physikalische Simulation
**Parameter:**
- Max. Iterationen (100-2000): Simulationsschritte
- Federkonstante (0.01-1): Steifigkeit der Verbindungen
- Abstoßungskonstante (100-5000): Knoten-Abstoßung
- Dämpfung (0.1-1): Energieverlust
- Natürliche Länge (0.5-10): Ideal-Kantenlänge

**Vorteile:** Sehr natürliche Ergebnisse
**Nachteile:** Rechenintensiv

### Hierarchical Layout
**Verwendung:** Für Organigramme, Entscheidungsbäume
**Parameter:**
- Ebenen-Höhe (1-10): Vertikaler Abstand zwischen Ebenen
- Knoten-Abstand (0.5-5): Horizontaler Abstand

**Vorteile:** Klare Hierarchie-Darstellung
**Nachteile:** Nur für hierarchische Strukturen geeignet

### Tree Layout
**Verwendung:** Baum-Strukturen, Stammbäume
**Parameter:** Wie Hierarchical Layout

**Vorteile:** Optimiert für Baum-Strukturen
**Nachteile:** Erfordert azyklische Graphen

### Circular Layout
**Verwendung:** Zyklische Strukturen, gleichwertige Knoten
**Parameter:**
- Radius (5-50): Kreisgröße
- Höhe (-10 bis 10): Vertikale Position

**Vorteile:** Sehr schnell, zeigt Symmetrie
**Nachteile:** Keine Berücksichtigung der Kanten-Struktur

### Grid Layout
**Verwendung:** Gleichmäßige Verteilung, Vergleichsstudien
**Parameter:**
- Abstand (0.5-10): Raster-Größe

**Vorteile:** Extrem schnell, vorhersagbar
**Nachteile:** Ignoriert Netzwerk-Struktur

### Random Layout
**Verwendung:** Ausgangspunkt für andere Algorithmen
**Parameter:**
- Min. Grenze (-50 bis 0): Untere Raumgrenze
- Max. Grenze (0 bis 50): Obere Raumgrenze

**Vorteile:** Sehr schnell
**Nachteile:** Keine sinnvolle Struktur

## ⚡ Performance-Tipps

### Kleine Netzwerke (<50 Knoten)
- **Empfohlen:** Force-Directed, Spring-Embedder
- **Parameter:** Hohe Iterationen (1000+) für beste Qualität

### Mittlere Netzwerke (50-500 Knoten)
- **Empfohlen:** Fruchterman-Reingold, Force-Directed
- **Parameter:** Mittlere Iterationen (500)

### Große Netzwerke (500+ Knoten)
- **Empfohlen:** Circular, Grid, Random
- **Parameter:** Niedrige Iterationen (200) für Geschwindigkeit

### Hierarchische Daten
- **Empfohlen:** Hierarchical, Tree
- **Tipp:** Strukturieren Sie Ihre Daten vorab

## 🎛️ Parameter-Optimierung

### Force-Directed Feintuning
```
Kleine, dichte Netzwerke:
- Abstoßungskraft: 2000-3000
- Anziehungskraft: 0.05-0.1
- Dämpfung: 0.8-0.9

Große, sparse Netzwerke:
- Abstoßungskraft: 500-1000
- Anziehungskraft: 0.1-0.2
- Dämpfung: 0.9-0.95
```

### Animation-Geschwindigkeit
```
Präsentationen: 3-5 Sekunden
Interaktive Exploration: 1-2 Sekunden
Schnelle Iteration: 0.5-1 Sekunde
```

## 🔄 Workflow-Empfehlungen

### 1. Explorative Analyse
1. Laden Sie Ihr Netzwerk
2. Starten Sie mit **Random Layout**
3. Wechseln Sie zu **Force-Directed** für Struktur-Erkennung
4. Verfeinern Sie mit **Fruchterman-Reingold**

### 2. Präsentation
1. Wählen Sie den passenden Algorithmus für Ihre Daten
2. Optimieren Sie Parameter für beste Darstellung
3. Verwenden Sie langsame Animation (3-5s) für Publikum
4. Speichern Sie optimale Einstellungen als Preset

### 3. Vergleichsstudien
1. Verwenden Sie **Grid Layout** für neutrale Ausgangslage
2. Wenden Sie verschiedene Algorithmen an
3. Vergleichen Sie Ergebnisse visuell
4. Dokumentieren Sie beste Parameter

## 🚨 Troubleshooting

### Layout konvergiert nicht
- **Lösung:** Erhöhen Sie die Dämpfung (0.9+)
- **Alternative:** Reduzieren Sie Abstoßungskraft

### Animation zu langsam
- **Lösung:** Reduzieren Sie Animation-Dauer
- **Alternative:** Verwenden Sie Stop-Button und direktes Layout

### Knoten überlappen
- **Lösung:** Erhöhen Sie Abstoßungskraft
- **Alternative:** Verwenden Sie Grid Layout als Basis

### Ungleichmäßige Verteilung
- **Lösung:** Passen Sie Anziehungs-/Abstoßungsverhältnis an
- **Alternative:** Verwenden Sie Circular Layout

## 🎯 Keyboard-Shortcuts

- **L** - Layout-Panel öffnen/schließen
- **Escape** - Animation stoppen
- **R** - Random Layout anwenden
- **C** - Circular Layout anwenden
- **G** - Grid Layout anwenden

## 📊 Algorithmus-Vergleich

| Algorithmus | Geschwindigkeit | Qualität | Flexibilität | Beste Verwendung |
|-------------|----------------|----------|--------------|------------------|
| Force-Directed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Allgemein |
| Fruchterman-Reingold | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Große Netzwerke |
| Spring-Embedder | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Hohe Qualität |
| Hierarchical | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Hierarchien |
| Tree | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | Bäume |
| Circular | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | Symmetrie |
| Grid | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | Vergleiche |
| Random | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | Ausgangspunkt |

## 🔮 Zukünftige Erweiterungen

- **Multi-Level Layouts** - Hierarchische Verfeinerung
- **Constraint-basierte Layouts** - Benutzer-definierte Beschränkungen
- **3D-spezifische Algorithmen** - Optimiert für 3D-Raum
- **Machine Learning Layouts** - KI-optimierte Anordnungen
- **Interaktive Layout-Bearbeitung** - Manuelle Feinabstimmung

---

**Nodges 0.80** - Professionelle Netzwerk-Visualisierung mit automatischen Layout-Algorithmen! 🎯