# Schritt-fuer-Schritt-Anleitung: Umzug von Antigravity auf das WSL2-Verzeichnis

## 1. Ueberblick

Um die vollstaendige Entkopplung von der Windows-Kopie (`C:/Users/ich/Desktop/code/_projects/Nodges`) zu vollziehen und WSL2 (`/home/unixusername/nodges`) als alleinige Single Source of Truth zu etablieren, wird der Arbeitsbereich in Antigravity neu ausgerichtet.

---

## 2. Der Umzugsprozess in 4 Schritten

### Schritt 1: Vorbereitung und finaler Commit-Abgleich
- Vor dem Schliessen des aktuellen Fensters sicherstellen, dass saemtliche aktuellen Dokumente und Berichte committet und gepusht sind.
- Aktueller Stand: Beide Seiten sind auf Commit `f1ef5bf` vollstaendig synchron und sauber.

### Schritt 2: Neues Projekt / Ordner in Antigravity oeffnen
1. In Antigravity (bzw. Ihrer IDE) im Menue auf **Datei -> Ordner oeffnen...** (oder "Neues Projekt / Open Folder") klicken.
2. In der Adresszeile des Windows-Dateidialogs den UNC-Pfad eingeben:
   `\\wsl.localhost\Ubuntu\home\unixusername\nodges`
3. Den Ordner auswaehlen und bestaetigen.
4. Falls Antigravity/VS Code fragt: „Vertrauen Sie den Autoren dieser Dateien?", mit **Ja** bestaetigen.

*Ergebnis*: Antigravity laedt nun saemtliche Dateien, den Dateibaum und den Git-Status direkt aus dem Linux-Dateisystem von WSL2.

### Schritt 3: Altes Windows-Verzeichnis unkenntlich machen (Schutz vor Fehlern)
Um zu verhindern, dass Sie oder ein Tool aus Gewohnheit wieder die alte Windows-Kopie oeffnen oder dort Dateien ablegen:
1. Den alten Windows-Ordner umbenennen:
   - Von: `C:/Users/ich/Desktop/code/_projects/Nodges`
   - Nach: `C:/Users/ich/Desktop/code/_projects/Nodges_OLD_BACKUP`
2. Dadurch laeuft jeder versehentliche Schreibzugriff auf den alten Pfad sofort ins Leere, und es ist garantiert, dass nur noch am WSL-Projekt gearbeitet wird.

### Schritt 4: Verifikation der neuen Arbeitsumgebung
Nach dem Oeffnen des neuen Projekts:
1. Pruefen, ob die Dateien `setup.md` und `bericht.md` im Root sichtbar sind.
2. Pruefen, ob `git status` im Terminal sofort `On branch pi, working tree clean` meldet.
3. Pruefen, ob der Dev-Server unter `http://localhost:5173` wie gewohnt erreichbar bleibt.

---

## 3. Wichtige Arbeitsregel fuer die neue Session

Da Antigravity nun auf einem Linux-Verzeichnis arbeitet:
- **Quellcode editieren**: Vollkommen transparent wie gewohnt (TypeScript, Vue, Markdown, JSON koennen direkt editiert und gespeichert werden).
- **Laufzeit-Befehle (npm, vite, tests)**: Falls Sie ein PowerShell-Terminal nutzen, Befehle immer mit `wsl -e ...` ausfuehren (z.B. `wsl -e npm test`), damit die Linux-Binaries genutzt werden und keine Windows-Module in `node_modules` geraten.
