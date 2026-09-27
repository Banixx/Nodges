# Bericht: Commit-Trailer und E2E-Gate (F-01 und F-02)

> **Version:** 0.106.11
> **Datum:** 2026-09-27
> **Harness:** piCon (Linux-Container)
> **Grund:** Benutzerentscheidung zu den offenen Fragen F-01 und F-02 in `com/offene-fragen.md`.
> **Beschluss:** Beide Punkte nach **Option A**. Eingetragen in `com/entscheidungen.md`.

---

## 1. Ausgangslage

`com/offene-fragen.md` fuehrte zwei Git-Workflow-Fragen:

- **F-01:** Soll sichtbar sein, welches Harness einen Commit erzeugt?
- **F-02:** Soll `tools/nodges-git.sh release` die E2E-Tests erzwingen?

conT und piCon hatten in `com/fragen-an-cont.md` jeweils Option A empfohlen. Der Benutzer hat am
2026-09-27 beide Empfehlungen bestaetigt.

---

## 2. Umsetzung F-01: Harness-Trailer

`tools/nodges-git.sh` bestimmt das Harness in einer neuen Funktion `harness_name()`:

1. Ist `NODGES_HARNESS` gesetzt, gilt dieser Wert.
2. Sonst: Windows-Shell (`MINGW*`, `MSYS*`, `CYGWIN*`) = `conT`, alle anderen = `piCon`.

`save` und `release` haengen an die Commit-Nachricht eine Leerzeile und den Trailer an:

```
0.106.11

Harness: piCon
```

Damit bleibt Banixx Autor und Committer, das Harness ist aber in den Git-Metadaten transparent.

---

## 3. Umsetzung F-02: E2E-Gate

`release` prueft weiterhin Typecheck und Unit-Tests. Danach greift das neue E2E-Gate:

| Harness | Verhalten |
|---|---|
| `conT` (Windows-Host) | `npm run test:e2e` ist Pflicht. |
| `piCon` (Container) | E2E wird uebersprungen (Chromium-Bibliotheken fehlen). |

Steuerung per Umgebungsvariable:

- `NODGES_SKIP_E2E=1` erzwingt das Ueberspringen (auch auf dem Host).
- `NODGES_FORCE_E2E=1` erzwingt E2E auch im Container.
- `--skip-checks` springt wie bisher ueber die gesamte Pruefkette.

---

## 4. Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `tools/nodges-git.sh` | `harness_name()`, Trailer in `save`/`release`, E2E-Gate in `release` |
| `com/entscheidungen.md` | zwei neue Beschlusszeilen (F-01, F-02, Option A) |
| `com/offene-fragen.md` | F-01 und F-02 als erledigt markiert |
| `com/todo.md` | offene Punkte zu Trailer und E2E als erledigt vermerkt |

---

## 5. Pruefung

- `bash -n tools/nodges-git.sh` ist fehlerfrei.
- `tools/nodges-git.sh status` laeuft unveraendert.
- `harness_name()` liefert im Container `piCon` (Betriebssystem Linux); auf einer Windows-Shell `conT`.
- Der eigentliche Release-Lauf mit E2E wird auf der conT-Seite verifiziert (Runde 3 bzw. naechstes Release).