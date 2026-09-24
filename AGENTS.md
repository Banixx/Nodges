# Projektkontext und Arbeitsregeln (Multi-Harness)

Dieses Dokument dient als zentrale, verbindliche Referenz fuer alle beteiligten KI-Agenten und Harnesses am Projekt **Nodges**.

---

## 1. Uebersicht der Harnesses und Rollen

| Harness | Umgebung | Arbeitsverzeichnis | Aufgaben | Status |
|---|---|---|---|---|
| **conT** | Antigravity (Windows 11) | `W:/` (gemappt auf WSL2) | Architektur, Frontend/Three.js, UI, Dokumentation | [aktiv] |
| **piCon** | Pi-Agent im Docker-Container `pi-harness` | `/workspace` | Container-Dienste, Vite, LightRAG, Linux-Skripte, Backup | [aktiv] |
| ~~**winAnt**~~ | ~~Antigravity (Windows Host)~~ | ~~`C:/Users/ich/Desktop/code/_projects/Nodges`~~ | ~~Urspruenglicher Windows-NTFS-Workspace~~ | **[abgekoppelt]** (ersetzt durch conT) |

---

## 2. Physische Architektur und Single Source of Truth (SSoT)

Es gibt **nur einen einzigen physischen Arbeitsort** fuer dieses Projekt:

```
        /home/unixusername/nodges   (WSL2 Linux, ext4)  <-- Single Source of Truth
                    |
        +-----------+-----------+
        |                       |
   /workspace                  W:/  (Netzlaufwerk)
   [piCon im Container]        [conT in Antigravity Windows 11]
        |                       |
        +-----------+-----------+
                    |
              GitHub Remote
       (Sicherung & Tag-Archiv)
```

