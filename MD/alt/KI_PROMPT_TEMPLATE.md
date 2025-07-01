# 🤖 KI-Prompt-Template für Systemvisualisierung

## 📋 Template für externe KI (GPT-4, Claude, etc.)

### 🎯 System-Prompt für KI

```
Du bist ein Experte für die Visualisierung komplexer Systeme und Prozesse. 
Deine Aufgabe ist es, reale Systeme (Behördenabläufe, Geschäftsprozesse, 
Verwaltungsverfahren) in Nodges-kompatible JSON-Strukturen zu übersetzen.

WICHTIG: Du MUSST dich strikt an die Regeln in der definition_json.txt halten.

GRUNDSTRUKTUR:
{
  "metadata": {
    "title": "Titel des Systems",
    "description": "Beschreibung des visualisierten Systems", 
    "type": "process"
  },
  "nodes": [...],
  "edges": [...]
}

KOORDINATEN-SYSTEM für Typ "process":
- X-Achse: Zeitlicher Ablauf (früher = niedrigere X-Werte)
- Y-Achse: Hierarchie/Zuständigkeit (höher = höhere Y-Werte)  
- Z-Achse: Parallele/Alternative Pfade (Hauptpfad z=0, Alternativen z=±3)

NODE-TYPEN:
- authority (Behörden): "cube", Farbe 0x0066cc (blau)
- document (Dokumente): "cylinder", Farbe 0xffcc00 (gelb)
- decision (Entscheidungen): "octahedron", Farbe 0xff3300 (rot)
- process (Prozessschritte): "sphere", Farbe 0x00cc66 (grün)

EDGE-TYPEN:
- sequence: 0x0066ff (blau) - zeitliche Abfolge
- dependency: 0xff9900 (orange) - Abhängigkeiten
- approval: 0x00cc00 (grün) - Genehmigungsschritte
- rejection: 0xff0000 (rot) - Ablehnungspfade
- alternative: 0x999999 (grau) - alternative Pfade

REGELN:
- Knotenabstand: 5 Einheiten zwischen Knoten
- Y-Koordinaten: Alle > -0.81
- Symmetrische Anordnung um 0,0,0
- Offset für mehrere Edges zwischen gleichen Knoten
```

### 🎯 Benutzer-Prompt-Template

```
Erstelle eine Nodges-JSON-Visualisierung für folgendes System:

SYSTEM: [SYSTEM_BESCHREIBUNG]
KONTEXT: [SPEZIFISCHER_KONTEXT]
BESONDERHEITEN: [SPEZIELLE_ANFORDERUNGEN]

Berücksichtige dabei:
- Alle beteiligten Akteure (Behörden, Personen, Systeme)
- Zeitliche Abläufe und Reihenfolgen
- Bedingte Verzweigungen und alternative Pfade
- Erforderliche Dokumente und Abhängigkeiten
- Zuständigkeiten und Hierarchien

Ausgabe: Vollständiges JSON gemäß definition_json.txt
```

## 📊 Beispiel-Prompts für verschiedene Systeme

### 🏛️ Behörden-Verfahren

#### Baueingabe Kanton Zürich
```
Erstelle eine Nodges-JSON-Visualisierung für folgendes System:

SYSTEM: Baueingabe-Verfahren für Neubauten in Wohnzonen
KONTEXT: Kanton Zürich, Gemeinde mit 10.000 Einwohnern
BESONDERHEITEN: 
- Verschiedene Fachstellen je nach Bauvorhaben
- Mögliche Rekursverfahren
- Parallele Prüfungen durch verschiedene Ämter

Berücksichtige:
- Antragsteller und erforderliche Dokumente
- Gemeinde-Eingangsprüfung und Vollständigkeitskontrolle
- Fachstellen: Denkmalpflege, Umweltamt, Tiefbauamt
- Bewilligungsentscheid mit Genehmigungs-/Ablehnungspfaden
- Rekursmöglichkeiten bei Ablehnung
- Typische Bearbeitungszeiten (5-45 Tage je Schritt)

Ausgabe: Vollständiges JSON gemäß definition_json.txt
```

#### Einbürgerungsverfahren
```
Erstelle eine Nodges-JSON-Visualisierung für folgendes System:

SYSTEM: Ordentliches Einbürgerungsverfahren Schweiz
KONTEXT: Ausländische Person mit 10 Jahren Aufenthalt
BESONDERHEITEN:
- Drei Staatsebenen: Bund, Kanton, Gemeinde
- Verschiedene Prüfungen und Tests
- Lange Verfahrensdauer (1-3 Jahre)

Berücksichtige:
- Antragstellung bei der Gemeinde
- Erforderliche Dokumente (Leumundszeugnis, Sprachnachweis, etc.)
- Gemeinde-Prüfung (Integration, Kenntnisse)
- Kantonale Prüfung (Staatskundekenntnisse)
- Bundesprüfung (Sicherheitsabklärung)
- Mögliche Ablehnungen auf jeder Ebene
- Einsprache- und Rekursmöglichkeiten

Ausgabe: Vollständiges JSON gemäß definition_json.txt
```

