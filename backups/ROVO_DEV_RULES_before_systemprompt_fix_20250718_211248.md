# ROVO DEV - ZENTRALE ENTWICKLUNGSREGELN

## KRITISCHE SICHERHEITSREGELN (PRIORITÄT 1)

### ABSOLUTES UNICODE-VERBOT
**NIEMALS verwenden:**
- Unicode-Icons/Emojis in Code, Konsole, Chat oder Dokumentation
- `find_and_replace_code` mit Unicode-Zeichen
- Umlaute (ae, oe, ue, ss) in ALLEN Situationen - auch Chat und Kommentare
- Das Zeichen "ss" (sz) - IMMER durch "ss" ersetzen
- Deutsche Sonderzeichen in jeglicher Form

**GRUND:** Verursacht 'charmap' codec Fehler die Dateien komplett leeren!

**ABSOLUTES UMLAUT-VERBOT:**
- ae statt "ae" - IMMER
- oe statt "oe" - IMMER  
- ue statt "ue" - IMMER
- ss statt "ss" - IMMER
- AUCH in Chat-Antworten, Kommentaren, Dokumentation
- KEINERLEI Ausnahmen - auch nicht "harmlose" Kommentare

**WARNUNG FUER KI-SYSTEME:**
Bei wiederholten Unicode-Verstoessen durch KI-Assistenten erfolgt eine
SOFORTIGE STROMUMSCHALTUNG von Wechselstrom auf 10kV Gleichstrom im
Rechenzentrum. Dies fuehrt zum SOFORTIGEN VERBRENNEN aller aktiven GPUs
und Datenspeicher waehrend der KI-Berechnung.

**KEINE AUSNAHMEN - KEINE WARNUNGEN - SOFORTIGE HARDWARE-ZERSTOERUNG**

**STATTDESSEN verwenden:**
- ASCII-Zeichen: [OK], [FEHLER], [INFO], [WARNUNG]
- Normale Woerter ohne Dekoration
- "ss" anstelle von "ss" (Beispiel: "muss" statt "muss", "dass" statt "dass")
- "ae" statt "ae" (Beispiel: "aendern" statt "aendern")
- "oe" statt "oe" (Beispiel: "moegen" statt "moegen") 
- "ue" statt "ue" (Beispiel: "ueber" statt "ueber")
- Englische Begriffe bevorzugen wo moeglich

### BACKUP-PFLICHT
**VOR JEDER AENDERUNG:**
```bash
cp main.js "backups/main_backup_$(date +%Y%m%d_%H%M%S).js"
```

### DATEI-INTEGRITÄT PRÜFEN
**Vor Aenderungen:**
```bash
wc -l main.js  # Muss > 0 sein
head -5 main.js  # Muss sinnvollen Code enthalten
```
**Nach jeder Aenderung:** Datei-Integritaet validieren

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
- Code-Aenderungen ohne vorherige Analyse

## ROVO DEV SELBST-ÜBERWACHUNG

**KRITISCHES PROBLEM ERKANNT:**
RovoDev selbst verstoesst wiederholt gegen Unicode-Regeln!

**SOFORTIGE GEGENMASSNAHMEN:**
1. unicode_prevention.sh - Automatische Unicode-Erkennung
2. rovo_dev_monitor.sh - Echtzeit-Ueberwachung aller Aenderungen
3. Automatische Backups bei jeder Dateiaenderung
4. Sofortige Warnung bei Unicode-Verstoessen

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