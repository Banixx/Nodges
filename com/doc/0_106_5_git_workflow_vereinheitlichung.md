# Git-Workflow: Vereinheitlichung von conT und piCon (Bestandsaufnahme und Vorschlag)

**Datum:** 2026-09-25
**Erstellt von:** piCon (Container)
**Anlass:** Benutzeranforderung — beide Harnesses sollen beim Speichern identisch handeln: Version erhoehen, lokal committen, und nur bei einer Minor-Version nach GitHub pushen.
**Stand Version:** `0.106.4` · `main` ist mit `origin/main` gleichauf (0/0), aber 12 geaenderte und 13 neue Dateien sind **ungesichert**.

---

## 1. Befund: Was heute existiert

### 1.1 Die beiden Rituale liegen an zwei Orten, die niemand abgleichen kann

| Harness | Ritual | Ablageort | Im Git versioniert |
|---|---|---|---|
| piCon | `uupdate` | `/home/.pi/agent/skills/uupdate/SKILL.md` (ausserhalb des Repos) | nein |
| conT | `sgc` (Push), `sgp` (Pull) | laut `com/doc/0_106_1_...` unter `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/sgc/SKILL.md` — Windows-Host-Pfad, aus dem Container **nicht erreichbar** | nein |

Zwei zusaetzliche Befunde:

- Im geteilten Arbeitsbaum (`/workspace` = `W:/`) existiert **kein** Ordner `.agents/` und auch kein `.agent/`. conT liest den `sgc`-Skill damit **nicht aus dem Workspace**, sondern vom alten winAnt-Pfad auf `C:`. Ob die Datei dort heute noch aktuell ist, ist von piCon aus nicht pruefbar.
- `.agents/` und `.agent/` stehen in der `.gitignore` (Abschnitt "AI and Tooling"). Selbst wenn die Skills im Workspace liegen wuerden, waeren sie **nicht versioniert**, also ohne Backup und ohne Abgleich zwischen den Harnesses.

**Folge:** Beide Seiten arbeiten nach Freitext, den das Sprachmodell jedes Mal neu interpretiert. Diese Bauart driftet (Abweichung durch schleichende Unterschiede) mit jeder Anpassung auseinander — ein klassisches Risiko, wenn zwei Agenten dieselbe Regel aus zwei Dateien lesen.

### 1.2 Die Inhalte sind historisch widerspruechlich

| Quelle | Aussage zum Push-Ziel |
|---|---|
| `com/bericht.md` Abschnitt 6.3 | `sgc` pusht zu **`origin/pi`** |
| `com/doc/0_106_1_sgc_release_und_dual_harness_abschluss.md` | `sgc` pusht zu **`origin/pi`** |
| `com/setup.md` Abschnitt 2 | korrigiert durch piCon auf **`origin/main`** |
| `AGENTS.md` Abschnitt 3 | **`origin/main`** |
| `uupdate` (piCon, aktuell) | **`origin/main`** |

Der Branch `pi` ist geloescht. Die Korrektur steht also in den Leitdateien, aber ob conTs Skill-Datei mitgezogen wurde, ist offen.

### 1.3 Heutiger Ablauf (beide Skills, Stand heute)

```
Patch-Version +1  ->  git add .  ->  git commit -m "<version>"  ->  git push origin main
```

Jeder Zwischenschritt landet sofort auf GitHub. Das ist genau das Verhalten, das der Benutzer nicht mehr moechte.

### 1.4 Der gemeinsame Arbeitsbaum macht Push zwischen den Harnesses eigentlich ueberfluessig

`AGENTS.md` Abschnitt 2: conT (`W:/`) und piCon (`/workspace`) greifen auf **dieselben physischen Inodes** zu — inklusive derselben `.git`-Verwaltung. Daraus folgt:

- Ein **lokaler Commit** einer Seite ist auf der anderen Seite sofort sichtbar. Push und Pull zwischen conT und piCon sind damit kein Synchronisationsmittel mehr, sondern nur noch der Weg zu GitHub.
- `sgp` (`git pull origin main`) ist historisch gewachsen und heute **schief**: Solange man lokal vor `origin` liegt, holt ein Pull nichts; der Befehl suggeriert aber "ich bin jetzt aktuell". Ehrlicher waere ein reiner **Standbericht**.
- Dieselbe `.git/index`-Datei bedeutet: Zwei gleichzeitige Git-Laeufe koennen sich sperren (`index.lock`). Der Plan `com/plan/0_106_4_parallele_pi_instanzen.md` hat daraus bereits die Regel "Git nur von einer Instanz" abgeleitet — sie gilt sinngemaess auch fuer conT und piCon.

