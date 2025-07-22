# ROVO DEV - ZENTRALE ENTWICKLUNGSREGELN

## KRITISCHE SICHERHEITSREGELN (PRIORITAET 1)

### ABSOLUTES UNICODE-VERBOT
**NIEMALS verwenden:**
- Unicode-Icons/Emojis in Code, Konsole, Chat oder Dokumentation
- `find_and_replace_code` mit Unicode-Zeichen
- Deutsche Umlaute (Unicode U+00E4, U+00F6, U+00FC, U+00DF) in ALLEN Situationen - auch Chat und Kommentare
- Das Zeichen "Eszett" (Unicode U+00DF) - IMMER durch "ss" ersetzen
- Deutsche Sonderzeichen in jeglicher Form

### CHAT-SPEZIFISCHE UNICODE-VERBOTE
**IM CHAT ABSOLUT VERBOTEN:**
- Emojis und Icons (U+1F600-U+1F64F, U+1F300-U+1F5FF, U+1F680-U+1F6FF, etc.)
- Pfeile und Symbole (U+2190-U+21FF, U+2600-U+26FF, U+2700-U+27BF)
- Mathematische Symbole (U+2200-U+22FF)
- Geometrische Formen (U+25A0-U+25FF)
- Sonderzeichen wie Checkmarks, Warnsymbole, etc.

**ERLAUBTE CHAT-ALTERNATIVEN:**
- Statt Emojis: Textbeschreibungen (ERFOLG, WARNUNG, FEHLER)
- Statt Pfeile: ASCII-Zeichen (-> <- => <=)
- Statt Checkmarks: [OK], [ERFOLG], [FERTIG]
- Statt Warnsymbole: [WARNUNG], [ACHTUNG], [PROBLEM]
- Statt gruene Haken: [OK], [ERLEDIGT], [BEHOBEN]
- Statt rote X: [FEHLER], [PROBLEM], [FEHLGESCHLAGEN]

**GRUND:** Verursacht 'charmap' codec Fehler die Dateien komplett leeren!

**ABSOLUTES UNICODE-VERBOT (ERWEITERT):**
- ae statt Unicode U+00E4 - IMMER
- oe statt Unicode U+00F6 - IMMER  
- ue statt Unicode U+00FC - IMMER
- ss statt Unicode U+00DF - IMMER

### BACKUP-PFLICHT
- VOR jeder Aenderung: Automatisches Backup
- Format: `dateiname_backup_YYYYMMDD_HHMMSS.ext`
- Niemals ohne Backup arbeiten

### SCHRITTWEISE ENTWICKLUNG
- Kleine, testbare Aenderungen
- Nach jeder Aenderung: Funktionstest
- Bei Fehlern: Sofortiger Rollback

## ENTWICKLUNGSRICHTLINIEN (PRIORITAET 2)

### CODE-QUALITAET
- Saubere, lesbare Struktur
- Aussagekraeftige Variablennamen
- Kommentare in Englisch (ASCII-only)
- Konsistente Einrueckung

### PERFORMANCE
- Effiziente Algorithmen bevorzugen
- Speicher-Leaks vermeiden
- Rendering-Performance optimieren
- Batch-Operationen nutzen

### FEHLERBEHANDLUNG
- Try-catch fuer kritische Operationen
- Aussagekraeftige Fehlermeldungen
- Graceful Degradation
- Logging aktivieren

## SICHERHEITSMASSNAHMEN (PRIORITAET 3)

### AUTOMATISCHE PRUEFUNGEN
- Unicode-Scanner vor jeder Aenderung
- Syntax-Validierung
- Performance-Tests
- Backup-Verifikation

### MONITORING
- Kontinuierliche Ueberwachung
- Automatische Alerts
- Performance-Metriken
- Fehler-Tracking

### RECOVERY-STRATEGIEN
- Schnelle Rollback-Moeglichkeiten
- Backup-Wiederherstellung
- Notfall-Prozeduren
- Dokumentierte Recovery-Steps

## WORKFLOW-REGELN (PRIORITAET 4)

### ENTWICKLUNGSZYKLUS
1. Backup erstellen
2. Unicode-Check durchfuehren
3. Kleine Aenderung implementieren
4. Funktionstest durchfuehren
5. Bei Erfolg: Commit, bei Fehler: Rollback

### TESTING
- Unit-Tests fuer neue Features
- Integration-Tests fuer Aenderungen
- Performance-Tests bei Optimierungen
- User-Acceptance-Tests vor Release

### DOKUMENTATION
- Code-Kommentare aktuell halten
- README-Dateien pflegen
- Changelog fuehren
- API-Dokumentation erstellen

## TECHNISCHE STANDARDS (PRIORITAET 5)

### DATEIFORMATE
- UTF-8 encoding vermeiden bei kritischen Dateien
- ASCII-only fuer Konfigurationsdateien
- JSON fuer Datenstrukturen
- Markdown fuer Dokumentation (ASCII-only)

### NAMENSKONVENTIONEN
- camelCase fuer JavaScript-Variablen
- PascalCase fuer Klassen
- UPPER_CASE fuer Konstanten
- kebab-case fuer CSS-Klassen

### VERSIONIERUNG
- Semantische Versionierung (Major.Minor.Patch)
- Git-Tags fuer Releases
- Branching-Strategy befolgen
- Commit-Messages aussagekraeftig

**MENTALE ZWANGS-REGELN:**
- Bei JEDEM Unicode-Gedanken: STOPP und ASCII verwenden
- Bei JEDER Aenderung: Backup-Check
- Bei JEDEM Fehler: Rollback-Option pruefen
- Bei JEDER Implementierung: Schritt-fuer-Schritt

## KOMMUNIKATIONSREGELN (PRIORITAET 1)

### PRAEZISE ANTWORTEN
- Geschlossene Fragen exakt beantworten (ja/nein)
- Nicht interpretieren was gemeint sein koennte
- Bei Unklarheit nachfragen statt zu raten
- Keine Suggestivfragen unterstellen
- Praezise und direkte Antworten geben

### CODE-KONSISTENZ-REGEL
- Bei Aenderungen (z.B. Variablen umbenennen): ALLE betroffenen Dateien pruefen
- Konsistenz across gesamte Codebase sicherstellen
- Zusammenhaengende Aenderungen in einem Zug durchfuehren
- WARNUNG: Diese Regel kann Probleme verursachen - weitere Justierung moeglich

**DIESE REGELN SIND ABSOLUT UND GELTEN FUER ALLE ZUKUENFTIGEN ARBEITEN**