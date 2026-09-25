# Persistente Einbindung von Laufwerk W: und Anbindung in Total Commander

Dokumentversion: 0.106.4
Erstellt am: 2026-09-25
Gueltigkeitsbereich: Windows 11 Host, WSL2 (Ubuntu), Total Commander, Antigravity Workspace

## 1. Ursache fuer den Verlust des Laufwerks W: nach Neustart

1. **Fluechtigkeit von subst:**
   Der Befehl `subst W: //wsl.localhost/Ubuntu/home/unixusername/nodges` ordnet einen Pfad ausschliesslich der aktuellen Windows-Anmeldesitzung im Arbeitsspeicher zu. Bei einem Abmelden oder Neustart des Rechners loescht Windows diese Zuordnung vollstaendig.
2. **Timing-Problem bei net use:**
   Klassische Netzlaufwerk-Zuweisungen (`net use W: ... /persistent:yes`) scheitern bei WSL2-Pfaden beim Booten haeufig mit `Systemfehler 67 (Der Netzwerkname wurde nicht gefunden)`. Der Grund ist, dass der Windows-Netzwerk-Redirector und die WSL-Dienste (`LxssManager`) beim Systemstart noch nicht bereit sind, wenn Windows versucht, gespeicherte Netzlaufwerke wiederherzustellen.

## 2. Loesungen fuer eine dauerhafte (persistente) Einbindung

### Option A: Autostart-Skript (Empfohlen)

Eine CMD-Datei im Windows-Autostart-Ordner stellt sicher, dass WSL zunaechst kurz aufgeweckt wird und anschliessend das Laufwerk W: zuverlaessig gesetzt wird.

- **Pfad der Datei:** `C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/mount_nodges_w.cmd`
- **Inhalt:**
  ```cmd
  @echo off
  :: WSL-Distro kurz ansprechen, damit der 9P-Redirector aktiv ist
  wsl.exe -d Ubuntu --exec /bin/true
  :: Altes Mapping loesen, falls noch Fragmente existieren
  subst W: /D >nul 2>&1
  :: Laufwerk W: neu zuweisen
  subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges
  ```

### Option B: Windows-Aufgabenplanung (Task Scheduler)

Alternativ kann eine Aufgabe in der Windows-Aufgabenplanung erstellt werden:
- **Trigger:** Bei Anmeldung des Benutzers.
- **Aktion:** Programm starten `powershell.exe -WindowStyle Hidden -Command "wsl -d Ubuntu --exec /bin/true; subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges"`
- **Vorteil:** Laeuft komplett lautlos und unsichtbar im Hintergrund.

## 3. Total Commander: Optimale Konfiguration fuer WSL und Laufwerke

### Problem 1: Laufwerke fehlen oder Total Commander laeuft als Administrator
Wenn Total Commander mit Administratorrechten gestartet wird, greift die UAC-Token-Trennung von Windows. Ein in der normalen Benutzersitzung ausgefuehrtes `subst` oder `net use` ist fuer den erhoehten Total Commander unsichtbar.
- **Loesung (Registry-Schluessel):**
  In `HKEY_LOCAL_MACHINE/SOFTWARE/Microsoft/Windows/CurrentVersion/Policies/System` den DWORD-Wert `EnableLinkedConnections` auf `1` setzen. Dadurch teilen sich Benutzer- und Admin-Token die Laufwerkszuordnungen.

### Problem 2: Linux-Verzeichnisse werden in Total Commander nicht wie im Explorer aufgelistet
Der Windows Explorer zeigt WSL ueber eine virtuelle Shell-Erweiterung (`Linux` in der Navigationsleiste) an. Total Commander ist ein dateibasiertes Werkzeug und nutzt dafuer folgende Wege:

1. **Total Commander Verzeichnisliste (Strg+D):**
   - Im Total Commander `Strg+D` druecken -> `Hinzufuegen`.
   - Name: `WSL Nodges`
   - Befehl/Pfad: `//wsl.localhost/Ubuntu/home/unixusername/nodges`
   - Damit springt man per Tastendruck sofort in das Verzeichnis, ohne auf Laufwerksbuchstaben angewiesen zu sein.
2. **Buttonleiste in Total Commander:**
   - Rechtsklick auf eine freie Stelle der Buttonleiste -> `Aendern`.
   - Kommando: `cd //wsl.localhost/Ubuntu/home/unixusername/nodges/`
   - Icondatei: `wsl.exe`
   - Tooltip: `Nodges WSL2 Workspace`
3. **Total Commander WSL File System Plugin (WFX):**
   - Es existieren Erweiterungen (z.B. das Total Commander WSL Plugin), die unter der "Netzwerkumgebung" (`///`) alle installierten Distributionen direkt mit einem Klick zugaenglich machen.

## 4. Performance-Hinweise fuer Datentransfers zwischen Windows und WSL2

- **9P-Protokoll-Overhead:** Zugriffe von Windows auf `//wsl.localhost/...` laufen ueber das 9P-Netzwerkdateisystem. Fuer das Betrachten, Editieren und Kopieren einzelner Dateien ist dies sehr schnell.
- **Massendateien (node_modules, Git-Index):** Befehle mit zehntausenden kleinen Dateioperationen (`npm install`, `npm test`, `git status`) sollten immer nativ innerhalb von WSL oder im Docker-Container ausgefuehrt werden, da dort die native Linux-Ext4-Dateisystemgeschwindigkeit greift.
