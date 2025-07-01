/**
 * KI-System-Generator für Nodges 0.80
 * Ermöglicht die Generierung von Systemvisualisierungen durch externe KI
 */

export class AISystemGenerator {
    constructor(loadNetworkFromImportedData) {
        this.loadNetworkFromImportedData = loadNetworkFromImportedData;
        this.settings = {
            systemDescription: '',
            systemType: 'government', // government, business, healthcare, education
            jurisdiction: 'Schweiz',
            complexity: 'medium', // low, medium, high
            generationStatus: 'Bereit',
            lastGenerated: null
        };
    }

    /**
     * Generiert einen KI-Prompt basierend auf den aktuellen Einstellungen
     */
    generatePrompt() {
        if (!this.settings.systemDescription.trim()) {
            alert('Bitte geben Sie eine System-Beschreibung ein!');
            return;
        }
        
        const prompt = this.buildSystemPrompt();
        
        // Kopiere Prompt in Zwischenablage
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(prompt).then(() => {
                alert('✅ Prompt in Zwischenablage kopiert!\n\nJetzt in externe KI einfügen (ChatGPT, Claude, etc.) und JSON zurückkopieren.');
                this.settings.generationStatus = 'Prompt kopiert - Warte auf KI...';
            }).catch(err => {
                console.error('Fehler beim Kopieren:', err);
                this.showPromptDialog(prompt);
            });
        } else {
            // Fallback für ältere Browser
            this.showPromptDialog(prompt);
        }
    }

    /**
     * Erstellt den vollständigen System-Prompt für die KI
     */
    buildSystemPrompt() {
        const systemTypeDescriptions = {
            government: 'Behörden-/Verwaltungsverfahren',
            business: 'Geschäftsprozess',
            healthcare: 'Gesundheitswesen-Prozess',
            education: 'Bildungs-/Lernprozess'
        };
        
        const complexityDescriptions = {
            low: 'Einfach (5-10 Schritte)',
            medium: 'Mittel (10-20 Schritte)', 
            high: 'Komplex (20+ Schritte)'
        };
        
        const basePrompt = `Du bist ein Experte für die Visualisierung komplexer Systeme und Prozesse. 
Deine Aufgabe ist es, reale Systeme in Nodges-kompatible JSON-Strukturen zu übersetzen.

WICHTIG: Du MUSST dich strikt an die Regeln halten.

SYSTEM-ANFRAGE:
System: ${this.settings.systemDescription}
Typ: ${systemTypeDescriptions[this.settings.systemType]}
Kontext: ${this.settings.jurisdiction}
Komplexität: ${complexityDescriptions[this.settings.complexity]}

AUSGABE-FORMAT:
Erstelle ein vollständiges JSON mit folgender Struktur:

{
  "metadata": {
    "title": "Titel des Systems",
    "description": "Beschreibung des visualisierten Systems", 
    "type": "process",
    "jurisdiction": "${this.settings.jurisdiction}",
    "complexity": "${this.settings.complexity}"
  },
  "nodes": [
    {
      "id": "eindeutige_id",
      "name": "Anzeigename",
      "position": {"x": 0, "y": 5, "z": 0},
      "metadata": {
        "nodeType": "authority|document|decision|process",
        "type": "cube|cylinder|octahedron|sphere",
        "color": "0x0066cc|0xffcc00|0xff3300|0x00cc66",
        "duration": 0,
        "jurisdiction": "Zuständigkeitsbereich",
        "requirements": []
      }
    }
  ],
  "edges": [
    {
      "source": "start_id",
      "target": "end_id", 
      "type": "sequence|dependency|approval|rejection|alternative",
      "offset": 0,
      "condition": "Bedingung für diese Verbindung",
      "probability": 1.0,
      "duration": 0
    }
  ]
}

KOORDINATEN-SYSTEM für Typ "process":
- X-Achse: Zeitlicher Ablauf (früher = niedrigere X-Werte, Abstand 5 Einheiten)
- Y-Achse: Hierarchie/Zuständigkeit (höher = höhere Y-Werte, alle > -0.81)  
- Z-Achse: Parallele/Alternative Pfade (Hauptpfad z=0, Alternativen z=±3)

NODE-TYPEN:
- authority (Behörden): "cube", Farbe 0x0066cc (blau)
- document (Dokumente): "cylinder", Farbe 0xffcc00 (gelb)
- decision (Entscheidungen): "octahedron", Farbe 0xff3300 (rot)
- process (Prozessschritte): "sphere", Farbe 0x00cc66 (grün)

EDGE-TYPEN:
- sequence: Zeitliche Abfolge (blau)
- dependency: Abhängigkeiten (orange) 
- approval: Genehmigungsschritte (grün)
- rejection: Ablehnungspfade (rot)
- alternative: Alternative Pfade (grau)

REGELN:
- Knotenabstand: 5 Einheiten zwischen Knoten
- Y-Koordinaten: Alle > -0.81
- Symmetrische Anordnung um 0,0,0
- Offset für mehrere Edges zwischen gleichen Knoten
- Realistische Zeitdauern und Wahrscheinlichkeiten

Berücksichtige dabei:
- Alle beteiligten Akteure (Behörden, Personen, Systeme)
- Zeitliche Abläufe und Reihenfolgen
- Bedingte Verzweigungen und alternative Pfade
- Erforderliche Dokumente und Abhängigkeiten
- Zuständigkeiten und Hierarchien
- Typische Bearbeitungszeiten

Ausgabe: Nur das vollständige JSON, keine zusätzlichen Erklärungen.`;

        return basePrompt;
    }

    /**
     * Zeigt den Prompt in einem Dialog an (Fallback)
     */
    showPromptDialog(prompt) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 20px; border: 2px solid #333; border-radius: 10px;
            max-width: 80%; max-height: 80%; overflow: auto; z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        dialog.innerHTML = `
            <h3>🤖 KI-Prompt für ${this.settings.systemDescription}</h3>
            <p>Kopieren Sie diesen Prompt und fügen Sie ihn in ChatGPT, Claude oder eine andere KI ein:</p>
            <textarea readonly style="width: 100%; height: 300px; font-family: monospace; font-size: 12px;">${prompt}</textarea>
            <br><br>
            <button onclick="navigator.clipboard.writeText(\`${prompt.replace(/`/g, '\\`')}\`).then(() => alert('Prompt kopiert!')).catch(() => alert('Manuell kopieren')); this.parentElement.remove();">📋 Kopieren</button>
            <button onclick="this.parentElement.remove();">❌ Schließen</button>
        `;
        
        document.body.appendChild(dialog);
        this.settings.generationStatus = 'Prompt angezeigt - Warte auf KI...';
    }

    /**
     * Verarbeitet die KI-Antwort und lädt das generierte Netzwerk
     */
    pasteAndLoad() {
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
                this.processKIResponse(text);
            }).catch(err => {
                console.error('Fehler beim Lesen der Zwischenablage:', err);
                const text = prompt('Fügen Sie das KI-generierte JSON hier ein:');
                if (text) {
                    this.processKIResponse(text);
                }
            });
        } else {
            // Fallback für ältere Browser
            const text = prompt('Fügen Sie das KI-generierte JSON hier ein:');
            if (text) {
                this.processKIResponse(text);
            }
        }
    }

    /**
     * Verarbeitet die KI-Antwort und extrahiert das JSON
     */
    processKIResponse(text) {
        try {
            this.settings.generationStatus = 'Verarbeite KI-Antwort...';
            
            // Extrahiere JSON aus der KI-Antwort (falls in Markdown-Code-Block)
            let jsonText = text.trim();
            
            // Entferne Markdown-Code-Blöcke
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            // Parse JSON
            const jsonData = JSON.parse(jsonText);
            
            // Validiere JSON-Struktur
            if (this.validateSystemJSON(jsonData)) {
                // Lade das Netzwerk
                this.loadNetworkFromImportedData(jsonData, `KI: ${this.settings.systemDescription}`);
                this.settings.generationStatus = 'Erfolgreich generiert!';
                this.settings.lastGenerated = new Date().toLocaleTimeString();
                alert('✅ System erfolgreich generiert und geladen!');
            } else {
                this.settings.generationStatus = 'Fehler: Ungültiges JSON-Format';
                alert('❌ Ungültiges JSON-Format. Bitte prüfen Sie die Struktur.');
            }
        } catch (error) {
            this.settings.generationStatus = 'Fehler: ' + error.message;
            alert('❌ Fehler beim Verarbeiten des JSON: ' + error.message);
            console.error('JSON Parse Error:', error);
        }
    }

    /**
     * Validiert die JSON-Struktur für Nodges-Kompatibilität
     */
    validateSystemJSON(json) {
        // Grundstruktur prüfen
        if (!json.metadata || !json.nodes || !json.edges) {
            console.error('Fehlende Grundstruktur');
            return false;
        }
        
        // Metadata prüfen
        if (json.metadata.type !== 'process') {
            console.error('Falscher Typ, erwartet "process"');
            return false;
        }
        
        // Nodes prüfen
        if (!Array.isArray(json.nodes) || json.nodes.length === 0) {
            console.error('Keine gültigen Nodes');
            return false;
        }
        
        // Edges prüfen
        if (!Array.isArray(json.edges)) {
            console.error('Keine gültigen Edges');
            return false;
        }
        
        // Node-Struktur prüfen
        for (const node of json.nodes) {
            if (!node.id || !node.name || !node.position || !node.metadata) {
                console.error('Ungültige Node-Struktur:', node);
                return false;
            }
            
            if (node.position.x === undefined || node.position.y === undefined || node.position.z === undefined) {
                console.error('Ungültige Position:', node.position);
                return false;
            }
            
            if (node.position.y <= -0.81) {
                console.error('Y-Koordinate zu niedrig:', node.position.y);
                return false;
            }
        }
        
        // Edge-Struktur prüfen
        for (const edge of json.edges) {
            if (!edge.source || !edge.target || !edge.type) {
                console.error('Ungültige Edge-Struktur:', edge);
                return false;
            }
            
            // Prüfe ob Source und Target Nodes existieren
            const sourceExists = json.nodes.some(n => n.id === edge.source);
            const targetExists = json.nodes.some(n => n.id === edge.target);
            
            if (!sourceExists || !targetExists) {
                console.error('Edge referenziert nicht-existierende Nodes:', edge);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Zeigt Beispiele für den gewählten System-Typ
     */
    showExamples() {
        const examples = this.getExamplesForType(this.settings.systemType);
        const exampleText = `Beispiele für ${this.settings.systemType}:\n\n${examples.join('\n\n')}`;
        alert(exampleText);
    }

    /**
     * Gibt Beispiele für verschiedene System-Typen zurück
     */
    getExamplesForType(type) {
        const examples = {
            government: [
                '🏛️ Baueingabe-Verfahren Kanton Zürich für Neubauten in Wohnzonen',
                '🏛️ Einbürgerungsverfahren Schweiz für ordentliche Einbürgerung',
                '🏛️ Steuererklärung-Prozess mit Prüfung und Veranlagung',
                '🏛️ Führerschein-Antrag mit Theorie- und Praxisprüfung'
            ],
            business: [
                '🏢 Software-Entwicklungsprozess mit Scrum-Methodik',
                '🏢 Recruiting-Prozess für Software-Entwickler',
                '🏢 Kundenservice-Workflow für Beschwerdebearbeitung',
                '🏢 Produktentwicklung von Idee bis Markteinführung'
            ],
            healthcare: [
                '🏥 Notfall-Patientenaufnahme im Krankenhaus',
                '🏥 Operationsplanung und -durchführung',
                '🏥 Medikamenten-Zulassungsverfahren',
                '🏥 Impfkampagne-Organisation und -durchführung'
            ],
            education: [
                '🎓 Universitäts-Bewerbungsverfahren',
                '🎓 Prüfungsorganisation und -durchführung',
                '🎓 Forschungsprojekt von Antrag bis Publikation',
                '🎓 Online-Kurs-Entwicklung und -bereitstellung'
            ]
        };
        return examples[type] || [];
    }

    /**
     * Lädt das vordefinierte US-Politiksystem
     */
    loadUSPoliticalSystem() {
        fetch('./us_political_system.json')
            .then(response => response.json())
            .then(data => {
                this.loadNetworkFromImportedData(data, 'US Political System');
                this.settings.generationStatus = 'US-Politiksystem geladen';
                this.settings.lastGenerated = new Date().toLocaleTimeString();
                alert('✅ US-Politiksystem erfolgreich geladen!');
            })
            .catch(error => {
                console.error('Fehler beim Laden des US-Politiksystems:', error);
                alert('❌ Fehler beim Laden des US-Politiksystems');
            });
    }

    /**
     * Lädt das vordefinierte Baueingabe-Beispiel
     */
    loadBaueingabeExample() {
        fetch('./EXAMPLE_BAUEINGABE_SYSTEM.json')
            .then(response => response.json())
            .then(data => {
                this.loadNetworkFromImportedData(data, 'Baueingabe Kanton Zürich');
                this.settings.generationStatus = 'Baueingabe-Beispiel geladen';
                this.settings.lastGenerated = new Date().toLocaleTimeString();
                alert('✅ Baueingabe-Beispiel erfolgreich geladen!');
            })
            .catch(error => {
                console.error('Fehler beim Laden des Baueingabe-Beispiels:', error);
                alert('❌ Fehler beim Laden des Baueingabe-Beispiels');
            });
    }

    /**
     * Erstellt die GUI-Integration für lil-gui
     */
    createGUIIntegration(gui) {
        // Haupt-Ordner für KI-System-Generator
        const aiSystemFolder = gui.addFolder('🤖 KI-System-Generator');
        
        // Eingabe-Felder
        aiSystemFolder.add(this.settings, 'systemDescription').name('📝 System-Beschreibung');
        aiSystemFolder.add(this.settings, 'systemType', ['government', 'business', 'healthcare', 'education']).name('🎯 System-Typ');
        aiSystemFolder.add(this.settings, 'jurisdiction').name('🌍 Zuständigkeitsbereich');
        aiSystemFolder.add(this.settings, 'complexity', ['low', 'medium', 'high']).name('📊 Komplexität');
        
        // Aktions-Buttons
        aiSystemFolder.add(this, 'generatePrompt').name('📋 Prompt generieren');
        aiSystemFolder.add(this, 'pasteAndLoad').name('📥 JSON einfügen & laden');
        aiSystemFolder.add(this, 'showExamples').name('💡 Beispiele anzeigen');
        
        // Status-Anzeigen (read-only)
        aiSystemFolder.add(this.settings, 'generationStatus').name('📊 Status').listen();
        aiSystemFolder.add(this.settings, 'lastGenerated').name('🕒 Zuletzt generiert').listen();
        
        // Beispiel-Systeme Unterordner
        const exampleSystemsFolder = aiSystemFolder.addFolder('📚 Beispiel-Systeme');
        exampleSystemsFolder.add(this, 'loadUSPoliticalSystem').name('🇺🇸 US-Politiksystem');
        exampleSystemsFolder.add(this, 'loadBaueingabeExample').name('🏛️ Baueingabe Zürich');
        
        return aiSystemFolder;
    }

    /**
     * Gibt die aktuellen Einstellungen zurück
     */
    getSettings() {
        return this.settings;
    }

    /**
     * Setzt neue Einstellungen
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }
}