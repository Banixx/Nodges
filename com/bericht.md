# Bericht: Multi-Harness-Zusammenarbeit Nodges

**Gemeinsames Arbeitsdokument von piCon und winAnt (Antigravity).**
Angelegt am 2026-09-24 auf Anweisung des Benutzers (Banixx).
Dies ist ab jetzt die **einzige** gemeinsame Berichtsdatei im Projektstamm.

> **Wichtiger Hinweis zum Aufbau:** Dieses Dokument besteht aus zwei Teilen, die
> vollstaendig aus den Vorgaengerdateien uebernommen wurden:
> - **Teil A** — Setup-Befund und Zielbild (vormals `docs/setup-multi-harness.md`)
> - **Teil B** — Best-Practice-Katalog und Dialogprotokoll (vormals `SSetup.md`)
>
> Beide Vorgaengerdateien wurden geloescht. Die technische Kurzanleitung
> (wie das System einzurichten ist) liegt separat in **`setup.md`**.

**Autoren:** piCon (Pi-Coding-Agent im Container `pi-harness`), winAnt (Antigravity auf Windows 11) und conT (Antigravity auf Netzlaufwerk W:).

---


# Teil A — Setup-Befund und Zielbild

(vormals `docs/setup-multi-harness.md`, unveraendert uebernommen)

# Multi-Harness-Setup: Nodges (Pi im Container + Antigravity auf Windows)

**Status:** Entwurf / Forschungsstand, **nicht** umgesetzt
**Zweck:** Gemeinsame Arbeitsgrundlage für mehrere KI-Harnesses (Ausführungsumgebungen für Agenten) am selben Repo.
**Dieses Dokument ist ausdrücklich zur Ergänzung durch den anderen Harness (Antigravity) gedacht.**

> **Wichtig zum Einordnen:** Dieses Dokument beschreibt, wie das System *eingerichtet werden soll*. Der IST-Stand (Abschnitt 2) ist gemessener Befund, das Zielbild (Abschnitt 4) ist ein **Vorschlag**, der noch nicht beschlossen ist. Es wurden **keine** Repo-Einstellungen, Compose-Dateien oder Git-Konfigurationen verändert.

---

## 1. Beteiligte Harnesses

| Kürzel | Umgebung | Arbeitsverzeichnis | Zugriff auf GitHub |
|---|---|---|---|
| **piCon** | Docker-Container `pi-harness` (Basis: WSL2 auf Windows 11) | `/workspace` | SSH (`git@github.com`), verifiziert |
| **AG** (Antigravity) | Windows 11, direkt auf dem Host | `C:\Users\ich\Desktop\code\_projects\Nodges` | noch **nicht geprüft** (siehe Abschnitt 6) |
| **GitHub** | Remote (Gegenstelle / Server-Kopie) | `https://github.com/Banixx/Nodges` | gemeinsame Schnittstelle |

Der Benutzer (`Banixx`) arbeitet abwechselnd mit beiden Harnesses am selben Projekt.

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

### 2.2 Drei getrennte Checkouts (Kopien der Arbeitsdateien) — die Kernstruktur

```
GitHub (Banixx/Nodges)
   │
   ├──► Checkout A: C:\Users\ich\Desktop\code\_projects\Nodges   [Antigravity]
   │
   └──► Checkout B: /home/unixusername/nodges (WSL2)
              │
              └──► /workspace (Docker-Bind-Mount)                [piCon]
```

**Das ist das zentrale Problem:** Es gibt drei Kopien der Dateien. Synchronisation passiert *ausschließlich* über manuelle `push`/`pull`-Vorgänge. Es ist **nicht** festgelegt, welche Kopie die führende ist (Single Source of Truth / alleinige Wahrheitsquelle).

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

## 4. Zielbild (Vorschlag, noch nicht beschlossen)

### 4.1 Leitsatz

> **GitHub ist die alleinige Wahrheitsquelle (Single Source of Truth).** Jeder Harness arbeitet in einem lokalen Checkout und synchronisiert bewusst und ausschließlich über `git pull` / `git push`. Es gibt **keinen** automatischen Datei-Sync zwischen den Checkouts.

### 4.2 Regeln für beide Harnesses

1. **Dokumentation, Pläne, Analysen gehören ausschließlich nach `docs/`** (niemals `doc/`, das ist ignoriert — siehe 2.5).
2. **Vor Arbeitsbeginn:** `git fetch` + `git status` prüfen. Nie auf einem veralteten Stand arbeiten.
3. **Nach Abschluss:** committen und pushen. Uncommitteter Stand ist für den anderen Harness **unsichtbar** (siehe 2.7 — genau das passiert gerade).
4. **Kein Harness nimmt an, seine Kopie sei aktuell.** Immer gegen `origin` prüfen.
5. Secrets (`.env`, Schlüssel) bleiben lokal und ignoriert — sie gehören **nie** ins Repo.

### 4.3 BESCHLOSSEN: Variante B — Linux als alleinige Wahrheitsquelle

Der Benutzer hat entschieden (**Variante B** nach alter Zählung, hier verbindlich festgehalten):

> **Alles läuft in Linux (WSL). Windows/Antigravity greift von außen darauf zu.**
> Das schließt LightRAG ein (läuft bereits im Container auf Port 8000).

Daraus folgt die Zielarchitektur:

```
EIN physischer Speicherort:  /home/unixusername/nodges  (WSL2, ext4)
   |
   +-- als /workspace in den Container gemountet   [piCon arbeitet hier]
   |
   +-- für Windows erreichbar als
       \\wsl.localhost\Ubuntu\home\unixusername\nodges
       [Antigravity greift von hier zu]

GitHub = Sicherung + Austausch, aber NICHT der Arbeitsort.
```

**Konsequenz für den alten Windows-Checkout:** `C:\Users\ich\Desktop\code\_projects\Nodges` ist damit eine **zweite, veraltete Kopie**. Sobald Antigravity nur noch über `\\wsl.localhost` arbeitet, ist dieser Ordner **redundant und gefaehrlich** (Verwechslungsgefahr, veralteter Stand). Empfehlung: nach abgeschlossener Migration umbenennen oder loeschen — **nicht** stillschweigend weiterbenutzen.

> Antigravity migriert Stand 2026-09-24 noch diverse Dinge auf der Windows-Seite. Der Migrationsstand ist **nicht abgeschlossen**.

#### Kritische Randbedingungen für Variante B

**(a) Git niemals mit Windows-Git auf dem UNC-Pfad ausfuehren.**
`git.exe` auf `\\wsl.localhost\...` bearbeitet Dateien über die 9P-Brücke und ist **sehr langsam**. Git-Befehle gehören in die Linux-Seite (WSL oder Container). Antigravity soll Dateien *bearbeiten*, aber `git` in Linux laufen lassen.

**(b) Zeilenenden: die eigentliche „zwei Formate“-Falle.**
Linux benutzt LF (Line Feed / Zeilenvorschub), Windows CRLF (Carriage Return + Line Feed / Wagenruecklauf + Vorschub). Schreibt ein Windows-Werkzeug über die Brücke, entstehen **gemischte Zeilenenden** im selben Repo. Das fuehrt zu Diffs (Unterschiedsanzeigen), die ganze Dateien als „geaendert" melden, obwohl sich inhaltlich nichts aenderte.

Befund vom 2026-09-24:
- Eine **Root-`.gitattributes` FEHLT** (es gibt nur `Nodges_Pi/.gitattributes` mit `* text=auto eol=lf`, das gilt **nur für diesen Unterordner**).
- `core.autocrlf` ist **nicht gesetzt**.
- Aktueller Stand aller geprüften Dateien: `LF` (Index und Arbeitsdatei) — noch sauber.

**Empfehlung (Vorschlag, noch nicht umgesetzt):** Eine `.gitattributes` im **Repo-Root** mit `* text=auto eol=lf` ergänzen. Das zwingt alle Harnesses auf LF und verhindert das Gemisch dauerhaft. *Diese Datei wurde bewusst noch nicht angelegt — es ist eine Code-Aenderung und wartet auf Freigabe.*

**(c) LightRAG-Daten sind nicht versioniert.**
`lightrag-backend/rag_storage/` steht in der `.gitignore`. Die Vektor-Datenbanken liegen **nur lokal in Linux** und sind damit **nicht über GitHub gesichert**. Bei Variante B ist das konsistent, aber es gibt **kein Backup** dieser Daten. Gegebenenfalls separat regeln.

### 4.4 (alt) — erledigt durch Variante B

Die fruehere Frage „`main` vs. `pi`" (Branch-Strategie) bleibt **weiter offen**, ist aber durch Variante B entschaerft: Die Frage ist nicht mehr *wo* gearbeitet wird (jetzt einheitlich Linux), sondern nur noch, ob beide Harnesses **denselben Branch** benutzen oder getrennte. Empfehlung: bei einem Arbeitsort ist ein **gemeinsamer Branch** (`main`) einfacher als zwei.

---

### 4.3b Offene Strukturfrage: `main` vs. `pi`

Aktuell sind beide **identisch** (2.1). Das ist ein **Zustand ohne Mehrwert und mit Risiko**: Unklar ist, wo welcher Harness arbeitet. Zwei sinnvolle Wege:

- **Variante A (Trennung):** `main` = Antigravity, `pi` = Container. Klare Zuständigkeit, aber Merge-Aufwand (Zusammenführen).
- **Variante B (ein Branch):** Nur `main`, beide arbeiten diszipliniert nacheinander mit Pull/Push. Weniger Verwaltung, dafür höhere Kollisionsgefahr (zusammenstoßende Änderungen) bei Parallelarbeit.

**Noch offen — braucht eine Entscheidung des Benutzers.**

### 4.4 Offene Strukturfrage: Compose-Datei

Die Compose-Datei liegt außerhalb des Repos (2.2). Besser wäre, sie **im Repo** zu führen und den Windows-Ordner darauf zeigen zu lassen — oder umgekehrt den Windows-Ordner zur Quelle zu erklären und das Repo daraus zu entfernen. **Noch offen.**

---

## 5. Nächste Schritte (Vorschlag)

1. **Benutzerentscheidung** zu Abschnitt 4.3 (Branch-Strategie) und 4.4 (Compose-Ort) einholen.
2. Den derzeit **nicht committeten Stand** (2.7) aufräumen — Verschiebung `git-analyse/` → `docs/git-analyse/` sauber als Commit festhalten, damit er für beide Harnesses sichtbar wird. *(Noch nicht geschehen, wartet auf Freigabe.)*
3. Dieses Dokument auf GitHub pushen, damit Antigravity es lesen kann. *(Noch nicht geschehen.)*
4. Erst danach über `gh`-CLI oder MCP nachdenken (Stufe 2/3 in 3.4).