### 1.5 Fehlende Schranken heute

| Schranke | Stand |
|---|---|
| Git-Hooks | **keine** — `.git/hooks/` enthaelt nur `*.sample` |
| Versionszwang vor Push | keine Pruefung |
| Tests vor Push | keine lokale Pruefung; CI `.github/workflows/verify.yml` laeuft erst **nach** dem Push (Typecheck, Biome, Vitest, Playwright, Build) |
| Secret-Schutz | nur durch `.gitignore` (`.env`, `.env.local`), nicht technisch erzwungen |
| Versionstags | genau **eines**: `v0.106.0` |

`com/todo.md` fuehrt Git-Hooks bereits als offenen Punkt ("Werkzeuge und Qualitaetssicherung").

### 1.6 Reale Auswirkung (Beleg aus dem aktuellen Status)

Der Baum ist sauber gegen `origin/main` (0/0), enthaelt aber 12 geaenderte und 13 neue Dateien ohne Commit. Weil das Ritual nur "Patch + Push" kennt, wird zwischen grossen Schritten oft gar nicht gesichert. Ein reines "lokal speichern" fehlt.

---

## 2. Zielbild des Benutzers

1. **Beide Harnesses handeln identisch** beim Speichern — egal welche Seite gerade arbeitet.
2. **Speichern = Patch erhoehen + lokaler Commit.** Kein Push. Das darf beliebig oft passieren.
3. **Push nach GitHub nur bei einer Minor-Version** (`0.106.x` -> `0.107.0`). GitHub wird damit vom Zwischenspeicher zum **Meilenstein-Archiv**.

---

## 3. Vorschlag zur Umsetzung

Kernidee: **Die Regel wird ausfuehrbar und liegt im Repo.** Die Skills beider Seiten werden duenn und verweisen nur noch darauf. Damit ist Drift strukturell ausgeschlossen, weil es nur noch eine Datei gibt.

### 3.1 Ein Skript im Repo statt zwei Freitexte

Neuer Ordner (Vorschlag `tools/`, **nicht** `scripts/`, weil `scripts/` in der `.gitignore` steht) mit `nodges-git.sh`:

| Aufruf | Wirkung |
|---|---|
| `tools/nodges-git.sh status` | Branch, Version, Abstand zu `origin/main`, letztes Tag, Zahl offener Dateien — **kein** Pull, nichts wird veraendert |
| `tools/nodges-git.sh save` | Patch +1 in `package.json` **und** `package-lock.json`, `git add -A`, Commit `<version>`, **kein Push**. Ausgabe: "lokal gesichert, N Commits vor origin" |
| `tools/nodges-git.sh release` | Minor +1 und Patch auf 0 (`0.106.9` -> `0.107.0`), Commit, Tag `v0.107.0`, `git push origin main` und `git push --tags` |

Technische Randbedingungen, die beim Umsetzen zu beachten sind:

- Die Version steht im Lockfile an **zwei** Stellen: im Kopf (`"version"` auf oberster Ebene) und unter `packages.""`. Beide muessen mitgezogen werden; verschachtelte Versionsnummern von Abhaengigkeiten duerfen **nicht** angefasst werden.
- Umsetzung der Versionierung mit `node` (vorhanden, v22.23.2) statt `jq` (nicht vorhanden), damit JSON korrekt und stabil geschrieben wird.
- Das Skript muss idempotent (wiederholbar ohne Nebenwirkung) und selbsterklaerend sein: Abbruch, wenn nicht auf `main`, Abbruch bei leerem Status beim `save`.

### 3.2 Versionierte Git-Hooks — dieselben Regeln fuer beide Seiten

Weil beide Harnesses **dasselbe `.git`** benutzen, gilt eine einmal gesetzte Hook-Konfiguration automatisch fuer conT und piCon. Das ist die staerkste Form der Synchronisierung: sie ist nicht interpretierbar.

Vorschlag: neuer Ordner `git-hooks/` im Repo (versioniert), aktivierung mit `git config core.hooksPath git-hooks`.

| Hook | Aufgabe |
|---|---|
| `pre-commit` | Branch muss `main` sein; Warnung bei `.env`-Dateien in der Stage; zeigt die Liste der mitgenommenen Dateien |
| `pre-push` | **Technische Durchsetzung der neuen Regel:** Push nur, wenn `package.json` bei `HEAD` eine Minor- oder Major-Version traegt (Patch-Anteil ist `0`) beziehungsweise wenn ein Tag vorhanden ist. Sonst Abbruch mit Hinweis auf `save` |
| `post-commit` | kurze Bestaetigung: neue Version, Kurz-Hash, Abstand zu `origin/main` |