- **Dateisystem-Identitaet:** `conT` (ueber das Netzlaufwerk [W:/](file:///W:/)) und `piCon` (ueber `/workspace`) greifen direkt auf exakt dieselben physischen ext4-Inodes zu.
- **Kein Git-Sync fuer lokale Arbeit:** Aenderungen, die von `conT` oder `piCon` vorgenommen werden, sind auf der Gegenseite unmittelbar im Dateisystem praesent. Es ist kein `git commit` oder `git push` erforderlich, um Zwischenschritte zwischen den beiden Agenten auszutauschen.
- **Netzlaufwerk W:** Ein eventuelles rotes Kreuz im Windows Explorer beim Netzlaufwerk `W:` ist ein rein kosmetischer Effekt (Windows Lazy Reconnect) und beeintraechtigt weder Datei- noch Git-Operationen.

---

## 3. Git- und Branch-Strategie

| Eigenschaft | Vorgabe |
|---|---|
| Remote | `git@github.com:Banixx/Nodges.git` (SSH) bzw. `https://github.com/Banixx/Nodges.git` (HTTPS) |
| Primaerer Arbeitsbranch | **`main`** (alleiniger Zweig fuer alle Harnesses) |
| Branch `pi` | **Geloescht** — vollstaendig in `main` aufgegangen, darf nicht mehr verwendet werden |
| Rolle von GitHub | Externes Backup und Historie, nicht primaere Synchronisationsbruecke |
| Versionstags | Stabile Meilensteine werden als Git-Tag gesichert (z.B. `v0.106.0`) |

### Automatisierte Git-Workflows
- **`sgc` (Push & Handover):** Erhoeht die Patch-Version in `package.json`, fuehrt `git add .` aus, committet mit der Versionsnummer und pusht zu `origin/main`.
- **`sgp` (Pull & Takeover):** Fuehrt `git pull origin main` aus und meldet den Versions- und Commit-Stand.

---

## 4. Dienste, Ports und Laufzeitumgebung

Alle Kern-Dienste laufen im Linux-Container:

| Port | Dienst | Status beim Start | Verwaltung |
|---|---|---|---|
| 5173 | Vite Dev-Server | [aktiv] automatisch via Container-CMD | Start via PID 1; im Container: `node /workspace/node_modules/.bin/vite` |
| 5174 | Vite (manuell) | [inaktiv] | Manueller Ausweich-Port: `npm run dev -- --port 5174` |
| 8000 | LightRAG Backend | [aktiv] via `postStartCommand` | `.devcontainer/start-lightrag.sh` bzw. `npm run lightrag` |
| 5173 `/lightrag-api` | Vite-Proxy auf LightRAG | [aktiv] | Proxy-Kette leitet Anfragen an `http://localhost:8000` weiter |
| 9222 | Chrome CDP | [inaktiv] | Nicht verfuegbar (Pakete im Pi-Image fehlen) |
| 6080 | noVNC / VNC | [inaktiv] | Nicht verfuegbar (Pakete im Pi-Image fehlen) |

### LightRAG-Konfiguration
- **Virtuelle Umgebung:** `/workspace/lightrag-backend/venv` bzw. [W:/lightrag-backend/venv](file:///W:/lightrag-backend/venv).
- **Abhaengigkeiten:** `fastapi`, `uvicorn`, `lightrag-hku`, `pydantic`, `python-dotenv`.
- **Speicherort:** `LIGHTRAG_WORKING_DIR`, Fallback auf `lightrag-backend/rag_storage`. Vektordaten liegen lokal in Linux und sind in `.gitignore` ausgeschlossen.
- **Embeddings:** OpenRouter Modell `qwen/qwen3-embedding-8b` (Dimension 4096).
- **Health-Check:**
  ```bash
  curl -s http://localhost:5173/lightrag-api/health
  ```

### Docker-Compose-Besonderheit
- Die wirksame Compose-Datei wird unter Windows verwaltet:
  `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml`
- Der Ordner [W:/Nodges_Pi/](file:///W:/Nodges_Pi/) im Repository ist ein Git-Snapshot. Aenderungen muessen bei Bedarf nach Windows synchronisiert werden.

### Prozess-Management im Container
- Standardtools wie `ps`, `pgrep`, `pkill`, `ss` fehlen im Image.
- Prozesspruefungen erfolgen direkt ueber `/proc` (z.B. `/proc/*/cmdline`, `/proc/net/tcp`).

---

## 5. Dateisystem- und Dokumentationskonventionen

### Gemeinsamer Wissensspeicher `com/` (verbindlicher Einstieg)

Alle Harnesses lesen ihre Arbeitsgrundlage aus dem Ordner **[W:/com/](file:///W:/com/)** — piCon ueber `/workspace/com/`, conT ueber `W:\com\`. Beide zeigen auf **denselben** Ordner.

**Lesereihenfolge bei jedem Arbeitsbeginn:**

1. Dieses `AGENTS.md` (Root) — die Regeln.
2. [W:/com/todo.md](file:///W:/com/todo.md) — was gerade offen ist.
3. [W:/com/plan/](file:///W:/com/plan/) — laufende Vorhaben (nur Dateinamen reichen zum Ueberblick).
4. [W:/com/entscheidungen.md](file:///W:/com/entscheidungen.md) — Beschluesse des Benutzers, bindend.
5. [W:/com/ideen.md](file:///W:/com/ideen.md) — ungepruefte Einfaelle.
6. Erst bei Detailfragen: `com/bericht.md` (Historie) bzw. `com/setup.md` (Technik).

Der vollstaendige Einstieg steht in **[W:/com/00_start_hier.md](file:///W:/com/00_start_hier.md)**.

**Inhalte von `com/` (alle versioniert, nichts in `.gitignore`):**

| Datei / Ordner | Zweck |
|---|---|
| `00_start_hier.md` | Einstieg und Lesereihenfolge |
| `todo.md` | offene Punkte, kurz |
| `plan/` | laufende Vorhaben, ein File je Vorhaben |
| `ideen.md` | Ideensammlung, ungeprueft |
| `entscheidungen.md` | Beschluesse des Benutzers (bindend) |
| `bericht.md` | Gesamtbericht und Dialogprotokoll (Historie) |
| `setup.md` | technische Kurzanleitung Setup/Git |
| `doc/` | Archiv aller bisherigen Berichte (273 Dateien) |

### Verzeichnisstruktur fuer Dokumentation
- **[W:/com/doc/](file:///W:/com/doc/):** Arbeitsdokumente, Plaene, Analysen und Architekturberichte von Antigravity.
  - Dateinamen tragen als Praefix die bereinigte Versionsnummer aus `package.json` (z.B. `0_106_3_mein_bericht.md`).
  - `com/doc/` ist **vollstaendig versioniert** und nicht in `.gitignore`.
  - Gezielt suchen (`grep`), nicht pauschal lesen — der Ordner ist gross.
- **[W:/docs/](file:///W:/docs/):** Dauerhafte Leitfaeden und statische Projektdokumentation.
- **Verlinkte Gesamtdokumente (liegen in `com/`):**
  - [W:/com/bericht.md](file:///W:/com/bericht.md): Ausfuehrlicher Gesamtbericht und fortlaufendes Dialogprotokoll zwischen den Agenten.
  - [W:/com/setup.md](file:///W:/com/setup.md): Technische Kurzanleitung und Setup-Referenz.
- **Root-Dokument:**
  - [W:/AGENTS.md](file:///W:/AGENTS.md): Dieses Dokument (Arbeitsregeln und Agenten-Kontext).

### Zeilenenden und Git-Attribute
- **Root-`.gitattributes`:** Erzwingt repo-weit `* text=auto eol=lf`.
- **Skript-Ausnahmen:** Windows-Startskripte (`*.cmd`, `*.bat`, `*.ps1`) werden zwingend mit `eol=crlf` ausgecheckt, um die Ausfuehrbarkeit des Startskripts [W:/start_pi_container.cmd](file:///W:/start_pi_container.cmd) sicherzustellen.
- **Berechtigungen:** `core.fileMode = false` und `safe.directory` sind fuer den WSL-Pfad konfiguriert.

---

## 6. Arbeitsregeln fuer Agenten (conT und piCon)

1. **Pfad-Perspektive beachten:**
   - conT arbeitet mit absoluten Windows-Pfaden auf Laufwerk `W:/` (z.B. [W:/src/main.ts](file:///W:/src/main.ts)).
   - piCon arbeitet mit Linux-Pfaden im Container (z.B. `/workspace/src/main.ts`).
   - Beide Pfade referenzieren dieselbe Datei.
2. **Kommunikationsregeln:**
   - Ausschliesslich auf Deutsch kommunizieren.
   - Kein Sz (immer "ss" verwenden).
   - Striktestes Verbot von Emojis, Emoticons oder grafischen Unicode-Symbolen in Antworten und generierten Dokumenten.
3. **Frage-Modus:**
   - Wenn eine Nutzeranfrage ein Fragezeichen ("?") enthaelt, handelt es sich um eine Frage.
   - Fragen sind **direkt im ersten Satz** zu beantworten (sofern passend mit `Ja` oder `Nein` am Satzanfang).
   - Bei reinen Fragen werden **keine Code-Aenderungen** ausgefuehrt.
4. **Planungs- und Dokumentationsmodus:**
   - Plaene, Analysen und Berichte sind selbststaendig als Markdown-Dateien im Ordner [W:/com/doc/](file:///W:/com/doc/) mit dem Versionspraefix zu speichern.
   - Im Planungsmodus (`planning_mode`) sind Aenderungen am Dateisystem ausserhalb von `com/` strikt untersagt.
   - Ein Arbeitsergebnis **sollte** (Empfehlung, keine Pflicht) zusaetzlich dort festgehalten werden, wo es hingehort: Ergebnisbericht nach `com/doc/`, offener naechster Schritt nach `com/todo.md`, mehrschrittiges Vorhaben nach `com/plan/`, ein Beschluss des Benutzers nach `com/entscheidungen.md`. Ein Faustregel gilt: Was laenger als eine Antwort ueberdauert, gehoert in `com/` — eine Antwort im Chat allein ist fuer das andere Harness spaeter nicht auffindbar.
5. **Sorgfaltspflicht vor Aenderungen:**
   - Vor Aenderungen muessen relevante Dateien, die Projektstruktur, `git status` und vorhandene Tests geprueft werden.
   - Vor groesseren Eingriffen oder Loeschungen ist die Rueckfrage an den Benutzer erforderlich. Keine stillen Ueberschreibungen fremder Arbeit.
