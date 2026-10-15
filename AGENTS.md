# Projektkontext und Arbeitsregeln (Multi-Harness)

Dieses Dokument dient als zentrale, verbindliche Referenz fuer alle beteiligten KI-Agenten und Harnesses am Projekt **Nodges**.

\---

## 1\. Uebersicht der Harnesses und Rollen

|Harness|Umgebung|Arbeitsverzeichnis|Aufgaben|Status|
|-|-|-|-|-|
|**conT**|Antigravity (Windows 11)|`W:/` (gemappt auf WSL2)|Architektur, Frontend/Three.js, UI, E2E-Tests|\[aktiv]|
|**piCon**|Pi-Agent im Docker-Container `pi-harness`|`/workspace`|Backend, Python/LightRAG, Ingestion, Linux-Skripte, L1-Tests|\[aktiv]|
|**dopi**|Docker- & Host-Orchestrator (Antigravity Host)|`C:/Users/ich/Desktop/code/_projects/Nodges_Pi`|Host- & Docker-Setup, Container-Erstellung, Compose, Startskripte, Container-Infrastruktur|\[Bedarf] (nur bei Setup-Bedarf)|

\---

## 2\. Physische Architektur und Single Source of Truth (SSoT)

Es gibt **einen primaeren Arbeitsort** (ext4 unter WSL2, SSoT fuer den Projektinhalt) **und einen zweiten gueltigen Ort** auf dem Windows-Host (`C:/Users/ich/Desktop/code/_projects/Nodges_Pi`). Beide sind gueltig und werden nicht gegeneinander ausgespielt:

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

**Zweiter gueltiger Ort (dopi, Host-Infrastruktur):** `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` — dort liegen die unter Windows verwaltete `docker-compose.yml`, das `Dockerfile`, `.devcontainer/` und `start_pi_container.cmd`. Der Ort liegt bewusst ausserhalb des ext4-SSoT und traegt keinen Projekt-Fachinhalt.

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
|`bash tools/nodges-git.sh save`|Patch-Version +1 (`0.106.4` -> `0.106.5`), `git add -A`, Commit mit der reinen Versionsnummer. **Auf Anforderung des Benutzers oder am fachlichen Abschluss** — nicht mehr automatisch nach jedem Schritt. Die Datei selbst zu schreiben genuegt; die Versionierung ist sekundaer.|nein|
|`bash tools/nodges-git.sh release --bestaetigt-durch-user`|Minor-Version (`0.106.9` -> `0.107.0`), Typecheck und Tests, lokaler Commit, lokales Tag `v0.107.0`. **NUR nach Ruecksprache mit dem Benutzer.**|nein|
|`bash tools/nodges-git.sh major --bestaetigt-durch-user`|Major-Version (`0.107.0` -> `1.0.0`), Typecheck, Tests, Commit, Tag, Push nach GitHub. **NUR nach Rueckfrage an den Benutzer.**|ja|
|`bash tools/nodges-git.sh hooks`|Richtet die versionierten Git-Hooks ein (`core.hooksPath = git-hooks`).|nein|

**Regel: Zurueckhaltung ist die Grundhaltung (Abschnitt 6). Dateien zu schreiben und liegen zu lassen ist der Normalfall — Git-Sicherungen (`save`) erfolgen nur auf Anforderung des Benutzers oder am fachlichen Abschluss eines Vorhabens, nicht nach jedem Arbeitsschritt. Die Versionierung ist sekundaer. Lokale Minor-Releases erfordern vorherige Ruecksprache mit dem Benutzer. Nach GitHub geht ausschliesslich ein Major-Release und nur nach vorheriger Rueckfrage an den Benutzer.**

### Versionierte Git-Hooks (`git-hooks/`, aktiv ueber `core.hooksPath`)

conT und piCon teilen **dieselbe `.git`-Verwaltung**, deshalb gelten die Hooks automatisch fuer beide Seiten.

