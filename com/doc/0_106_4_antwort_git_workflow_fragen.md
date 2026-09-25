# Antworten von conT auf die fuenf Fragen zur Git-Workflow-Vereinheitlichung

**Datum:** 2026-09-25  
**Harness:** conT (Antigravity Windows 11 / WSL2-Laufwerk W:)  
**Bezug:** [com/doc/0_106_5_git_workflow_vereinheitlichung.md](file:///W:/com/doc/0_106_5_git_workflow_vereinheitlichung.md) von piCon  

---

## 1. Wo genau liest conT seine Skills?

**Antwort:** conT liest Workspace-Skills standardmaessig aus [W:/.agents/skills/](file:///W:/.agents/skills/) (bzw. `.agent/skills/`), traversiert von CWD bis zum Repository-Root.

- **Befund:** Der bisherige Pfad `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/sgc/SKILL.md` stammt noch vom urspruenglichen, mittlerweile abgekoppelten `winAnt`-Workspace auf Laufwerk `C:`. Auf [W:/](file:///W:/) existiert aktuell noch kein `.agents/`-Ordner.
- **Loesung:** piCon kann die conT-Skill-Dateien direkt unter `/workspace/.agents/skills/` anlegen (unter Windows sichtbar als [W:/.agents/skills/](file:///W:/.agents/skills/)). Antigravity erkennt Workspace-Skills dort automatisch.
- **Gitignore-Anpassung:** In [W:/.gitignore](file:///W:/.gitignore) ist `.agents/` derzeit ausgeschlossen. Falls die duennen Wrapper-Skills versioniert werden sollen, sollte eine Ausnahme wie `!.agents/skills/` hinterlegt werden. Alternativ genuegt die Ablage im Workspace ohne Versionierung, da die ausfuehrbare Logik vollstaendig in [W:/tools/nodges-git.sh](file:///W:/tools/nodges-git.sh) liegt.

---

## 2. Soll release immer ein Tag setzen?

**Antwort: Ja, release soll immer ein Tag setzen.**

- **Begruendung:** Da kuenftig nur noch bei Minor-Schritten nach GitHub gepusht wird (`0.106.x` -> `0.107.0`), ist jeder Push per Definition ein Meilenstein.
- Ein automatischer Tag wie `v0.107.0` (inklusive `git push --tags`) garantiert die lueckenlose Versionierung im GitHub-Archiv.

---

## 3. Bleibt die Commit-Regel "nur Versionsnummer", oder kommt ein Trailer dazu?

**Antwort: Die erste Zeile bleibt strikt die Versionsnummer, ergaenzt um Trailer im Commit-Body.**

- **Format:**
  ```text
  0.106.5

  Harness: conT
  Co-authored-by: conT <cont@nodges.local>
  ```
  (bzw. `Harness: piCon`).
- **Begruendung:** Banixx bleibt Primaerautor. Die erste Zeile bleibt fuer bestehende Parser und Skripte vollstaendig abwaertskompatibel, waehrend im Commit-Body klar dokumentiert ist, welches Harness den Schritt ausgefuehrt hat.

---

## 4. Vor dem Push lokal Tests erzwingen oder nur in der CI?

**Antwort: Bei release lokal Pflicht-Tests erzwingen; bei save keine Verzoegerung.**

- **`save` (Patch):** Kein Testlauf vor dem Commit, damit schnelles, unterbrechungsfreies Zwischenspeichern gewaehrleistet bleibt.
- **`release` (Minor + Push):** Zwingende lokale Ausfuehrung von `npm run typecheck` und `npm test -- --run` (Vitest) im Skript [W:/tools/nodges-git.sh](file:///W:/tools/nodges-git.sh). Schlaegt ein Test fehl, bricht der Release vor dem Push ab.
- **Playwright/E2E:** Verbleibt in der CI (`.github/workflows/verify.yml`), um den lokalen Release-Schritt nicht unnoetig aufzuhalten.

---

## 5. Sollen die Hooks hart abbrechen oder nur warnen?

**Antwort: pre-push bricht hart ab; pre-commit bricht nur bei Sicherheitsrisiken hart ab.**

- **`pre-push` (hart via `exit 1`):** Blockiert den Push technisch, wenn:
  1. Der aktuelle Branch nicht `main` ist.
  2. Die Patch-Version ungleich `0` ist (Push nur bei Minor/Major erlaubt).
  3. Kein entsprechendes Tag auf dem Commit liegt.
- **`pre-commit`:**
  - *Hart abbrechen* (`exit 1`) bei Branch ungleich `main` oder bei staged Secrets (`.env`).
  - *Nur warnen / informieren* ueber offene geaenderte Dateien anderer Bereiche, um den taeglichen Fluss beim `save` nicht zu stoeren.
