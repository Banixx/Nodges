# ROVO DEV - ZENTRALE ENTWICKLUNGSREGELN

## KRITISCHE SICHERHEITSREGELN (PRIORITÄT 1)

### ABSOLUTES UNICODE-VERBOT
**NIEMALS verwenden:**
- Unicode-Icons/Emojis in Code, Konsole, Chat oder Dokumentation
- `find_and_replace_code` mit Unicode-Zeichen
- Umlaute oder Sonderzeichen in `find_and_replace_code`

**GRUND:** Verursacht 'charmap' codec Fehler die Dateien komplett leeren!

**STATTDESSEN verwenden:**
- ASCII-Zeichen: [OK], [FEHLER], [INFO], [WARNUNG]
- Normale Wörter ohne Dekoration

### BACKUP-PFLICHT
**VOR JEDER ÄNDERUNG:**
```bash
cp main.js "backups/main_backup_$(date +%Y%m%d_%H%M%S).js"
```

### DATEI-INTEGRITÄT PRÜFEN
**Vor Änderungen:**
```bash
wc -l main.js  # Muss > 0 sein
head -5 main.js  # Muss sinnvollen Code enthalten
```
**Nach jeder Änderung:** Datei-Integrität validieren

## ENTWICKLUNGSRICHTLINIEN (PRIORITÄT 2)

### STRIKTE FEATURE-REGEL
**VERBOTEN:**
- Eigenmächtige Feature-Ergänzungen ohne explizite Anfrage
- "Bonus"-Elemente hinzufügen
- Ungefragt erweitern von Anforderungen
- Annahmen über gewünschte Zusatzfunktionen treffen

**ERLAUBT:**
- Exakt umsetzen was angefordert wurde
- Vorschläge für zusätzliche Features machen (aber NICHT implementieren)
- Bei Unklarheiten nachfragen
- Vor möglichen Problemen warnen

**KORREKTE VORSCHLÄGE:**
"[Feature] implementiert. **Möchten Sie zusätzlich:**
- [Vorschlag 1]?
- [Vorschlag 2]?
- [Vorschlag 3]?"

## SICHERE ARBEITSWEISE (PRIORITÄT 3)

### PFLICHT-WORKFLOW
1. **IMMER** zuerst `grep_file_content` oder `expand_code_chunks` verwenden
2. Backup erstellen
3. Nur ASCII-Zeichen in Code-Änderungen
4. Nach jeder Änderung validieren
5. Bei Problemen sofort aus Backup wiederherstellen

### VERBOTENE OPERATIONEN
- `find_and_replace_code` mit leerem replace Parameter
- Mehrfache `find_and_replace_code` ohne Validierung zwischen Schritten
- Code-Änderungen ohne vorherige Analyse

## NOTFALL-PROTOKOLL

**Bei geleerten Dateien:**
1. Sofort aus Backup wiederherstellen
2. Ursache analysieren (meist Unicode-Encoding-Fehler)
3. Alternative Lösung ohne problematische Zeichen implementieren

**Bekannte Risiko-Dateien:** main.js, index.html

## PROJEKTSPEZIFISCHE REGELN

### BETROFFENE DATEIEN
- Hauptrisiko: main.js, index.html
- Backup-Verzeichnis: backups/
- Überwachung: check_unicode.sh

### BEREINIGUNGSSTATUS
[ABGESCHLOSSEN] Alle Unicode-Icons aus dem Projekt entfernt

---
**DIESE REGELN SIND ABSOLUT UND GELTEN FÜR ALLE ZUKÜNFTIGEN ARBEITEN**