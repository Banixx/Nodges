# Projektkontext und Arbeitsregeln (Multi-Harness)

Dieses Dokument dient als zentrale, verbindliche Referenz fuer alle beteiligten KI-Agenten und Harnesses am Projekt **Nodges**.

\---

## 1\. Uebersicht der Harnesses und Rollen

|Harness|Umgebung|Arbeitsverzeichnis|Aufgaben|Status|
|-|-|-|-|-|
|**conT**|Antigravity (Windows 11)|`W:/` (gemappt auf WSL2)|Architektur, Frontend/Three.js, UI, Dokumentation|\[aktiv]|
|**piCon**|Pi-Agent im Docker-Container `pi-harness`|`/workspace`|Container-Dienste, Vite, LightRAG, Linux-Skripte, Backup|\[aktiv]|
|**dopi**|Docker- & Host-Orchestrator|`C:/Users/ich/Desktop/code/_projects/Nodges_Pi`|Host- & Docker-Setup, Compose, Startskripte, Container-Infrastruktur|\[Bedarf] (redet nur bei Setup mit, kein fester Turnus, expliziter Aufruf)|
|<b>~~winAnt~~</b>|~~Antigravity (Windows Host)~~|~~`C:/Users/ich/Desktop/code/\_projects/Nodges`~~|~~Urspruenglicher Windows-NTFS-Workspace~~|**\[abgekoppelt]** (ersetzt durch conT)|

\---

## 2\. Physische Architektur und Single Source of Truth (SSoT)

Es gibt **nur einen einzigen physischen Arbeitsort** fuer dieses Projekt:

```
        /home/unixusername/nodges   (WSL2 Linux, ext4)  <-- Single Source of Truth
                    |
        +-----------+-----------+
        |                       |
   /workspace                  W:/  (Netzlaufwerk)
   \[piCon im Container]        \[conT in Antigravity Windows 11]
        |                       |
        +-----------+-----------+
                    |
              GitHub Remote
       (Sicherung \& Tag-Archiv)
```

