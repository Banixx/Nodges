---
name: release
description: Nodges freigeben — Minor-Version, Git-Tag, L0+L1+L2 Pruefungen. Lokaler Meilenstein.
---

# release (conT)

Verbindliche Quelle des Ablaufs: `tools/nodges-git.sh` im Repo.

Ausfuehren (nur nach Ruecksprache mit dem Benutzer):

```bash
bash tools/nodges-git.sh release --bestaetigt-durch-user
```

Wirkung:
- Typecheck (`tsc --noEmit`, L0)
- Unit-Tests via Container-Bruecke (`pi-harness`, L1)
- E2E-Tests via Playwright SwiftShader (L2)
- Minor +1 mit Patch 0 (`0.106.9` -> `0.107.0`), Commit mit `Harness: conT`, Tag `v0.107.0`.
- **KEIN Push nach GitHub:** Nach GitHub gehen ausschliesslich Major-Releases nach expliziter Rueckfrage an den Benutzer.
