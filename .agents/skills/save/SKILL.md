---
name: save
description: Nodges sichern — Patch-Version +1, alles committen, kein Push. Standard nach jedem Arbeitsschritt.
---

# save (conT)

Verbindliche Quelle des Ablaufs: `tools/nodges-git.sh` im Repo.

Ausfuehren:

```bash
bash tools/nodges-git.sh save
```

Wirkung: Patch-Version +1 in `package.json` und `package-lock.json`, `git add -A`, Commit mit der reinen Versionsnummer als Nachricht, Trailer `Harness: conT`, **kein Push**. Bei leerem Arbeitsbaum passiert nichts.

Regeln: Branch muss `main` sein. Vor dem Speichern zeigt das Skript `git status --short`.
