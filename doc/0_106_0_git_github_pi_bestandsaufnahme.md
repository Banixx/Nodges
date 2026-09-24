# Bestandsaufnahme: Git (lokal), GitHub und Pi-Container

**Projekt:** Nodges ([package.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges/package.json))  
**Version:** 0.106.0  
**Datum:** 2026-09-24  
**Untersuchte Umgebungen:** Windows-Host, WSL2 (Ubuntu), Docker (`pi-harness`), GitHub (`Banixx/Nodges`)

---

## 1. Kernaussagen auf einen Blick

- **Git-Status:** Der primaere Entwicklungszweig ist `pi`. Sowohl lokal auf Windows als auch im WSL-Container und auf GitHub steht `pi` auf Commit `80236c5` (Hinzufuegen von [Plan_v4_Nodges_Diagnose_Refactoring.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/Plan_v4_Nodges_Diagnose_Refactoring.md)).
- **GitHub vs. pi:** Der Branch `origin/pi` ist `origin/main` um exakt 13 Commits voraus. Ein Fast-Forward-Merge von `pi` in `main` ist konfliktfrei moeglich. Der Remote-Branch `feature/multi-build` wurde sowohl remote als auch lokal vollstaendig geloescht.
- **Pi-Container:** Der Container `pi-harness` laeuft seit ueber 12 Stunden. Vite (Port 5173) und das LightRAG-Backend (Port 8000) sind aktiv und online (`status: online`, Modell: `qwen/qwen3-embedding-8b`).
- **Pi-Agent:** Die persistenten Daten liegen in `/home/unixusername/.pi` (gemountet als `/home/.pi`). Die letzte Sitzung des Pi-Agents endete mit der erfolgreichen Loeschung des Hilfs-Branches `feature/multi-build` und der Fast-Forward-Pruefung fuer den Merge nach `main`.
- **Auffaelligkeit im WSL-Dateisystem:** Im WSL-Workspace (`/home/unixusername/nodges`) sind 5 Dateien im Dateisystem geloescht, aber nicht gestaged (`blau.txt`, `git-setup-bericht.md`, `hier_start_pi_cmd.txt`, `hrlp.txt`, `lexikon.md`). Auf Windows sind diese Dateien vollstaendig vorhanden.

---

## 2. Lokaler Git-Status

### Windows-Host ([C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges))

- **Aktiver Branch:** `pi`
- **Stand:** Auf aktuellem Stand von `origin/pi` (`80236c5`).
- **Ungetrackte Dateien:**
  - `hier__pro_Nodges.txt` (Hilfs-Markerdatei)
- **Arbeitskopie:** Sauber bis auf den Marker.

### WSL2-Umgebung (`/home/unixusername/nodges` / Container-Mount `/workspace`)

- **Aktiver Branch:** `pi`
- **Stand:** Synchronisiert mit `origin/pi` (`80236c5`).
- **Unstaged Changes (Arbeitsverzeichnis):**
  - `deleted: blau.txt`
  - `deleted: git-setup-bericht.md`
  - `deleted: hier_start_pi_cmd.txt`
  - `deleted: hrlp.txt`
  - `deleted: lexikon.md`
- **Ursache / Einordnung:** Diese Dateien wurden in Commit `20acf62` comittet, wurden jedoch im WSL-Dateisystem geloescht. Da sie im Git-Index existieren, markiert Git sie als "Changes not staged for commit". Bei Bedarf koennen sie mit `git restore <datei>` im WSL-Pfad wiederhergestellt werden.

---

## 3. GitHub-Repository (`https://github.com/Banixx/Nodges`)

### Repository-Metadaten
- **Sichtbarkeit:** Oeffentlich (Public)
- **Primaere Sprache:** TypeScript
- **Default Branch:** `main`
- **Offene Pull Requests:** 0 (PR #1 fuer `feature/multi-build` wurde historisch geschlossen/gemerged)
- **Offene Issues:** 0

### Branch-Vergleich (`pi` vs. `main`)
- `origin/main` steht auf Commit `476bf6c` (*chore: stop tracking .tmp.driveupload and add to gitignore*).
- `origin/pi` steht auf Commit `80236c5` (*docs: Plan v4 Nodges Diagnose, Stabilisierung & Refactoring hinzufuegen*).
- `origin/main` ist vollstaendig in `origin/pi` enthalten (0 fehlende Commits).
- `origin/pi` ist `origin/main` um **13 Commits** voraus:
  1. `80236c5` - docs: Plan v4 Nodges Diagnose, Stabilisierung & Refactoring hinzufuegen
  2. `d6416a6` - Merge origin/main (chore: stop tracking .tmp.driveupload) in pi
  3. `20acf62` - Nachtrag: Testdaten, Build-13-Ergebnisse, Git-Analyse und Berichte
  4. `69163fc` - Version 0.106.0: Diagnose bei Netzwerkfehlern im LLM-Abruf
  5. `d4391c0` - 0.105.1
  6. `10d6c50` - LightRAG im Container, Setup-Doku aktualisiert
  7. `2b3a97b` - key restriction
  8. `346d9c2` - 0.105- zueglete
  9. `2e44e67` - 0.105.1
  10. `d8bef5b` - 0.105.0
  11. `cfe5658` - zwuetschged
  12. `91138a5` - 104
  13. `5b355b9` - 0.103.1 von Pi

---

## 4. Pi-Agent & Container-Infrastruktur

### Container `pi-harness`
- **Image:** `nodges_pi-pi-agent`
- **Compose-Konfiguration:** [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml)
- **Laufende Dienste:**
  - **Vite Dev Server:** Port 5173 (automatisch via CMD als PID 1 gestartet).
  - **LightRAG Backend:** Port 8000 via `.devcontainer/start-lightrag.sh`.
    - Health-Status: `{"status":"online", "lightrag_engine_active":true}`
    - Aktive Datenbank: `/workspace/lightrag-backend/rag_storage/databases/budenbrook`
    - Embedding-Modell: `qwen/qwen3-embedding-8b` ueber OpenRouter

### Pi-Konfiguration & Persistenz (`/home/unixusername/.pi`)
- **Settings:**
  - `defaultProvider`: `openrouter`
  - `defaultModel`: `deepseek/deepseek-v4.1-flash`
  - `sessionDir`: `/home/.pi/agent/sessions`
- **Nutzerprofil (`user.md`):**
  - Festhalten der Arbeitsweise: Lokales Testen im Windows-Browser (Firefox), Entschaerfung von `fetch`-Fehlern in [`LLMService.ts`](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts).
  - Testdaten unter `testdata/buddenbrooks.txt` und `testdata/prompt_bb.txt`.
- **Letzter Stand der Pi-Sitzung:**
  - Pi hat den veralteten Branch `feature/multi-build` auf GitHub und lokal entfernt.
  - Pi hat die Fast-Forward-Faehigkeit von `pi` nach `main` geprueft und dem Nutzer vorgeschlagen, den Merge durchzufuehren.

---

## 5. Fazit & Handlungsoptionen

1. **Hauptzweig aktualisieren (`pi` -> `main`):**
   Da alle Tests, Bereinigungen und Version 0.106.0 stabil auf `pi` liegen, kann `main` konfliktfrei per Fast-Forward auf den neuesten Stand gebracht werden (entweder via GitHub Pull Request oder lokal).
2. **WSL-Dateisystem saeubern:**
   Die 5 geloeschten Dateien im WSL-Ordner (`blau.txt`, `lexikon.md` etc.) koennen entweder per `git restore` wiederhergestellt oder, falls nicht mehr gewuenscht, aus dem Git-Tracking entfernt werden.
