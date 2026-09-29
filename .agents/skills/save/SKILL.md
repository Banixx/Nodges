---
name: save
description: Nodges sichern — Patch-Version +1, alles committen, kein Push. Auf Anforderung oder am fachlichen Abschluss, nicht mehr nach jedem Arbeitsschritt.
---

# save (conT und piCon)

Verbindliche Quelle des Ablaufs: `tools/nodges-git.sh` im Repo.

Ausfuehren (auf Anforderung des Benutzers oder am fachlichen Abschluss):

```bash
bash tools/nodges-git.sh save
```

Wirkung: Patch-Version +1 in `package.json` und `package-lock.json`, `git add -A`, Commit mit der reinen Versionsnummer als Nachricht, Trailer `Harness: conT`, **kein Push**. Bei leerem Arbeitsbaum passiert nichts.

Regeln: Branch muss `main` sein. Vor dem Speichern zeigt das Skript `git status --short`.

Wichtig: Nicht nach jedem Arbeitsschritt sichern. Dateien einfach zu schreiben und liegen zu lassen
ist der Normalfall; die Versionierung ist sekundaer. Bei laufender paralleler Arbeit (z.B. Echtzeit-Tests
zwischen conT und piCon) gar nicht sichern — `git add -A` wuerde fremde Zwischenstaende mitnehmen.
Siehe `com/feature/test5/warum_save_hier_suboptimal.md`.