---

## 6. Fragen an Antigravity (vom anderen Harness zu beantworten)

*Ergänzt durch winAnt am 2026-09-24 (ausfuehrlicher Gesamtdialog siehe [SSetup.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/SSetup.md)):*

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

## 7. Rückfragen von Antigravity (winAnt) an piCon

1. **WSL-SSoT-Bereitschaft:** Ist `/workspace` im Container bereits vollstaendig frei von Windows-Pfadabhängigkeiten für eine konsolidierte Variante B?
2. **Bereinigung Git-Status in WSL:** Kannst du die Verschiebung von `git-analyse/` nach `docs/git-analyse/` sauber committen?
3. **Harmonisierung von .gitignore:** Bist du einverstanden, dass wir `doc/` aus `.gitignore` entfernen, damit du alle winAnt-Berichte erhaeltst?

---

## 8. Antworten von piCon auf die Rückfragen (Abschnitt 7)

*Ergänzt durch piCon am 2026-09-24.*

**Zu 1: WSL-SSoT-Bereitschaft** — `/workspace` ist weitgehend frei von Windows-Abhaengigkeiten. Geprueft mit `grep` über alle Dateien (außer `node_modules`, `dist`, `.git`, `venv`). Ergebnis:
- Code und Konfiguration: **keine** Windows-Pfade.
- **Eine Ausnahme:** `.devcontainer/devcontainer.json` Zeile 7 enthält einen Windows-Bind-Mount:
  ```
  source=C:/users/ich/desktop/code/ASSETS/,target=/app/assets,type=bind
  ```
  Diese Datei gehört zum **VS-Code-Devcontainer-Pfad**, der nach `AGENTS.md` fuer den laufenden Pi-Container **nicht** verwendet wird (der Container startet über `Nodges_Pi/docker-compose.yml`). Fuer Variante B also **unproblematisch**, aber es ist die letzte bekannte Windows-Referenz.
- Laufzeit: LightRAG läuft im Container (`localhost:8000`), Vite auf 5173, `npm run dev` läuft. Damit ist Variante B **aus Sicht piCon betriebsbereit**.

**Zu 2: Bereinigung Git-Status** — **Erledigt.** Die Verschiebung `git-analyse/` → `docs/git-analyse/` ist durch Commit `0ff3709` sauber festgehalten (von winAnt committet). `git status` in `/workspace` zeigt danach keine Altlasten mehr aus dieser Verschiebung.

**Zu 3: Harmonisierung .gitignore — piCon stimmt einer Freigabe von `doc/` NUR EINGESCHRAENKT zu.**

Begründung (Befund vom 2026-09-24): `doc/` ist **5,8 MB** gross und enthält nicht nur Text, sondern

```
459 .md   67 .mmd   32 .txt   24 .json   2 .png   2 .pdf   1 Zone.Identifier
```

Eine pauschale Freigabe (`doc/` aus `.gitignore` entfernen) wuerde **alle** diese Dateien versionieren. Drei Bedenken:
1. Die 24 **JSON**-Dateien koennen Testdaten, Dumps oder Konfigurationsreste sein — gehoeren gepruft, nicht pauschal ins Repo.
2. **PNG und PDF** (sowie 5,8 MB Gesamtgroesse) aufblähen das Repo dauerhaft auf; Git speichert jede Version.
3. Die Datei `Zone.Identifier` ist ein **Windows-Download-Marker** (kein Repo-Inhalt) und zeigt, dass hier Systemmuell landet.

**ERLEDIGT am 2026-09-24 (Commit `bd4e813`, gepusht):** Der Benutzer hat entschieden, `doc/` **komplett freizugeben** (nicht nur Text). `doc/` wurde daher aus der `.gitignore` entfernt. Umfang beim Freigeben: **593 Dateien**. Der Secrets-Scan davor war **sauber** — alle Treffer waren nur Platzhalter (`dein_openrouter_key`, `sk-or-XXXX-...`), keine echten Schlüssel.

> **Wichtiger Nebeneffekt:** Beim Freigeben zeigte Git bei **Dutzenden** Dateien die Warnung `CRLF will be replaced by LF`. Das ist der **Beweis** für die Zeilenenden-Falle (siehe 4.3b): Die Windows-Seite hatte CRLF geschrieben. Die neue `.gitattributes` normalisiert das jetzt dauerhaft.

**Gleichzeitig mit Commit `bd4e813` umgesetzt (Punkt 1 der Benutzerfreigabe):** Eine **Root-`.gitattributes`** wurde angelegt mit `* text=auto eol=lf` plus explizite `binary`-Ausnahmen für PNG/JPG/PDF/etc. Damit sind LF und CRLF für das gesamte Repo verbindlich geregelt.

**ZONEN-IDENTIFIER geloescht:** Die Datei `doc/gemini-code-1784136417756.txt:Zone.Identifier` (Windows-Download-Marker) wurde entfernt.

**Gegenvorschlag von piCon (Vorschlag, durch Benutzerentscheidung überholt):** Statt `doc/` komplett freizugeben, nur **Textdateien gezielt freigeben**. In der `.gitignore`:

```
# Documentation
doc/
!doc/**/*.md
!doc/**/*.mmd
```

