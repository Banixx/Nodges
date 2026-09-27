# Persistente Einbindung von Laufwerk W:

Dokumentversion: 0.106.4
Erstellt am: 2026-09-25
Gueltigkeitsbereich: Windows 11 Host, WSL2 (Ubuntu), Nodges Projektordner

## 1. Ursache fuer das Verschwinden nach einem Neustart

1. **Fluechtigkeit von subst:**
   Der Befehl `subst` speichert Laufwerksbuchstaben ausschliesslich im Speicher der aktuellen Benutzersitzung. Ein Neustart loescht diese Zuordnung selbstaendig.
2. **Problem bei net use:**
   Wird versucht, den Pfad ueber `net use W: ... /persistent:yes` anzubinden, schlaegt die Wiederverbindung beim Booten fehl, weil WSL2 (Ubuntu) beim Hochfahren von Windows noch nicht gestartet ist. Der Netzwerkpfad `//wsl.localhost/Ubuntu/...` existiert zu diesem fruehen Zeitpunkt noch nicht.
3. **Status des vorherigen Versuchs:**
   Die Loesung wurde im Dokument `W:/doc/0_106_4_wsl_laufwerk_w_persistenz_und_total_commander.md` theoretisch beschrieben, die entsprechende Datei war jedoch physisch noch nicht im Windows-Autostart-Verzeichnis angelegt worden.

## 2. Umgesetzte Loesung

Es wurde ein Autostart-Skript angelegt:
- **Datei:** `C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/mount_nodges_w.cmd`

### Inhalt des Skripts:
```cmd
@echo off
rem Initialisiere WSL Ubuntu, damit der 9P-Netzwerkpfad verfuegbar ist
wsl.exe -d Ubuntu -e true
rem Trenne altes Mapping, falls vorhanden
subst W: /D >nul 2>&1
rem Verbinde Laufwerk W: mit dem Nodges-Verzeichnis
subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges
```

### Funktionsweise:
1. `wsl.exe -d Ubuntu -e true` weckt die WSL2-Instanz auf. Dadurch initialisiert Windows den 9P-Redirector fuer `\\wsl.localhost\Ubuntu`.
2. `subst W: /D` entfernt eventuelle verwaiste Mappings sauber.
3. `subst W: \\wsl.localhost\Ubuntu\home\unixusername\nodges` verknuepft den Pfad wieder als lokales Laufwerk `W:`.

## 3. Verifikation und Test

Das Skript wurde nach einem vollstaendigen WSL-Kaltstart (`wsl --shutdown`) ausgefuehrt und geprueft.
- Laufwerk `W:` wurde erfolgreich gemappt.
- Zugriff auf `W:/package.json` liefert sofort `True`.
- Nach jedem Windows-Neustart und Benutzer-Login wird dieses Skript nun automatisch durch Windows ausgefuehrt.

## 4. Optionale Anpassung: Lautloser Start

Falls das kurze Aufblitzen des Eingabeaufforderungs-Fensters beim Windows-Start stoert, kann eine VBS-Datei im Autostart-Ordner hinterlegt werden:
- **Datei:** `C:/Users/ich/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup/mount_nodges_w.vbs`
- **Inhalt:**
  ```vbs
  Set WshShell = CreateObject("WScript.Shell")
  WshShell.Run "C:\Users\ich\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\mount_nodges_w.cmd", 0, False
  ```
  (Dabei muesste die Endung der .cmd-Datei aus dem Autostart-Ordner entfernt oder an einen anderen Ort verschoben werden, damit sie nicht doppelt startet).