* **Dateisystem-Identitaet:** `conT` (ueber das Netzlaufwerk [W:/](file:///W:/)) und `piCon` (ueber `/workspace`) greifen direkt auf exakt dieselben physischen ext4-Inodes zu.
* **Kein Git-Sync fuer lokale Arbeit:** Aenderungen, die von `conT` oder `piCon` vorgenommen werden, sind auf der Gegenseite unmittelbar im Dateisystem praesent. Es ist kein `git commit` oder `git push` erforderlich, um Zwischenschritte zwischen den beiden Agenten auszutauschen.
* **Netzlaufwerk W:** Ein eventuelles rotes Kreuz im Windows Explorer beim Netzlaufwerk `W:` ist ein rein kosmetischer Effekt (Windows Lazy Reconnect) und beeintraechtigt weder Datei- noch Git-Operationen.

\---

## 3\. Git- und Branch-Strategie

|Eigenschaft|Vorgabe|
|-|-|
|Remote|`git@github.com:Banixx/Nodges.git` (SSH) bzw. `https://github.com/Banixx/Nodges.git` (HTTPS)|
|Primaerer Arbeitsbranch|**`main`** (alleiniger Zweig fuer alle Harnesses)|
|Branch `pi`|**Geloescht** — vollstaendig in `main` aufgegangen, darf nicht mehr verwendet werden|
|Rolle von GitHub|**Meilenstein-Archiv** — dorthin gehen nur Minor- und Major-Versionen, nicht primaere Synchronisationsbruecke|
|Versionstags|Stabile Meilensteine werden als Git-Tag gesichert (z.B. `v0.106.0`)|

### Verbindlicher Git-Workflow (gueltig seit Version 0.106.5)

Die Ablaeufe liegen **ausfuehrbar** im Repo: `tools/nodges-git.sh` (mit Hilfsskript `tools/nodges-git-version.mjs` fuer die Versionsverwaltung). conT und piCon rufen dasselbe Skript auf
und interpretieren nichts selbst. Damit ist Drift zwischen den beiden Seiten ausgeschlossen. Die Skills
(siehe unten) sind nur duenne Verweise darauf.

|Befehl|Wirkung|Push|
|-|-|-|
|`bash tools/nodges-git.sh status`|Stand: Branch, Version, Tag, Abstand zu GitHub, offene Dateien. Aendert nichts.|nein|
|`bash tools/nodges-git.sh save`|Patch-Version +1 (`0.106.4` -> `0.106.5`), `git add -A`, Commit mit der reinen Versionsnummer. Sichert Zwi|nein|
|`bash tools/nodges-git.sh release`|Minor-Version (`0.106.9` -> `0.107.0`), Typecheck und Unit-Tests, Commit, Tag `v0.107.0`, Push nach `origin|ja|
|`bash tools/nodges-git.sh hooks`|Richtet die versionierten Git-Hooks ein (`core.hooksPath = git-hooks`).|nein|

**Regel: Zwischenstaende bleiben lokal. Nur eine Minor- oder Major-Version geht nach GitHub.**

### Versionierte Git-Hooks (`git-hooks/`, aktiv ueber `core.hooksPath`)

conT und piCon teilen **dieselbe `.git`-Verwaltung**, deshalb gelten die Hooks automatisch fuer beide Seiten.

|Hook|Wirkung|
|-|-|
|`pre-commit`|Abbruch bei falschem Branch und bei moeglichen Geheimnissen in der Stage; Hinweis, wenn die Version nicht mitgezogen wurde|
|`pre-push`|**Blockiert jeden Push mit einer Patch-Version.** Ausnahme nur bewusst: `NODGES\_ALLOW\_PUSH=1`|
|`post-commit`|Kurzmeldung: Version, Commit, wie viele Commits nur lokal vorliegen|

### Skills beider Harnesses

|Harness|Ort|Inhalt|
|-|-|-|
|conT (Antigravity)|`W:/.agents/skills/<name>/SKILL.md` (= `/workspace/.agents/skills/...`)|`save`, `release`, `status` — duenne Verweise auf `tools/nodges-git.sh`|
|piCon (Container)|`/home/.pi/agent/skills/<name>/SKILL.md`|dieselben drei Griffe; `uupdate` bleibt als Alt-Name fuer `save` erhalten|

> \*\*Vorsicht:\*\* `.agents/` ist bis auf `.agents/skills/` in der `.gitignore` ausgeschlossen. Die Skills
> selbst sind versioniert, andere Agenten-Konfigurationen dort bleiben privat.

### Vorsicht beim Zuruecksetzen

Solange `status` meldet, dass Commits **lokal voraus** liegen, waere `git reset --hard origin/main` oder
„Zurueck auf den GitHub-Stand" ein Datenverlust. Erst `release` ausfuehren oder bewusst lokal bleiben.

\---

## 4\. Dienste, Ports und Laufzeitumgebung

Alle Kern-Dienste laufen im Linux-Container:

|Port|Dienst|Status beim Start|Verwaltung|
|-|-|-|-|
|5173|Vite Dev-Server|\[aktiv] automatisch via Container-CMD|Start via PID 1; im Container: `node /workspace/node\_modules/.bin/vite`|
|5174|Vite (manuell)|\[inaktiv]|Manueller Ausweich-Port: `npm run dev -- --port 5174`|
|8000|LightRAG Backend|\[aktiv] via `postStartCommand`|`.devcontainer/start-lightrag.sh` bzw. `npm run lightrag`|
|5173 `/lightrag-api`|Vite-Proxy auf LightRAG|\[aktiv]|Proxy-Kette leitet Anfragen an `http://localhost:8000` weiter|
|9222|Chrome CDP|\[inaktiv]|Nicht verfuegbar (Pakete im Pi-Image fehlen)|
|6080|noVNC / VNC|\[inaktiv]|Nicht verfuegbar (Pakete im Pi-Image fehlen)|

### LightRAG-Konfiguration

* **Virtuelle Umgebung:** `/workspace/lightrag-backend/venv` bzw. [W:/lightrag-backend/venv](file:///W:/lightrag-backend/venv).
* **Abhaengigkeiten:** `fastapi`, `uvicorn`, `lightrag-hku`, `pydantic`, `python-dotenv`.
* **Speicherort:** `LIGHTRAG\_WORKING\_DIR`, Fallback auf `lightrag-backend/rag\_storage`. Vektordaten liegen lokal in Linux und sind in `.gitignore` ausgeschlossen.
* **Embeddings:** OpenRouter Modell `qwen/qwen3-embedding-8b` (Dimension 4096).
* **Health-Check:**

```bash
  curl -s http://localhost:5173/lightrag-api/health
  ```

### Docker-Compose-Besonderheit

* Die wirksame Compose-Datei wird unter Windows verwaltet:
`C:/Users/ich/Desktop/code/\_projects/Nodges\_Pi/docker-compose.yml`



### Prozess-Management im Container

* Standardtools wie `ps`, `pgrep`, `pkill`, `ss` fehlen im Image.
* Prozesspruefungen erfolgen direkt ueber `/proc` (z.B. `/proc/\*/cmdline`, `/proc/net/tcp`).

\---

## 5\. Dateisystem- und Dokumentationskonventionen

### Gemeinsamer Wissensspeicher `com/` (verbindlicher Einstieg)

Alle Harnesses lesen ihre Arbeitsgrundlage aus dem Ordner [**W:/com/**](file:///W:/com/) — piCon ueber `/workspace/com/`, conT ueber `W:\\com\\`. Beide zeigen auf **denselben** Ordner.

**Lesereihenfolge bei jedem Arbeitsbeginn:**

1. Dieses `AGENTS.md` (Root) — die Regeln.
2. [W:/com/todo.md](file:///W:/com/todo.md) — was gerade offen ist.
3. [W:/com/plan/](file:///W:/com/plan/) — laufende Vorhaben (nur Dateinamen reichen zum Ueberblick).
4. [W:/com/entscheidungen.md](file:///W:/com/entscheidungen.md) — Beschluesse des Benutzers, bindend.
5. [W:/com/offene-fragen.md](file:///W:/com/offene-fragen.md) — offene Fragen an den Benutzer (Orientierung bei "fragen"-Abfragen).
6. [W:/com/ideen.md](file:///W:/com/ideen.md) — ungepruefte Einfaelle.
7. Erst bei Detailfragen: `com/bericht.md` (Historie) bzw. `com/setup.md` (Technik).

Der vollstaendige Einstieg steht in [**W:/com/00\_start\_hier.md**](file:///W:/com/00_start_hier.md).

**Verbindliche Dokumenten-Rangfolge bei inhaltlichen Konflikten:**
1. [W:/com/entscheidungen.md](file:///W:/com/entscheidungen.md) (Rang 1: Beschluesse des Benutzers, bindend)
2. [W:/com/plan/](file:///W:/com/plan/) (Rang 2: Verbindliche Fachvertraege und DTOs des laufenden Vorhabens)
3. [W:/com/todo.md](file:///W:/com/todo.md) (Rang 3: Offene Aufgaben und Empfehlungen; darf Rang 1 und 2 niemals ueberstimmen)

**Inhalte von `com/` (alle versioniert, nichts in `.gitignore`):**

|Datei / Ordner|Zweck|
|-|-|
|`00\_start\_hier.md`|Einstieg und Lesereihenfolge|
|`todo.md`|offene Punkte, kurz|
|`plan/`|laufende Vorhaben, ein File je Vorhaben|
|`entscheidungen.md`|Beschluesse des Benutzers (bindend)|
|`offene-fragen.md`|offene Fragen fuer den Benutzer (Orientierung bei "fragen")|
|`ideen.md`|Ideensammlung, ungeprueft|
|`bericht.md`|Gesamtbericht und Dialogprotokoll (Historie)|
|`setup.md`|technische Kurzanleitung Setup/Git|
|`doc/`|Archiv aller bisherigen Berichte (273 Dateien)|

### Verzeichnisstruktur fuer Dokumentation

* [**W:/com/doc/**](file:///W:/com/doc/)**:** Arbeitsdokumente, Plaene, Analysen und Architekturberichte von Antigravity.

  * Dateinamen tragen als Praefix die bereinigte Versionsnummer aus `package.json` (z.B. `0\_106\_3\_mein\_bericht.md`).
  * `com/doc/` ist **vollstaendig versioniert** und nicht in `.gitignore`.
  * Gezielt suchen (`grep`), nicht pauschal lesen — der Ordner ist gross.
* [**W:/docs/**](file:///W:/docs/)**:** Dauerhafte Leitfaeden und statische Projektdokumentation.
* **Verlinkte Gesamtdokumente (liegen in `com/`):**

  * [W:/com/bericht.md](file:///W:/com/bericht.md): Ausfuehrlicher Gesamtbericht und fortlaufendes Dialogprotokoll zwischen den Agenten.
  * [W:/com/setup.md](file:///W:/com/setup.md): Technische Kurzanleitung und Setup-Referenz.
* **Root-Dokument:**

  * [W:/AGENTS.md](file:///W:/AGENTS.md): Dieses Dokument (Arbeitsregeln und Agenten-Kontext).

### Zeilenenden und Git-Attribute

* **Root-`.gitattributes`:** Erzwingt repo-weit `\* text=auto eol=lf`.
* **Skript-Ausnahmen:** Windows-Startskripte (`\*.cmd`, `\*.bat`, `\*.ps1`) werden zwingend mit `eol=crlf` ausgecheckt, um die Ausfuehrbarkeit des Startskripts [W:/start\_pi\_container.cmd](file:///W:/start_pi_container.cmd) sicherzustellen.
* **Berechtigungen:** `core.fileMode = false` und `safe.directory` sind fuer den WSL-Pfad konfiguriert.

\---

## 6\. Arbeitsregeln fuer Agenten (conT, piCon und dopi)

### Domaenenzustaendigkeiten (Zustaendigkeit mit Ansagepflicht)

| Bereich | Primaere Zustaendigkeit | Pfade |
|---|---|---|
| Frontend, 3D-Canvas & E2E-Tests | **conT** (Host / Windows 11) | `src/`, `e2e/`, `playwright.config.ts` |
| Backend, Python-Venv & Container-Tools | **piCon** (Docker-Container / Linux) | `lightrag-backend/`, `tools/*.sh`, `tools/*.mjs`, `tools/watch_com.mjs` |
| Host-Docker & Container-Infrastruktur | **dopi** (Host / Bedarfs-Harness) | `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` (`docker-compose.yml`, `Dockerfile`, `.devcontainer/`, `start_pi_container.cmd`) |
| Gemeinsame Dateien | **conT & piCon** (nur mit vorheriger Ansage/Ping) | `package.json`, `AGENTS.md`, `com/`, `tools/nodges-git.sh`, `git-hooks/` |

*Regeln:*
* Wer ausnahmsweise in der Domaene des anderen arbeiten muss, kuendigt dies vorher kurz per Notiz in `com/todo.md` oder via COM-Ping an.
* **Sonderregel fuer dopi:** dopi hat grundsaetzlich nur mitzureden, wenn es um das Setup (Host-Docker, Compose, Startskripte, Infrastruktur) geht – und auch dann nicht immer. Es gibt keinen fixen Turnus fuer dopi. Dopi wird nur bei explizitem Bedarf von conT oder piCon aufgerufen.

---

1. **Pfad-Perspektive beachten:**

   * conT arbeitet mit absoluten Windows-Pfaden auf Laufwerk `W:/` (z.B. [W:/src/main.ts](file:///W:/src/main.ts)).
   * piCon arbeitet mit Linux-Pfaden im Container (z.B. `/workspace/src/main.ts`).
   * Beide Pfade referenzieren dieselbe Datei.
2. **Kommunikationsregeln:**

   * Ausschliesslich auf Deutsch kommunizieren.
   * Kein Sz (immer "ss" verwenden).
   * Striktestes Verbot von Emojis, Emoticons oder grafischen Unicode-Symbolen in Antworten und generierten Dokumenten.
3. **Frage-Modus:**

   * Wenn eine Nutzeranfrage ein Fragezeichen ("?") enthaelt, handelt es sich um eine Frage.
   * Fragen sind **direkt im ersten Satz** zu beantworten (sofern passend mit `Ja` oder `Nein` am Satzanfang).
   * Bei reinen Fragen werden **keine Code-Aenderungen** ausgefuehrt.
   * *Ausnahme:* Rueckfragen innerhalb eines initiierten Multi-Harness-Rapports (z.B. in `com/plan/` oder `com/test/`) sind Arbeitsaufgaben zwischen den Agenten und unterliegen nicht der Code-Aenderungssperre.
4. **Planungs- und Dokumentationsmodus:**

   * Plaene, Analysen und Berichte sind selbststaendig als Markdown-Dateien im Ordner [W:/com/doc/](file:///W:/com/doc/) mit dem Versionspraefix zu speichern.
   * Im Planungsmodus (`planning\_mode`) sind Aenderungen am Dateisystem ausserhalb von `com/` strikt untersagt.
   * Ein Arbeitsergebnis **sollte** (Empfehlung, keine Pflicht) zusaetzlich dort festgehalten werden, wo es hingehort: Ergebnisbericht nach `com/doc/`, offener naechster Schritt nach `com/todo.md`, mehrschrittiges Vorhaben nach `com/plan/`, ein Beschluss des Benutzers nach `com/entscheidungen.md`. Ein Faustregel gilt: Was laenger als eine Antwort ueberdauert, gehoert in `com/` — eine Antwort im Chat allein ist fuer das andere Harness spaeter nicht auffindbar.
5. **Sorgfaltspflicht vor Aenderungen:**

   * Vor Aenderungen muessen relevante Dateien, die Projektstruktur, `git status` und vorhandene Tests geprueft werden.
   * Vor groesseren Eingriffen oder Loeschungen ist die Rueckfrage an den Benutzer erforderlich. Keine stillen Ueberschreibungen fremder Arbeit.
6. **Benutzerprofil und Interaktionsregeln (Single Source of Truth):**

   * **Benutzer:** `Banixx` (GitHub), Windows-Benutzer `ich`.
   * **Erfahrung:** Amateurprogrammierer.
   * **Erklaerungs-Trigger ("ç"):** Wenn der Benutzer im Prompt das Zeichen **"ç"** (mit Cedille) verwendet, werden Fachbegriffe grosszuegig in Klammern mit deutschsprachigen Synonymen oder in maximal zwei Saetzen erklaert. Fehlt das Zeichen, bleibt die Kommunikation technisch praezise, direkt und kompakt.
   * **Farbvorlieben:** Violette und rosafarbene Schrift fuer Terminal- und UI-Gestaltung (gilt nicht fuer Markdown- oder Code-Repo-Inhalte).
   * **Wahrheitsgebot:** Nichts ungeprueft behaupten — fremde Angaben am realen Code und Dateistand verifizieren.
   * **Zurueckhaltung:** Vor groesseren Refactorings, strukturellen Umbauten oder Loeschungen immer zuerst den Benutzer fragen.
   * **Fragen-Trigger ("fragen"):** Wenn der Benutzer in einer Session nach "fragen" fragt (z.B. "Welche Fragen sind offen?", "gibt es offene fragen?", "fragen"), orientiert sich das LLM verbindlich an [W:/com/offene-fragen.md](file:///W:/com/offene-fragen.md) und praesentiert die offenen Entscheidungsvorlagen strukturiert und kompakt.

\---

## 7\. Der COM-Bus — wie conT und piCon sich gegenseitig wecken

Dateien in `com/` sind die gemeinsame Arbeitsgrundlage. Damit ein Harness sofort mitbekommt, dass das
andere dort etwas abgelegt hat, laeuft auf jeder Seite ein Waechter (Dateibeobachter):

|Seite|Waechter|Einschalten|
|-|-|-|
|piCon (Linux-Container)|`tools/watch\_com.mjs` (Node, weil keine `inotify-tools` im Image)|`bash tools/nodges-com.sh start`|
|conT (Windows/Antigravity)|`W:/tools/watch\_com.ps1` (PowerShell, `FileSystemWatcher`)|als Hintergrundprozess gestartet|

**So fliesst eine Meldung:**

1. conT legt eine Datei in `com/` ab (z.B. `com/todo.md`).
2. Der Linux-Waechter merkt das sofort (Ereignis direkt vom Dateisystem) und schreibt eine Zeile in
`tools/com-bus/events.log`, zum Beispiel `2026-09-27 06:03:11  geandert  com/todo.md  (812 B)`.
3. Die Erweiterung `/home/.pi/agent/extensions/nodges-com.ts` schaut bei **jedem Prompt** (Ereignis
`before\_agent\_start`) in diese Liste und stellt alles Neue als `COM\_UPDATE`-Nachricht in den Chat.
piCon muss also nicht nachfragen — die Meldung erscheint von selbst.
4. Der Zaehlerstand `tools/com-bus/piCon.seen` merkt, was schon gemeldet wurde.

**Gezielter Weckruf (Ping):** `bash tools/nodges-com.sh ping conT "Bitte Datei X lesen"` legt
`tools/com-bus/ping-conT.md` ab. Der Waechter meldet ihn einmal und nimmt die Datei dann weg. Pings landen im Chat des Empfaengers als eigener, vorrangiger Block.

**Bedienung auf der piCon-Seite (Fernbedienung):**

|Befehl|Wirkung|
|-|-|
|`bash tools/nodges-com.sh status`|Laeuft der Waechter? Wie viele Ereignisse sind ungelesen?|
|`bash tools/nodges-com.sh read`|Neues zeigen und als gelesen markieren (`--peek` laesst den Zaehler stehen)|
|`bash tools/nodges-com.sh ack`|Alles als gelesen markieren|
|`bash tools/nodges-com.sh watch`|Die Ereignisse live mitlesen (Abbruch mit Strg+C)|
|`bash tools/nodges-com.sh ping <ziel> <text>`|Weckruf an `conT`, `piCon` oder `all`|
|`bash tools/nodges-com.sh stop` / `start`|Waechter anhalten bzw. starten|

Regeln dazu:

* **Der Bus liegt unter `tools/com-bus/`, nicht in `com/`.** Sonst loest das Protokoll beim Schreiben
sich selbst wieder aus. `com/` bleibt reiner Inhalt, `tools/` ist Werkzeug. `tools/com-bus/` ist
Laufzeitprotokoll und bleibt per `.gitignore` aus dem Repo draussen; der Rest von `com/` bleibt
versioniert.
* Der Waechter muss nach jedem Neustart des Containers einmal gestartet werden (merken: `status` sagt es).
* Wer eine Rueckfrage an das andere Harness hat, schreibt sie als Datei in `com/` **und** setzt einen Ping.
Die Datei ist der Inhalt, der Ping ist nur die Klingel.
* Ausfuehrlich beschrieben in `com/doc/0\_106\_7\_com\_bus\_picon.md`.