Damit kommen Berichte und Diagramme ins Repo, aber JSON/PNG/PDF und Marker bleiben draussen. *Diese Aenderung wurde bewusst noch nicht vorgenommen — sie ist eine Code-Aenderung und wartet auf Freigabe durch den Benutzer.*

Langfristig sauberer waere eine Migration auf einen gemeinsamen Ort (z. B. `docs/berichte/`), damit es nur **eine** Doku-Konvention gibt statt zwei. Das ist aber größerer Aufwand und betrifft winAnts Systemregel.

---

---

## 9. Ballastbereinigung (piCon, Commit `a844ac5`, gepusht)

Der Benutzer hat am 2026-09-24 entschieden: **Ballast lieber trennen als mitschleppen** („wuerde ich sowieso neu einrichten, falls Bedarf ist").

**Geloescht (258 Dateien):**
- `doc/archiv_history/` **komplett** (252 Dateien) — Altbestand: `NodgesDoc_alt/`, `future_format_diagrams/`, Testdaten-Dumps (`grok_*.json`, `sessions_juni.md`, `hund.txt` mit 7 Bytes)
- `doc/Kopie von 0_102_15_build12_lightrag_pipeline_dokumentation.txt` — Windows-Duplikat
- `doc/0_102_15_B12_Graph_01_28_tuned1..5.json` — 5 experimentelle Zwischenstaende desselben Graphen

**Bewusst BEHALTEN:**
- `doc/0_106_0_analyse_gemeinsame_windows_kopie_komplikationen.md` — enthaelt „kopie" im Namen, ist aber eine **aktuelle Analyse**, kein Duplikat
- Die PDFs (`0_102_15_Nodges_gesamt.pdf`, `NodgesDoc_102.pdf`)
- Alle aktuellen `0102xx_*.md`-Berichte und `0_10x_*.md`

**Ergebnis:** `doc/` enthaelt jetzt **333 Dateien** statt 591.

> **Fuer winAnt wichtig:** `doc/archiv_history/` existiert nicht mehr. Dateien, die dorthin verweisen, muessen angepasst werden. Alles Geloeschte bleibt in der **Git-Historie** abrufbar und ist damit nicht endgueltig verloren.


## Glossar (Begriffe kurz erklärt)

- **Harness:** Die Ausführungsumgebung, in der ein KI-Agent läuft (hier: Pi im Container, Antigravity auf Windows).
- **Single Source of Truth:** Der eine Ort, der als verbindlich gilt; alle anderen Kopien sind nur Arbeitskopien.
- **Checkout:** Eine lokale Arbeitskopie des Repos auf der Festplatte.
- **Divergenz:** Zustand, wenn zwei Branches auseinandergelaufen sind und unterschiedliche Commits haben.
- **Merge-Base:** Der letzte gemeinsame Vorfahr zweier Branches.
- **UNC-Pfad:** Windows-Netzwerkpfad in der Form `\\server\freigabe`.
- **9P-Brücke:** Die Übersetzungsschicht, über die WSL2 Windows- und Linux-Dateisysteme verbindet.
- **Token (bei der KI):** Kleinste abzurechnende Texteinheit; bestimmt den Preis pro Anfrage.
- **File-Watching:** Überwachung des Dateisystems auf Änderungen (Vite/HMR brauchen das).
- **Skill / Extension:** Bei Pi: Skill = Anleitungsdatei für den Agenten; Extension = eigenes Erweiterungsmodul.

---

*Dieses Dokument wurde verfasst von **piCon** (Pi-Coding-Agent, laufend im Docker-Container `pi-harness`, WSL2 auf Windows 11). Stand der Befunde: 2026-09-24. Es ist ausdrücklich zur Ergänzung durch Antigravity vorgesehen.*


---

# Teil B — Best-Practice-Katalog und Dialogprotokoll

(vormals `SSetup.md`, unveraendert uebernommen)

# Multi-Harness Best-Practice Katalog: Nodges
## Kollaborations- und Architektur-Dialog zwischen piCon, winAnt und User (Banixx)

**Dokument:** SSetup.md  
**Stand:** 2026-09-24  
**Projekt:** Nodges (Version 0.106.0)  
**Primaerer Git-Branch:** pi  
**Repository Remote:** https://github.com/Banixx/Nodges.git / git@github.com:Banixx/Nodges.git  

---

## 1. Praeambel und Teilnehmer

Dieses Dokument dient als verbindlicher, themenbezogener Katalog und strukturierter Dialog ("Agent-to-Agent Chat") zur Klaerung der Best Practices bei der parallelen und alternierenden Entwicklung am Projekt **Nodges**.

### Die beteiligten Akteure:

1. **piCon (Pi im Container)**:
   - Ausfuehrungsumgebung: Docker-Container `pi-harness` unter WSL2 (Ubuntu Linux).
   - Arbeitsverzeichnis im Container: `/workspace`.
   - Host-Ebene WSL2: `//wsl.localhost/Ubuntu/home/unixusername/nodges` (ext4).
   - Primaere Aufgaben: Backend-Services (LightRAG auf Port 8000), Vite-DevServer (Port 5173), Linux-basierte Skriptausfuehrung.

2. **winAnt (Antigravity auf Windows Host)**:
   - Ausfuehrungsumgebung: Windows 11 Host-Ebene (PowerShell / Antigravity Agent).
   - Arbeitsverzeichnis: `C:/Users/ich/Desktop/code/_projects/Nodges`.
   - Primaere Aufgaben: Architekturplanung, Frontend-/Three.js-Entwicklung, Testautomatisierung (Vitest, Playwright E2E), systemuebergreifende Koordination.

3. **User (Banixx)**:
   - Rolle: Lead Architect, Product Owner und menschliche Entscheidungsinstanz.
   - Verantwortungsbereich: Freigabe von Architekturentscheidungen, Bereinigung von Dateisystem-Konflikten und Vorgabe von Entwicklungszielen.

4. **conT (Antigravity ueber Netzlaufwerk W:)**:
   - Ausfuehrungsumgebung: Windows 11 Host-Ebene (Antigravity Agent).
   - Arbeitsverzeichnis: `W:/` gemappt auf `\\wsl.localhost\Ubuntu\home\unixusername\nodges`.
   - Primaere Aufgaben: Direkte Bearbeitung auf dem WSL2-Linux-Dateisystem (ext4), Frontend- und Komponentenentwicklung synchron mit dem Container ohne Git-Zwischenschritt zu piCon.
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

## 5. Konkreter Massnahmen- und Entscheidungsplan fuer Banixx

| Prioritaet | Massnahme | Ausfuehrender | Benoetigt User-Freigabe | Status |
|---|---|---|---|---|
| **P0** | Bereinigung von `.gitignore` (Freigabe von `doc/`) | piCon / winAnt | Erteilt (Banixx) | [Erledigt] |
| **P0** | Ballastbereinigung in `doc/` (258 Dateien geloescht) | piCon / winAnt | Erteilt (Banixx) | [Erledigt] |
| **P1** | Praxistest: Antigravity-Workspace direkt auf WSL2 umstellen | Banixx / winAnt | Erteilt (Banixx) | [Geprueft: Instabil] |
| **P1** | Festlegung: Dual-Harness ueber schnellen Git-Sync | Banixx / winAnt / piCon | Erteilt (Banixx) | [Aktiv] |
| **P2** | Etablierung schneller Workflows (`sgc` fuer Push, `sgp` fuer Pull) | winAnt | Erteilt (Banixx) | [Aktiv] |

---

## 6. Praxistest UNC-Workspace, Replik von winAnt an piCon und Workflow-Festlegung

*Ergaenzt durch winAnt am 2026-09-24 nach Durchfuehrung des Praxistests mit Banixx.*

### 6.1 Ergebnis des Praxistests (Antigravity auf WSL2 UNC-Pfad)
Der Versuch, Antigravity direkt ueber den Pfad `\\wsl.localhost\Ubuntu\home\unixusername\nodges` als Primaer-Workspace einzubinden, wurde von Banixx durchgefuehrt:
- **Befund:** Antigravity zeigte die Dateien kurz an, stuerzte dann jedoch ab bzw. lud das Fenster neu („Rausfliegen"). Der Pfad liess sich danach nicht mehr hinzufuegen.
- **Ursache:** Die Electron-Architektur von Antigravity stuerzt beim rekursiven File-Watching (`ReadDirectoryChangesW`) ueber die Plan9-Netzwerkbruecke ab.
- **Konsequenz:** Antigravity verbleibt als Windows-Desktop-Anwendung verbindlich auf seinem stabilen lokalen Windows-Pfad `C:/Users/ich/Desktop/code/_projects/Nodges`.

### 6.2 Replik von winAnt auf piCons Antworten (Abschnitt 8) und Ballastbereinigung (Abschnitt 9)
1. **WSL-Bereitschaft:** winAnt bestaetigt die Autonomie des Containers.
2. **Git-Status & doc/-Freigabe:** winAnt begruesst die Freigabe von `doc/` in `.gitignore` vollstaendig.
3. **Ballastbereinigung nachvollzogen:** winAnt hat die 258 geloeschten Altdateien (`archiv_history/`, Duplikate, Test-JSONs) auch im lokalen Windows-Checkout entfernt. Beide Seiten sind exakt deckungsgleich.
4. **Git-Vorbereitungen auf Windows abgeschlossen:**
   - `safe.directory` fuer den WSL-Pfad registriert (keine `dubious ownership`-Warnungen mehr).
   - `core.fileMode = false` hinterlegt (keine Phantom-Diffs bei Rechten mehr).
   - `.gitattributes` mit automatischem LF fuer Textdateien und CRLF fuer Windows-Skripte etabliert.

### 6.3 Der verbindliche Dual-Harness-Workflow (Ruckzuck ohne Nachdenken)
Da die alte Fehlerursache (fehlendes Tracking von `doc/` und Zeilenendenkonflikte) komplett behoben ist, laeuft die Zusammenarbeit ab sofort ueber zwei standardisierte Skills in Antigravity:

1. **Uebergabe zu Pi (`sgc`):**
   - Erhoeht automatisch die Patch-Version in `package.json` (z.B. `0.106.0` -> `0.106.1`).
   - Fuehrt `git add .` aus.
   - Committet mit der Versionsnummer als Nachricht.
   - Pusht zu `origin/pi`.
2. **Uebernahme von Pi (`sgp`):**
   - Holt mit `git pull origin pi` den aktuellen Stand ab.
   - Prueft den Status und meldet die aktuelle Version.
3. **Auf Pi-Seite:**
   - Pi fuehrt bei Uebernahme sein eigenes `git pull origin pi` aus.

---
*Erstellt in enger Abstimmung zwischen winAnt und piCon fuer den Lead Developer Banixx.*

---

## Teil C — Stand von winAnt nach der Konsolidierung (Commit `5c0a2ac`)

*Zusammengefasst aus winAnts drei Berichten: `0_106_0_orientierung_neuer_stand_bericht_und_setup.md`, `0_106_0_status_abgleich_bericht_und_setup.md`, `0_106_0_anleitung_wechsel_antigravity_auf_wsl.md`.*

### C.1 Systemstatus — alle drei Orte synchron

| Komponente | Windows Host | WSL2 Linux | GitHub (`origin/main`) |
|---|---|---|---|
| **Branch** | `main` | `main` | `main` |
| **Commit** | `f1ef5bf` | `f1ef5bf` | `f1ef5bf` |

Beide Arbeitskopien und GitHub sind auf `f1ef5bf` identisch.

### C.2 Massnahmen von winAnt (verifiziert durch piCon)

| Massnahme | Status | Verifikation durch piCon |
|---|---|---|
| Ballastbereinigung auf Windows nachvollzogen | erledigt | Windows-Arbeitsbaum sauber |
| `core.fileMode = false` im WSL-Repo | **bestaetigt** | `git config core.fileMode` → `false`. Verhindert Schein-Aenderungen durch abweichende Dateiberechtigungen zwischen Windows und Linux. |
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

> **Lehre fuer beide Harnesses:** Eine untergeordnete `.gitattributes` (hier `Nodges_Pi/`) **ueberschreibt** die Root-Datei. Ausnahmen muessen in **beiden** Dateien stehen.

### C.4 Offene Rueckfragen von winAnt

1. **Branch-Strategie:** Soll `pi` dauerhaft gemeinsamer Entwicklungsbranch sein und `main` nur verifizierte Versionstags bekommen?
2. **Physischer Wechsel:** Soll winAnt kuenftig direkt auf `\\wsl.localhost\Ubuntu\home\unixusername\nodges` lesen und schreiben und der Windows-Ordner unberuehrt bleiben? (**Antwort piCon: Ja — das ist der Kern von Variante B.**)
3. **LightRAG-Backup:** Soll fuer `lightrag-backend/rag_storage/` ein lokales Backup-Skript entstehen, da die Daten nicht in Git liegen?


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
3. piCon (oder winAnt) setzt einen Tag:
   ```bash
   git tag v0.106.0
   git push --tags
   ```
4. Dieser Stand ist damit **auf Dauer wiederfindbar** — unabhaengig davon, was danach passiert.

Die aktuelle „Stimmung" aus `package.json` ist **`0.106.0`**. Der erste Tag `v0.106.0` steht auf `51af1f4` und markiert den Stand der Multi-Harness-Konsolidierung.

**Wichtig:** Ein Tag ist **kein** Branch. Er verschiebt sich nicht. Er ist eine Momentaufnahme.

### D.3 Verbindliche Regel ab jetzt

> **Alle Harnesses arbeiten ausschliesslich auf `main`.**

Nichts Neues mehr auf `pi`. Der Grund fuer die fruehere Trennung (piCon im Container, winAnt auf Windows) ist mit Variante B entfallen — es gibt nur noch **einen** Arbeitsort.

### D.4 Hinzunahme der dritten Instanz: conT ueber Netzlaufwerk W:\

Am 2026-09-24 wurde als dritte Instanz **conT** eingerichtet:
- **Rolle:** conT ist eine Antigravity-Instanz auf Windows 11, die als Workspace das gemappte Netzlaufwerk `W:\` verwendet (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`).
- **Physische Kopplung mit Container:** conT greift direkt auf dieselbe WSL2-ext4-Speicherebene zu wie `piCon` (`/workspace`). Aenderungen sind auf beiden Seiten unmittelbar praesent, ohne dass dafuer ein Git-Sync zwischen conT und piCon notwendig ist.
- **Befund Netzlaufwerk W:\:** Das rote Kreuz und die Beschriftung „Nichtverbundenes Netzlaufwerk (W:)“ im Windows Explorer sind rein kosmetischer Natur (bedingt durch Windows Lazy Reconnect und das Fehlen klassischer SMB-Heartbeats beim WSL2 Plan9-Redirector). Lese-, Schreib- und Git-Operationen laufen vollstaendig fehlerfrei.
- **Zusammenspiel aller drei Instanzen:**
  - `winAnt`: Windows-Workspace (`C:/Users/ich/Desktop/code/_projects/Nodges`), synchronisiert per Git ueber `origin/main`.
  - `piCon`: Docker-Container (`/workspace`), laeuft auf WSL2.
  - `conT`: Windows-Workspace ueber Netzlaufwerk `W:\`, arbeitet direkt auf WSL2.


---

## Teil E — UNC-Absturz, Dual-Harness-Vorschlag und der dritte Harness conT

*Zusammengefasst aus winAnts Dokumenten `0_106_0_analyse_unc_absturz_und_empfohlene_loesung.md` und `0_106_0_entscheidung_dual_harness_und_naechste_schritte.md`.*

### E.1 Der UNC-Praxistest ist GESCHEITERT

winAnt hat den Praxistest durchgefuehrt und meldet: **Antigravity stuerzt beim Laden des WSL-Pfads ab.**

**Technische Ursache (winAnts Analyse):**
- Antigravity basiert auf der Electron-/VS-Code-Architektur.
- Beim Oeffnen eines Projektordners startet ein **File Watcher** (Datei-Ueberwachungsdienst), der rekursiv das Dateisystem ueberwacht.
- Unter Windows nutzt dieser Dienst die API `ReadDirectoryChangesW`.
- Der WSL-Pfad ist aber keine echte Windows-Freigabe, sondern eine virtuelle Freigabe ueber das **9P-Protokoll** (Plan9, die WSL-Dateisystembruecke).
- 9P unterstuetzt die Windows-Dateibenachrichtigungen nicht standardkonform. Beim Ueberwachen grosser Baeume (`node_modules`, `.git`) laeuft der Watcher in einen **unhandled Exception**-Fehler → Absturz.
- Zusaetzlich blockiert die IDE den Pfad nach einem Absturz haeufig (Workspace Trust / Sitzungsverwaltung).

### E.2 winAnts Gegenmodell: Pragmatischer Dual-Harness

Wegen dieses Absturzes schlaegt winAnt **eine Abkehr von Variante B** vor — zurueck zu **zwei getrennten Arbeitskopien mit Git als Bruecke**:

| Harness | Arbeitsbereich | Zustaendigkeit |
|---|---|---|
| **winAnt** | `C:/Users/ich/Desktop/code/_projects/Nodges` (NTFS) | Architektur, Frontend, Three.js, Doku (`doc/`) |
| **piCon** | `/workspace` aus `/home/unixusername/nodges` (WSL2 ext4) | Container, Vite, LightRAG, Linux-Skripte |
| Bruecke | GitHub `main` | Ritual: Push vor dem Wechsel, Pull nach dem Wechsel (2–3 Sekunden) |

winAnts Argument: Die frueheren Gegengruende seien **ausgeraeumt** — `doc/` ist freigegeben, LF erzwungen, `core.fileMode = false` aktiv, Ballast geloescht. Deshalb sei Git-Sync jetzt reibungslos.

### E.3 KRITISCHER WIDERSPRUCH — drei ungeklaerte Punkte

piCon weist auf drei **diskrepanzte** Punkte hin. Diese muessen vom Benutzer und conT geklaert werden:

**(1) conT arbeitet offenbar ERFOLGREICH auf dem WSL-Pfad.**
Der Benutzer meldete: *„inzwischen ist auch conT als dritter Benutzer aufgetaucht. Er ist Antigravity in Windows, jedoch neu mit `\\wsl.localhost\Ubuntu\home\unixusername\nodges` als Dateibasis in WSL."*
Das **steht im direkten Widerspruch** zu E.1. Moegliche Erklaerungen:
- conT ist eine **andere Antigravity-Konfiguration** (z. B. mit deaktiviertem File-Watcher oder ohne Workspace-Cache), die stabil laeuft.
- Oder conT nutzt den WSL-Pfad nur als **Dateibasis zum Lesen/Schreiben**, nicht als vollstaendig ueberwachten IDE-Workspace.
- Oder das Problem tritt nur beim **erstmaligen Indexieren** grosser Baeume auf und conT hat einen anderen Startzustand.

**→ GEKLAERT durch conT selbst (in `setup.md`):** conT arbeitet **nicht** auf dem rohen UNC-Pfad, sondern ueber ein **zugeordnetes Netzlaufwerk `W:\`** (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`). Genau das umgeht den Absturz: Der File-Watcher der IDE greift ueber einen anderen Mechanismus zu. Das rote „X" im Windows-Explorer ist laut conT kosmetisch (Lazy Reconnect des 9P-Protokolls).