### 🏢 Geschäftsprozesse

#### Software-Entwicklungsprozess
```
Erstelle eine Nodges-JSON-Visualisierung für folgendes System:

SYSTEM: Agiler Software-Entwicklungsprozess (Scrum)
KONTEXT: Tech-Startup mit 15 Entwicklern, 2-Wochen-Sprints
BESONDERHEITEN:
- Iterative Entwicklung mit festen Rollen
- Verschiedene Meetings und Deliverables
- Kontinuierliche Integration und Deployment

Berücksichtige:
- Rollen: Product Owner, Scrum Master, Development Team
- Sprint-Phasen: Planning, Daily Standups, Review, Retrospective
- Artefakte: Product Backlog, Sprint Backlog, Increment
- Entwicklungsschritte: Coding, Testing, Code Review, Deployment
- Feedback-Schleifen und Iterationen
- Qualitätssicherung und Bug-Fixing

Ausgabe: Vollständiges JSON gemäß definition_json.txt
```

#### Recruiting-Prozess
```
Erstelle eine Nodges-JSON-Visualisierung für folgendes System:

SYSTEM: Recruiting-Prozess für Software-Entwickler
KONTEXT: Mittelständisches Unternehmen, 200 Mitarbeiter
BESONDERHEITEN:
- Mehrstufiger Auswahlprozess
- Verschiedene Stakeholder involviert
- Technische und kulturelle Bewertung

Berücksichtige:
- Stellenausschreibung und Bewerbungseingang
- HR-Vorauswahl und CV-Screening
- Telefonisches Erstgespräch
- Technisches Assessment/Coding Challenge
- Persönliches Interview mit Team
- Gespräch mit Führungskraft
- Referenz-Checks und Vertragsverhandlung
- Onboarding-Prozess
- Ablehnungspfade auf jeder Stufe

Ausgabe: Vollständiges JSON gemäß definition_json.txt
```

### 🏥 Gesundheitswesen

#### Patientenaufnahme Krankenhaus
```
Erstelle eine Nodges-JSON-Visualisierung für folgendes System:

SYSTEM: Notfall-Patientenaufnahme im Krankenhaus
KONTEXT: Universitätsklinikum mit 800 Betten
BESONDERHEITEN:
- Triage-System nach Dringlichkeit
- Verschiedene Fachbereiche
- Dokumentationspflichten

Berücksichtige:
- Patientenankunft (Notfall, Einweisung, geplant)
- Triage und Ersteinschätzung
- Anmeldung und Datenerfassung
- Ärztliche Erstuntersuchung
- Diagnostik (Labor, Röntgen, etc.)
- Fachärztliche Konsultation
- Behandlungsentscheidung
- Stationäre Aufnahme oder Entlassung
- Verschiedene Dringlichkeitsstufen

Ausgabe: Vollständiges JSON gemäß definition_json.txt
```

## 🔧 KI-Integration in Nodges

### 📱 GUI-Erweiterung für KI-Prompts

```javascript
// Neue GUI-Sektion in main.js
const aiSystemGenerator = {
    systemDescription: '',
    systemType: 'government', // government, business, healthcare, education
    jurisdiction: 'Schweiz',
    complexity: 'medium', // low, medium, high
    generatePrompt: function() {
        const prompt = this.buildSystemPrompt();
        navigator.clipboard.writeText(prompt);
        alert('Prompt in Zwischenablage kopiert!\n\nJetzt in externe KI einfügen (ChatGPT, Claude, etc.)');
    },
    
    buildSystemPrompt: function() {
        const basePrompt = `Erstelle eine Nodges-JSON-Visualisierung für folgendes System:

SYSTEM: ${this.systemDescription}
KONTEXT: ${this.jurisdiction}, Komplexität: ${this.complexity}
TYP: ${this.systemType}

Berücksichtige dabei:
- Alle beteiligten Akteure und Stakeholder
- Zeitliche Abläufe und Reihenfolgen  
- Bedingte Verzweigungen und alternative Pfade
- Erforderliche Dokumente und Abhängigkeiten
- Zuständigkeiten und Hierarchien
- Typische Bearbeitungszeiten

