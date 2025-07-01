# 🤖 KI-gestützte Systemvisualisierung für Nodges

## 🎯 Konzept: Reale Systeme durch KI in Nodges visualisieren

### 🌟 Vision
Eine externe KI nutzt die erweiterte `definition_json.txt` als Anleitung, um komplexe reale Systeme (Behördenabläufe, Geschäftsprozesse, Verwaltungsverfahren) in Nodges-kompatible JSON-Strukturen zu übersetzen.

## 📋 Herausforderung: Komplexe reale Systeme

### 🏛️ Beispiel: Baueingabe-Verfahren
**System-Komplexität:**
- **Verschiedene Kantone** → unterschiedliche Regelwerke
- **Bauzonen-Abhängigkeiten** → verschiedene Genehmigungsverfahren  
- **Behörden-Hierarchien** → komplexe Zuständigkeiten
- **Zeitliche Abläufe** → Reihenfolgen und Parallelverfahren
- **Bedingte Pfade** → "Wenn-Dann"-Logik

**Neue Visualisierungs-Anforderungen:**
- ⏱️ **Zeitliche Reihenfolge** (Prozess-Schritte)
- 🔀 **Bedingte Verzweigungen** (Alternative Pfade)
- ⏳ **Wartezeiten** (Bearbeitungsdauer)
- 📋 **Dokumenten-Abhängigkeiten** (Erforderliche Unterlagen)
- 🎯 **Zuständigkeiten** (Welches Amt für welchen Schritt)

## 🔧 Erweiterte definition_json.txt

### 📊 Neue Netzwerk-Typen für Systeme

<function_calls>
<invoke name="find_and_replace_code">
<parameter name="file_path">definition_json.txt