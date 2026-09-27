# Analyse: Eignung von watch_com.ps1 fuer die One-Way-Synchronisation

Dokumentversion: 0.106.8
Datum: 2026-09-27
Quelle: W:/com (bzw. //wsl.localhost/Ubuntu/home/unixusername/nodges/com)
Ziel: C:/Users/ich/Desktop/code/_Nodges_Com_Sync

## 1. Fragestellung

Ist das bestehende Skript [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) bereits dafuer geeignet bzw. optimal, um die One-Way-Synchronisation von `W:/com` nach `C:/Users/ich/Desktop/code/_Nodges_Com_Sync` auszuloesen?

## 2. Direkte Antwort und Bewertung

Nein, im aktuellen Zustand ist das Skript noch nicht optimal und nur bedingt geeignet, um als verlaesslicher Trigger fuer die Synchronisation zu dienen.

Als grundlegendes Geruest liefert es zwar bereits die `FileSystemWatcher`-Ueberwachung fuer `W:/com`, fuer eine saubere, stabile One-Way-Synchronisation fehlen jedoch zentrale Mechanismen.

## 3. Analyse des Ist-Zustands von watch_com.ps1

Das Skript [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) enthaelt aktuell:
1. Einen Watcher auf `W:/com` (rekursiv), der auf `Created` und `Changed` reagiert.
2. Einen Watcher auf `W:/tools/com-bus`, der auf `ping-*.md` reagiert.
3. Die Handler-Aktion `$actionCom` gibt lediglich eine Konsolenzeile mit `Write-Host` aus.
4. Es existiert keine Kopier- oder Spiegelungslogik.

## 4. Warum das Skript aktuell noch nicht optimal ist

### 4.1 Fehlende Ereignisse: Deleted und Renamed
- Aktuell werden nur `Created` und `Changed` registriert.
- Wenn eine Datei in `com/` geloescht oder umbenannt wird, loest der Watcher kein Ereignis aus.
- Fuer eine echte One-Way-Synchronisation (Spiegelung) muss das Zielverzeichnis auch Loeschungen und Umbenennungen nachvollziehen.

### 4.2 Event-Sturm und fehlendes Debouncing (Entprellen)
- Der `FileSystemWatcher` feuert unter Windows bei einer einzigen Dateioperation haeufig mehrere Events kurz hintereinander (z.B. LastWrite, Dateigroesse, Attribute).
- Wenn mehrere Dateien gleichzeitig oder in schneller Folge geaendert werden, wuerde der Trigger mehrfach unkoordiniert ausgeloest.
- Ohne einen Entprell-Timer (Debounce / Cooldown von z.B. 1 bis 2 Sekunden) kaeme es zu unnoetigen Mehrfachausfuehrungen.

### 4.3 Dateisperren (File Locks / Race Conditions)
- Sobald ein `Changed`-Event gemeldet wird, befindet sich die Datei unter WSL2 oder Windows oft noch im Schreibzugriff des erzeugenden Prozesses.
- Ein sofortiger Synchronisationsversuch kann zu Zugriffsfehlern fuehren (Sharing Violation).
- Eine kurze Verzoegerung bzw. Fehlertoleranz beim Lesezugriff ist zwingend erforderlich.

### 4.4 Keine Parallelitaetssperre (Concurrency Lock)
- Waehrend ein Synchronisationslauf aktiv ist, duerfen Folge-Trigger nicht parallel starten, sondern muessen zurueckgestellt oder zusammengefasst werden.

## 5. Empfohlene Architektur fuer die Umsetzung

### 5.1 Synchronisationswerkzeug
- `robocopy` ist unter Windows fuer One-Way-Spiegelungen die bewaehrteste Loesung:
  `robocopy "W:/com" "C:/Users/ich/Desktop/code/_Nodges_Com_Sync" /MIR /R:2 /W:1 /FFT /NDL /NFL /NP`
- `/MIR` spiegelt das Verzeichnis exakt (inklusive Loeschen entfernter Dateien im Ziel).

### 5.2 Trigger-Moeglichkeiten (Bedarf und Flexibilitaet)
Die Anforderung lautet "das soll triggerbar sein". Hierfuer empfiehlt sich ein modulares Zweistufenmodell:
1. **Automatischer Event-Trigger (Watcher):**
   Erweiterung von [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) um einen Debounce-Mechanismus, der nach jeder Aenderung in `W:/com` nach kurzer Ruhezeit automatisch `robocopy` ausfuehrt.
2. **Gezielter / Manueller Trigger:**
   - Ein dediziertes PowerShell-Skript (z.B. [W:/tools/sync_com.ps1](file:///W:/tools/sync_com.ps1)), das jederzeit eigenstaendig aufgerufen werden kann.
   - Integration in den COM-Bus: Das Watcher-Skript kann zusaetzlich auf ein Signal wie `ping-sync.md` in `W:/tools/com-bus` hoeren, sodass der Sync auch aus Containern (piCon via `nodges-com.sh`) per Befehl ausgeloest werden kann.
