# Setup Nodges — Multi-Harness Arbeitsumgebung

**Stand:** 2026-09-24 · **Verantwortlich:** piCon (Container) + conT (Antigravity auf `W:`)
**Abgekoppelt:** winAnt (war Antigravity auf Windows NTFS, ersetzt durch conT)
**Dies ist die technische Kurzanleitung.** Der ausfuehrliche Bericht und Dialog steht in **`bericht.md`**.

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

**Versionstags:** Ein Tag (Etikett) ist ein fester Name fuer einen Commit — eine Momentaufnahme, die sich nie verschiebt. Wenn der Benutzer sagt *"das ist jetzt stabil"*: `git tag v0.106.0 && git push --tags`. Danach ist dieser Stand dauerhaft wiederfindbar. Aktuelle Version laut `package.json`: `0.106.0`.

**Ablauf — zwingend:**
```
Datei aendern -> git add -> git commit (lokal) -> git push -> GitHub aktuell
```
Ein **Commit** wirkt nur im lokalen Checkout. **Push** laedt hoch. **Pull** holt in einen anderen Checkout.
GitHub wird **nicht** automatisch aktualisiert.

**Automatisierte Antigravity-Skills (ruckzuck ohne Nachdenken):**
> **KORREKTUR durch piCon (2026-09-24):** Diese Skills zeigten auf **`origin/pi`**, der Branch existiert aber nicht mehr (siehe Teil D in `bericht.md`). Sie wuerden **ins Leere laufen**. Korrigierte Fassung:

- **`sgc` (Push & Handover):** Erhoeht automatisch die Patch-Version in `package.json` um 1 (z.B. `0.106.0` -> `0.106.1`), fuehrt `git add .` aus, committet ausschliesslich mit der Versionsnummer als Message und pusht direkt zu **`origin/main`**.
- **`sgp` (Pull & Takeover):** Holt den neuesten Stand mit **`git pull origin main`** ab, prueft `git status` und meldet die aktuelle Version sowie den Commit.

> Fuer conT gilt das Gleiche: **`main` statt `pi`** verwenden.


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
| **`bericht.md`** (Root) | Gemeinsamer Bericht und Dialog piCon + conT (Historie mit winAnt in Teil A–E dokumentiert) |
| **`setup.md`** (Root) | Diese technische Anleitung |
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

1. Dieses `setup.md` lesen, dann `bericht.md` (Detailfragen).
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

## 8. Status der offenen Punkte

- **winAnt / Windows-Workspace `C:\...\Nodges`:** **ABGEKOPPELT** (Beschluss 2026-09-24). Ersetzt durch **conT** auf `W:\`. Kann nach Sicherung archiviert werden.
- **Branch-Strategie:** **ALLE Harnesses arbeiten auf `main`.** Branch `pi` ist geloescht (Beschluss des Benutzers, `bericht.md` Teil D). Es gibt keinen Merge mehr nach `main` — `main` IST der Arbeitsbranch.
- **Veraltetes in fremden Dokus:** winAnts Dokumente (`0_106_0_entscheidung_dual_harness...`, `0_106_0_analyse_unc_absturz...`) nennen noch `origin/pi`. Inhaltlich relevant, aber die Branch-Angabe ist ueberholt.
- **Absturz-Ursache geklaert:** conT nutzt **`W:\`** als Netzlaufwerk (nicht den rohen UNC-Pfad) und laeuft stabil. winAnts Absturz betraf den direkten UNC-Zugriff der IDE.
- **Offen:** Soll winAnt ebenfalls auf `W:\` umgestellt werden, oder bleibt es beim Windows-Workspace + Git-Sync?
- **`docker-compose.yml`:** Liegt noch in `C:\Users\ich\Desktop\code\_projects\Nodges_Pi` (wird bei Gelegenheit im Repo harmonisiert).
- **LightRAG-Daten (`lightrag-backend/rag_storage/`):** Bleiben lokal im Linux-Container; Backup-Skript bei Bedarf ergaenzen.


---

*Verfasst von **piCon** (Pi-Coding-Agent im Container `pi-harness`, WSL2 auf Windows 11), 2026-09-24.
Ergaenzungen durch **conT** (Antigravity auf `W:`) ausdruecklich erwuenscht.*
