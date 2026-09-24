# Antigravity GUI: Fehleranalyse und Registry-Fix (Version 0.102.12)

## Problem 1: Meldung "Holen Sie sich eine App, um diesen 'antigravity-ide'-Link zu oeffnen"
**Ursache**: Windows fehlt der Eintrags-Registrierungsschluessel fuer das Protokoll `antigravity-ide://`.

**Loesung**:
1. Das Protokoll `antigravity-ide` muss in der Windows-Registrierung (`HKEY_CLASSES_ROOT\antigravity-ide`) registriert werden, damit Windows den Pfad zur ausfuehrbaren Datei `Antigravity IDE.exe` kennt.
2. Alternativ die IDE direkt ueber das Windows-Startmenue oder ein Desktopsymbol starten, anstatt auf den Button "Open IDE" in der Antigravity-App zu klicken.

### Registrierungsschluessel (.reg):
```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\antigravity-ide]
@="URL:Antigravity IDE Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\antigravity-ide\shell\open\command]
@="\"C:\\Program Files\\Antigravity IDE\\Antigravity IDE.exe\" \"%1\""
```

## Problem 2: Session "Analyse Von KI Artefakten" zeigt Ladekreisel (`C`)
**Ursache**: Das rotierende Ladesymbol zeigt an, dass in dieser Session aktuell noch ein Hintergrundprozess oder ein Task ausgefuehrt wird.

**Loesung**:
1. Direkt auf den Schriftzug `Analyse Von KI Artefakten` in der linken Seitenleiste unter `Projects` klicken, um zur laufenden Session zu wechseln.
2. Die Protokolldateien befinden sich unter `C:/Users/ich/.gemini/antigravity/brain/1059610c-cb91-4d3a-a0f2-c29b88ee8b36/.system_generated/logs/transcript.jsonl`.
