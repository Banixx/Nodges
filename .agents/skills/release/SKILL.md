---
name: release
description: Nodges freigeben — Minor-Version, Git-Tag und Push nach origin/main. Der einzige Weg, Arbeit nach GitHub zu bringen.
---

# release — Meilenstein nach GitHub bringen (Nodges)

Fuehrt einen Minor-Sprung durch, setzt ein Git-Tag und pusht. Nur dadurch wird GitHub aktualisiert.

## Ausfuehren

```bash
bash /workspace/tools/nodges-git.sh release
```

Ohne die Pruefungen (Typecheck und Unit-Tests), nur bewusst:

```bash
bash /workspace/tools/nodges-git.sh release --skip-checks
```

## Wirkung

1. Pruefung: Branch muss `main` sein, `npm run typecheck` und `npm test -- --run` muessen gruen sein.
2. Minor-Version +1, Patch auf 0 (`0.106.9` -> `0.107.0`) in `package.json` **und** `package-lock.json`.
3. `git add -A`, `git commit -m "<neue Version>"`.
4. Git-Tag `v<Version>` (zum Beispiel `v0.107.0`).
5. `git push origin main` und `git push origin v<Version>`.

## Regeln

- Commit-Nachricht ist nur die Versionsnummer. Keine Emojis, kein Sz.
- Ein Push loest die GitHub-Pipeline `.github/workflows/verify.yml` aus (Typecheck, Biome, Vitest,
  Playwright, Build). Ein roter Lauf dort ist ernst zu nehmen.
- Der `pre-push`-Hook blockiert jeden Push, der keine Minor- oder Major-Version ist. Das ist gewollt:
  GitHub bleibt das Meilenstein-Archiv, Zwischenstaende bleiben lokal.

## Technischer Hintergrund

Warum kein Push bei jedem Zwischenschritt: conT (`W:/`) und piCon (`/workspace`) arbeiten auf
demselben Dateisystem und derselben `.git`-Verwaltung. Ein lokaler Commit der einen Seite ist bei der
anderen sofort sichtbar. Push und Pull sind zwischen den beiden Harnesses kein Synchronisationsmittel.
