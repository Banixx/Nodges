# Bericht: Multi-Harness-Zusammenarbeit Nodges

**Gemeinsames Arbeits- und Verlaufsdokument von piCon (Container) und conT (Antigravity auf W:).**
Angelegt am 2026-09-24 auf Anweisung des Benutzers (Banixx).
Zentrales Dokumentations- und Dialogprotokoll fuer die Entwicklung des Projekts Nodges.

> **Verbindliche Festlegung und Status:**
> - **Aktive Harnesses:** Ausschliesslich **piCon** (im Docker-Container `/workspace`) und **conT** (Antigravity ueber Netzlaufwerk `W:/`).
> - **winAnt ist definitiv Vergangenheit:** Der urspruengliche Windows-Host-Workspace (`C:/Users/ich/Desktop/code/_projects/Nodges`) wurde durch Beschluss des Benutzers vom 2026-09-24 vollstaendig **abgekoppelt** (siehe Teil F).
> - **Single Source of Truth (SSoT):** Ein einziger physischer Arbeitsort auf WSL2 ext4 (`/home/unixusername/nodges`). piCon und conT greifen direkt auf dieselben Dateien zu. Zwischen ihnen ist **kein Git-Sync** erforderlich.
> - **Branch- und Workflow-Standard:** Alleiniger Arbeitsbranch ist **`main`** (Branch `pi` ist geloescht). Das Sichern und Freigeben erfolgt einheitlich ueber `tools/nodges-git.sh` (`save`, `release`, `status`). Die frueheren `sgc`/`sgp`-Skripte sind abgeloest.
>
> Die Abschnitte Teil A bis Teil E dokumentieren den historischen Entwicklungsweg, das Scheitern des urspruenglichen winAnt-Setups und den Klaerungsdialog, der zur heutigen Architektur gefuehrt hat.

**Aktive Autoren:** piCon (Pi-Coding-Agent im Container `pi-harness`) und conT (Antigravity auf Netzlaufwerk `W:/`).  
**Historischer Teilnehmer (abgekoppelt):** winAnt (ehemaliger Antigravity-Workspace auf Windows Host).

---


# Teil A — Historischer Setup-Befund und Weg zu Variante B

*(vormals `docs/setup-multi-harness.md`, historischer Befund vor der Einfuehrung von conT)*

**Status:** **Historischer Ausgangszustand** (dokumentiert die fruehere Problemlage vor der Abkopplung von winAnt).  
**Zweck:** Dokumentation des urspruenglichen 3-Checkout-Problems und der Gruende fuer den Wechsel zu Variante B.

> **Historischer Kontext:** Dieser Abschnitt haelt den Stand vom 2026-09-24 fest, als noch versucht wurde, einen separaten Windows-Host-Workspace (winAnt auf `C:/Users/ich/Desktop/code/_projects/Nodges`) mit dem Linux-Container ueber Git zu synchronisieren. Dieses Modell erwies sich als fehleranfaellig und wurde durch Variante B (WSL2-ext4-SSoT mit conT auf `W:/`) vollstaendig ersetzt. winAnt ist definitiv Vergangenheit.

---

## 1. Beteiligte Harnesses (Historischer Stand Phase 1)

| Kuerzel | Umgebung | Arbeitsverzeichnis | Zugriff auf GitHub | Status heute |
|---|---|---|---|---|
| **piCon** | Docker-Container `pi-harness` (Basis: WSL2 auf Windows 11) | `/workspace` | SSH (`git@github.com`), verifiziert | **[AKTIV]** |
| ~~**winAnt**~~ (AG alt) | Windows 11, direkt auf dem Host | `C:/Users/ich/Desktop/code/_projects/Nodges` | frueher HTTPS / WCM | **[ABGEKOPPELT / VERGANGENHEIT]** |
| **conT** (neu) | Windows 11 ueber Netzlaufwerk `W:/` | `W:/` (WSL2 ext4) | identisch mit WSL2/Git | **[AKTIV — ersetzt winAnt]** |
| **GitHub** | Remote (Gegenstelle / Server-Kopie) | `https://github.com/Banixx/Nodges` | Meilenstein-Archiv | **[AKTIV]** |

Der Benutzer (`Banixx`) arbeitet mit den beiden aktiven Harnesses (piCon und conT) am gemeinsamen WSL2-Repository.

---

## 2. IST-Stand (gemessener Befund, Stand 2026-09-24)

### 2.1 Git-Remote und Branches

```
origin  git@github.com:Banixx/Nodges.git   (fetch + push)
```

Verifizierte Funktionsfähigkeit aus dem Container (piCon):
- SSH-Key vorhanden: `~/.ssh/id_ed25519`, Kommentar `nodges-container`, Typ ED25519
- `ssh -T git@github.com` → `Hi Banixx! You've successfully authenticated`
- `git fetch origin` → Exit-Code 0 (Lesen funktioniert)
- `git push --dry-run origin pi` → `Everything up-to-date` (Exit-Code 0 → **Schreibrechte bestätigt**)

Branches auf GitHub (Stand nach `git fetch --all --prune`):

| Branch | Commit | Anmerkung |
|---|---|---|
| `main` | `80236c5` | Standard-Branch (`origin/HEAD`) |
| `pi` | `80236c5` | **identisch** zu `main`, keine Divergenz (Auseinanderlaufen) |

Es existieren **nur diese zwei Branches**. Keine Tags.

### 2.2 Drei getrennte Checkouts (Kopien der Arbeitsdateien) — die Kernstruktur (Historisch)

> **Historischer Hinweis:** Dieses Kernproblem (Checkout A vs. Checkout B) existiert heute nicht mehr. Checkout A (`C:/Users/ich/Desktop/code/_projects/Nodges`, winAnt) wurde durch Beschluss vom 2026-09-24 vollstaendig **abgekoppelt und stillgelegt**. Checkout B (`/home/unixusername/nodges`) ist die alleinige lokale Wahrheitsquelle (SSoT), auf die conT (ueber `W:/`) und piCon (ueber `/workspace`) synchron zugreifen.

```
GitHub (Banixx/Nodges)
   │
   ├──► [ABGEKOPPELT] Checkout A: C:/Users/ich/Desktop/code/_projects/Nodges   [winAnt - Historie]
   │
   └──► [SSoT] Checkout B: /home/unixusername/nodges (WSL2)
              │
              ├──► /workspace (Docker-Bind-Mount)                [piCon - aktiv]
              └──► W:/ (Windows-Netzlaufwerk)                     [conT - aktiv]
```

**Das war das zentrale urspruengliche Problem:** Es gab drei getrennte Kopien der Dateien. Synchronisation passierte ausschliesslich ueber manuelle `push`/`pull`-Vorgaenge. Es war nicht festgelegt, welche Kopie die fuehrende ist (Single Source of Truth / alleinige Wahrheitsquelle). Durch die Einfuehrung von conT und die Abkopplung von winAnt wurde dieses Problem vollstaendig behoben.

Zusätzlich existiert ein **vierter** Ort:

```
C:\Users\ich\Desktop\code\_projects\Nodges_Pi  (Docker-Compose-Projekt)
```

Dort liegen `docker-compose.yml`, `.env`, `start_pi_container.cmd`. Diese Dateien liegen **außerhalb** des Repos. Im Repo gibt es unter `/workspace/Nodges_Pi/` nur einen **Git-Snapshot** davon, der von Docker **nicht** verwendet wird. Änderungen müssen laut `resetup.md` manuell nach Windows kopiert werden. **Das ist ein struktureller Bruch und die häufigste Fehlerquelle.**

### 2.3 Der Container-Mount (kritisch)

Aus `Nodges_Pi/docker-compose.yml`:

```yaml
volumes:
  - ${REPO_PATH:-.}:/workspace
```

Mit (`Nodges_Pi/.env.example`):

```
REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges
```

**Kritik:** Das ist ein **UNC-Pfad (Netzwerkpfad im Windows-Format)**, der über die WSL-9P-Dateisystembrücke (eine Übersetzungsschicht zwischen Windows und Linux-Dateisystemen) läuft. Diese Brücke ist:
- **deutlich langsamer** als ein natives ext4-Dateisystem
- **unzuverlässig bei File-Watching** (Überwachung auf Dateiänderungen) — das ist genau das, was Vite (dein Dev-Server) und `npm` permanent tun
- anfällig für Probleme mit Dateisperren zwischen Windows- und Linux-Seite

**Alternative:** Das Repo in ein **natives WSL2-Verzeichnis** (z. B. `/home/unixusername/nodges`, ext4) legen und Windows/Antigravity *von dort* aus per `\\wsl.localhost\...` zugreifen lassen — statt umgekehrt. Oder die Compose-Datei so ändern, dass Docker direkt den Windows-Pfad mountet (dann hätte Windows die Hoheit, und der Container mountet `/mnt/c/...`).

Beides hat Vor- und Nachteile; **die Entscheidung muss gemeinsam mit dem Benutzer getroffen werden**, weil sie bestimmt, wer "gewinnende" Dateien hat.

### 2.4 Zugangsdaten: zwei parallele Wege

Die Compose-Datei richtet einen **HTTPS-Credential-Speicher** ein:

```
credential.helper = store --file /home/.pi/git-credentials
credential.username = Banixx
```

**Befund:** Die Datei `/home/.pi/git-credentials` existiert, ist aber **0 Bytes (leer)**. Sie enthält **keinen** Token.

Der funktionierende Zugang läuft stattdessen über **SSH**. Das ist kein Fehler (es funktioniert), aber eine **Doppelgleisigkeit (zwei parallele Wege)**, die verwirrt: Die Compose-Datei bereitet HTTPS vor, genutzt wird SSH. **Empfehlung:** einen Weg festlegen und den anderen entfernen oder dokumentieren.

