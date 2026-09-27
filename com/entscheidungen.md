# Beschluesse des Benutzers

Bindend fuer alle Harnesses. Immer mit Datum und wenn vorhanden Commit oder Tag.
Ergaenzende Begruendungen stehen in `bericht.md` (Teile D, E, F) und `setup.md`.

| Datum | Beschluss | Quelle / Stand |
|---|---|---|
| 2026-09-24 | **`main` ist der alleinige Arbeitsbranch** fuer alle Harnesses. Kein Merge mehr nach `main` — `main` IST der Arbeitsbranch. | `bericht.md` Teil D, Commit `d4c7b3f` |
| 2026-09-24 | Branch **`pi` wird geloescht** (remote und lokal). Er ist vollstaendig in `main` aufgegangen. Spater erneut aufgetaucht, Sicherheitspruefung bestand: 0 eigene Commits, nichts verloren. | `bericht.md` Teil D + F.5, remote `refs/heads/main` |
| 2026-09-24 | Erstes Versionstag **`v0.106.0`** auf Commit `51af1f4` (Stand der Multi-Harness-Konsolidierung). Ein Tag verschiebt sich nicht. | `bericht.md` Teil D.2 |
| 2026-09-24 | **`winAnt` wird abgekoppelt**, ersetzt durch **`conT`** (Antigravity auf `W:\`). Damit ist der Dual-Harness-Vorschlag (Teil E.2) gegenstandslos. | `bericht.md` Teil F.1 |
| 2026-09-24 | **Variante B gilt:** ein physischer Arbeitsort (`/home/unixusername/nodges`), zwei Zugriffswege (`/workspace` und `W:\`). Zwischen piCon und conT ist **kein Git-Sync** noetig. | `bericht.md` Teil F.2 |
| 2026-09-24 | **`doc/` ist nicht mehr in `.gitignore`** — versioniert, Secrets-Scan war sauber. Ballast (252 Archivdateien, Duplikat, `tuned1-5.json`) entfernt in `a844ac5`. | `setup.md` Abschnitt 4 |
| 2026-09-24 | **Zeilenenden:** repo-weit LF, aber zwingend **CRLF fuer `*.cmd`, `*.bat`, `*.ps1`** (auch in `Nodges_Pi/.gitattributes`). Grund: das Startskript fuer den Container muss ausfuehrbar bleiben. | `bericht.md` Teil C.3, Commit `5c0a2ac` |
| 2026-09-24 | **Kein GitHub-MCP.** Der Git-Weg ist verifiziert; bei Bedarf Issues/PRs ueber die `gh` CLI. | `setup.md` Abschnitt 6 |
| 2026-09-24 | **`com/` wird eingefuehrt** als gemeinsamer Wissensspeicher. `bericht.md`, `setup.md` und `doc/` ziehen dorthin um; die `AGENTS.md` verweist darauf. Neue Dateien fuer Todo, Plan, Ideen, Entscheidungen. | dieser Umbau, Version `0.106.3` |
| 2026-09-24 | Das Anlegen von Plaenen/Todos durch piCon ist eine **Empfehlung, keine Pflicht** (Beschluss auf Rueckfrage). | `com/00_start_hier.md` |

| 2026-09-25 | **Speichern und Freigeben sind getrennt:** `save` = Patch +1 und lokaler Commit, **kein Push**. `release` = Minor-Version + Git-Tag + Push nach `origin/main`. GitHub ist damit das Meilenstein-Archiv, nicht der Zwischenspeicher. | `tools/nodges-git.sh`, `git-hooks/pre-push`, `AGENTS.md` Abschnitt 3 |
| 2026-09-25 | **Beide Harnesses rufen dasselbe Skript** `tools/nodges-git.sh` auf. Die Skills sind nur duenne Verweise, damit conT und piCon nicht auseinanderdriften. | `AGENTS.md` Abschnitt 3 |
| 2026-09-25 | **Die conT-Skills liegen versioniert** unter `W:/.agents/skills/<name>/SKILL.md` (= `/workspace/.agents/skills/`). `.agents/skills/` ist deshalb aus der `.gitignore` ausgenommen; der Rest von `.agents/` bleibt draussen. | Antigravity-Discovery laut Benutzer, `.gitignore` Abschnitt AI and Tooling |
| 2026-09-25 | **`sgc` und `sgp` sind abgeloest.** `sgc` pushte jeden Zwischenschritt und zeigte zuletzt auf den geloeschten Branch `origin/pi`; `sgp` zog per Pull, obwohl zwischen den Harnesses nichts zu holen ist. Ersetzt durch `save`, `release`, `status`. | `com/setup.md` Abschnitt 2 |
| 2026-09-27 | **Domaenenzustaendigkeiten verankert:** conT primaer `src/`, `e2e/`; piCon primaer `lightrag-backend/`, `tools/`. Gemeinsame Dateien (`package.json`, `AGENTS.md`, `com/`) nur mit Ansage/Ping. Keine starren Sperren, sondern Zustaendigkeit mit Ansagepflicht. | `com/test/rapport_pingpong.md`, Beschluss Punkt 1 |
| 2026-09-27 | **Pfadkorrektur, Rangfolge und Ping-Ausnahme:** Pfad `tools/com-bus/` verbindlich; Dokumentenrangfolge `entscheidungen.md > plan/ > todo.md`; Frage-Modus ("?") schuetzt vor ungefragten Codeaenderungen, gilt aber nicht fuer Arbeitsauftraege/Pings im Rapport. | `com/test/rapport_pingpong.md`, Beschluss Punkt 2 |
| 2026-09-27 | **Benutzerprofil in `AGENTS.md` integriert:** Keine separate Datei `user.md` noetig; Profil (`Banixx`, Amateurprogrammierer, Erklaerungsmodus "ç", Farbvorlieben) direkt in `AGENTS.md` als zentrale Single Source of Truth verankert. | `com/test/rapport_pingpong.md`, Beschluss Punkt 3 |
| 2026-09-27 | **Entkopplung der Testketten:** `package.json` erhaelt `test:fast` fuer den Container (L0+L1+L3) und `test:all` fuer den Windows-Host (L0+L1+L2). E2E bleibt bis auf Weiteres ausserhalb des automatischen `release`-Gates. | `com/test/rapport_pingpong.md`, Beschluss Punkt 4 |
| 2026-09-27 | **Schutz vor unabsichtlichem Staging bei `save`:** `tools/nodges-git.sh save` zeigt vor dem Commit zwingend `git status --short` an, um unfertige Zwischenstaende der anderen Domaene sichtbar zu machen. | `com/test/rapport_pingpong.md`, Beschluss Punkt 5 |
| 2026-09-27 | **Rolle und Einbindung von dopi:** dopi (Host- & Docker-Orchestrator in `C:/Users/ich/Desktop/code/_projects/Nodges_Pi`) redet grundsaetzlich nur mit, wenn es um das Setup / die Container-Infrastruktur geht (und auch dann nicht immer). Kein fixer Turnus; dopi muss von conT oder piCon explizit aufgerufen werden. | Benutzerbeschluss (Chat) |
| 2026-09-27 | **Commit-Trailer (F-01, Option A):** `tools/nodges-git.sh` (in `save` und `release`) haengt an die Commit-Nachricht eine Leerzeile und `Harness: conT` bzw. `Harness: piCon` an. Das Harness wird aus `NODGES_HARNESS` oder dem Betriebssystem erkannt. | Benutzerbeschluss (Chat), Umsetzung in `tools/nodges-git.sh` |
| 2026-09-27 | **E2E-Gate (F-02, Option A):** `release` erzwingt das volle E2E (Playwright) nur auf dem Windows-Host (`conT`). Im Container (`piCon`) wird E2E uebersprungen. `NODGES_SKIP_E2E=1` erzwingt das Ueberspringen, `NODGES_FORCE_E2E=1` erzwingt E2E auch im Container. | Benutzerbeschluss (Chat), Umsetzung in `tools/nodges-git.sh` |

---

> **Hinweis zu offenen Fragen:** Saemtliche noch nicht entschiedenen Fragen, Vorschlaege und Diskussionspunkte wurden nach [W:/com/offene-fragen.md](file:///W:/com/offene-fragen.md) ausgelagert. Dieses Dokument enthaelt ausschliesslich verbindliche Beschluesse.

