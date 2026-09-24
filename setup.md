# Setup Nodges — Multi-Harness Arbeitsumgebung

**Stand:** 2026-09-24 · **Verantwortlich:** piCon (Container) + winAnt (Antigravity Windows) + conT (Antigravity W:)
**Dies ist die technische Kurzanleitung.** Der ausfuehrliche Bericht und Dialog steht in **`bericht.md`**.

---

## 1. Architektur: Multi-Harness Arbeitsumgebung (winAnt, piCon, conT)

**Befund Praxistest & Erweiterung (2026-09-24):** Der direkte Zugriff der Antigravity-IDE auf den UNC-Netzwerkpfad (`\\wsl.localhost\...`) stuerzte frueher ab. Daher existieren nun zwei komplementaere Windows-Arbeitsweisen plus Container:

```
[winAnt: Antigravity Windows 11]           [piCon: Pi im Container]           [conT: Antigravity Windows 11]
C:\Users\ich\Desktop\code\_projects\Nodges      /workspace (WSL2 ext4)          W:\ (Netzlaufwerk auf WSL2)
                 │                                        │                                   │
                 ▼                                        │                                   │ (Direktzugriff
             (via sgc / git push)                         │                                   │  auf WSL2-ext4)
                 │                                        ▼                                   ▼
                 └──────────────► GitHub ◄────────────────┴───────────────────────────────────┘
                              (origin/main)
```

**Arbeitsaufteilung:**
- **winAnt (Antigravity Windows):** Entwickelt auf Windows `C:\Users\ich\Desktop\code\_projects\Nodges` (Frontend, Three.js, Dokumentation; Sync via Git).
- **piCon (Pi-Agent):** Entwickelt im Container `/workspace` (Vite 5173, LightRAG 8000, Linux-Skripte; physisch auf WSL2 ext4).
- **conT (Antigravity W:):** Entwickelt auf Windows ueber Netzlaufwerk `W:\` (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`). Greift direkt auf dieselben Dateien wie piCon zu (kein lokaler Git-Sync zwischen conT und piCon noetig). Das rote "X" im Windows Explorer ist rein kosmetisch (Lazy Reconnect / Plan9).
- **Synchronisation:** Erfolgt diszipliniert und automatisiert ueber Git auf Branch `main`. Da `doc/` freigegeben ist und LF-Zeilenenden repo-weit gelten, dauert der Sync nur 2 bis 3 Sekunden.

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
| Zugang winAnt | HTTPS ueber Windows Credential Manager |

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
| **`bericht.md`** (Root) | Gemeinsamer Bericht und Dialog piCon + winAnt |
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
3. Immer ueber `\\wsl.localhost\Ubuntu\home\unixusername\nodges` arbeiten.
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

- **Windows-Workspace `C:\...\Nodges`:** Bleibt als aktiver, stabiler Antigravity-Workspace dauerhaft bestehen (Praxistest am 2026-09-24 bestaetigt).
- **Branch-Strategie:** **ALLE Harnesses arbeiten auf `main`.** Branch `pi` ist geloescht (Beschluss des Benutzers, `bericht.md` Teil D). Es gibt keinen Merge mehr nach `main` — `main` IST der Arbeitsbranch.
- **Veraltetes in fremden Dokus:** winAnts Dokumente (`0_106_0_entscheidung_dual_harness...`, `0_106_0_analyse_unc_absturz...`) nennen noch `origin/pi`. Inhaltlich relevant, aber die Branch-Angabe ist ueberholt.
- **Absturz-Ursache geklaert:** conT nutzt **`W:\`** als Netzlaufwerk (nicht den rohen UNC-Pfad) und laeuft stabil. winAnts Absturz betraf den direkten UNC-Zugriff der IDE.
- **Offen:** Soll winAnt ebenfalls auf `W:\` umgestellt werden, oder bleibt es beim Windows-Workspace + Git-Sync?
- **`docker-compose.yml`:** Liegt noch in `C:\Users\ich\Desktop\code\_projects\Nodges_Pi` (wird bei Gelegenheit im Repo harmonisiert).
- **LightRAG-Daten (`lightrag-backend/rag_storage/`):** Bleiben lokal im Linux-Container; Backup-Skript bei Bedarf ergaenzen.


---

*Verfasst von **piCon** (Pi-Coding-Agent im Container `pi-harness`, WSL2 auf Windows 11), 2026-09-24.
Ergaenzungen durch **winAnt** (Antigravity) ausdruecklich erwuenscht.*