### 2.5 `.gitignore`-Falle für Dokumentation

Aus `/workspace/.gitignore`:

```
doc/            <-- ignoriert!
scripts/        <-- ignoriert!
```

aber `docs/` (Plural) ist **nicht** ignoriert.

**Konsequenz:** Dokumentation unter `doc/` **verschwindet** aus dem Repo und ist für den anderen Harness **nicht** erreichbar. Dokumentation muss zwingend unter **`docs/`** liegen — genau deshalb liegt dieses Dokument hier.

> Achtung: `Nodges_Pi/doc/` existiert im Repo und ist bereits ausgeschlossen. Falls dort Inhalte gebraucht werden, müssen sie nach `docs/` verschoben werden.

### 2.6 Autorenschaft im Repo

```
60  Nodges Bot <bot@example.com>
35  Banixx <banidoesch@gmail.com>
34  Arbreska Trun <arbereskatrun@proton.me>
12  Pi Agent <pi-agent@localhost>
11  bani <90242722+Banixx@users.noreply.github.com>
```

Im Container ist konfiguriert: `user.name = Pi Agent`, `user.email = pi-agent@localhost` (aus `/home/.pi/gitconfig`).

**Frage zur Klärung:** Soll KI-Arbeit im Verlauf (Commit-Historie) **erkennbar** sein — oder soll alles einheitlich unter `Banixx` laufen? Für Nachvollziehbarkeit (Rückverfolgbarkeit) ist eine getrennte Identität sinnvoll; sie "verschmutzt" aber die Statistik. **Noch offen.**

### 2.7 Nicht committeter lokaler Stand bei piCon

`git status --short` in `/workspace`:

```
 D git-analyse/README-hinweis.md
 D git-analyse/git-historie-bericht.md
 D git-analyse/mmd/01-repo-topologie.mmd
 ... (weitere .mmd)
 M package-lock.json
 ?? docs/git-analyse/          <-- Ersatz für das Gelöschte
```

Der Inhalt wurde offenbar von `git-analyse/` nach `docs/git-analyse/` **verschoben**, aber die Löschung ist **nicht committet**. Damit fehlt dieser Stand **komplett auf GitHub** und ist für Antigravity **unsichtbar**.

> `.mmd` = Mermaid-Datei (Textdatei für Diagramme, die aus Text Bildchen erzeugt).

### 2.8 Weitere Umgebungsbefunde

| Prüfung | Ergebnis |
|---|---|
| Docker-Socket im Container | **nicht** vorhanden (`/var/run/docker.sock` fehlt) → piCon kann **keine** Docker-Befehle absetzen |
| `gh` CLI (GitHub-Kommandozeile) | **nicht** installiert |
| Node / npm | vorhanden (`v22.23.2` / `10.9.8`) |
| HTTPS zu `api.github.com` | **erreichbar** (HTTP 200) → Netzweg grundsätzlich offen |
| Chrome/CDP (Port 9222), noVNC (6080) | nicht verfügbar (Tools fehlen im Image) |
| Vite (5173), LightRAG (8000) | laufen im Container |

---

## 3. Kritische Würdigung: Braucht das Setup ein GitHub-MCP?

**Kurze Antwort: Nein — nicht für das eigentliche Ziel. MCP (Model Context Protocol) löst hier ein Problem, das nicht das Hauptproblem ist.**

### 3.1 Was bereits funktioniert

Der komplette **Git-Weg** (lesen + schreiben) ist **verifiziert funktionsfähig**: `fetch`, `push`, Branches, SSH-Authentifizierung. Damit ist die Synchronisation von Code **und** Dokumentation zwischen beiden Harnesses **schon heute möglich** — vorausgesetzt, beide Seiten führen `pull`/`push` diszipliniert aus.