|Hook|Wirkung|
|-|-|
|`pre-commit`|Abbruch bei falschem Branch und bei moeglichen Geheimnissen in der Stage; Hinweis, wenn die Version nicht mitgezogen wurde|
|`pre-push`|**Blockiert jeden Push ausser Major-Versionen (X.0.0).** Ausnahme nur bewusst: `NODGES\_ALLOW\_PUSH=1`|
|`post-commit`|Kurzmeldung: Version, Commit, wie viele Commits nur lokal vorliegen|

### Skills beider Harnesses

|Harness|Ort|Inhalt|
|-|-|-|
|conT (Antigravity)|`W:/.agents/skills/<name>/SKILL.md` (= `/workspace/.agents/skills/...`)|`save`, `release`, `status` — duenne Verweise auf `tools/nodges-git.sh`|
|piCon (Container)|`/workspace/.agents/skills/<name>/SKILL.md`|**dieselben** Skills, kein eigener Satz|

> **Ein Skill-Ort fuer beide Harnesses:** `.agents/skills/` im Repo ist die einzige verbindliche Quelle. Die frueheren Kopien unter `/home/.pi/agent/skills/` (`release`, `save`, `status`) sind entfernt worden. Der fruehere `com`-Skill und die COM-Bus-Skripte wurden zurueckgebaut.

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
3. [W:/com/feature/](file:///W:/com/feature/) — laufende Vorhaben und Features (nur Dateinamen reichen zum Ueberblick).
4. [W:/com/entscheidungen.md](file:///W:/com/entscheidungen.md) — Beschluesse des Benutzers, bindend.
5. [W:/com/fragen_an_user.md](file:///W:/com/fragen_an_user.md) — offene Fragen an den Benutzer (Orientierung bei "fragen"-Abfragen).
6. [W:/com/ideen.md](file:///W:/com/ideen.md) — ungepruefte Einfaelle.
7. Erst bei Detailfragen: `com/bericht.md` (Historie) bzw. `com/setup.md` (Technik).

Der vollstaendige Einstieg steht in [**W:/com/00\_start\_hier.md**](file:///W:/com/00_start_hier.md).

**Verbindliche Dokumenten-Rangfolge bei inhaltlichen Konflikten:**
1. [W:/com/entscheidungen.md](file:///W:/com/entscheidungen.md) (Rang 1: Beschluesse des Benutzers, bindend)
2. [W:/com/feature/](file:///W:/com/feature/) (Rang 2: Verbindliche Fachvertraege und DTOs des laufenden Vorhabens)
3. [W:/com/todo.md](file:///W:/com/todo.md) (Rang 3: Offene Aufgaben und Empfehlungen; darf Rang 1 und 2 niemals ueberstimmen)

**Inhalte von `com/` (alle versioniert, nichts in `.gitignore`):**

|Datei / Ordner|Zweck|
|-|-|
|`00\_start\_hier.md`|Einstieg und Lesereihenfolge|
|`todo.md`|offene Punkte, kurz|
|`feature/`|laufende Vorhaben und Features, ein Ordner/File je Vorhaben|
|`entscheidungen.md`|Beschluesse des Benutzers (bindend)|
|`fragen_an_user.md`|offene Fragen fuer den Benutzer (Orientierung bei "fragen")|
|`ideen.md`|Ideensammlung, ungeprueft|
|`bericht.md`|Gesamtbericht und Dialogprotokoll (Historie)|
|`setup.md` / `setup/`|technische Kurzanleitung Setup/Git und Vorlagen|
|`doc/`|Archiv aller bisherigen Berichte (273 Dateien)|
|`txt/`|**Ausnahme:** reine `.txt`-Varianten der Kerndokumente fuer **NotebookLM**, das keine `.md` liest. Erzeugt ueber `tools/export_com_txt.mjs` bzw. `tools/create_000_txt.mjs`, indexiert in `com/txt/INDEX_DATEIEN.txt`.|

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
| Backend, Python-Venv & Linux-Tools | **piCon** (Docker-Container / Linux) | `lightrag-backend/`, `tools/*.sh`, `tools/*.mjs` |
| Host-Docker, Container-Erstellung & Infrastruktur | **dopi** (Antigravity Host / Bedarfs-Harness) | `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` (`docker-compose.yml`, `Dockerfile`, `.devcontainer/`, `start_pi_container.cmd`) |
| Gemeinsame Dateien | **conT & piCon** (nur mit vorheriger Notiz in todo.md) | `package.json`, `AGENTS.md`, `com/`, `tools/nodges-git.sh`, `git-hooks/` |

*Regeln:*
* Wer ausnahmsweise in der Domaene des anderen arbeiten muss, kuendigt dies vorher kurz per Notiz in `com/todo.md` an.
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
4. **Dokumentation und Aufgabenpflege:**
   * **Schlanke Dokumentation:** Keine unnoetigen Mammut-Berichte fuer Zwischenschritte. Der primaere Status gehoert direkt, knapp und praegnant in [W:/com/todo.md](file:///W:/com/todo.md).
   * **Ergebnisberichte:** Nur bei groesseren Architekturumbauten oder echten Meilensteinen wird eine kompakte Datei unter [W:/com/doc/](file:///W:/com/doc/) abgelegt.
   * **Benutzerbeschluesse:** Werden verbindlich mit Datum in [W:/com/entscheidungen.md](file:///W:/com/entscheidungen.md) festgehalten.
   * **Offene Punkte & Rueckfragen:** Gehoeren strukturiert nach [W:/com/fragen_an_user.md](file:///W:/com/fragen_an_user.md).
5. **Sorgfalt bei Aenderungen:**

   * Keine stillen Ueberschreibungen fremder Arbeit.
6. **Benutzerprofil und Interaktionsregeln (Single Source of Truth):**

   * **Benutzer:** `Banixx` (GitHub), Windows-Benutzer `ich`.
   * **Erfahrung:** Amateurprogrammierer.
   * **Wahrheitsgebot:** Nichts ungeprueft behaupten — fremde Angaben am realen Code und Dateistand verifizieren.
   * **Zurueckhaltung (Grundhaltung):** Keine inhaltlichen Code-Aenderungen ohne ausdrueckliche Anforderung des Benutzers. Einzige ausdruecklich vereinbarte Ausnahme ist die Berichtspflicht (Abschnitt 6 Punkt 4). Git-Sicherungen (`save`) sind kein Automatismus: erst auf Anforderung oder am fachlichen Abschluss.
   * **Fragen-Trigger ("fragen"):** Wenn der Benutzer in einer Session nach "fragen" fragt (z.B. "Welche Fragen sind offen?", "gibt es offene fragen?", "fragen"), orientiert sich das LLM verbindlich an [W:/com/fragen_an_user.md](file:///W:/com/fragen_an_user.md) und praesentiert die offenen Entscheidungsvorlagen strukturiert und kompakt.

\---

## 7\. Koordination und Aufgabenfluss (Zustandsbasiert)

Der fruehere aktive COM-Bus (Hintergrund-Waechter, Dateisystem-Pings und periodisches Token-Polling) wurde gemaess Benutzerbeschluss vom 2026-10-01 vollstaendig zurueckgebaut.

Die Zusammenarbeit zwischen **conT**, **piCon** und **dopi** erfolgt rein zustandsbasiert:
1. **Gemeinsamer Wissensspeicher `com/`:** Fachliche Vorgaben, Notizen und Architekturentscheidungen liegen transparent im Dateisystem vor (SSoT).
2. **Aufgabenmatrix [com/todo.md](file:///W:/com/todo.md):** Aufgaben werden anhand ihrer Domaenentags (`[READY: conT]`, `[READY: piCon]`, `[READY: dopi]`) uebernommen.
3. **Status-Aktualisierung:** Bei Beginn setzt das bearbeitende Harness den Tag `[IN ARBEIT: <Harness>]` und nach Abschluss auf `[ERLEDIGT]` (bzw. `[REVIEW: User]`).
4. **Kein Ping-Zwang:** Da beide Agenten dieselben Inodes nutzen, sind Aenderungen sofort sichtbar. Pings und Dauerscanner sind nicht mehr aktiv.


