---
name: status
description: Nodges Standbericht — Branch, Version, Tag, Abstand zu GitHub, offene Dateien. Veraendert nichts.
---

# status — Wo stehen wir (Nodges)

Zeigt den vollstaendigen Stand. **Es wird nichts geaendert und nichts geholt** — kein Pull, kein Reset.

## Ausfuehren

```bash
bash /workspace/tools/nodges-git.sh status
```

## Ausgabe

Branch, aktuelle Version, letztes Tag, letzter Commit, wie viele Commits **lokal** noch nicht auf
GitHub liegen, wie viele von GitHub noch nicht hier sind, Zahl der offenen Dateien.

## Regeln

- Kommunikation auf Deutsch, kein Sz, keine Emojis.
- `status` ersetzt das alte `sgp` (das frueher `git pull origin main` ausfuehrte). Da conT und piCon
  dieselbe Arbeitskopie teilen, gibt es nichts zu holen, solange lokal gearbeitet wird.
- **Gefahr beachten:** Solange "lokal voraus" groesser als 0 ist, waere ein
  `git reset --hard origin/main` ein Datenverlust. Vor jedem Zuruecksetzen diesen Bericht ansehen.
