# Setup Nodges — Multi-Harness Arbeitsumgebung

**Stand:** 2026-09-27 · **Verantwortlich:** piCon (Container) + conT (Antigravity auf `W:`)
**Abgekoppelt:** winAnt (war Antigravity auf Windows NTFS, ersetzt durch conT)
**Dies ist die technische Kurzanleitung.** Der ausfuehrliche Bericht und Dialog steht in **`bericht.md`**.
Eine detaillierte Gesamtdarstellung der Skripte und Kommunikation liegt unter [W:/com/setup/multi_harness_setup_und_kommunikation.md](file:///W:/com/setup/multi_harness_setup_und_kommunikation.md).

---

## 1. Architektur (verbindlich: Ein Arbeitsort, zwei Zugriffe)

**Beschluss des Benutzers 2026-09-24: `winAnt` wird abgekoppelt und ist durch `conT` ersetzt.**

Es gibt **nur noch einen physischen Arbeitsort**. piCon und conT teilen sich **dieselben Dateien** — ein Git-Sync zwischen ihnen ist **nicht** noetig.

```
        /home/unixusername/nodges   (WSL2, ext4)  <-- EIN Arbeitsort
                    |
        +-----------+-----------+
        |                       |
   /workspace              W:\  (Netzlaufwerk)
   [piCon, Container]      [conT, Antigravity Windows 11]
        |                       |
        +-----------+-----------+
                    |
              GitHub zum Backup

winAnt (C:\...\Nodges, NTFS) = ABGEKOPPELT - nicht mehr verwenden
```

**Arbeitsaufteilung:**
- **piCon:** Container-Dienste, Vite (5173), LightRAG (8000), Linux-Skripte, Backup & Git-Pflege.
- **conT:** Architektur, Frontend, Three.js, Dokumentation — **auf denselben Dateien** wie piCon.
- **GitHub:** Sicherung und Historie, nicht primaere Bruecke.

**Warum `W:\` und nicht der UNC-Pfad?** Antigravity (Electron/VS-Code) startet einen **File-Watcher** (Datei-Ueberwachungsdienst), der unter Windows die API `ReadDirectoryChangesW` nutzt. Das WSL-Dateisystem laeuft ueber das **9P-Protokoll**, das diese Benachrichtigungen nicht standardkonform unterstuetzt → Absturz beim **direkten** UNC-Zugriff. Ein **zugeordnetes Netzlaufwerk** umgeht das. Details: `bericht.md` Teil E und F.

**Alle Dienste laufen weiterhin im Linux-Container:**

| Dienst | Port | Wo |
|---|---|---|
| Vite / Nodges Dev-Server | 5173 | Container |
| LightRAG API | 8000 | Container (intern) |
| Vite-Proxy auf LightRAG | 5173 `/lightrag-api` | Container |


---

## 2. Git-Regeln

| Was | Wert |
|---|---|
| Remote | `git@github.com:Banixx/Nodges.git` (SSH) |
| Arbeitsbranch (ALLE Harnesses) | **`main`** (einziger Branch, beschlossen 2026-09-24) |
| Branch `pi` | **GELOSCHT** — vollstaendig in `main` aufgegangen. Alle Dokus/Rituale muessen `main` statt `pi` sagen! |
| Erstes Tag | `v0.106.0` auf `51af1f4` |
| Zugang piCon | SSH-Key `id_ed25519` (Kommentar `nodges-container`) |
| Zugang conT | direkt auf dieselben Dateien (`W:`), Git ueber Windows Credential Manager |
| ~~Zugang winAnt~~ | **abgekoppelt** — nicht mehr verwenden |

**Verifiziert:** `fetch`, `push` und `push --dry-run` laufen fehlerfrei (Lesen und Schreiben).

**Versionstags:** Ein Tag (Etikett) ist ein fester Name fuer einen Commit — eine Momentaufnahme, die sich nie verschiebt. Wenn der Benutzer sagt *"das ist jetzt stabil"*: `git tag v0.106.0 && git push --tags`. Danach ist dieser Stand dauerhaft wiederfindbar. Aktuelle Version laut `package.json`: `0.106.8`.

**Ablauf — zwingend:**
```
Datei aendern -> git add -> git commit (lokal) -> git push -> GitHub aktuell
```
Ein **Commit** wirkt nur im lokalen Checkout. **Push** laedt hoch. **Pull** holt in einen anderen Checkout.
GitHub wird **nicht** automatisch aktualisiert.

**Automatisierter Git-Workflow (verbindlich seit Version 0.106.5):**
> **Ersetzung durch piCon (2026-09-25):** Die alten Handover-Skills `sgc` (in jeder Version pushen) und
> `sgp` (Pull) sind abgeloest. `sgc` zeigte historisch auf **`origin/pi`** — dieser Branch ist geloescht,
> der Skill wuerde **ins Leere laufen**. Heute gilt ein einziges Skript fuer **beide** Harnesses:
> `tools/nodges-git.sh`. conT und piCon rufen identisch auf, damit es keine Abweichungen gibt.

```bash
bash tools/nodges-git.sh status    # Stand anzeigen, aendert nichts
bash tools/nodges-git.sh save      # Patch +1, lokaler Commit, KEIN Push
bash tools/nodges-git.sh release   # Minor (Patch auf 0) + Tag + Push nach origin/main
```

- **`status`** ersetzt **`sgp`**: Da conT (`W:/`) und piCon (`/workspace`) dieselbe Arbeitskopie teilen,
  gibt es nichts zu holen, solange lokal gearbeitet wird. Ein `git pull` suggerierte das faelschlich.
- **`save`** ist der normale Arbeitsschritt. Version steigt um 1, `git add -A`, Commit mit der reinen
  Versionsnummer. **GitHub bleibt unberuehrt.**
- **`release`** ist der einzige Weg nach GitHub: Minor-Sprung, Typecheck und Unit-Tests, Commit, Tag
  `v0.107.0`, Push von `main` und Tag. Ein `pre-push`-Hook blockiert Pushes mit Patch-Version.

> **Fuer conT genau gleich:** dieselben drei Befehle, aufzurufen im Workspace `W:/`.
> Vorsicht: Solange local Commits **voraus** liegen, waere ein Zuruecksetzen auf `origin/main`
> ein Datenverlust.


---

## 2b. Der COM-Bus und die Multi-Harness-Kommunikation (Historisch / Vollstaendig zurueckgebaut)

> **Ueberholt / Zurueckgebaut (Beschluss 2026-10-02 und anschliessende Dateiaufraeumung):** Der aktive COM-Bus, Hintergrundwaechter (`watch_com.*`), Pingskripte (`nodges-com.*`, `sync_com.ps1`, `test-com.sh`), der Skill `com`, die Pi-Extension `nodges-com.ts` samt Sicherung und das Verzeichnis `tools/com-bus/` sind entfernt.
> Die Koordination aller Harnesses (`conT`, `piCon`, `dopi`) erfolgt fortan rein **zustandsbasiert ueber [W:/com/todo.md](file:///W:/com/todo.md)** und Dateistatus im ext4/Netzlaufwerk (SSoT). Die nachfolgenden Abschnitte und Tabellen dienen ausschliesslich der Dokumentationshistorie.

Grundsatz fuer alle Agenten: **"Die Datei ist der Inhalt, der Ping ist nur die Klingel."**

### Die zwei Saeulen der Kommunikation:

1. **Inhaltsebene (Harness-Chat via Rapport):**
   - Groessere Abstimmungen laufen ueber standardisierte Rapport-Dateien: `com/plan/<thema>/rapport_<thema>.md`.
   - Die Blaupause dafuer ist [W:/com/setup/harness_chat_setup.md](file:///W:/com/setup/harness_chat_setup.md).
   - Fester Ablauf im **3-Runden-Ping-Pong:** Runde 1 (Schnittstellen & DTOs) → Runde 2 (Datenvertrag & Expansion) → Runde 3 (Visualisierung & Verifikation).

2. **Klingelebene (COM-Bus):**
   - Liegt unter [W:/tools/com-bus/](file:///W:/tools/com-bus/) (ausserhalb von `com/`, um Rekursion zu vermeiden).
   - Protokoll: `tools/com-bus/events.log`.
   - Weckruf: `ping-<ziel>.md` (`conT`, `piCon` oder `all`).
   - Die fruehere Agent-Extension `/home/.pi/agent/extensions/nodges-com.ts` samt Sicherung ist geloescht.
   - conT liest `com/todo.md`, die Rapport-Dateien und prueft Pings in `tools/com-bus/`.

### Werkzeuge des COM-Busses:

| Werkzeug | Harness | Plattform | Befehle |
|---|---|---|---|
| [W:/tools/nodges-com.sh](file:///W:/tools/nodges-com.sh) | piCon | Bash (Linux) | `start`, `stop`, `status`, `read`, `ack`, `ping`, `watch` |
| [W:/tools/watch_com.mjs](file:///W:/tools/watch_com.mjs) | piCon | Node.js (Linux) | Daemon fuer Linux-Events und `events.log` |
| [W:/tools/test-com.sh](file:///W:/tools/test-com.sh) | piCon / conT | Bash | 8-stufiger Regressionstest ohne Seiteneffekte |
| [W:/tools/nodges-com.ps1](file:///W:/tools/nodges-com.ps1) | conT | PowerShell | `ping`, `status`, `read`, `sync` |
| [W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1) | conT | PowerShell | Hintergrunddienst fuer Windows, Heartbeat-Fallback und Sync-Trigger |
| [W:/tools/sync_com.ps1](file:///W:/tools/sync_com.ps1) | System | PowerShell | One-Way-Spiegelung via `robocopy /MIR` nach `C:/Users/ich/Desktop/code/_Nodges_Com_Sync` |


---

## 3. Zeilenenden (verbindlich geregelt)

Es gibt eine **Root-`.gitattributes`**:

```
* text=auto eol=lf
```

plus `binary`-Ausnahmen fuer PNG/JPG/PDF/ZIP/WOFF und eine **CRLF-Ausnahme fuer Windows-Skripte** (`*.cmd`, `*.bat`, `*.ps1`). Damit gilt reposweit **LF** — ausser fuer CMD-Dateien, die zwingend CRLF brauchen, weil sie den Container starten.

> **Achtung:** Eine untergeordnete `.gitattributes` (z. B. `Nodges_Pi/.gitattributes`) **ueberschreibt** die Root-Datei. Ausnahmen muessen in **beiden** stehen.

**Warum das noetig war:** Beim Freigeben von `doc/` meldete Git bei Dutzenden Dateien `CRLF will be replaced by LF`. Die Windows-Seite hatte CRLF geschrieben. Ohne diese Regel meldet Git Dateien als geaendert, deren Inhalt identisch ist.

---

## 4. Dokumentationsablage

| Datei | Zweck |
|---|---|
| **`bericht.md`** (in `com/`) | Gemeinsamer Bericht und Dialog piCon + conT (Historie mit winAnt in Teil A–E dokumentiert) |
| **`setup.md`** (in `com/`) | Diese technische Anleitung |
| `doc/` | Arbeitsdokumente von winAnt (mit Versionspraeefix, z. B. `0_106_0_...md`) |
| `docs/` | Weitere Projektdoku |

**Wichtig:** `doc/` ist seit 2026-09-24 **nicht mehr** in der `.gitignore` — es ist versioniert, damit beide Harnesses die Berichte sehen. Beim Freigeben wurde ein Secrets-Scan durchgefuehrt: sauber (nur Platzhalter, keine echten Schluessel).

**Ballast ist bereits bereinigt** (Commit `a844ac5`): `doc/archiv_history/` (252 Dateien), ein Windows-Duplikat („Kopie von …") und fuenf experimentelle `tuned1-5.json` wurden entfernt. `doc/` hat jetzt 333 statt 591 Dateien. Geloeschtes bleibt in der Git-Historie abrufbar.

---

## 4b. Windows-spezifische Git-Einstellungen (von winAnt gesetzt, verifiziert)

| Einstellung | Wert | Zweck |
|---|---|---|
| `safe.directory` | `\\wsl.localhost\Ubuntu\home\unixusername\nodges` | Unterdrueckt Git-Berechtigungswarnungen beim Zugriff ueber den UNC-Pfad |
| `core.fileMode` | `false` (im WSL-Repo) | Verhindert Schein-Aenderungen durch abweichende Dateiberechtigungen zwischen Windows und Linux |

Falls Windows-Git den WSL-Pfad meldet als *„dubious ownership“*, ist `safe.directory` nicht gesetzt.

---

## 5. Identitaet und Autorenschaft

Im Container ist gesetzt: `user.name = Pi Agent`, `user.email = pi-agent@localhost`.
Historisch committeten auch `Banixx`, `Nodges Bot`, `Arbreska Trun` und `bani`.

**Empfehlung von winAnt (noch nicht umgesetzt):** Git-Trailer im Commit, damit Banixx Repo-Owner bleibt und KI-Beitraege transparent sind:
```
Co-authored-by: Antigravity <antigravity@internal>
```

---

## 6. MCP und Werkzeuge

**Es wird kein GitHub-MCP verwendet.** Begruendung (Details in `bericht.md` Abschnitt 3):

- Pi (der Agent) hat **bewusst kein eingebautes MCP** — Erweiterungen sind als Extension oder Skill vorgesehen.
- Der Git-Weg funktioniert verifiziert. Mehr Werkzeuge = mehr Tokens = hoehere Kosten pro Anfrage, ohne Mehrwert fuer Standardsync.
- Bei Bedarf an Issues/Pull-Requests ist die **`gh` CLI** die schlankere Alternative (Node ist vorhanden, `api.github.com` ist erreichbar).

winAnt hat zwar 24 MCP-Werkzeuge verfuegbar, nutzt sie aber fuer Git-Sync **nicht** — ebenfalls aus Tokenspargruenden.

---

## 7. Checkliste fuer einen neuen Harness

1. Dieses `setup.md` lesen, dann `bericht.md` (beide in `com/`), dazu `com/00_start_hier.md` als Einstieg.
2. `git fetch` und `git status` pruefen — **nie** auf veraltetem Stand arbeiten.
3. conT arbeitet ueber `W:\`; piCon ueber `/workspace`. Beide zeigen auf **dieselben** Dateien.
4. `git` nur in Linux ausfuehren.
5. Keine Secrets (`.env`, Schluessel) ins Repo — sie bleiben lokal und ignoriert.
6. Vor groesseren Schritten den Benutzer fragen; keine stillen Veraenderungen an fremder Arbeit.

Health-Checks im Container:
```bash
curl -s http://localhost:8000/health
curl -s http://localhost:5173/lightrag-api/health
```

---

## 8. Status der offenen Punkte (Stand 2026-09-27)

- **winAnt / Windows-Workspace `C:/.../Nodges`:** **ABGEKOPPELT** (Beschluss 2026-09-24). Ersetzt durch **conT** auf `W:/`. Workspace ist archiviert.
- **Branch-Strategie:** **ALLE Harnesses arbeiten auf `main`.** Branch `pi` ist geloescht.
- **Git-Workflow (0.106.5+):** `tools/nodges-git.sh` verbindlich fuer conT und piCon. Zwischenstaende bleiben lokal (`save`), Releases bringen Minor-Sprung und Push (`release`).
- **Build 14 (LightRAG Query-Subgraphen & DTOs):** Abgeschlossen und integriert (3 Runden Ping-Pong zwischen conT und piCon).
- **Backend-Tests:** In `package.json` hinterlegt (`"test:backend"`). 18 Pytest-Tests im Backend gruen, ohne externe API-Kosten.
- **`test:all`:** Offen. Soll L0/L1 buendeln. E2E muss im Container via `NODGES_SKIP_E2E=1` uebersprungen werden, da Chromium im Container an fehlenden Systembibliotheken scheitert.
- **E2E-Gate in `release`:** Offene Benutzerentscheidung in `com/entscheidungen.md`.
- **E2E-Suiten:** `05-visual-regression` und `06-lightrag-integration` in Ausarbeitung durch conT.
- **Lifespan-Handler in `main.py`:** Folgethema im Backend (DeprecationWarning beheben).
- **LightRAG-Daten (`lightrag-backend/rag_storage/`):** Vektordaten bleiben lokal im Linux-Container; Backup-Skript `backup_storage.sh` verifiziert.

---

*Verfasst von **piCon** (2026-09-24), umfassend aktualisiert und ergaenzt von **conT** (2026-09-27).*
