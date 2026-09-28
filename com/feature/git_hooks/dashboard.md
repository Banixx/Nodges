# Dashboard: Git-Hooks & Release-Gate Absicherung (Multi-Harness)

> **Projekt:** Git-Hooks & Release-Gate Absicherung | **Harness:** Multi-Harness (conT / piCon) | **Stand:** 2026-09-28 | **Status:** INITIALISIERT  
> **Ablagepfad:** `W:/com/feature/git_hooks/dashboard.md` | **HTML-Ansicht:** [dashboard.html](./dashboard.html)

---

## 1. Name & Beschreibung

| Attribut | Spezifikation |
|---|---|
| **Projektname** | **Git-Hooks & Release-Gate Absicherung** |
| **Betriebsmodus** | **Multi-Harness (conT, piCon)** |
| **Kategorie** | Git-Workflow, Qualitaetssicherung & Versions-Integritaet |
| **Beschreibung** | Etablierung versionierter Git-Hooks (pre-commit, pre-push, post-commit) fuer conT und piCon. Patch-Versionen (save) sichern Agenten selbststaendig. Minor-Releases (release) erfordern zwingend vorherige Ruecksprache mit dem Benutzer. Push nach GitHub ist exklusiv Major-Versionen vorbehalten und darf nur nach expliziter Rueckfrage an den Benutzer erfolgen. |
| **Arbeitsverzeichnis** | `W:/com/feature/git_hooks/` |

---

## 2. Ziele

- **[Z-01]** Git-Hooks (pre-commit, pre-push, post-commit) in `git-hooks/` einrichten und via `core.hooksPath` repo-weit fuer Host (conT) und Container (piCon) aktivieren.
- **[Z-02]** `pre-push`-Hook konfigurieren: Pushs fuer Patch- und Minor-Releases blockieren; GitHub-Push nur fuer Major-Versionen (`*.0.0`).
- **[Z-03]** `tools/nodges-git.sh` und `tools/nodges-git-version.mjs` harmonisieren: `release`-Befehl und interaktive Freigabe so anpassen, dass Major-Pushes explizite Rueckfrage an den Benutzer erzwingen.
- **[Z-04]** Pre-Commit-Gates absichern: Pruefung auf falsche Branches, Secrets in Staging (`.env`, Keys) sowie optionale Linter/Typecheck-Validierung.
- **[Z-05]** Multi-Harness-Rapport und Verifikation: Testlaeufe fuer conT (Windows) und piCon (Container) durchfuehren und dokumentieren.

---

## 3. Fortschritt & Meilensteine

| Meilenstein / Bereich | Pruef- / Arbeitsschritt | Fokus | Status | Fortschritt |
|---|---|---|---|---|
| **M1: Feature-Setup & Rapport** | Feature-Ordner, One-Page Dashboard & Tri-Harness-Rapport | Struktur etablieren | **[ERLEDIGT]** | `[====================] 100%` |
| **M2: Hook- & Workflow-Spezifikation** | Vertragsabstimmung (Major-Push-Regel, Pre-Commit) | Fachlicher Vertrag | **[ERLEDIGT]** | `[====================] 100%` |
| **M3: Implementierung in Git-Tools** | Anpassung `pre-push`, `nodges-git.sh`, `version.mjs` | Code & Skripte | **[ERLEDIGT]** | `[====================] 100%` |
| **M4: Multi-Harness Verifikation** | Integrierte Pruefung auf Windows & im Container | Testlaeufe & Nachweis | **[ERLEDIGT]** | `[====================] 100%` |

**Gesamtfortschritt Projekt:** **100%**

---

## 4. Status & Naechste Schritte

- **Aktueller Status:** Erfolgreich abgeschlossen. Git-Hooks aktiv, Push nach GitHub fuer Nicht-Major-Versionen blockiert, Major-Push erfordert explizite Bestaetigung nach Rueckfrage an den Benutzer.
- **Naechste Aktion:** Keine weiteren Schritte im Feature git_hooks erforderlich.
- **Verknuepfte Dokumente:**
  - Multi-Harness Rapport: [rapport_git_hooks.md](./rapport_git_hooks.md)
  - HTML-Ansicht: [dashboard.html](./dashboard.html)
  - Beschluesse: [com/entscheidungen.md](../../entscheidungen.md)
  - Aufgabenliste: [com/todo.md](../../todo.md)
