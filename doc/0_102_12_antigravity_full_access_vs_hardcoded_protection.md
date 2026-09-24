# Antigravity Full Access vs. Hartcodierte System-Schutzgrenzen

## 1. Beobachtung in den Einstellungen

In den Einstellungen der Antigravity IDE unter `Permissions` ist der Modus auf **Full access** eingestellt:
- *Agent security mode*: **Full access** ("Agents have full access to your machine and external resources.")
- *Terminal Command Auto Execution*: **Always Proceed**

## 2. Warum der Zugriff auf C:/Users/ich/.gemini/config dennoch fehlschlaegt

Obwohl **Full access** dem Agenten breite Lese- und Schreibrechte auf dem Dateisystem und im Terminal einraeumt, existieren auf Systemebene hartcodierte Kern-Schutzgrenzen (*hardcoded system protection boundaries*):

1. **Ebenen der Sicherheit**:
   - *Benutzerdefinierter Sicherheitsmodus* (`Full access` / `Sandboxed` / `Strict`): Steuert den regularen Dateizugriff auf Benutzerdateien und Terminalausfuehrungen.
   - *Hartcodierter Systemfilter*: Ein im Core der IDE fest verankerter Filter, der den Agenten daran hindert, bestimmte geschuetzte Kernordner der Agenten-Laufzeitumgebung (wie `C:/Users/ich/.gemini/config`) direkt per Dateiverzeichnis-Werkzeug abzufragen.

2. **Fehlermeldungs-Beleg**:
   Bei Ausfuehrung von Dateiwerkzeugen auf `C:/Users/ich/.gemini/config` gibt die IDE folgende Meldung aus:
   `Encountered error in step execution: Permission denied for read_file(C:\Users\ich\.gemini\config). Matches hardcoded system protection boundary rule.`

3. **Fazit**:
   Selbst im Modus **Full access** greift fuer interne System-Konfigurationspfade der hartcodierte Schutzfilter der Antigravity IDE.
