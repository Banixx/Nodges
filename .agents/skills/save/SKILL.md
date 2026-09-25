---
name: save
description: Nodges sichern — Patch-Version erhoehen, alles committen, kein Push. Automatisch nach jedem Arbeitsschritt.
---

# save — Zwischenstand sichern (Nodges)

Sichert den aktuellen Arbeitsstand **lokal**. Kein Push nach GitHub.

## Ausfuehren

```bash
bash /workspace/tools/nodges-git.sh save
```

Auf `W:/` (conT, Windows Git Bash):

```bash
bash W:/tools/nodges-git.sh save
```

## Wirkung

1. Patch-Version in `package.json` **und** `package-lock.json` um +1 (`0.106.4` -> `0.106.5`).
2. `git add -A` und `git commit -m "<neue Version>"`.
3. Ausgabe: neue Version, Commit-Kuerzel, wie viele Commits nur lokal vorliegen.
4. Kein Push. GitHub bleibt unberuehrt.

## Regeln

- Die Commit-Nachricht besteht ausschliesslich aus der Versionsnummer. Keine Zusatztexte, keine Emojis.
- Kein Sz — immer "ss". Kommunikation auf Deutsch.
- Nie stillschweigend fremde Arbeit ueberschreiben: Weil conT und piCon dieselbe Arbeitskopie teilen,
  nimmt `git add -A` auch ungesicherte Dateien der anderen Seite mit. Vor dem Kommitieren die Liste
  per `git status --short` zeigen, wenn der Auftrag nicht eindeutig ist.
- Bei leerem Arbeitsbaum passiert nichts (kein Leer-Commit).

## Im Anschluss (Empfehlung)

Ergebnisse nach `com/doc/<version>_<titel>.md`, offene Punkte nach `com/todo.md`.
