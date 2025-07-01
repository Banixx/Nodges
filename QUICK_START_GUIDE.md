# ⚡ Nodges 0.80 - Quick Start Guide

## 🚀 In 5 Minuten startklar!

Dieser Guide bringt Sie in wenigen Minuten von der Installation zur ersten Netzwerk-Visualisierung.

## 📋 Inhaltsverzeichnis

1. [Schnellstart-Checkliste](#-schnellstart-checkliste)
2. [Server starten](#-schritt-1-server-starten-1-minute)
3. [Anwendung öffnen](#-schritt-2-anwendung-öffnen-30-sekunden)
4. [Netzwerk laden](#-schritt-3-erstes-netzwerk-laden-30-sekunden)
5. [Layout testen](#-schritt-4-layout-algorithmus-testen-1-minute)
6. [Multi-Select](#-schritt-5-multi-select-ausprobieren-1-minute)
7. [Batch-Operationen](#-schritt-6-batch-operation-durchführen-1-minute)
8. [Nächste Schritte](#-nächste-schritte)

## 📋 Schnellstart-Checkliste

- [ ] **Server starten** (1 Minute)
- [ ] **Anwendung öffnen** (30 Sekunden)
- [ ] **Erstes Netzwerk laden** (30 Sekunden)
- [ ] **Layout-Algorithmus testen** (1 Minute)
- [ ] **Multi-Select ausprobieren** (1 Minute)
- [ ] **Batch-Operation durchführen** (1 Minute)

## 🎯 Schritt 1: Server starten (1 Minute)

### Option A: Python (Empfohlen)
```bash
# Terminal/Kommandozeile öffnen
cd /pfad/zu/nodges

# Python-Server starten
python3 -m http.server 8080
```

### Option B: Node.js
```bash
# Falls Node.js installiert ist
npx http-server -p 8080
```

### ✅ Erfolgskontrolle
Sie sollten sehen: `Serving HTTP on 0.0.0.0 port 8080`

## 🌐 Schritt 2: Anwendung öffnen (30 Sekunden)

1. **Browser öffnen** (Chrome, Firefox, oder Edge)
2. **URL eingeben:** `http://localhost:8080`
3. **Enter drücken**

### ✅ Erfolgskontrolle
- 3D-Szene mit Netzwerk ist sichtbar
- Linkes Bedienfeld mit Buttons
- Rechtes GUI-Panel
- Keine Fehlermeldungen

## 📊 Schritt 3: Erstes Netzwerk laden (30 Sekunden)

1. **Klicken Sie auf "Mittleres Netzwerk"** (linkes Bedienfeld)
2. **Warten Sie 2-3 Sekunden** bis das Netzwerk lädt
3. **Navigieren Sie mit der Maus:**
   - **Drehen:** Linke Maustaste + Ziehen
   - **Zoomen:** Mausrad
   - **Verschieben:** Rechte Maustaste + Ziehen

### ✅ Erfolgskontrolle
- 12 Knoten und 20 Kanten sind sichtbar
- Dateiinfo-Panel zeigt korrekte Zahlen
- Navigation funktioniert flüssig

## 🎨 Schritt 4: Layout-Algorithmus testen (1 Minute)

1. **Klicken Sie auf "🎯 Layout Algorithmen"** (orange Button)
2. **Layout-Panel öffnet sich**
3. **Wählen Sie "Circular"** aus der Liste
4. **Beobachten Sie die 2-Sekunden-Animation**
5. **Probieren Sie "Grid"** für einen anderen Effekt

### 🎯 Layout-Algorithmus Vergleich

| Algorithmus | Anordnung | Geeignet für | Animationsdauer |
|-------------|-----------|--------------|-----------------|
| **Circular** | Kreisförmig | Gleichwertige Knoten | 2 Sekunden |
| **Grid** | Rasterförmig | Systematische Anordnung | 2 Sekunden |
| **Force-Directed** | Organisch | Allgemeine Netzwerke | 2 Sekunden |
| **Hierarchical** | Ebenen-basiert | Hierarchische Daten | 2 Sekunden |

### ✅ Erfolgskontrolle
- Knoten bewegen sich smooth zu neuen Positionen
- Circular: Knoten bilden einen Kreis
- Grid: Knoten ordnen sich in einem Raster an
- Alle Animationen dauern genau 2 Sekunden

## 🎯 Schritt 5: Multi-Select ausprobieren (1 Minute)

1. **Halten Sie Strg gedrückt**
2. **Klicken Sie auf 3-4 verschiedene Knoten**
3. **Grüne Auswahlboxen** sollten erscheinen
4. **Öffnen Sie "Auswahl & Batch"** im rechten GUI-Panel
5. **Prüfen Sie die Auswahl-Info** (sollte Ihre Auswahl zeigen)

### Alternative: Box-Select
1. **Halten Sie Shift gedrückt**
2. **Ziehen Sie ein Rechteck** um mehrere Knoten
3. **Alle eingeschlossenen Knoten** werden ausgewählt

### ✅ Erfolgskontrolle
- Grüne, semi-transparente Boxen um ausgewählte Knoten
- Live-Zähler im GUI zeigt korrekte Anzahl
- Auswahl-Info zeigt Details

## 🔄 Schritt 6: Batch-Operation durchführen (1 Minute)

1. **Stellen Sie sicher, dass mehrere Knoten ausgewählt sind**
2. **Öffnen Sie "🎨 Batch-Farbe"** im GUI
3. **Klicken Sie auf den Farbwähler** (standardmäßig rot)
4. **Wählen Sie eine neue Farbe** (z.B. blau)
5. **Klicken Sie "Farbe anwenden"**
6. **Alle ausgewählten Knoten** ändern ihre Farbe!

### ✅ Erfolgskontrolle
- Alle ausgewählten Knoten haben die neue Farbe
- Nicht-ausgewählte Knoten behalten ihre ursprüngliche Farbe
- Änderung ist sofort sichtbar

## 🎉 Herzlichen Glückwunsch!

Sie haben erfolgreich:
- ✅ Nodges 0.80 gestartet
- ✅ Ein Netzwerk geladen
- ✅ Layout-Algorithmen verwendet
- ✅ Multi-Select gemeistert
- ✅ Batch-Operationen durchgeführt

## 🚀 Nächste Schritte

### 📚 Mehr lernen
- **[USER_MANUAL.md](USER_MANUAL.md)** - Vollständiges Handbuch
- **[FEATURE_OVERVIEW.md](FEATURE_OVERVIEW.md)** - Alle Features im Detail
- **[INSTALLATION_SETUP_GUIDE.md](INSTALLATION_SETUP_GUIDE.md)** - Erweiterte Installation

### 🧪 Weitere Experimente
1. **Probieren Sie alle 8 Layout-Algorithmen**
2. **Laden Sie das "Mega Netzwerk" für Performance-Tests**
3. **Testen Sie die Suchfunktion** (linkes Bedienfeld)
4. **Erkunden Sie die Netzwerk-Analyse-Tools**
5. **Importieren Sie eigene Daten**

### 🎯 Erweiterte Features entdecken
- **Pfadfindung** zwischen Knoten
- **Community-Erkennung** für Cluster
- **Netzwerk-Statistiken** für Analysen
- **Import/Export** für eigene Daten
- **Performance-Monitoring** für große Netzwerke

## 🆘 Probleme?

### Häufige Lösungen
- **Seite lädt nicht:** Prüfen Sie, ob der Server läuft
- **Keine 3D-Szene:** Aktualisieren Sie Ihren Browser
- **Layout funktioniert nicht:** Warten Sie, bis Animationen abgeschlossen sind
- **Multi-Select reagiert nicht:** Stellen Sie sicher, dass Strg/Shift gedrückt ist

### Weitere Hilfe
- **F12 drücken** → Console Tab → Fehlermeldungen prüfen
- **Anderen Browser testen** (Chrome empfohlen)
- **Seite neu laden** (Strg+F5)

## 💡 Pro-Tipps

1. **Beginnen Sie immer mit "Force-Directed"** für einen natürlichen Überblick
2. **Verwenden Sie "Hierarchical"** für strukturierte Daten
3. **Box-Select ist schneller** für große Bereiche
4. **F1 drücken** zeigt alle Tastaturkürzel
5. **Performance-Einstellungen** anpassen für große Netzwerke

---

**🎯 Sie sind jetzt bereit für professionelle Netzwerk-Visualisierung mit Nodges 0.80!**

**Viel Spaß beim Erkunden Ihrer Daten!** 🚀