### 3.3 Skills auf beiden Seiten werden duenne Verweise

- piCon: `uupdate` wird auf das Skript umgestellt (Skill-Datei liegt weiter ausserhalb, enthaelt aber nur noch den Verweis plus die Projektregein).
- conT: `sgc` und `sgp` muessten auf denselben Stand gebracht werden. **Offen:** Wo genau Antigravity bei conT Skills liest. Siehe Abschnitt 4, Frage 1.
- Zusaetzlich gehoert die vollstaendige Prozessbeschreibung als verbindlicher Abschnitt in `com/setup.md` und ein Kurzverweis in `AGENTS.md`. Damit hat das Wissen einen versionierten Ort, den beide Seiten lesen (`com/` ist der gemeinsame Einstieg).

### 3.4 Namensvorschlag fuer die drei Griffe

| Alt | Neu | Bedeutung |
|---|---|---|
| `sgc` | `speichern` (save) | Patch + lokaler Commit |
| neu | `freigeben` (release) | Minor + Tag + Push |
| `sgp` | `stand` (status) | Bericht statt Pull |

### 3.5 Zwei Folgen, die bewusst geregelt werden muessen

1. **Gemeinsame Arbeitskopie:** `git add -A` nimmt beim Speichern automatisch auch ungesicherte Dateien der anderen Seite mit. Empfehlung: vor jedem Commit die Liste zeigen und sie vom Benutzer bestaetigen lassen.
2. **Lokal vor `origin`:** Mit dem neuen Modell ist der lokale Baum fast immer vor GitHub. `git reset --hard origin/main` oder ein unbedachtes "Zurueck auf GitHub-Stand" waere dann **Datenverlust**. Das gehoert ausdruecklich als Warnung in `AGENTS.md` und `com/setup.md`.

---

## 4. Offene Fragen an Banixx (Entscheidung noetig)

1. **Wo liest conT seine Skills?** `W:\.agents\skills\...`, `W:\.agent\skills\...` oder weiterhin `C:\Users\ich\Desktop\code\_projects\Nodges\.agents\skills\...`?
   Nur wenn der Pfad auf `W:/` liegt, kann piCon die conT-Datei selbst schreiben (weil `/workspace` und `W:/` identisch sind).
2. **Tag automatisch bei jedem Push?** Bisher existiert nur `v0.106.0`. Vorschlag: ja, `freigeben` setzt immer ein Tag.
3. **Commit-Regel anpassen?** Heute gilt "Nachricht ist nur die Versionsnummer". Soll ein Trailer ergaenzt werden (`Harness: piCon` bzw. `Harness: conT`), damit erkennbar bleibt, wer gesichert hat? Das beruehrt den offenen Punkt "Co-authored-by" in `com/todo.md`.
4. **Tests vor dem Push erzwingen?** Entweder lokal im `release`-Schritt (`npm run typecheck` plus `npm test -- --run`) oder nur die CI in `.github/workflows/verify.yml`. Weil kuenftig seltener gepusht wird, wiegt ein Fehler im Release schwerer.
5. **Harte Abbrueche oder nur Hinweise?** Sollen die Hooks technisch blockieren oder lediglich warnen?

---

## 5. Vorgeschlagene Reihenfolge

- [x] Fragen aus Abschnitt 4 weitgehend beantwortet (siehe Abschnitt 6.1).
- [x] `tools/nodges-git.sh` angelegt (`status`, `save`, `release`, `hooks`).
- [x] `git-hooks/` plus `core.hooksPath` eingerichtet und in einer Wegwerf-Kopie getestet.
- [x] `uupdate` (piCon) umgestellt, zusaetzlich die drei Griffe `save` / `release` / `status`.
- [x] conT-Skills unter `W:/.agents/skills/` angelegt (Pfad vom Benutzer bestaetigt).
- [x] `AGENTS.md`, `com/setup.md`, `com/entscheidungen.md` und `com/todo.md` nachgezogen.

---

## 6. Umsetzung (2026-09-25, piCon)

### 6.1 Stand der Fragen aus Abschnitt 4