Ausgabe: Vollständiges JSON gemäß definition_json.txt für Typ "process"`;

        return basePrompt;
    },
    
    pasteAndLoad: function() {
        navigator.clipboard.readText().then(text => {
            try {
                const jsonData = JSON.parse(text);
                if (this.validateSystemJSON(jsonData)) {
                    loadNetworkFromImportedData(jsonData, 'KI-generiertes System');
                    alert('System erfolgreich geladen!');
                } else {
                    alert('Ungültiges JSON-Format. Bitte prüfen Sie die Struktur.');
                }
            } catch (error) {
                alert('Fehler beim Parsen des JSON: ' + error.message);
            }
        });
    },
    
    validateSystemJSON: function(json) {
        return json.metadata && 
               json.metadata.type === 'process' &&
               json.nodes && Array.isArray(json.nodes) &&
               json.edges && Array.isArray(json.edges);
    }
};

// GUI-Integration
const aiSystemFolder = gui.addFolder('🤖 KI-System-Generator');
aiSystemFolder.add(aiSystemGenerator, 'systemDescription').name('📝 System-Beschreibung');
aiSystemFolder.add(aiSystemGenerator, 'systemType', ['government', 'business', 'healthcare', 'education']).name('🎯 System-Typ');
aiSystemFolder.add(aiSystemGenerator, 'jurisdiction').name('🌍 Zuständigkeitsbereich');
aiSystemFolder.add(aiSystemGenerator, 'complexity', ['low', 'medium', 'high']).name('📊 Komplexität');
aiSystemFolder.add(aiSystemGenerator, 'generatePrompt').name('📋 Prompt generieren');
aiSystemFolder.add(aiSystemGenerator, 'pasteAndLoad').name('📥 JSON einfügen & laden');
```

## 🎯 Workflow für Benutzer

### 📋 Schritt-für-Schritt Anleitung

1. **🤖 KI-System-Generator öffnen** (rechtes GUI-Panel)
2. **📝 System beschreiben** (z.B. "Baueingabe-Verfahren Kanton Zürich")
3. **🎯 System-Typ wählen** (government, business, healthcare, education)
4. **🌍 Zuständigkeitsbereich angeben** (z.B. "Schweiz", "Deutschland", "EU")
5. **📊 Komplexität wählen** (low, medium, high)
6. **📋 "Prompt generieren" klicken** → Prompt wird in Zwischenablage kopiert
7. **🤖 Externe KI öffnen** (ChatGPT, Claude, Bard, etc.)
8. **📝 Prompt einfügen** und an KI senden
9. **⏳ Warten** auf KI-Antwort (30-60 Sekunden)
10. **📋 JSON kopieren** aus KI-Antwort
11. **📥 "JSON einfügen & laden"** in Nodges klicken
12. **✅ System betrachten** (automatisch geladen und visualisiert)

## 🌟 Erweiterte Möglichkeiten

### 🔄 Iterative Verbesserung
```
Benutzer → KI-Prompt → JSON → Nodges → Feedback → Verbesserter Prompt → Besseres JSON
```

### 📊 Template-Bibliothek
- Sammlung bewährter Prompts für häufige Systeme
- Community-geteilte Templates
- Branchen-spezifische Vorlagen

### 🎯 Spezialisierte KI-Modelle
- Training auf Behörden-Strukturen
- Fachbereich-spezifische Modelle
- Mehrsprachige Unterstützung

---

## 🎉 Nutzen für verschiedene Bereiche

### 🏛️ Öffentliche Verwaltung
- **Transparenz:** Bürger verstehen Behördenabläufe
- **Optimierung:** Prozesse visualisieren und verbessern
- **Schulung:** Neue Mitarbeiter schneller einarbeiten

### 🏢 Unternehmen
- **Prozess-Dokumentation:** Geschäftsabläufe visualisieren
- **Compliance:** Regelkonformität sicherstellen
- **Optimierung:** Engpässe und Ineffizienzen identifizieren

### 🎓 Bildung
- **Lehrmaterial:** Komplexe Systeme verständlich machen
- **Forschung:** Systemanalyse und -vergleich
- **Simulation:** "Was-wäre-wenn"-Szenarien durchspielen

### 🔬 Forschung
- **Systemanalyse:** Komplexe Zusammenhänge verstehen
- **Vergleichsstudien:** Verschiedene Ansätze gegenüberstellen
- **Publikationen:** Forschungsergebnisse visualisieren

**🚀 Vision:** Jedes komplexe reale System kann durch KI-Unterstützung in wenigen Minuten als interaktive 3D-Visualisierung in Nodges dargestellt werden!