---
description: Erhöht die Patch-Version (letzte Ziffer) von Nodges um eins
---

# Versionierung Workflow

Dieser Workflow beschreibt, wie die **Patch-Version** (die dritte Zahl) der `package.json` von Nodges erhöht wird.

**Schritte:**
1. **Lese** die Datei `package.json` im Projektstamm.
2. **Extrahiere** den aktuellen Versionsstring aus dem Feld `"version"` (z. B. `"0.94.3"`).
3. **Erhöhe** die letzte Ziffer (Patch) um `1` → `"0.94.4"`.
4. **Schreibe** den aktualisierten Versionsstring zurück in die `package.json`.
5. **Commit**  die Änderung mit einer passenden Commit‑Message, z. B. `" 0.94.4"`.
6. **Ausführen** git push

> **Hinweis:** Dieser Workflow erhöht **nur** die Patch‑Version. Für ein Minor‑ oder Major‑Bump muss ein anderer Workflow verwendet werden.