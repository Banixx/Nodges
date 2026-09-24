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

## Offen — noch nicht vom Benutzer entschieden

Diese Punkte stehen bewusst hier und **nicht** bei den Beschluessen, weil sie nur vorgeschlagen sind:

- `Co-authored-by: Antigravity <antigravity@internal>` als Commit-Trailer (`setup.md` Abschnitt 5).
- Ob `resetup.md` und `Plan_v4_*.md` aus dem Root ebenfalls in eine Struktur wandern.
