# 📁 Import/Export System - Nodges 0.78

## 🎯 Übersicht

Das neue Import/Export-System ermöglicht es Benutzern, eigene Netzwerkdaten zu laden und Visualisierungen zu exportieren. Unterstützt werden die gängigsten Netzwerk-Formate sowie Bildexport.

## 📥 Import-Funktionen

### **Unterstützte Formate**

1. **JSON** (Nodges-nativ)
2. **CSV** (Knoten und Kanten)
3. **GEXF** (Gephi Exchange Format)
4. **GraphML** (Graph Markup Language)

### **Import-Prozess**

1. **GUI öffnen**: Import/Export → 📁 Datei importieren
2. **Datei auswählen**: Unterstützte Formate werden automatisch erkannt
3. **Automatische Validierung**: Dateiformat und -größe werden geprüft
4. **Fortschrittsanzeige**: Echtzeit-Feedback während des Imports
5. **Netzwerk-Laden**: Automatische Integration in die Anwendung

### **CSV-Format Spezifikationen**

#### **Knoten-CSV**
```csv
id,name,x,y,z,color,size,type,gender,age
node1,Alice,0,0,0,#ff0000,1.2,cube,female,25
node2,Bob,5,0,0,#0000ff,1.0,sphere,male,30
```

#### **Kanten-CSV**
```csv
source,target,name,weight,color,style
node1,node2,friendship,1.0,#00ff00,solid
node2,node3,collaboration,2.0,#ffff00,dashed
```

### **GEXF-Format**
- Vollständige Unterstützung für Gephi-Dateien
- Position, Farbe, Größe werden automatisch übernommen
- Attribute werden als Metadaten importiert

### **GraphML-Format**
- Standard-GraphML-Unterstützung
- Key-Definitionen werden respektiert
- Automatische Typkonvertierung

## 📤 Export-Funktionen

### **Netzwerk-Export**

**Verfügbare Formate:**
- **JSON**: Vollständige Nodges-Kompatibilität
- **CSV**: Separate Knoten- und Kanten-Dateien
- **GEXF**: Gephi-kompatibel
- **GraphML**: Standard-Format

**Export-Optionen:**
- **Dateiname**: Frei wählbar
- **Visualisierungszustand**: Kamera-Position und Einstellungen
- **Metadaten**: Vollständige Erhaltung aller Eigenschaften

### **Visualisierungs-Export**

**PNG-Export:**
- Hochauflösende Bilder (2x Skalierung)
- Aktuelle Kamera-Ansicht
- Transparenter Hintergrund optional

## 🔧 Technische Details

### **Datei-Validierung**
- **Maximale Dateigröße**: 50MB
- **Format-Erkennung**: Automatisch über Dateiendung
- **Inhalt-Validierung**: Struktur-Prüfung vor Import

### **Fehlerbehandlung**
- **Benutzerfreundliche Meldungen**: Klare Fehlerbeschreibungen
- **Fortschritts-Feedback**: Echtzeit-Updates
- **Rollback**: Automatische Wiederherstellung bei Fehlern

### **Performance-Optimierung**
- **Streaming-Import**: Große Dateien werden schrittweise geladen
- **Speicher-Management**: Effiziente Ressourcen-Nutzung
- **Batch-Processing**: Optimierte Verarbeitung großer Netzwerke

## 📋 Verwendung

### **Import durchführen**

1. **Datei vorbereiten**:
   ```csv
   # Beispiel nodes.csv
   id,name,x,y,z,color
   1,Node A,0,0,0,#ff0000
   2,Node B,5,0,0,#00ff00
   3,Node C,2.5,5,0,#0000ff
   ```

2. **Import starten**:
   - GUI: Import/Export → 📁 Datei importieren
   - Datei auswählen und bestätigen
   - Warten auf Abschluss

3. **Ergebnis prüfen**:
   - Netzwerk wird automatisch geladen
   - Dateiinfo-Panel zeigt Details
   - Alle Features sind verfügbar

### **Export durchführen**

1. **Format wählen**:
   - JSON: Vollständige Kompatibilität
   - CSV: Für Tabellenkalkulation
   - GEXF: Für Gephi
   - GraphML: Für andere Tools

2. **Optionen setzen**:
   - Dateiname eingeben
   - Visualisierungszustand optional
   - Export starten

3. **Download**:
   - Automatischer Download
   - Datei im gewählten Format
   - Erfolgs-Bestätigung

## 🚀 Erweiterte Features

### **Batch-Import**
- Mehrere Dateien gleichzeitig
- Automatische Zusammenführung
- Konflikt-Auflösung

### **Format-Konvertierung**
- Import in einem Format
- Export in anderem Format
- Verlustfreie Konvertierung

### **Metadaten-Erhaltung**
- Alle Eigenschaften bleiben erhalten
- Benutzerdefinierte Attribute
- Vollständige Rückverfolgbarkeit

## 🔍 Troubleshooting

### **Häufige Probleme**

**Import schlägt fehl:**
- Dateiformat prüfen
- Dateigröße reduzieren
- CSV-Struktur validieren

**Export funktioniert nicht:**
- Browser-Berechtigungen prüfen
- Popup-Blocker deaktivieren
- Speicherplatz verfügbar?

**Performance-Probleme:**
- Große Dateien in kleinere aufteilen
- Unnötige Metadaten entfernen
- Browser-Cache leeren

### **Unterstützung**

Bei Problemen:
1. Browser-Konsole prüfen
2. Dateiformat validieren
3. Beispiel-Dateien verwenden
4. Dokumentation konsultieren

## 📊 Beispiel-Workflows

### **Workflow 1: CSV → Nodges → GEXF**
1. CSV-Daten vorbereiten
2. In Nodges importieren
3. Visualisierung anpassen
4. Als GEXF für Gephi exportieren

### **Workflow 2: GraphML → Nodges → PNG**
1. GraphML aus anderem Tool
2. In Nodges importieren
3. 3D-Visualisierung erstellen
4. Hochauflösendes Bild exportieren

### **Workflow 3: Datenanalyse**
1. Rohdaten als CSV importieren
2. Netzwerkanalyse durchführen
3. Ergebnisse als JSON exportieren
4. Backup für spätere Verwendung

---

**Das Import/Export-System macht Nodges 0.78 zu einem vollwertigen Netzwerk-Analyse-Tool, das nahtlos mit anderen Anwendungen zusammenarbeitet!** 🚀