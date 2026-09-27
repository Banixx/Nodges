# One-Way-Synchronisation des com/-Ordners

Dokumentversion: 0.106.8
Datum: 2026-09-27
Quelle: W:/com (bzw. //wsl.localhost/Ubuntu/home/unixusername/nodges/com)
Ziel: C:/Users/ich/Desktop/code/_Nodges_Com_Sync

## 1. Zielsetzung

Realisierung einer zuverlaessigen One-Way-Synchronisation aller Inhalte des gemeinsamen Projektordners `com/` in den lokalen Windows-Ordner `C:/Users/ich/Desktop/code/_Nodges_Com_Sync`.
Das System soll flexibel ausloesbar sein ("triggerbar"):
1. Automatisch bei jeder Datei- oder Ordneraenderung in `com/` (mit Entprellung).
2. Manuell per Konsolenbefehl oder Skriptaufruf.
3. Signalgesteuert ueber den COM-Bus (auch aus dem Linux-Container piCon heraus).

## 2. Architektur und Komponenten

### 2.1 Synchronisationsmodul: [W:/tools/sync_com.ps1](file:///W:/tools/sync_com.ps1)
Das eigenstaendige Kernmodul fuer den Abgleich nutzt Windows `robocopy` mit folgenden Optionen:
- Quelle: `W:\com` (mit automatischem Fallback auf `\\wsl.localhost\Ubuntu\home\unixusername\nodges\com`).
- Ziel: `C:\Users\ich\Desktop\code\_Nodges_Com_Sync`.
- Parameter:
  - `/MIR`: Exakte 1:1-Spiegelung (geloeschte Dateien in der Quelle werden auch im Ziel entfernt).
  - `/FFT`: 2-Sekunden FAT-Dateizeit-Toleranz (verhindert unnoetige Re-Kopiervorgaenge zwischen Linux/WSL und Windows NTFS).
  - `/XJ`: Ausschluss von Junction-Points und Linux-Symlinks, um Fehler bei relativen Symlinks zu verhindern.
  - `/R:2 /W:1`: 2 Wiederholungsversuche mit 1 Sekunde Wartezeit bei kurzzeitig gesperrten Dateien.
  - `/XF ~* *.tmp *.bak *.swp`: Ausschluss temporaerer Editor-Dateien.
  - `/NP /NDL /NFL`: Ruhige, saubere Konsolenausgabe.

### 2.2 Ueberwachungs- und Trigger-Dienst: [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1)
Das ueberarbeitete Watcher-Skript deckt folgende Trigger-Moeglichkeiten ab:
- **Automatische Event-Erkennung:** Reagiert auf `Created`, `Changed`, `Deleted` und `Renamed` in `W:\com`.
- **Debounce (Entprellung):** Verwendet einen 1500ms-Timer. Mehrfache Dateiereignisse kurz hintereinander loesen nur einen einzigen gebuendelten Synchronisationslauf aus.
- **Sperrmechanismus (Concurrency Lock):** Verhindert ueberlappende Sync-Laeufe. Bei Aenderungen waehrend eines laufenden Syncs wird automatisch ein Folge-Sync nachgereicht.
- **Direkt-Trigger per Parameter:** `.\watch_com.ps1 -SyncNow` fuehrt sofort einen Sync aus und beendet sich wieder.
- **COM-Bus-Trigger:** Erkennt Signaldokumente wie `ping-sync.md` im Bus-Ordner `W:\tools\com-bus` und stoesst den Sync sofort an.

### 2.3 CLI-Integration: [W:/tools/nodges-com.ps1](file:///W:/tools/nodges-com.ps1)
Fuer conT und die Windows-Bedienung wurde der Befehl `sync` integriert:
```powershell
.\nodges-com.ps1 sync
```

### 2.4 Triggerung aus dem Linux-Container (piCon)
piCon kann die Synchronisation auf dem Windows-Host ueber den bestehenden COM-Bus ausloesen:
```bash
bash tools/nodges-com.sh ping sync "Synchronisiere com"
```

## 3. Verifizierung und Tests

Folgende Tests wurden erfolgreich durchgefuehrt:
1. **Initialer Vollabgleich:** Alle 416 Dateien und Unterordner (inklusive `doc/` und `plan/`) wurden vollstaendig nach `C:/Users/ich/Desktop/code/_Nodges_Com_Sync` gespiegelt.
2. **Automatischer Event-Trigger:** Das Anlegen einer Datei loeste nach Ablauf des 1500ms-Debounce-Fensters selbstaendig die Synchronisation aus.
3. **Loesch-Spiegelung:** Das Entfernen einer Datei in der Quelle entfernte die entsprechende Datei im Ziel.
4. **Signal-Trigger:** Ein Signal `ping-sync.md` im COM-Bus loeste die Synchronisation umgehend aus und bereinigte das Signal.
