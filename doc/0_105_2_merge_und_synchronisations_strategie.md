# Strategie zur Zusammenfuehrung (Merge) und Synchronisation

Plan fuer eine einheitliche Codebasis zwischen dem Windows-Arbeitsbereich (Antigravity), dem WSL/Container-Arbeitsbereich (Pi-Agent) und dem GitHub-Repository [https://github.com/Banixx/Nodges](https://github.com/Banixx/Nodges).

---

## 1. Ausgangslage: Wo liegen aktuell die Unterschiede?

Aktuell existieren nicht nur unterschiedliche Branches auf GitHub, sondern **zwei voellig getrennte Repository-Klone** auf Ihrem Computer:

1. **Windows-Repository ([C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges)):**
   - Hier arbeitet Antigravity.
   - Aktuell ausgecheckt: `refactor/pi-gem31` (auf Basis von Stand `pi` `d4391c0`).
   - Zusaetzlicher lokaler Branch `refactor/pi-stabilization` mit 6 wertvollen Architektur-Commits (Trennung DataManager/RenderEngine, Performance-Fixes fuer Glob-Imports, Bereinigung grosser Test-JSONs).

2. **WSL-Repository (`/home/unixusername/nodges` bzw. `\\wsl.localhost\Ubuntu\home\unixusername\nodges`):**
   - Dies ist der Ordner, den der Pi-Container laut `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env` (`REPO_PATH`) als `/workspace` einbindet.
   - Ausgecheckt ist der Branch `pi`.
   - Hier liegt eine ungespeicherte Code-Aenderung in `src/utils/LLMService.ts` (erweiterte Fehlerdiagnose und Proxy-Payload-Warnungen) sowie ungetrackte Hilfsdateien.

3. **GitHub (`origin`):**
   - `main`: Steht noch auf Version 0.103 (Juli 2026).
   - `pi`: Steht auf Version 0.105.1 (`d4391c0`).
   - `feature/multi-build`: Historischer Stand (v0.102.3).

---

## 2. Schrittweiser Merge- und Bereinigungsplan

### Schritt 1: WSL-Aenderungen sichern und committen
Im WSL-Repository von Pi liegt eine Nuance in `src/utils/LLMService.ts`. Diese sollte vorab gesichert werden:
```bash
# In WSL (/home/unixusername/nodges):
git add src/utils/LLMService.ts
git commit -m "fix(llm): erweiterte fehlerdiagnose und payload-hinweis fuer proxy"
git push origin pi
```

### Schritt 2: Windows-Repo auf den neuesten Stand bringen
Anschliessend werden die neuesten Aenderungen im Windows-Repository abgerufen:
```bash
# Im Windows-Verzeichnis:
git checkout pi
git pull origin pi
```

### Schritt 3: Stabilisierungs-Commits integrieren
Die 6 Stabilisierungs-Commits aus `refactor/pi-stabilization` enthalten wichtige Performance- und Architekturverbesserungen:
```bash
# Stabilisierung auf pi zusammenfuehren
git checkout pi
git merge refactor/pi-stabilization
```

### Schritt 4: `main` auf den aktuellen Stand heben
Bisher war `main` auf GitHub veraltet (v0.103), waehrend `pi` (v0.105.2) der eigentliche Hauptcode ist. Um eine saubere, einheitliche Version zu etablieren:
```bash
git checkout main
git pull origin main
git merge pi
```
Damit wird `main` auf die vollstaendige Version 0.105.2 gebracht, inklusive DevContainer, LightRAG-Backend und 3-Schichten-Architektur.

### Schritt 5: Zu GitHub uebertragen
```bash
git push origin main
git push origin pi
```
Beide Hauptzweige sind nun auf GitHub auf demselben modernen Stand.

---

## 3. Synchronisationsmodell fuer den laufenden Betrieb

Um sicherzustellen, dass Antigravity (Windows) und Pi (Container) stets auf demselben Stand arbeiten, gibt es zwei Wege:

### Modell A: GitHub als zentraler Abgleich (Empfohlen bei getrenntem WSL-Mount)
- **Funktionsweise:** Beide Klone (`C:/.../Nodges` und `/home/.../nodges`) bleiben getrennt.
- **Workflow:** 
  - Bevor Pi im Container arbeitet: `git pull`.
  - Wenn Pi eine Aufgabe beendet: `git push`.
  - Bevor Antigravity in Windows arbeitet: `git pull`.
  - Wenn Antigravity eine Aufgabe beendet: `git push`.
- **Vorteil:** Maximale Docker-Dateisystem-Geschwindigkeit unter Linux/WSL2.

### Modell B: Gemeinsames Verzeichnis nutzen (Echtzeit-Synchronitaet)
- **Funktionsweise:** In `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env` wird der Pfad geaendert auf:
  ```env
  REPO_PATH=/mnt/c/Users/ich/Desktop/code/_projects/Nodges
  ```
- **Vorteil:** Es existiert nur noch ein einziges Repository auf der Festplatte. Jede Datei, die Antigravity in Windows aendert, ist in derselben Sekunde auch im Pi-Container sichtbar (und umgekehrt). Kein `git push`/`pull` zwischen den beiden Arbeitsbereichen noetig.
- **Nachteil:** Docker-Zugriffe ueber das WSL-Mount `/mnt/c` koennen bei extrem vielen kleinen Dateioperationen geringfuegig langsamer sein als im nativen Linux-Dateisystem.