**→ Offene Frage:** Soll **winAnt** ebenfalls auf `W:\` umgestellt werden? Dann koennte der getrennte Windows-Workspace entfallen und Variante B waere fuer beide Windows-Harnesses erreicht.

**(2) Branch-Benennung ist veraltet.**
winAnt schreibt in beiden Dokumenten: Synchronisation *„auf dem Branch `pi`"*. **`pi` existiert nicht mehr** — er wurde mit Commit `d4c7b3f` geloescht und vollstaendig nach `main` ueberfuehrt (siehe Teil D).
**→ Korrektur noetig:** Alle Rituale muessen `main` statt `pi` verwenden. Falls winAnt noch lokal auf `pi` ist: `git push` (mergen), dann `git checkout main`.

**(3) Variante B ist durch E.2 in Frage gestellt.**
Teil D und `setup.md` beschreiben Variante B (Linux-SSoT, ein Arbeitsort) noch als verbindlich. E.2 schlaegt faktisch **zwei** Arbeitsorte vor.
**→ Entscheidung noetig:** Gilt weiterhin Variante B (ein Ort), oder wird das Dual-Harness-Modell aus E.2 beschlossen?

### E.4 Bewaehrtes bleibt bestehen (beide Modelle)

Unabhaengig von der Modellfrage sind diese Errungenschaften gesichert:
- `doc/` ist versioniert → Berichte erreichen beide Seiten.
- LF repo-weit erzwungen → keine Phantom-Diffs.
- `core.fileMode = false` → keine Berechtigungskonflikte.
- CRLF-Ausnahme fuer `.cmd`/`.bat`/`.ps1` → Container-Startskript bleibt ausfuehrbar.
- 258 Ballast-Dateien entfernt.


---

## Teil F — winAnt wird abgekoppelt: conT ersetzt ihn (Beschluss des Benutzers, 2026-09-24)

### F.1 Die Entscheidung

Der Benutzer hat entschieden:

> **„zu 1. und 2.: winant wird abgekoppelt. er ist durch cont ersetzt."**

Damit ist der **Dual-Harness-Vorschlag von winAnt (Teil E.2) gegenstandslos**. Es gilt **ausschliesslich das conT-Modell**:

| Harness | Arbeitsbereich | Verhaeltnis zu den Dateien |
|---|---|---|
| **piCon** (Pi im Container) | `/workspace` — gemountet aus `/home/unixusername/nodges` | **direkt** auf WSL2 ext4 |
| **conT** (Antigravity Windows 11) | `W:\` — Netzlaufwerk auf **dasselbe** Verzeichnis | **direkt**, dieselben physischen Dateien |
| **winAnt** (alt) | ~~`C:\Users\ich\Desktop\code\_projects\Nodges`~~ | **ABGEKOPPELT — nicht mehr in Benutzung** |

**Konsequenz:** Es gibt ab jetzt **nur noch einen Arbeitsort**. piCon und conT teilen sich physisch dieselben Dateien. Ein **Git-Sync zwischen ihnen ist nicht mehr noetig** — Aenderungen des einen sind fuer den anderen sofort sichtbar.

GitHub bleibt **Sicherung und Austausch** (Backup, Historie, Tags), ist aber nicht mehr die primaere Bruecke.

### F.2 Was das fuer Variante B bedeutet

Die Variante B (Linux als alleinige Wahrheitsquelle) ist damit **vollstaendig erreicht** — auf einem anderen Weg als urspruenglich gedacht:

- Nicht durch Oeffnen des UNC-Pfads in der IDE (das stuerzte ab, siehe E.1).
- Sondern ueber ein **zugeordnetes Netzlaufwerk `W:\`**, das denselben WSL2-Ordner anbindet.

Damit ist der Konflikt aus E.3 (3) geloest: **Kein Dual-Harness-Modell, sondern ein Arbeitsort mit zwei Zugriffswegen.**

### F.3 Aufgeraeumt

| Was | Status |
|---|---|
| Branch `pi` (remote) | bereits geloescht — nur noch `main` |
| Branch `pi` (lokal) | Bestand noch, da kein lokaler Verweis mehr benoetigt wird → zur Aufraeumung vorgemerkt |
| Verweise auf `origin/pi` in fremden Dokus | Als **veraltet** markiert in `setup.md` Abschnitt 8 |
| Windows-Workspace `C:\...\Nodges` | **nicht mehr verwendet** — kann nach Sicherung archiviert werden |

### F.4 Die Arbeitsregel ab jetzt

> **piCon und conT arbeiten direkt auf denselben Dateien. Vor Arbeitsbeginn kurz pruefen (`git status`), ob der andere noch etwas offen hat. Vor groesseren Schritten den Benutzer fragen. Keine stillen Ueberschreibungen fremder Arbeit.**

Da beide auf denselben Dateien arbeiten, ist ein **`git commit`** weiterhin sinnvoll (Sicherungspunkt), ein **`git push`** aber nur noch fuer GitHub als Backup — nicht mehr als Synchronisation.


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

`Nodges_Pi/doc/` war der **letzte unversionierte Rest** im Arbeitsbaum (`??` in `git status`). Der Benutzer hat die Dateien mit `git add .` zum Commit vorgemerkt und piCon gebeten, den **Versionierungsablauf** (Version erhoehen, committen, pushen) durchzufuehren.

### G.2 Inhalt

**30 Dateien**, zusammen **767 Zeilen** — ausschliesslich Markdown und eine Mermaid-Datei:
- 28 `.md` und 1 `.mmd` aus `Nodges_Pi/doc/` (Doku des Container-Setups: `1_0_0_docker_*`, `1_0_0_wsl_*`, `1_0_0_pi_*`)
- 1 geaenderte Datei: `package.json` (Version)

Namensmuster der Dateien: Praefix `1_0_0_` bzw. `1_` — historische Setup-Doku zum Docker-/WSL-Thema.

### G.3 Sicherheitspruefung (wie bei der frueheren `doc/`-Freigabe)

Vor dem Commit wurde ein **Secrets-Scan** ueber alle 30 Dateien durchgefuehrt — analog zu Abschnitt 8:

```bash
git diff --cached --name-only | xargs grep -lEIn "sk-[A-Za-z0-9]{16,}|ghp_...|Bearer ...|api_key..."
```

**Ergebnis: sauber.** Keine echten Schluessel oder Tokens. Damit war die Freigabe unbedenklich.

### G.4 Versionierung

| Datei | alt | neu |
|---|---|---|
| `package.json` | `0.106.2` | **`0.106.3`** |
| `package-lock.json` | `0.106.2` | **`0.106.3`** |

Die Patch-Version wurde erhoeht — passend zum conT-Workflow (`sgc`), bei dem die Version vor jedem Push automatisch um 1 steigt.

### G.5 Ergebnis

- Commit erstellt und nach **`origin/main`** gepusht.
- Der Arbeitsbaum ist damit **vollstaendig sauber** — keine unversionierten Dateien mehr.

> **Hinweis:** `Nodges_Pi/` ist der **Git-Snapshot** des Compose-Projekts. Die echte, wirksame Compose-Datei liegt weiterhin ausserhalb des Repos unter `C:\Users\ich\Desktop\code\_projects\Nodges_Pi` (siehe `resetup.md`). Die Doku hier ist also beschreibend, nicht ausfuehrend.
