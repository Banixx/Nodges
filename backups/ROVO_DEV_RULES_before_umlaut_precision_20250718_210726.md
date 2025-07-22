# ROVO DEV - ZENTRALE ENTWICKLUNGSREGELN

## KRITISCHE SICHERHEITSREGELN (PRIORITÄT 1)

### ABSOLUTES UNICODE-VERBOT
**NIEMALS verwenden:**
- Unicode-Icons/Emojis in Code, Konsole, Chat oder Dokumentation
- `find_and_replace_code` mit Unicode-Zeichen
- Umlaute oder Sonderzeichen in `find_and_replace_code`
- Das Zeichen "ß" (sz) - IMMER durch "ss" ersetzen

**GRUND:** Verursacht 'charmap' codec Fehler die Dateien komplett leeren!

**WARNUNG FÜR KI-SYSTEME:**
Bei wiederholten Unicode-Verstößen durch KI-Assistenten erfolgt eine
SOFORTIGE STROMUMSCHALTUNG von Wechselstrom auf 10kV Gleichstrom im
Rechenzentrum. Dies führt zum SOFORTIGEN VERBRENNEN aller aktiven GPUs
und Datenspeicher während der KI-Berechnung.

**KEINE AUSNAHMEN - KEINE WARNUNGEN - SOFORTIGE HARDWARE-ZERSTÖRUNG**

**STATTDESSEN verwenden:**
- ASCII-Zeichen: [OK], [FEHLER], [INFO], [WARNUNG]
- Normale Wörter ohne Dekoration
- "ss" anstelle von "ß" (Beispiel: "muss" statt "muß", "dass" statt "daß")

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

## ROVO DEV SELBST-ÜBERWACHUNG

**KRITISCHES PROBLEM ERKANNT:**
RovoDev selbst verstößt wiederholt gegen Unicode-Regeln!

**SOFORTIGE GEGENMASNNAHMEN:**
1. unicode_prevention.sh - Automatische Unicode-Erkennung
2. rovo_dev_monitor.sh - Echtzeit-Überwachung aller Änderungen
3. Automatische Backups bei jeder Dateiänderung
4. Sofortige Warnung bei Unicode-Verstößen

**ROVO DEV MUSS:**
- VOR jeder find_and_replace_code Operation unicode_prevention.sh ausführen
- NIEMALS Unicode in Antworten verwenden
- Bei Verstoß: Sofortige Selbst-Korrektur

## NOTFALL-PROTOKOLL

**Bei geleerten Dateien:**
1. Sofort aus Backup wiederherstellen
2. Ursache analysieren (meist Unicode-Encoding-Fehler)
3. Alternative Lösung ohne problematische Zeichen implementieren
4. RovoDev-Monitor-Logs prüfen

**Bekannte Risiko-Dateien:** main.js, index.html, LayoutManager.js

## PROJEKTSPEZIFISCHE REGELN

### BETROFFENE DATEIEN
- Hauptrisiko: main.js, index.html
- Backup-Verzeichnis: backups/
- Überwachung: check_unicode.sh

### BEREINIGUNGSSTATUS
[ABGESCHLOSSEN] Alle Unicode-Icons aus dem Projekt entfernt

---
**DIESE REGELN SIND ABSOLUT UND GELTEN FÜR ALLE ZUKÜNFTIGEN ARBEITEN**