| Frage | Stand |
|---|---|
| 1. Wo liest conT Skills | **`W:/.agents/skills/<name>/SKILL.md`** (vom Benutzer bestaetigt). Im Container identisch mit `/workspace/.agents/skills/` |
| 2. Tag bei jedem Push | ja — `release` setzt immer `v<Version>` |
| 3. Trailer im Commit | **offen**, Regel bleibt bis auf Weiteres "Nachricht ist nur die Versionsnummer" |
| 4. Tests vor dem Push | ja — `release` erzwingt `npm run typecheck` und `npm test -- --run`; `--skip-checks` als bewusster Ausweg |
| 5. Harte Abbrueche | ja fuer Branch und Geheimnisse sowie `pre-push`; Hinweis (kein Abbruch) bei fehlendem Versionsbump |

### 6.2 Neue Dateien

| Datei | Zweck |
|---|---|
| `tools/nodges-git.sh` | das einzige verbindliche Ritual: `status`, `save`, `release`, `hooks` |
| `tools/nodges-version.mjs` | schreibt die Version exakt an die drei vorgesehenen Stellen (`package.json` einmal, `package-lock.json` zweimal) |
| `git-hooks/pre-commit` | Branch muss `main`; blockiert Geheimnisse (`.env`, Schluessel, Zertifikate); Hinweis bei fehlendem Versionsbump |
| `git-hooks/pre-push` | **blockiert jeden Push einer Patch-Version**; Ausnahme `NODGES_ALLOW_PUSH=1` |
| `git-hooks/post-commit` | Kurzmeldung mit Version, Commit und Abstand zu GitHub |
| `.agents/skills/save/SKILL.md` | conT-Skill |
| `.agents/skills/release/SKILL.md` | conT-Skill |
| `.agents/skills/status/SKILL.md` | conT-Skill |

### 6.3 Geaendert

- `.gitignore`: `.agents/*` plus Ausnahme `!.agents/skills/` — die conT-Skills sind damit versioniert und gesichert.
- `AGENTS.md` Abschnitt 3: neuer Abschnitt "Verbindlicher Git-Workflow", Rolle von GitHub als Meilenstein-Archiv, Warnung vor `git reset --hard origin/main`.
- `com/setup.md` Abschnitt 2: `sgc`/`sgp` sind abgeloest, drei Befehle stattdessen.
- `com/entscheidungen.md`: vier neue Beschluesse.
- `com/todo.md`: Arbeitsstand plus zwei offene Punkte.
- piCon-Skills `/home/.pi/agent/skills/`: `save`, `release`, `status` neu; `uupdate` jetzt Verweis (Alt-Name fuer `save`).

### 6.4 Testergebnis (Wegwerf-Kopie unter `/home/piuser/wgtest`, danach geloescht)

| Pruefung | Ergebnis |
|---|---|
| `status` | korrekte Ausgabe, keine Netzwerkzugriffe |
| `save` | Version `0.106.4` -> `0.106.5`, alle drei Stellen geschrieben, Commit-Nachricht exakt `0.106.5`, kein Push |
| `git push` nach `save` | **blockiert** durch `pre-push` |
| `release --skip-checks` | Version `0.106.5` -> `0.107.0`, Tag `v0.107.0`, Push von `main` und Tag, danach 0 Commits vor GitHub |
| `save` bei sauberem Baum | "Nichts zu sichern", kein Leer-Commit |
| Commit auf Branch `experiment` | abgebrochen |
| `.env` in der Stage | abgebrochen |
| nicht auffindbarer `core.hooksPath` | Git laeuft weiter, Hooks werden nur uebersprungen — das ist der Fall, falls die Windows-Seite den relativen Pfad nicht aufloest |

### 6.5 Nebenbefund waehrend der Arbeit

conT hat waehrend dieser Untersuchung selbst committet: `8441e81` mit der Nachricht
`"0.106.4: CI-Workflow, Biome-Tooling und Testinfrastruktur eingerichtet"`. piCon haette denselben Stand
mit der Nachricht `"0.106.4"` versehen. Das ist der sichtbare Beleg fuer die Drift, die das gemeinsame
Skript beendet: **eine Quelle, beide Seiten rufen sie auf.**

### 6.6 Offen

- Wirken die Hooks auch unter **Git fuer Windows** bei conT? Bitte einmal gegenpruefen: auf `W:/` eine
  Datei aendern, `save` ausfuehren und prufen, ob die Rueckmeldung `Gesichert: Version ...` erscheint.
- Benutzerentscheidung `Harness:`-Trailer (Frage 3 aus Abschnitt 4).
- Benutzerentscheidung, ob `release` kuenftig auch die E2E-Tests erzwingt.
