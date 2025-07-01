# 📖 Nodges 0.80 - Benutzerhandbuch

## 🎯 Willkommen bei Nodges 0.80

**Nodges** ist eine professionelle 3D-Netzwerkvisualisierungsanwendung mit fortschrittlichen Layout-Algorithmen und Multi-Select-Funktionen. Diese Anwendung ermöglicht es Ihnen, komplexe Netzwerke interaktiv zu erkunden, zu analysieren und zu manipulieren.

### 🚀 Was ist neu in Version 0.80?
- **8 professionelle Layout-Algorithmen**
- **Erweiterte Multi-Select-Funktionen**
- **Umfassende Batch-Operationen**
- **Optimierte Performance für große Netzwerke**
- **Intuitive Benutzeroberfläche**

## 📋 Inhaltsverzeichnis

1. [Erste Schritte](#erste-schritte)
2. [Benutzeroberfläche](#benutzeroberfläche)
3. [Netzwerk-Daten laden](#netzwerk-daten-laden)
4. [Layout-Algorithmen](#layout-algorithmen)
5. [Multi-Select & Auswahl](#multi-select--auswahl)
6. [Batch-Operationen](#batch-operationen)
7. [Netzwerk-Analyse](#netzwerk-analyse)
8. [Import & Export](#import--export)
9. [Tastaturkürzel](#tastaturkürzel)
10. [Tipps & Tricks](#tipps--tricks)

## 🚀 Erste Schritte

### Anwendung starten
1. Öffnen Sie Ihren Webbrowser (Chrome, Firefox, oder Edge empfohlen)
2. Navigieren Sie zu: `http://localhost:8080`
3. Die Anwendung lädt automatisch ein kleines Beispiel-Netzwerk

### Grundlegende Navigation
- **Kamera drehen:** Linke Maustaste gedrückt halten und ziehen
- **Zoomen:** Mausrad scrollen
- **Kamera verschieben:** Rechte Maustaste gedrückt halten und ziehen
- **Objekt auswählen:** Auf Knoten oder Kante klicken

## 🖥️ Benutzeroberfläche

### Linkes Bedienfeld
Das linke Bedienfeld enthält die Hauptsteuerungen:

#### Netzwerk-Buttons
- **Kleines Netzwerk** - 3 Knoten, ideal zum Testen
- **Mittleres Netzwerk** - 12 Knoten, ausgewogene Größe
- **Großes Netzwerk** - 50 Knoten, komplexere Strukturen
- **Mega Netzwerk** - 200 Knoten, Performance-Test
- **Familien Daten** - Stammbaum-Beispiel
- **Architektur** - Software-Architektur-Beispiel
- **Königsfamilie** - Historische Familiendaten

#### Layout-Button
- **🎯 Layout Algorithmen** - Öffnet das Layout-Auswahlpanel

#### Suchfunktion
- **Suchfeld** - Knoten nach Namen suchen
- **Suchen-Button** - Suche ausführen

### Rechtes Bedienfeld (GUI)
Das rechte Bedienfeld enthält erweiterte Einstellungen:

#### Hauptordner
- **Daten** - Netzwerk-Verwaltung
- **Import/Export** - Dateiverwaltung
- **Auswahl & Batch** - Multi-Select-Operationen
- **Filter** - Sichtbarkeitsfilter
- **Ansicht** - Darstellungsoptionen
- **Analyse** - Netzwerk-Analyse-Tools
- **Gruppen** - Knotengruppierung
- **Performance** - Leistungsoptimierung

### Informationspanel
- **Dateiinformationen** - Zeigt Details zum aktuellen Netzwerk
- **Objekt-Details** - Informationen zu ausgewählten Objekten

## 📁 Netzwerk-Daten laden

### Vordefinierte Netzwerke
Klicken Sie auf einen der Netzwerk-Buttons im linken Bedienfeld:

1. **Kleines Netzwerk** - Perfekt für erste Experimente
2. **Mittleres Netzwerk** - Gute Balance zwischen Komplexität und Übersichtlichkeit
3. **Großes Netzwerk** - Für komplexere Analysen
4. **Mega Netzwerk** - Stress-Test für Performance
5. **Spezielle Datensätze** - Familien-, Architektur- und historische Daten

### Eigene Daten importieren
1. Öffnen Sie den **Import/Export** Ordner im rechten Bedienfeld
2. Klicken Sie auf **📁 Datei importieren**
3. Wählen Sie eine JSON-, CSV-, GEXF- oder GraphML-Datei
4. Die Daten werden automatisch geladen und visualisiert

### Unterstützte Dateiformate
- **JSON** - Nodges-natives Format
- **CSV** - Tabellendaten mit Knoten- und Kantenlisten
- **GEXF** - Gephi Exchange Format
- **GraphML** - XML-basiertes Graphformat

## 🎨 Layout-Algorithmen

### Zugriff auf Layout-Algorithmen
1. Klicken Sie auf den **🎯 Layout Algorithmen** Button
2. Das Layout-Panel öffnet sich
3. Wählen Sie einen Algorithmus aus der Liste

### Verfügbare Algorithmen

#### Layout-Algorithmus Vergleichstabelle

| Algorithmus | Typ | Komplexität | Geeignet für | Animationsdauer |
|-------------|-----|-------------|--------------|-----------------|
| **Force-Directed** | Physik-basiert | Mittel | Allgemeine Netzwerke | 2s |
| **Fruchterman-Reingold** | Optimiert | Hoch | Große Netzwerke | 2s |
| **Spring-Embedder** | Feder-basiert | Mittel | Strukturierte Daten | 2s |
| **Hierarchical** | Ebenen-basiert | Niedrig | Hierarchien | 2s |
| **Tree** | Baum-Struktur | Niedrig | Baumstrukturen | 2s |
| **Circular** | Geometrisch | Niedrig | Gleichwertige Knoten | 2s |
| **Grid** | Raster | Niedrig | Systematische Anordnung | 2s |
| **Random** | Zufällig | Niedrig | Ausgangspunkt | 2s |

#### 1. **Force-Directed Layout**
- **Beschreibung:** Physik-basierte Standardanordnung
- **Geeignet für:** Allgemeine Netzwerke, erste Exploration
- **Eigenschaften:** Natürliche, organische Anordnung

#### 2. **Fruchterman-Reingold Layout**
- **Beschreibung:** Optimierte Force-Directed Variante
- **Geeignet für:** Mittlere bis große Netzwerke
- **Eigenschaften:** Gleichmäßige Knotenverteilung, minimierte Kantenkreuzungen

#### 3. **Spring-Embedder Layout**
- **Beschreibung:** Feder-basierte Simulation
- **Geeignet für:** Strukturierte Netzwerke
- **Eigenschaften:** Stabile, ausgewogene Positionen

#### 4. **Hierarchical Layout**
- **Beschreibung:** Ebenen-basierte Struktur
- **Geeignet für:** Hierarchische Daten, Organigramme
- **Eigenschaften:** Klare Ebenen-Trennung, Top-Down-Anordnung

#### 5. **Tree Layout**
- **Beschreibung:** Baum-Darstellung
- **Geeignet für:** Baumstrukturen, Stammbäume
- **Eigenschaften:** Radiale oder lineare Baum-Anordnung

#### 6. **Circular Layout**
- **Beschreibung:** Kreisförmige Anordnung
- **Geeignet für:** Gleichwertige Knoten, zyklische Strukturen
- **Eigenschaften:** Symmetrische Kreisanordnung

#### 7. **Grid Layout**
- **Beschreibung:** Raster-Layout
- **Geeignet für:** Systematische Anordnung, Vergleiche
- **Eigenschaften:** Regelmäßige Gitterstruktur

#### 8. **Random Layout**
- **Beschreibung:** Zufällige Verteilung
- **Geeignet für:** Ausgangspunkt für andere Layouts
- **Eigenschaften:** Zufällige, aber gleichmäßige Verteilung

### Layout-Anwendung
1. Wählen Sie einen Algorithmus
2. Passen Sie Parameter an (falls verfügbar)
3. Klicken Sie **Anwenden**
4. Beobachten Sie die 2-Sekunden-Animation

## 🎯 Multi-Select & Auswahl

### Auswahlmethoden

#### Einzelauswahl
- **Klick** auf einen Knoten oder eine Kante
- Das Objekt wird hervorgehoben
- Informationen erscheinen im Infopanel

#### Multi-Select (Mehrfachauswahl)
- **Strg + Klick** - Objekte zur Auswahl hinzufügen
- **Shift + Ziehen** - Box-Auswahl (Rechteck aufziehen)
- Ausgewählte Objekte erhalten grüne Auswahlboxen

### Visuelle Rückmeldung
- **Grüne Boxen** - Zeigen ausgewählte Objekte
- **Live-Zähler** - Anzahl ausgewählter Objekte im GUI
- **Transparenz** - 30% transparente Auswahlboxen

### Auswahl-Operationen
Im **Auswahl & Batch** Ordner finden Sie:

#### 📊 Auswahl-Info
- **Gesamt** - Anzahl aller ausgewählten Objekte
- **Knoten** - Anzahl ausgewählter Knoten
- **Kanten** - Anzahl ausgewählter Kanten

#### 🎯 Auswahl-Operationen
- **Alle auswählen** - Strg+A Alternative
- **Auswahl aufheben** - Escape Alternative
- **Auswahl umkehren** - Nicht-ausgewählte Objekte auswählen
- **Statistiken anzeigen** - Detaillierte Auswahl-Informationen

## 🔄 Batch-Operationen

Batch-Operationen ermöglichen es, mehrere Objekte gleichzeitig zu bearbeiten.

### 🎨 Batch-Farbe
1. Wählen Sie mehrere Objekte aus
2. Öffnen Sie **🎨 Batch-Farbe**
3. Wählen Sie eine neue Farbe
4. Klicken Sie **Farbe anwenden**
5. Alle ausgewählten Objekte ändern ihre Farbe

### 📐 Batch-Transformation
#### Größe ändern
1. Stellen Sie **Größe** ein (0.1 - 5.0)
2. Klicken Sie **Größe anwenden**

#### Knotentyp ändern
1. Wählen Sie **Knotentyp** (Würfel, Kugel, Zylinder, etc.)
2. Klicken Sie **Typ anwenden**

### 🔄 Batch-Bewegung
#### Objekte verschieben
1. Stellen Sie **X/Y/Z-Versatz** ein
2. Klicken Sie **Bewegen**
3. Objekte werden um den angegebenen Betrag verschoben

#### Objekte skalieren
1. Stellen Sie **Skalierung** ein (0.1 - 3.0)
2. Klicken Sie **Skalieren**

### 📏 Batch-Ausrichtung
#### Objekte ausrichten
1. Wählen Sie **Achse** (X, Y, oder Z)
2. Wählen Sie **Modus** (Min, Max, Center, Average)
3. Klicken Sie **Ausrichten**

#### Objekte verteilen
1. Wählen Sie **Achse** für Verteilung
2. Klicken Sie **Verteilen**
3. Objekte werden gleichmäßig entlang der Achse verteilt

### 🏷️ Batch-Eigenschaften
1. Geben Sie **Eigenschaft** ein (z.B. "category")
2. Geben Sie **Wert** ein (z.B. "important")
3. Klicken Sie **Eigenschaft setzen**

### 👥 Batch-Gruppen
1. Erstellen Sie eine Gruppe im **Gruppen** Ordner
2. Klicken Sie **Zu Gruppe hinzufügen**
3. Oder **Aus Gruppen entfernen**

### 🛠️ Batch-Werkzeuge
- **🗑️ Auswahl löschen** - Entfernt ausgewählte Objekte
- **↶ Rückgängig** - Macht letzte Operation rückgängig

## 📊 Netzwerk-Analyse

### Nachbarschaftsanalyse
1. Wählen Sie einen Knoten aus
2. Öffnen Sie **Analyse** → **Nachbarschaftshervorhebung**
3. Stellen Sie **Nachbarschaftstiefe** ein (1-3)
4. Aktivieren Sie **Andere ausblenden** (optional)
5. Klicken Sie **Nachbarschaft hervorheben**

### Netzwerk-Statistiken
1. Öffnen Sie **Analyse** → **Netzwerkanalyse**
2. Klicken Sie **Netzwerk-Statistiken**
3. Erhalten Sie Informationen über:
   - Anzahl Knoten und Kanten
   - Netzwerkdichte
   - Durchschnittlicher Grad
   - Clustering-Koeffizient

### Knoten-Metriken
1. Wählen Sie einen Knoten aus
2. Klicken Sie **Knoten-Metriken**
3. Erhalten Sie Informationen über:
   - Grad (Anzahl Verbindungen)
   - Betweenness Centrality
   - Closeness Centrality
   - Clustering-Koeffizient

### Zentralitätsanalyse
1. Wählen Sie **Zentralitätstyp** (Degree, Betweenness, Closeness)
2. Stellen Sie **Anzahl Top-Knoten** ein
3. Klicken Sie **Top-Knoten anzeigen**

### Community-Erkennung
1. Klicken Sie **Communities erkennen**
2. Das System identifiziert Gruppen von eng verbundenen Knoten
3. Ergebnisse werden in einem Dialog angezeigt

### Pfadfindung
1. Wählen Sie einen Startknoten
2. Klicken Sie **Startknoten setzen**
3. Wählen Sie einen Zielknoten
4. Klicken Sie **Zielknoten setzen**
5. Klicken Sie **Pfad finden**
6. Der kürzeste Pfad wird hervorgehoben

## 📁 Import & Export

### Daten importieren
1. Öffnen Sie **Import/Export** im rechten Bedienfeld
2. Klicken Sie **📁 Datei importieren**
3. Wählen Sie eine unterstützte Datei
4. Die Daten werden automatisch geladen

### Netzwerk exportieren
1. Wählen Sie **Export-Format** (JSON, CSV, GEXF, GraphML)
2. Geben Sie einen **Dateinamen** ein
3. Aktivieren Sie **Visualisierungszustand** (optional)
4. Klicken Sie **📤 Netzwerk exportieren**

### Visualisierung exportieren
1. Geben Sie einen **Dateinamen** ein
2. Klicken Sie **🖼️ Bild exportieren**
3. Ein PNG-Screenshot wird erstellt

### Datenformat-Spezifikationen

#### JSON-Format (Nodges-nativ)
```json
{
  "nodes": [
    {
      "id": "node1",
      "name": "Knoten 1",
      "position": {"x": 0, "y": 0, "z": 0},
      "metadata": {
        "type": "cube",
        "size": 1.2,
        "color": "#ff4500"
      }
    }
  ],
  "edges": [
    {
      "start": {"id": "node1"},
      "end": {"id": "node2"},
      "name": "Verbindung",
      "metadata": {
        "style": "solid",
        "color": "#0000ff"
      }
    }
  ]
}
```

## ⌨️ Tastaturkürzel

### Grundlegende Shortcuts
- **Strg + A** - Alle Objekte auswählen
- **Escape** - Auswahl aufheben
- **Delete** - Ausgewählte Objekte löschen
- **F1** - Hilfe-Overlay anzeigen

### Multi-Select Shortcuts
- **Strg + Klick** - Objekt zur Auswahl hinzufügen
- **Shift + Ziehen** - Box-Auswahl
- **Strg + Shift + A** - Auswahl umkehren

### Navigation Shortcuts
- **Mausrad** - Zoomen
- **Linke Maustaste + Ziehen** - Kamera drehen
- **Rechte Maustaste + Ziehen** - Kamera verschieben
- **Mittlere Maustaste** - Kamera zentrieren

### Erweiterte Shortcuts
- **Strg + Z** - Rückgängig (geplant)
- **Strg + Y** - Wiederholen (geplant)
- **Strg + S** - Speichern (geplant)

## 💡 Tipps & Tricks

### Performance-Optimierung
1. **Große Netzwerke:** Verwenden Sie Level of Detail (LOD) in den Performance-Einstellungen
2. **Speicher:** Wechseln Sie regelmäßig zwischen Netzwerken, um Cache zu leeren
3. **FPS:** Reduzieren Sie die Anzahl sichtbarer Objekte bei Performance-Problemen

### Effektive Netzwerk-Exploration
1. **Beginnen Sie mit Force-Directed** für einen ersten Überblick
2. **Verwenden Sie Hierarchical** für strukturierte Daten
3. **Nutzen Sie Circular** für gleichwertige Knoten
4. **Probieren Sie Tree** für Baumstrukturen

### Multi-Select Effizienz
1. **Box-Select** ist schneller für große Bereiche
2. **Strg+Click** ist präziser für spezifische Objekte
3. **Auswahl umkehren** ist nützlich für Ausnahmen
4. **Statistiken** helfen bei der Auswahl-Validierung

### Batch-Operationen optimal nutzen
1. **Gruppieren Sie ähnliche Objekte** vor Batch-Operationen
2. **Verwenden Sie Farben** zur visuellen Kategorisierung
3. **Nutzen Sie Ausrichtung** für saubere Layouts
4. **Testen Sie mit kleinen Auswahlen** vor großen Operationen

### Analyse-Workflows
1. **Netzwerk-Statistiken** für Gesamtüberblick
2. **Zentralitätsanalyse** für wichtige Knoten
3. **Community-Erkennung** für Gruppenstrukturen
4. **Pfadfindung** für Verbindungsanalyse

### Fehlerbehebung
1. **Seite neu laden** bei unerwarteten Problemen
2. **Browser-Konsole prüfen** (F12) für Fehlermeldungen
3. **Verschiedene Browser testen** bei Kompatibilitätsproblemen
4. **Kleinere Datensätze verwenden** bei Performance-Problemen

## 🆘 Häufige Probleme

### Problem: Layout-Algorithmus funktioniert nicht
**Lösung:** 
1. Stellen Sie sicher, dass ein Netzwerk geladen ist
2. Warten Sie, bis vorherige Animationen abgeschlossen sind
3. Versuchen Sie einen anderen Algorithmus

### Problem: Multi-Select reagiert nicht
**Lösung:**
1. Überprüfen Sie, ob Strg/Shift-Tasten richtig gedrückt werden
2. Klicken Sie auf freie Fläche, um Auswahl zu leeren
3. Laden Sie das Netzwerk neu

### Problem: Performance ist langsam
**Lösung:**
1. Aktivieren Sie Performance-Optimierungen im GUI
2. Reduzieren Sie die Anzahl sichtbarer Objekte
3. Verwenden Sie kleinere Datensätze für Tests

### Problem: Import funktioniert nicht
**Lösung:**
1. Überprüfen Sie das Dateiformat
2. Stellen Sie sicher, dass die Datei gültig ist
3. Versuchen Sie ein kleineres Beispiel

## 📞 Support & Weitere Informationen

### Technische Spezifikationen
- **Browser:** Chrome 90+, Firefox 88+, Edge 90+
- **JavaScript:** ES6+ erforderlich
- **WebGL:** WebGL 2.0 empfohlen
- **Speicher:** Mindestens 4GB RAM für große Netzwerke

### Leistungsgrenzen
- **Empfohlene Größe:** < 1000 Knoten für optimale Performance
- **Maximum getestet:** 10.000 Knoten (mit Performance-Einstellungen)
- **Speicherverbrauch:** ~50-100MB für typische Netzwerke

### Weiterentwicklung
Nodges wird kontinuierlich weiterentwickelt. Zukünftige Versionen werden enthalten:
- Erweiterte Analyse-Algorithmen
- Zusätzliche Import/Export-Formate
- Verbesserte Performance-Optimierungen
- Erweiterte Visualisierungsoptionen

---

**Viel Erfolg bei der Netzwerk-Exploration mit Nodges 0.80!** 🚀