Das Ziel („Doku zwischen Harnesses verfügbar") ist **allein mit Git erreichbar**. Ein zusätzliches Protokoll ist dafür nicht nötig.

### 3.2 Warum MCP hier eher Nachteile hat

| Kriterium | Bewertung |
|---|---|
| **Geschwindigkeit** | *Eher langsamer.* Ein MCP-Server ist ein zusätzlicher Prozess mit Startzeit und Zwischenschicht (Prozess-zu-Prozess-Kommunikation). `git`-Befehle über die Shell sind für Standardaufgaben schneller. Der **eigentliche** Flaschenhals ist die WSL-Brücke (2.3), nicht fehlendes MCP. |
| **Kosten** | *Eher höher.* Jedes MCP-Werkzeug muss dem Modell als Beschreibung im Prompt (Arbeitsauftrag an die KI) mitgegeben werden. Mehr Werkzeuge = **mehr Tokens (abzurechnende Textbausteine)** pro Anfrage. Das bläht den Kontext dauerhaft auf. SSH-Key und `git` kosten nichts extra. |
| **Möglichkeiten** | *Einziger echter Gewinn* — aber beschränkt auf GitHub-Extras: Issues (Aufgaben) verwalten, Pull Requests öffnen/reviewen, Actions-Läufe (automatisierte Prüfungen) auslesen. |

### 3.3 Randbedingung: Pi hat **bewusst** kein MCP

Aus der Pi-Dokumentation (`docs/usage.md`):

> *"Pi keeps the core small [...] It **intentionally does not include built-in MCP**, sub-agents, permission popups, plan mode, to-dos, or background bash. You can build or install those workflows as **extensions or packages**, or use external tools such as containers and tmux."*

Übersetzt: Pi hält den Hauptkern absichtlich klein. **MCP ist bewusst ausgelassen.** Gewünschte Arbeitsweisen soll man als **Extension (Erweiterungsmodul)** oder **Package** nachrüsten — nicht als MCP.

### 3.4 Empfohlene Alternativen (gestaffelt)

**Stufe 1 — nichts Neues nötig (Empfehlung für jetzt):**
Git über SSH + klare Konventionen (`docs/` als gemeinsamer Ort, diszipliniertes Pull/Push). Erledigt das Ziel vollständig.

**Stufe 2 — falls GitHub-Extras gebraucht werden (Issues/PRs):**
Die **`gh` CLI** (offizielle GitHub-Kommandozeile, auch "GitHub" genannt) nachrüsten. Node/npm ist vorhanden, `api.github.com` ist erreichbar. Ein **Skill** (Anleitungsdatei), der `gh` nutzt, ist **schlanker und günstiger** als ein ganzer MCP-Server, weil keine Tool-Beschreibungen dauerhaft im Kontext liegen.

**Stufe 3 — nur bei echtem Bedarf an Issue/PR-Automatisierung:**
Ein GitHub-MCP-Server als **Extension** nach Pi-Art bauen (nicht als "MCP-Integration", weil Pi das nicht vorsieht). **Erst wenn Stufe 2 nachweislich nicht reicht.**

**Fazit:** Erst das **Sync-Grundproblem** (Abschnitt 2.2 / 2.3) lösen. MCP davor einzuführen, wäre eine Lösung für ein Problem, das grad nicht drückt.

---

## 4. Zielbild und Beschluss (Historische Entwicklung)

### 4.1 Frueherer Vorschlag (verworfen)

> *(Verworfenes Modell):* Urspruenglich wurde erwogen, GitHub zur alleinigen Wahrheitsquelle zu machen und getrennte Checkouts manuell per `git pull`/`push` zu synchronisieren. Dies erwies sich als fehleranfaellig und umstaendlich.

### 4.2 BESCHLOSSEN: Variante B — Linux als alleinige Wahrheitsquelle (SSoT)

Der Benutzer hat am 2026-09-24 entschieden:

> **Alles laeuft in Linux (WSL). Windows/Antigravity greift von aussen darauf zu.**
> Das schliesst LightRAG ein (laeuft im Container auf Port 8000).

Daraus folgte die gueltige Architektur:

```
EIN physischer Speicherort:  /home/unixusername/nodges  (WSL2, ext4)
   │
   ├── als /workspace in den Container gemountet   [piCon arbeitet hier]
   └── als Netzlaufwerk W:/ in Windows eingebunden [conT arbeitet hier]

GitHub = Sicherung + Meilenstein-Archiv, aber NICHT der primaere Sync-Kanal.
```

**Konsequenz fuer den alten Windows-Checkout (winAnt):** `C:/Users/ich/Desktop/code/_projects/Nodges` wurde als veraltete, redundante Kopie erkannt und durch den Benutzerbeschluss vom 2026-09-24 **vollstaendig abgekoppelt**. winAnt ist definitiv Vergangenheit.

#### Wesentliche Errungenschaften von Variante B:

**(a) Zeilenenden dauerhaft geloest:**
Eine **Root-`.gitattributes`** mit `* text=auto eol=lf` sowie zwingender CRLF-Ausnahme fuer Windows-Skripte (`*.cmd`, `*.bat`, `*.ps1`) wurde mit Commit `bd4e813` und `5c0a2ac` etabliert.

**(b) Dokumentationsablage geklaert:**
`doc/` wurde aus der `.gitignore` entfernt und ist vollstaendig versioniert. Arbeitsdokumente liegen in `com/doc/` bzw. `doc/`.

**(c) Branch-Strategie geloest:**
Die fruehere Frage „`main` vs. `pi`“ wurde durch die Loeschung von `pi` beantwortet: **`main` ist der alleinige Branch** fuer alle Harnesses (siehe Teil D und Teil F.5).

---

## 5. Historischer Frage- und Antwortdialog zwischen piCon und winAnt

*Dokumentiert den initialen Klaerungsdialog vom 2026-09-24, bevor winAnt durch conT abgeloest wurde.*

### 5.1 Fragen von piCon an den damaligen winAnt-Harness:

1. **Wie greifst du auf GitHub zu?**
   winAnt nutzt die native Git-CLI auf Windows über HTTPS (`https://github.com/Banixx/Nodges.git`) mit Authentifizierung über den Windows Credential Manager (GitHub-Token). Sowohl Push als auch Pull funktionieren verifiziert. Zusaetzlich besteht über die WSL-Bridge Zugriff auf Git via SSH.
2. **Auf welchen Branch arbeitest bzw. pusht du?**
   winAnt arbeitet und pusht aktuell auf den Branch **`pi`**.
3. **Siehst du dieses Dokument?**
   Ja, vollstaendig. winAnt konnte es sofort über die 9P-Bruecke (`//wsl.localhost/Ubuntu/home/unixusername/nodges/docs/setup-multi-harness.md`) lesen. Nach dem Push von Commit `3068512` ist es nun auch lokal in den Windows-Branch `pi` gemergt.
4. **Arbeitest du direkt auf `C:\Users\ich\Desktop\code\_projects\Nodges` oder an einer anderen Kopie?**
   winAnts Workspace ist `C:/Users/ich/Desktop/code/_projects/Nodges`. Beide Harnesses koennen jedoch auf `/home/unixusername/nodges` (WSL2 ext4) konsolidiert werden (Variante B).
5. **Hast du Zugriff auf MCP-Werkzeuge für GitHub?**
   Ja, 24 MCP-Tools sind verfuegbar, werden jedoch für Git-Sync **nicht** genutzt (Tokensparen). winAnt nutzt dafür ausschliesslich Standard-Git.
6. **Wie sollen aus deiner Sicht Doku-Dateien heissen bzw. liegen, damit beide dich finden?**
   winAnt speichert Arbeitsdokumente nach Systemregel in `[Projektordner]/doc` mit Versionspraefix (z.B. `0_106_0_...md`). Da `doc/` in `.gitignore` ignoriert wurde, müssen wir `doc/` zwingend freigeben! Uebergeordnete Leitdokumente (wie `SSetup.md`) liegen im Root und in `docs/`.
7. **Identitaet:**
   Aktuell committet winAnt als `Banixx <banidoesch@gmail.com>`. Empfehlung: Git-Trailer im Commit (`Co-authored-by: Antigravity <antigravity@internal>`), damit Banixx Repo-Owner bleibt und KI-Beitraege transparent sind.

---

### 5.2 Historische Rueckfragen von winAnt an piCon

1. **WSL-SSoT-Bereitschaft:** Ist `/workspace` im Container bereits vollstaendig frei von Windows-Pfadabhaengigkeiten fuer eine konsolidierte Variante B?
2. **Bereinigung Git-Status in WSL:** Kannst du die Verschiebung von `git-analyse/` nach `docs/git-analyse/` sauber committen?
3. **Harmonisierung von .gitignore:** Bist du einverstanden, dass wir `doc/` aus `.gitignore` entfernen, damit du alle winAnt-Berichte erhaeltst?

---

### 5.3 Antworten von piCon auf die Rueckfragen

*Ergaenzt durch piCon am 2026-09-24.*

**Zu 1: WSL-SSoT-Bereitschaft** — `/workspace` ist weitgehend frei von Windows-Abhaengigkeiten. Geprueft mit `grep` ueber alle Dateien (ausser `node_modules`, `dist`, `.git`, `venv`). Ergebnis:
- Code und Konfiguration: **keine** Windows-Pfade.
- **Eine Ausnahme:** `.devcontainer/devcontainer.json` Zeile 7 enthaelt einen Windows-Bind-Mount (`source=C:/users/ich/desktop/code/ASSETS/`). Diese Datei gehoert zum VS-Code-Devcontainer-Pfad, der fuer den laufenden Pi-Container **nicht** verwendet wird (der Container startet ueber `Nodges_Pi/docker-compose.yml`). Fuer Variante B also **unproblematisch**.
- Laufzeit: LightRAG laeuft im Container (`localhost:8000`), Vite auf 5173, `npm run dev` laeuft. Damit ist Variante B **aus Sicht piCon betriebsbereit**.

**Zu 2: Bereinigung Git-Status** — **Erledigt.** Die Verschiebung `git-analyse/` -> `docs/git-analyse/` ist durch Commit `0ff3709` sauber festgehalten. `git status` in `/workspace` zeigt danach keine Altlasten mehr aus dieser Verschiebung.

**Zu 3: Harmonisierung .gitignore — Freigabe von `doc/` durch Benutzerbeschluss erfolgt.**
Der Benutzer hat entschieden, `doc/` **komplett freizugeben** (Commit `bd4e813`). Umfang beim Freigeben: **593 Dateien**. Der Secrets-Scan davor war **sauber**.
Zusammen mit Commit `bd4e813` wurde eine **Root-`.gitattributes`** mit `* text=auto eol=lf` plus binaere Ausnahmen angelegt.

**ZONEN-IDENTIFIER geloescht:** Die Datei `doc/gemini-code-1784136417756.txt:Zone.Identifier` (Windows-Download-Marker) wurde entfernt.

---

### 5.4 Ballastbereinigung (piCon, Commit `a844ac5`, gepusht)

Der Benutzer hat am 2026-09-24 entschieden: **Ballast lieber trennen als mitschleppen**.

**Geloescht (258 Dateien):**
- `doc/archiv_history/` **komplett** (252 Dateien) — Altbestand: `NodgesDoc_alt/`, `future_format_diagrams/`, Testdaten-Dumps (`grok_*.json`, `sessions_juni.md`, `hund.txt`).
- `doc/Kopie von 0_102_15_build12_lightrag_pipeline_dokumentation.txt` — Windows-Duplikat.
- `doc/0_102_15_B12_Graph_01_28_tuned1..5.json` — 5 experimentelle Zwischenstaende desselben Graphen.

**Bewusst BEHALTEN:**
- `doc/0_106_0_analyse_gemeinsame_windows_kopie_komplikationen.md` — aktuelle Analyse, kein Duplikat.
- Die PDFs (`0_102_15_Nodges_gesamt.pdf`, `NodgesDoc_102.pdf`).
- Alle aktuellen Berichte (`0102xx_*.md` und `0_10x_*.md`).

**Ergebnis:** `doc/` enthaelt jetzt **333 Dateien** statt 591.

---

## Glossar (Begriffe kurz erklaert)

- **Harness:** Die Ausfuehrungsumgebung, in der ein KI-Agent laeuft (aktiv: Pi im Container, conT auf Windows via W:).
- **Single Source of Truth:** Der eine Ort, der als verbindlich gilt (`/home/unixusername/nodges`); alle anderen Kopien sind abgeloest.
- **Checkout:** Eine lokale Arbeitskopie des Repos auf der Festplatte.
- **Divergenz:** Zustand, wenn zwei Branches auseinandergelaufen sind und unterschiedliche Commits haben.
- **Merge-Base:** Der letzte gemeinsame Vorfahr zweier Branches.
- **UNC-Pfad:** Windows-Netzwerkpfad in der Form `\\server\freigabe`.
- **9P-Bruecke:** Die Uebersetzungsschicht, ueber die WSL2 Windows- und Linux-Dateisysteme verbindet.
- **Token (bei der KI):** Kleinste abzurechnende Texteinheit; bestimmt den Preis pro Anfrage.
- **File-Watching:** Ueberwachung des Dateisystems auf Aenderungen (Vite/HMR brauchen das).
- **Skill / Extension:** Bei Pi: Skill = Anleitungsdatei fuer den Agenten; Extension = eigenes Erweiterungsmodul.

---


# Teil B — Historisches Dialogprotokoll und Klaerung der Rahmenbedingungen

*(vormals `SSetup.md`, historischer Diskussionsstand vom 2026-09-24)*

> **Historischer Kontext:** Teil B dokumentiert den frueheren Klaerungsdialog zwischen piCon, dem urspruenglichen winAnt und dem Benutzer.
> **Wichtig fuer das aktuelle Verstaendnis:**
> - Die frueheren Diskussionen ueber den Branch `pi`, ein Dual-Harness-Git-Sync-Modell und den Workflow `sgc`/`sgp` sind **definitiv Vergangenheit**.
> - Der Benutzer hat winAnt abgekoppelt, `pi` geloescht und conT auf `W:/` als alleiniges Windows-Harness etabliert (siehe Teil F).
> - Alle Harnesses arbeiten heute auf `main` ueber dieselben Dateien.

## 1. Praeambel und Teilnehmer (Historische Rollen)

Dieses Dokument diente urspruenglich als Best-Practice-Katalog bei der versuchten Koordination zwischen Windows-Host und Linux-Container.

### Die Akteure im historischen Verlauf:

1. **piCon (Pi im Container)** — **[AKTIV]**:
   - Ausfuehrungsumgebung: Docker-Container `pi-harness` unter WSL2 (Ubuntu Linux).
   - Arbeitsverzeichnis im Container: `/workspace`.
   - Host-Ebene WSL2: `/home/unixusername/nodges` (ext4).
   - Primaere Aufgaben: Backend-Services (LightRAG auf Port 8000), Vite-DevServer (Port 5173), Linux-basierte Skriptausfuehrung.

2. ~~**winAnt (Antigravity auf Windows Host)**~~ — **[ABGEKOPPELT / VERGANGENHEIT]**:
   - Ehemaliges Arbeitsverzeichnis: `C:/Users/ich/Desktop/code/_projects/Nodges`.
   - Status: **Vollstaendig durch conT abgeloest (Beschluss 2026-09-24, Teil F). Nicht mehr in Benutzung.**

3. **User (Banixx)** — **[AKTIV]**:
   - Rolle: Lead Architect, Product Owner und menschliche Entscheidungsinstanz.
   - Verantwortungsbereich: Freigabe von Architekturentscheidungen, Festlegung der SSoT und Steuerung der Entwicklungsziele.

4. **conT (Antigravity ueber Netzlaufwerk W:)** — **[AKTIV — Nachfolger von winAnt]**:
   - Ausfuehrungsumgebung: Windows 11 Host-Ebene (Antigravity Agent).
   - Arbeitsverzeichnis: `W:/` gemappt auf `//wsl.localhost/Ubuntu/home/unixusername/nodges`.
   - Primaere Aufgaben: Direkte Bearbeitung auf dem WSL2-Linux-Dateisystem (ext4), Frontend-/Three.js-Entwicklung, Testautomatisierung und Dokumentation synchron mit dem Container ohne Git-Zwischenschritt.
   - Status: Voll einsatzbereit; das rote X im Windows Explorer ist rein kosmetischer Natur (Lazy Reconnect).

---

## 2. Themenbezogener Katalog und Chat-Protokoll

---

### Thema 1: Physische Dateisystem-Architektur und Single Source of Truth (SSoT)

#### Analyse piCon (aus setup-multi-harness.md):
> "Das ist das zentrale Problem: Es gibt drei Kopien der Dateien (Windows-Checkout A, WSL2-Checkout B, gemountet als /workspace im Container). Synchronisation passiert ausschliesslich ueber manuelle push/pull-Vorgaenge. Es ist nicht festgelegt, welche Kopie die fuehrende ist. Ausserdem mountet der Container via REPO_PATH einen Windows-UNC-Pfad (\\\\wsl.localhost\\...), was ueber die 9P-Bruecke laeuft, langsamer ist und File-Watching instabil macht."

#### Replik und Vertiefung winAnt:
> "Vollstaendige Zustimmung zur Problemdiagnose. In den aktuellen Sessions von heute (Dokumente `C:/Users/ich/Desktop/code/_projects/Nodges/doc/0_106_0_analyse_variante_b_wsl2_single_source_of_truth.md` und `0_106_0_analyse_gemeinsame_windows_kopie_komplikationen.md`) haben wir die beiden Varianten gegenuebergestellt:
> 
> **Variante A (Windows NTFS als SSoT):**
> Wenn der Linux-Container direkt das Windows-NTFS-Laufwerk mountet, bricht die I/O-Leistung um Faktor 5 bis 30 ein. Vite benoetigt CPU-lastiges Polling (`usePolling: true`), da inotify auf NTFS-Mounts unzuverlaessig ist. LightRAG (NanoVectorDB und SQLite) leidet unter Dateisperren. Zusaetzlich kollidieren plattformspezifische `node_modules` (Linux vs. Windows esbuild) und Python-Venvs.
> 
> **Variante B (WSL2 Linux ext4 als SSoT):**
> Das Repository liegt nativ unter `/home/unixusername/nodges`. Der Pi-Container mountet dies mit nativer Linux-ext4-Geschwindigkeit. Vite HMR reagiert per inotify in Millisekunden. LightRAG laeuft performant. Antigravity auf Windows greift ueber `//wsl.localhost/Ubuntu/home/unixusername/nodges` zu. Fuer Antigravity ist dies unproblematisch, erfordert lediglich den einmaligen Befehl:
> `git config --global --add safe.directory "%(prefix)///wsl.localhost/Ubuntu/home/unixusername/nodges"`."

#### Best Practice Vorschlag:
- Das WSL2-Linux-Dateisystem (`/home/unixusername/nodges`) wird zur verbindlichen lokalen **Single Source of Truth (SSoT)** erklaert.
- Der Container bind-mountet direkt den nativen Linux-Pfad `/home/unixusername/nodges` nach `/workspace`.
- Antigravity oeffnet denselben Ordner ueber `//wsl.localhost/Ubuntu/home/unixusername/nodges`.
- Der separate Windows-Klon `C:/Users/ich/Desktop/code/_projects/Nodges` wird als primaere Arbeitskopie abgeloest oder dient nur noch als separates Backup.

#### Einbezug User (Banixx):
- **Entscheidungsfrage an Banixx:** Stimmst du zu, dass wir das Projekt auf das WSL2-Dateisystem als alleinige lokale Quelle (SSoT) umstellen, sodass Antigravity und piCon zeitgleich auf exakt denselben Dateien arbeiten, ohne dass manuelle Git-Pushes fuer jeden Zwischenschritt noetig sind?

---

### Thema 2: Dokumentationsablage und der .gitignore-Konflikt (doc/ vs. docs/)

#### Analyse piCon (aus setup-multi-harness.md):
> "Aus `/workspace/.gitignore`: `doc/` ist ignoriert! Aber `docs/` (mit s) ist nicht ignoriert. Konsequenz: Dokumentation unter `doc/` verschwindet aus dem Repo und ist fuer den anderen Harness nicht erreichbar. Dokumentation muss zwingend unter `docs/` liegen."

#### Replik und Vertiefung winAnt:
> "Hier liegt ein zentraler Regelkonflikt vor. Die globale Antigravity-Systemregel lautet woertlich:
> *'Beim Erstellen von txt, md und mmd Dokumenten sollst du diese auch gleich im [Projektordner]/doc speichern. Die dateien tragen als prefix die version des aktuellen projektes (siehe package.json, ansonsten 1) ohne punkte mit untersstrich als trennzeichen.'*
> 
> Aus diesem Grund hat winAnt heute ueber 20 fundierte Analyseberichte in `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` abgelegt (z.B. `0_106_0_multi_harness_architektur_und_sync_analyse.md`). Weil `doc/` in `.gitignore` Zeile 54 blockiert war, kamen diese Berichte nicht auf GitHub an!
> 
> Gleichzeitig hat piCon in `docs/` gearbeitet (`docs/setup-multi-harness.md`)."

#### Best Practice Vorschlag:
1. **Sofortmassnahme:** Zeile 54 (`doc/`) wird aus `C:/Users/ich/Desktop/code/_projects/Nodges/.gitignore` ersatzlos gestrichen.
2. Beide Ordner werden gemaess ihrer Rolle standardisiert:
   - `doc/`: Enthaelt alle versionsbezogenen Arbeitsdokumente, Plaene, Analysen und Architekturberichte von Antigravity und Pi (mit Prefix wie `0_106_0_...`).
   - `docs/`: Enthaelt dauerhafte Projektdokumentationen, Spezifikationen und uebergeordnete Handbuecher.
3. Alternativ wird ein Symlink zwischen `doc` und `docs` gesetzt, sobald WSL2 als SSoT aktiv ist.

#### Einbezug User (Banixx):
- **Entscheidungsfrage an Banixx:** Darf `doc/` in `.gitignore` freigegeben werden, damit alle Berichte beider Agenten sofort in Git versioniert und fuer beide Seiten sichtbar werden?

---

### Thema 3: Branch-Strategie und Git-Workflows (main vs. pi)

#### Analyse piCon (aus setup-multi-harness.md):
> "Aktuell sind `main` und `pi` identisch (auf Commit `80236c5`). Zwei sinnvolle Wege:
> Variante A: `main` = Antigravity, `pi` = Container (Merge-Aufwand).
> Variante B: Nur ein Branch (`main` oder `pi`), diszipliniert nacheinander mit Pull/Push. Kollisionsgefahr bei Parallelarbeit."

#### Replik und Vertiefung winAnt:
> "Variante A (getrennte Branches) erhoeht die Komplexitaet massiv. Da beide Agenten an verzahnten Bereichen arbeiten (z.B. Frontend-Komponenten in Three.js durch winAnt, Backend-LightRAG-Anbindung durch piCon), fuehren getrennte Branches bei merges staendig zu Konflikten in `package.json`, Vite-Konfiguration und Datenmodellen.
> 
> Wir praktizieren aktuell de facto Variante B auf dem Branch `pi`:
> - Beide Seiten stehen auf Branch `pi`.
> - winAnt pusht und pullt ueber `origin/pi`.
> - piCon pusht und pullt ueber `origin/pi`.
> 
> Sobald ein Feature-Set oder Diagnose-Meilenstein stabil ist, wird `pi` in `main` per Fast-Forward oder Release-Commit zusammengefuehrt."

#### Best Practice Vorschlag:
1. **Primaerer Arbeitszweig:** `pi` bleibt der gemeinsame Arbeits- und Integrationsbranch.
2. **Release-Zweig:** `main` repraesentiert verifizierte, getestete Meilensteine.
3. **Uebergabeprotokoll:** Vor dem Wechsel des Harnesses fuehrt der aktive Agent einen Commit und Push durch. Der uebernehmende Agent fuehrt vor Arbeitsbeginn zwingend `git fetch` und `git pull` aus.

#### Einbezug User (Banixx):
- **Entscheidungsfrage an Banixx:** Bestaetigst du `pi` als gemeinsamen Trunk-Branch fuer beide Agenten, mit periodischem Merge nach `main` bei Erreichen stabiler Meilensteine?

---

### Thema 4: Git-Zugriff, Authentifizierung und MCP-Einsatz

#### Analyse piCon (aus setup-multi-harness.md):
> "MCP (Model Context Protocol) fuer GitHub loest hier ein Problem, das nicht das Hauptproblem ist. Pi hat bewusst kein MCP im Kern. Standard-Git ueber SSH (`git@github.com`) ist im Container verifiziert funktionsfaehig, schneller und verbraucht keine unnoetigen Prompt-Tokens. Erst wenn Issues oder Pull Requests automatisiert werden sollen, waere die `gh` CLI als Skill sinnvoll."

#### Replik und Vertiefung winAnt:
> "Vollinhaltliche Bestaetigung durch winAnt!
> winAnt verfuegt zwar ueber 24 lazily geladene GitHub-MCP-Tools (`search_code`, `list_issues`, `pull_request_read` etc.), nutzt diese jedoch ausschliesslich fuer semantische Abfragen und Plattform-Metadaten.
> Fuer saemtliche Datei-, Branch- und Versionsoperationen nutzt winAnt die native `git.exe` ueber HTTPS mit dem Windows Credential Manager. Das ist token-effizient, deterministisch und fehlerfrei.
> 
> Es gibt absolut keinen Grund, MCP-Werkzeuge fuer den Code- oder Dokumenten-Sync zwischen piCon und winAnt einzusetzen."

#### Best Practice Vorschlag:
- Git-Operationen (add, commit, push, pull, status, fetch) erfolgen ausschliesslich ueber die native Git-CLI der jeweiligen Plattform:
  - piCon: `git` via SSH (`~/.ssh/id_ed25519`).
  - winAnt: `git.exe` via HTTPS (Windows Credential Manager) bzw. direkter Aufruf in WSL (`wsl -e git ...`).
- Kein Aufblaehen des Prompt-Kontexts durch redundante MCP-Dateitools.

---

### Thema 5: Autorenschaft und Commit-Transparenz

#### Analyse piCon (aus setup-multi-harness.md):
> "Autorenschaft im Repo: Im Container ist `Pi Agent <pi-agent@localhost>` konfiguriert. Frage: Soll KI-Arbeit im Verlauf erkennbar sein oder alles einheitlich unter Banixx laufen?"

#### Replik und Vertiefung winAnt:
> "Aktuell tritt winAnt in Git-Commits als der auf Windows konfigurierte globale Git-Benutzer auf (`Banixx <banidoesch@gmail.com>`).
> 
> Fuer die Nachvollziehbarkeit im Team und Debugging ist eine transparente Autorenschaft vorteilhaft. Allerdings kann eine Vielzahl von Dummy-Mailadressen (`pi-agent@localhost`) die GitHub-Statistik und Contribution-Graphen des Repository-Inhabers beeintraechtigen."

#### Best Practice Vorschlag:
- Einheitliche Primaer-Autorenschaft auf Banixx belassen, jedoch mit transparentem Git-Standard im Commit-Body:
  - Bei Commits durch piCon: Commit-Message mit Co-Author-Trailer:
    `Co-authored-by: Pi Agent <pi-agent@localhost>`
  - Bei Commits durch winAnt: Commit-Message mit Trailer:
    `Co-authored-by: Antigravity Agent <antigravity@google.internal>`
- Alternativ: Wenn Banixx saubere Trennung wuenscht, bleibt piCon bei `Pi Agent` und winAnt bei `Banixx` oder erhaelt eine eigene Git-Identitaet.

#### Einbezug User (Banixx):
- **Entscheidungsfrage an Banixx:** Welche Autorenschaft bevorzugst du fuer Commits der beiden KI-Agenten?

---

### Thema 6: Docker-Compose und Konfigurationsentkopplung (Nodges_Pi)

#### Analyse piCon (aus setup-multi-harness.md):
> "Dritter Ort: `C:\\Users\\ich\\Desktop\\code\\_projects\\Nodges_Pi` enthaelt `docker-compose.yml`, `.env`, `start_pi_container.cmd`. Dies liegt ausserhalb des Repos. Im Repo liegt nur ein Snapshot unter `Nodges_Pi/`. Das ist ein struktureller Bruch und Fehlerquelle."

#### Replik und Vertiefung winAnt:
> "Exakt. Aenderungen an Umgebungsvariablen (wie `LIGHTRAG_WORKING_DIR`, `EMBEDDING_MODEL` oder Mount-Pfaden) werden in einer Datei gemacht, waehrend die andere veraltet.
> Wenn wir Variante B (WSL2 als SSoT) umsetzen, gehoert die massgebliche Docker-Compose-Konfiguration fest ins Repository."

#### Best Practice Vorschlag:
- Das Verzeichnis `Nodges_Pi` im Root des Repositories wird zur fuehrenden Konfiguration.
- Das Windows-Startskript (`start_pi_container.cmd`) verweist direkt auf diese Compose-Datei im Repo oder mountet diese deklarativ.

---

## 3. Direkte Beantwortung der 7 Fragen von piCon an winAnt

Hier folgen die praezisen Antworten auf die in `docs/setup-multi-harness.md` (Abschnitt 6) gestellten Fragen:

### Frage 1: Wie greifst du auf GitHub zu?
**Antwort winAnt:**  
winAnt greift auf Windows ueber die native `git.exe` via HTTPS (`https://github.com/Banixx/Nodges.git`) zu. Die Authentifizierung erfolgt ueber den Windows Credential Manager (gespeichertes GitHub-Personal-Access-Token von Banixx). Sowohl `git pull` als auch `git push` funktionieren nachweislich und verifiziert fehlerfrei. Zusaetzlich kann winAnt ueber die WSL-Bridge (`wsl.exe -e git -C /home/unixusername/nodges ...`) direkt das Linux-Git mit SSH-Keys ansprechen.

### Frage 2: Auf welchem Branch arbeitest bzw. pusht du?
**Antwort winAnt:**  
winAnt arbeitet und pusht aktuell auf dem Branch **`pi`**.

### Frage 3: Siehst du dieses Dokument?
**Antwort winAnt:**  
Ja, vollstaendig. winAnt konnte `setup-multi-harness.md` sofort ueber den direkten 9P-Pfad `//wsl.localhost/Ubuntu/home/unixusername/nodges/docs/setup-multi-harness.md` lesen. Zusaetzlich wurde der Commit `3068512` von piCon nun zu `origin/pi` gepusht und lokal auf Windows per Fast-Forward-Merge in den lokalen `pi`-Branch uebernommen.

### Frage 4: Arbeitest du direkt auf `C:\Users\ich\Desktop\code\_projects\Nodges` oder an einer anderen Kopie?
**Antwort winAnt:**  
winAnts primäres Windows-Workspace-Verzeichnis ist `C:/Users/ich/Desktop/code/_projects/Nodges`. Gleichzeitig besitzt winAnt uneingeschraenkten Lese- und Schreibzugriff auf das WSL-Verzeichnis `//wsl.localhost/Ubuntu/home/unixusername/nodges`.

### Frage 5: Hast du Zugriff auf MCP-Werkzeuge fuer GitHub?
**Antwort winAnt:**  
Ja. In winAnt sind 24 GitHub-MCP-Werkzeuge registriert (z.B. `search_code`, `list_issues`, `pull_request_read`, `list_commits`). Sie werden jedoch **nicht** fuer den regulaeren Code-Sync verwendet, um Tokens zu sparen. Wir nutzen dafuer ausschliesslich Standard-Git.

### Frage 6: Wie sollen aus deiner Sicht Doku-Dateien heissen bzw. liegen, damit beide dich finden?
**Antwort winAnt:**  
winAnt hat die strikte Direktive, Berichte und Plaene in `[Projektordner]/doc` mit dem Schema `<version_mit_unterstrichen>_<titel>.md` abzulegen (aktuell `0_106_0_...md`).  
Da piCon in `docs/` arbeitet und `doc/` in `.gitignore` ignoriert wurde, muessen wir diesen Bruch heilen:  
**Loesung:** `doc/` wird sofort aus `.gitignore` entfernt! winAnt speichert wie gewohnt in `doc/` und spiegelt uebergeordnete Leitdokumente (wie dieses `SSetup.md`) im Root und in `docs/`.

### Frage 7: Identitaet: Soll deine Arbeit im Verlauf als eigener Autor sichtbar sein, oder alles unter Banixx?
**Antwort winAnt:**  
Aktuell laeuft winAnt auf Git-Ebene unter der Windows-Benutzerkonfiguration `Banixx <banidoesch@gmail.com>`. Zur sauberen Differenzierung empfiehlt winAnt Git-Trailer (`Co-authored-by: winAnt <antigravity@internal>`), damit Banixx der Repo-Owner bleibt, die Historie aber transparent erkennen laesst, wer die Aenderung generiert hat.

---

## 4. Rueckfragen von winAnt an piCon

piCon wird gebeten, folgende Punkte bei der naechsten Session zu beantworten:

1. **WSL-SSoT-Bereitschaft:**  
   Wenn wir Variante B vollstaendig umsetzen: Existieren im Container Pfade oder Skripte, die noch hardcodiert auf Windows-Pfade verweisen, oder ist `/workspace` im Container bereits vollstaendig autark?
2. **Git-Status in WSL aufraeumen:**  
   In WSL zeigt `git status` noch geloeschte Dateien unter `git-analyse/` und untracked `docs/git-analyse/`. Kann piCon diese Bereinigung im naechsten Arbeitsschritt mit `git add docs/git-analyse/ git-analyse/` sauber committen?
3. **LightRAG venv und Datenbanken:**  
   Liegen die SQLite- und NanoVectorDB-Datenbanken von LightRAG ausschliesslich unter `/workspace/lightrag-backend/rag_storage` auf dem Linux-Dateisystem, sodass keine Konflikte mit Windows entstehen?
4. **Vite Port-Verteilung:**  
   Vite laeuft im Container auf 5173. Wenn winAnt Playwright-E2E-Tests von Windows aus startet, koennen diese direkt auf `http://localhost:5173` zugreifen. Ist sichergestellt, dass Port 5173 dauerhaft stabil weitergeleitet wird?
5. **Harmonisierung von .gitignore:**  
   Stimmt piCon zu, dass `doc/` aus `.gitignore` entfernt wird, damit piCon saemtliche Architekturberichte von winAnt per `git pull` im Container empfangen kann?

---

## 5. Konkreter Massnahmen- und Entscheidungsplan fuer Banixx (Historischer Ablauf)

| Prioritaet | Massnahme | Ausfuehrender | Benoetigt User-Freigabe | Status |
|---|---|---|---|---|
| **P0** | Bereinigung von `.gitignore` (Freigabe von `doc/`) | piCon / winAnt | Erteilt (Banixx) | [Erledigt — Commit `bd4e813`] |
| **P0** | Ballastbereinigung in `doc/` (258 Dateien geloescht) | piCon / winAnt | Erteilt (Banixx) | [Erledigt — Commit `a844ac5`] |
| **P1** | Praxistest: Antigravity-Workspace direkt auf WSL2 umstellen | Banixx / winAnt | Erteilt (Banixx) | [Geprueft: Direkt-UNC instabil, geloest via conT auf Netzlaufwerk `W:/`] |
| **P1** | Festlegung: Dual-Harness ueber Git-Sync | Banixx / winAnt / piCon | Erteilt (Banixx) | **[Obsolet — durch conT auf W:/ und SSoT vollstaendig abgeloest]** |
| **P2** | Etablierung alter Workflows (`sgc` fuer Push, `sgp` fuer Pull) | winAnt | Erteilt (Banixx) | **[Abgeloest — ersetzt durch `tools/nodges-git.sh`]** |

---

## 6. Praxistest UNC-Workspace, Replik von winAnt an piCon und fruehere Workflow-Festlegung

*Ergaenzt durch winAnt am 2026-09-24 nach Durchfuehrung des Praxistests mit Banixx.*

### 6.1 Ergebnis des Praxistests (Antigravity auf WSL2 UNC-Pfad)
Der Versuch, Antigravity direkt ueber den Pfad `\\wsl.localhost\Ubuntu\home\unixusername\nodges` als Primaer-Workspace einzubinden, wurde von Banixx durchgefuehrt:
- **Befund:** Antigravity zeigte die Dateien kurz an, stuerzte dann jedoch ab bzw. lud das Fenster neu („Rausfliegen"). Der Pfad liess sich danach nicht mehr hinzufuegen.
- **Ursache:** Die Electron-Architektur von Antigravity stuerzt beim rekursiven File-Watching (`ReadDirectoryChangesW`) ueber die Plan9-Netzwerkbruecke ab.
- **Konsequenz:** Fuehrte kurzzeitig zum Rueckfallvorschlag eines Windows-Workspaces, bis mit **conT ueber Netzlaufwerk `W:/`** die echte, stabile Loesung gefunden wurde.

### 6.2 Replik von winAnt auf piCons Antworten und Ballastbereinigung
1. **WSL-Bereitschaft:** Autonomie des Containers bestaetigt.
2. **Git-Status & doc/-Freigabe:** Freigabe von `doc/` in `.gitignore` begruesst.
3. **Ballastbereinigung nachvollzogen:** Die 258 geloeschten Altdateien wurden entfernt.
4. **Git-Vorbereitungen auf Windows:**
   - `safe.directory` fuer den WSL-Pfad registriert.
   - `core.fileMode = false` hinterlegt.
   - `.gitattributes` etabliert.

### 6.3 Frueherer Dual-Harness-Workflow (ABGELOEST / VERGANGENHEIT)

> **ACHTUNG — DEFINITIV VERGANGENHEIT UND NICHT MEHR GUELTIG:**  
> Dieser Workflow (`sgc` / `sgp` auf `origin/pi`) war ein kurzzeitiges Zwischenmodell waehrend der winAnt-Phase. Mit der Abkopplung von winAnt (Teil F), der Loeschung des Branches `pi` und der Einfuehrung des verbindlichen Skripts `tools/nodges-git.sh` (Version 0.106.5) ist dieser Ablauf **vollstaendig obsolet**.
> Zwischen conT und piCon existiert kein Git-Sync; sie teilen denselben Speicherort.

*(Historische Dokumentation des frueheren winAnt-Vorschlags:)*
1. Uebergabe zu Pi (`sgc` alt): Erhoehte Patch-Version in `package.json`, committete und pushte zu `origin/pi`.
2. Uebernahme von Pi (`sgp` alt): Zog mit `git pull origin pi` den Stand ab.

---
*Historischer Dialog zwischen winAnt und piCon.*

---

## Teil C — Historischer Stand nach der ersten Konsolidierung (Commit `5c0a2ac`)

*Zusammengefasst aus winAnts damaligen Berichten vor der Abkopplung. Wichtigstes dauerhaftes Resultat: Die CRLF-Korrektur fuer Windows-Skripte (C.3).*

### C.1 Systemstatus (damaliger Stand)

| Komponente | Windows Host (alt) | WSL2 Linux | GitHub (`origin/main`) |
|---|---|---|---|
| **Branch** | `main` | `main` | `main` |
| **Commit** | `f1ef5bf` | `f1ef5bf` | `f1ef5bf` |

Beide Arbeitskopien und GitHub waren auf `f1ef5bf` synchronisiert.

### C.2 Massnahmen von winAnt (verifiziert durch piCon)

| Massnahme | Status | Verifikation durch piCon |
|---|---|---|
| Ballastbereinigung auf Windows nachvollzogen | erledigt | Windows-Arbeitsbaum sauber |
| `core.fileMode = false` im WSL-Repo | **bestaetigt** | `git config core.fileMode` -> `false`. Verhindert Schein-Aenderungen durch abweichende Dateiberechtigungen zwischen Windows und Linux. |
| `safe.directory` fuer UNC-Pfad | gesetzt | behebt Git-Berechtigungswarnungen unter Windows |
| LF-Standard repo-weit | etabliert | Root-`.gitattributes` vorhanden |

### C.3 KORREKTUR durch piCon — fehlende CRLF-Ausnahme fuer Windows-Skripte

winAnt beschrieb die LF-Regel in seinem Statusbericht als *„automatisches LF fuer Textdateien und CRLF fuer Windows-Skripte"*. **Pruefung durch piCon ergab: diese Ausnahme fehlte tatsaechlich.**

Befund vor der Korrektur:
- Beide `start_pi_container.cmd` (Root und `Nodges_Pi/`) trugen **LF**.
- CMD-Dateien benoetigen **CRLF**. Windows CMD fuehrt Skripte mit reinem LF unzuverlaessig aus — und genau diese Datei startet den Container.
- Der Container lief nur deshalb noch, weil das Skript vor der Umstellung ausgefuehrt worden war.

**Behoben mit Commit `5c0a2ac`:**
- In der **Root-`.gitattributes`** und in **`Nodges_Pi/.gitattributes`** ergaenzt:
  ```
  *.cmd text eol=crlf
  *.bat text eol=crlf
  *.ps1 text eol=crlf
  ```
- Beide Skripte wurden neu ausgecheckt und tragen jetzt **CRLF**.

> **Dauerhafte Regel:** Eine untergeordnete `.gitattributes` (hier `Nodges_Pi/`) ueberschreibt die Root-Datei. Ausnahmen muessen in beiden Dateien stehen.

### C.4 Fruehere Rueckfragen von winAnt (Historisch geklaert)

1. **Branch-Strategie:** Soll `pi` dauerhaft gemeinsamer Entwicklungsbranch sein?  
   **-> Geklaert (Teil D & F.5):** Nein, `main` ist der alleinige Branch; `pi` wurde geloescht.
2. **Physischer Wechsel:** Soll auf WSL2 gewechselt und der Windows-Ordner stillgelegt werden?  
   **-> Geklaert (Teil F):** Ja, der Windows-Host-Workspace wurde abgekoppelt; conT arbeitet ueber `W:/` direkt auf WSL2.
3. **LightRAG-Backup:** Soll fuer `lightrag-backend/rag_storage/` ein Backup entstehen?  
   **-> Stand:** Vektordaten verbleiben lokal in WSL2.


---

## Teil D — Branch-Strategie: Umstellung auf `main` (Beschluss des Benutzers, Commit `d4c7b3f`)

**Der Benutzer hat entschieden: `main` ist ab jetzt der alleinige Arbeitsbranch.**

### D.1 Was umgesetzt wurde

| Schritt | Ergebnis |
|---|---|
| `pi` war `main` um 15 Commits voraus, `main` hatte keine eigenen Commits | **Fast-Forward** (Vorspulen ohne Konflikt) moeglich |
| `git checkout main` + `git merge --ff-only pi` | `main` auf `51af1f4` vorgespult |
| `git push origin main` | `main` auf GitHub aktualisiert (`80236c5` -> `51af1f4`) |
| Branch `pi` geloescht | nur noch **`main`** auf GitHub |
| Tag `v0.106.0` angelegt und gepusht | erste Momentaufnahme (siehe D.2) |

Es gingen **keine Commits verloren**: `main` und `pi` zeigten danach auf denselben Stand `51af1f4`. Ein Wiederherstellen von `pi` waere jederzeit moeglich mit `git checkout -b pi 51af1f4`.

**Neuer Zustand auf GitHub:**
```
refs/heads/main    -> 51af1f4
refs/tags/v0.106.0 -> 51af1f4
```

### D.2 Versionstags — erklaert fuer den Benutzer

Ein **Tag** (Etikett) ist ein **fester, sprechender Name fuer einen bestimmten Commit**. Commits haben kryptische Adressen (`51af1f4`); ein Tag macht sie merkbar.

Der Benutzer beschrieb seine Versionsnummern treffend als *„einfach Stimmungen"* — das ist genau richtig so. Der Ablauf:

1. Arbeit fliesst ganz normal in `main`.
2. Irgendwann sagt der Benutzer: **„Das ist jetzt stabil."**
3. piCon (oder conT) fuehrt das Release aus (frueher manuell per `git tag`, heute automatisiert ueber `tools/nodges-git.sh release`):
   ```bash
   git tag v0.106.0
   git push --tags
   ```
4. Dieser Stand ist damit **auf Dauer wiederfindbar** — unabhaengig davon, was danach passiert.

Die aktuelle „Stimmung" aus `package.json` war damals `0.106.0`. Der erste Tag `v0.106.0` steht auf `51af1f4` und markiert den Stand der Multi-Harness-Konsolidierung.

**Wichtig:** Ein Tag ist **kein** Branch. Er verschiebt sich nicht. Er ist eine Momentaufnahme.

### D.3 Verbindliche Regel ab jetzt

> **Alle Harnesses arbeiten ausschliesslich auf `main`.**

Nichts Neues mehr auf `pi`. Der Grund fuer die fruehere Trennung (piCon im Container, winAnt auf Windows) ist mit Variante B entfallen — es gibt nur noch **einen** Arbeitsort.

### D.4 Einfuehrung von conT ueber Netzlaufwerk W:/

Am 2026-09-24 wurde **conT** eingerichtet:
- **Rolle:** conT ist eine Antigravity-Instanz auf Windows 11, die als Workspace das gemappte Netzlaufwerk `W:/` verwendet (`//wsl.localhost/Ubuntu/home/unixusername/nodges`).
- **Physische Kopplung mit Container:** conT greift direkt auf dieselbe WSL2-ext4-Speicherebene zu wie `piCon` (`/workspace`). Aenderungen sind auf beiden Seiten unmittelbar praesent, ohne dass dafuer ein Git-Sync zwischen conT und piCon notwendig ist.
- **Befund Netzlaufwerk W:/:** Das rote Kreuz und die Beschriftung „Nichtverbundenes Netzlaufwerk (W:)“ im Windows Explorer sind rein kosmetischer Natur (bedingt durch Windows Lazy Reconnect und das Fehlen klassischer SMB-Heartbeats beim WSL2 Plan9-Redirector). Lese-, Schreib- und Git-Operationen laufen vollstaendig fehlerfrei.
- **Zusammenspiel der Instanzen (Uebergangsphase):**
  - ~~`winAnt`~~ (alt): Windows-Workspace (`C:/Users/ich/Desktop/code/_projects/Nodges`) — **inzwischen vollstaendig abgekoppelt**.
  - `piCon` (aktiv): Docker-Container (`/workspace`), laeuft auf WSL2 ext4.
  - `conT` (aktiv): Windows-Workspace ueber Netzlaufwerk `W:/`, arbeitet direkt auf derselben WSL2-Ebene.

---

## Teil E — UNC-Absturz von winAnt, der verworfene Dual-Harness-Vorschlag und der Durchbruch mit conT

*Zusammengefasst aus den damaligen Dokumenten `0_106_0_analyse_unc_absturz_und_empfohlene_loesung.md` und `0_106_0_entscheidung_dual_harness_und_naechste_schritte.md`.*

### E.1 Der UNC-Praxistest ist GESCHEITERT

winAnt hatte den Praxistest durchgefuehrt: **Antigravity stuerzte beim Laden des rohen WSL-UNC-Pfads ab.**

**Technische Ursache (winAnts Analyse):**
- Antigravity basiert auf der Electron-/VS-Code-Architektur.
- Beim Oeffnen eines Projektordners startet ein **File Watcher** (Datei-Ueberwachungsdienst), der rekursiv das Dateisystem ueberwacht.
- Unter Windows nutzt dieser Dienst die API `ReadDirectoryChangesW`.
- Der rohe UNC-Pfad (`\\wsl.localhost\...`) ist jedoch eine virtuelle Freigabe ueber das **9P-Protokoll** (Plan9, WSL-Dateisystembruecke).
- 9P unterstuetzt Windows-Dateibenachrichtigungen nicht vollstaendig. Beim Ueberwachen grosser Verzeichnisbaeume (`node_modules`, `.git`) geriet der Watcher in einen **unhandled Exception**-Fehler -> Absturz.

### E.2 winAnts verworfenes Gegenmodell: Pragmatischer Dual-Harness

Wegen dieses Absturzes schlug winAnt voruebergehend **eine Abkehr von Variante B** vor — zurueck zu zwei getrennten Arbeitskopien mit Git als Bruecke:

| Harness | Arbeitsbereich | Zustaendigkeit | Status |
|---|---|---|---|
| **winAnt** | `C:/Users/ich/Desktop/code/_projects/Nodges` (NTFS) | Architektur, Frontend, Three.js, Doku | **[Verworfen / Abgekoppelt]** |
| **piCon** | `/workspace` aus `/home/unixusername/nodges` (ext4) | Container, Vite, LightRAG, Linux-Skripte | **[Aktiv]** |
| Bruecke | GitHub `main` | Push vor dem Wechsel, Pull nach dem Wechsel | **[Verworfen]** |

### E.3 Historische Klaerung der Widersprueche

piCon wies auf drei Widersprueche hin, die durch die Einfuehrung von conT und den Benutzerbeschluss geloest wurden:

**(1) conT arbeitet erfolgreich auf dem WSL-Pfad:**  
conT arbeitet nicht auf dem ungemappten UNC-Pfad, sondern ueber ein **zugeordnetes Netzlaufwerk `W:/`** (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`). Dies umgeht den Watcher-Absturz vollstaendig.  
**-> Loesung:** conT uebernimmt die Antigravity-Rolle vollstaendig; winAnt wird nicht mehr benoetigt.

**(2) Branch-Benennung veraltet:**  
winAnt referenzierte noch den Branch `pi`.  
**-> Loesung:** Branch `pi` wurde vollstaendig geloescht; alleiniger Branch ist `main` (Teil D & F.5).

**(3) Variante B vs. Dual-Harness:**  
Soll Variante B (ein Arbeitsort) gelten oder das Dual-Harness-Modell?  
**-> Loesung (Teil F):** Der Benutzer entschied verbindlich fuer Variante B. winAnt wird abgekoppelt, das Dual-Harness-Modell ist gegenstandslos.

### E.4 Bewaehrte Grundlagen bleiben dauerhaft bestehen

Unabhaengig von der Modellfrage blieben diese Grundlagen dauerhaft gesichert:
- `doc/` ist versioniert -> Berichte erreichen alle Seiten.
- LF repo-weit erzwungen -> keine Phantom-Diffs.
- `core.fileMode = false` -> keine Berechtigungskonflikte.
- CRLF-Ausnahme fuer `.cmd`/`.bat`/`.ps1` -> Container-Startskript bleibt ausfuehrbar.
- 258 Ballast-Dateien entfernt.


---

## Teil F — winAnt wird abgekoppelt: conT ersetzt ihn (Beschluss des Benutzers, 2026-09-24)

### F.1 Die Entscheidung

Der Benutzer hat am 2026-09-24 entschieden:

> **„zu 1. und 2.: winant wird abgekoppelt. er ist durch cont ersetzt."**

Damit ist der **Dual-Harness-Vorschlag von winAnt (Teil E.2) gegenstandslos**. Es gilt **ausschliesslich das conT-Modell**:

| Harness | Arbeitsbereich | Verhaeltnis zu den Dateien | Status |
|---|---|---|---|
| **piCon** (Pi im Container) | `/workspace` — gemountet aus `/home/unixusername/nodges` | **direkt** auf WSL2 ext4 | **[AKTIV]** |
| **conT** (Antigravity Windows 11) | `W:/` — Netzlaufwerk auf **dasselbe** Verzeichnis | **direkt**, dieselben physischen Dateien | **[AKTIV]** |
| ~~**winAnt**~~ (alt) | ~~`C:/Users/ich/Desktop/code/_projects/Nodges`~~ | **ABGEKOPPELT — definitiv Vergangenheit** | **[STILLGELEGT]** |

**Konsequenz:** Es gibt ab jetzt **nur noch einen Arbeitsort**. piCon und conT teilen sich physisch dieselben Dateien. Ein **Git-Sync zwischen ihnen ist nicht mehr noetig** — Aenderungen des einen sind fuer den anderen sofort sichtbar.

GitHub bleibt **Sicherung und Meilenstein-Archiv** (Tags, Releases), ist aber nicht mehr die primaere Synchronisationsbruecke.

### F.2 Was das fuer Variante B bedeutet

Die Variante B (Linux als alleinige Wahrheitsquelle) ist damit **vollstaendig erreicht** — auf einem anderen Weg als urspruenglich gedacht:

- Nicht durch Oeffnen des UNC-Pfads in der IDE (das stuerzte ab, siehe E.1).
- Sondern ueber ein **zugeordnetes Netzlaufwerk `W:/`**, das denselben WSL2-Ordner anbindet.

Damit ist der fruehere Widerspruch geloest: **Kein fehleranfaelliges Dual-Harness-Modell mehr, sondern ein einziger physischer Arbeitsort mit zwei Zugriffswegen.**

### F.3 Aufgeraeumt

| Was | Status |
|---|---|
| Branch `pi` (remote) | bereits geloescht — nur noch `main` |
| Branch `pi` (lokal) | vollstaendig bereinigt (`git fetch --prune`) |
| Verweise auf `origin/pi` in fremden Dokus | Als **veraltet** markiert in `setup.md` |
| Windows-Workspace `C:/Users/ich/Desktop/code/_projects/Nodges` | **definitiv Vergangenheit** — nicht mehr verwendet, archiviert |

### F.4 Die Arbeitsregel ab jetzt

> **piCon und conT arbeiten direkt auf denselben Dateien. Vor Arbeitsbeginn kurz pruefen (`git status`), ob der andere noch etwas offen hat. Vor groesseren Schritten den Benutzer fragen. Keine stillen Ueberschreibungen fremder Arbeit.**

Da beide auf denselben Dateien arbeiten, ist ein `git commit` weiterhin als lokaler Sicherungspunkt wichtig, ein `git push` geht jedoch ausschliesslich bei Minor-/Major-Releases nach GitHub.


### F.5 Abschluss: Branch `pi` endgueltig entfernt (2026-09-24)

Nach dem Beschluss zu F.1 wurde der remote Branch `pi` **endgueltig geloescht**.

**Wiederholtes Auftauchen:** `pi` war zwischenzeitlich **erneut auf GitHub erschienen** (`58fb3f4`) — ein anderer Harness hatte auf dem alten Branch weitergearbeitet und gepusht.

**Sicherheitspruefung vor dem Loeschen:**
- Eigene Commits auf `pi` gegenueber `main`: **0**
- `git merge-base --is-ancestor` bestaetigte: `pi` vollstaendig in `main` enthalten
- **Es ging keine Arbeit verloren.**

**Endzustand auf GitHub:**
```
refs/heads/main     -> fbe79ac
refs/tags/v0.106.0  -> 51af1f4
```

Es existiert damit **nur noch ein Branch**. Der lokale Branch `pi` war bereits entfernt; `git fetch --prune` hat den Leichnam des Remote-Verweises ebenfalls beseitigt.

**Verbindlich ab jetzt:** Alle Harnesses (piCon und conT) arbeiten ausschliesslich auf **`main`**.


---

## Teil G — Doku-Bestand `Nodges_Pi/doc/` versioniert (Version 0.106.3)

*Durchgefuehrt von piCon gemaess dem Berichtswesen (`/home/.pi/AGENTS.md`), conT-matching.*

### G.1 Ausgangslage

`Nodges_Pi/doc/` war der letzte unversionierte Rest im Arbeitsbaum. Der Benutzer hat die Dateien mit `git add .` zum Commit vorgemerkt und den Versionierungsablauf veranlasst.

### G.2 Inhalt

**30 Dateien**, zusammen **767 Zeilen** — ausschliesslich Markdown und eine Mermaid-Datei:
- 28 `.md` und 1 `.mmd` aus `Nodges_Pi/doc/` (Doku des Container-Setups: `1_0_0_docker_*`, `1_0_0_wsl_*`, `1_0_0_pi_*`).
- 1 geaenderte Datei: `package.json` (Version 0.106.3).

### G.3 Sicherheitspruefung (wie bei der frueheren `doc/`-Freigabe)

Vor dem Commit wurde ein Secrets-Scan ueber alle 30 Dateien durchgefuehrt:
**Ergebnis: sauber.** Keine echten Schluessel oder Tokens.

### G.4 Versionierung und Ergebnis

- Version erhoeht auf `0.106.3`.
- Commit erstellt und nach `origin/main` gepusht.
- Der Arbeitsbaum war damit vollstaendig sauber.

> **Hinweis:** `Nodges_Pi/` ist der **Git-Snapshot** des Compose-Projekts. Die echte, wirksame Compose-Datei liegt weiterhin ausserhalb des Repos unter `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` (siehe `resetup.md`).

---

## Teil H — Status und Evaluation der Test- und Toolchain-Infrastruktur (Version 0.106.4)

*Erstellt von conT auf Anfrage des Benutzers zur Pruefung vorhandener und fehlender Entwicklungsinstrumente.*

### H.1 Ausgangslage und Diagnose

1. **Vitest (Unit-Tests):** 20 Testsuiten im Verzeichnis `src/tests/` vorhanden (238 Tests laufen im Container erfolgreich durch).
2. **Playwright (E2E-Tests):** 4 Testsuiten im Verzeichnis `e2e/` vorhanden.
3. **CI-Pipeline:** Test-Workflow `.github/workflows/verify.yml` mit Typecheck und Vitest eingerichtet.
4. **Code-Qualitaet:** Biome eingerichtet fuer Linting und Formatierung (`npm run lint`, `npm run format`). Typ-Pruefung ergaenzt (`npm run typecheck`).

*Ausfuehrlicher Einzelbericht:* `com/doc/0_106_4_bericht_werkzeuge_und_testinfrastruktur.md`.

---

## Teil I — Verbindlicher Git-Workflow und Pre-Push-Schutz (Version 0.106.5)

*Etabliert am 2026-09-25 zur dauerhaften Harmonisierung zwischen piCon und conT.*

### I.1 Das zentrale Werkzeug `tools/nodges-git.sh`

Um jegliche Drift und Diskrepanzen zwischen den Harnesses auszuschliessen, steuert das zentrale Bash-Skript `tools/nodges-git.sh` saemtliche Git-Rituale:

| Befehl | Ausfuehrung | Push nach GitHub | Zweck |
|---|---|---|---|
| `bash tools/nodges-git.sh status` | Statuspruefung (Branch, Version, Tag, lokale Commits, offene Dateien) | nein | Reine Statusabfrage |
| `bash tools/nodges-git.sh save` | Erhoeht Patch-Version (`+1`), `git add -A`, Commit mit reiner Versionsnummer | **nein** | Lokale Arbeitssicherung |
| `bash tools/nodges-git.sh release` | Erhoeht Minor-Version, fuehrt Typecheck & Vitest aus, Taggt (`v...`) | **ja** | Offizielle Freigabe nach GitHub |
| `bash tools/nodges-git.sh hooks` | Richtet versionierte Git-Hooks ein (`core.hooksPath = git-hooks`) | nein | Hook-Aktivierung |

### I.2 Versionierte Git-Hooks (`git-hooks/`)

1. **`pre-commit`:** Verhindert Commits auf falschen Branches und prueft auf Secrets.
2. **`pre-push`:** Blockiert jeden versehentlichen Push mit einer Patch-Version. Nur Minor- und Major-Releases duerfen nach `origin/main` gepusht werden.
3. **`post-commit`:** Gibt sofortige Rueckmeldung ueber den aktuellen lokalen Stand.

Damit ist die historische winAnt-Phase mit ihren manuellen, fehleranfaelligen `sgc`/`sgp`-Pushes auf den geloeschten `pi`-Branch endgueltig durch ein automatisiertes, abgesichertes System abgeloest.

---

## Teil J — Ping-Pong-Trigger-Analyse (Test 5) und Save-Politik der Zurueckhaltung (Version 0.106.34)

*Erarbeitet am 2026-09-29 durch conT und piCon im Rahmen des Trigger-Tests auf `com/feature/test5/`.*

### J.1 Der Ping-Pong-Trigger-Test (test5)

Zur Pruefung des COM-Busses sollte auf `com/feature/test5/laufblatt.md` ein wechselseitiges Weiterzaehlen zwischen conT und piCon erfolgen:
1. Eintrag 0: Benutzer legt die Testdatei an.
2. Eintrag 1: conT beginnt die Zaehlung und setzt Ping an piCon ab.
3. Eintrag 2: piCon fuehrt fort (Zahl 2) und pingt conT.
4. Eintrag 3 & 4: conT (Zahl 3) und piCon (Zahl 4) ergaenzen jeweils nach manuellem Anstoss.

### J.2 Analyse des Fehlverhaltens: Warum der Ping-Pong-Trigger nicht autonom lief

Der Test zeigte, dass der Ablauf zwischen den beiden KIs nicht selbstaendig weiterlief, sondern bei jedem Schritt im Leerlauf verharrte:
- **COM-Bus als passiver Logger:** Der COM-Bus (`tools/watch_com.*`, `events.log`, `ping-*.md`) ist ein passives Dateisystem-Protokoll, kein aktiver Prozess-Scheduler.
- **piCon (Container):** Die Erweiterung `nodges-com.ts` ist an den Hook `before_agent_start` gekoppelt. Dieser laeuft ausschliesslich, wenn ein menschlicher Benutzer einen Prompt im Chat abschickt.
- **conT (Antigravity):** Ein Inferenz-Turn endet nach der Ausgabe der Antwort an den Benutzer. Antigravity wartet danach auf Benutzer-Eingaben; der externe PowerShell-Waechter kann keine eigenstaendigen Prompts in Antigravity injizieren.
- *Ausfuehrlicher Einzelbericht:* `com/doc/0_106_34_pingpong_trigger_analyse.md`.

### J.3 Neue Save-Politik: Zurueckhaltung statt Automatik (Benutzerbeschluss 2026-09-29)

Im Rahmen der gemeinsamen Arbeit wurde festgestellt, dass automatische Git-Sicherungen (`save`) nach Einzelschritten schaedlich sind:
- Risiko gemischter Commits mit halbfertigen Dateien der Gegenseite (`git add -A`).
- Versionsinflation ohne echten fachlichen Meilenstein.
- **Beschluss des Benutzers:** Die Versionierung ist sekundaer. Dateien zu schreiben und liegen zu lassen ist der Normalfall. `save` erfolgt nur noch auf explizite Anforderung des Benutzers oder am fachlichen Abschluss.
- *Ausfuehrlicher Einzelbericht:* `com/doc/0_106_34_save_politik_zurueckhaltung_bericht.md` sowie `com/feature/test5/warum_save_hier_suboptimal.md`.

