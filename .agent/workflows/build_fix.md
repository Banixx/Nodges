---
description: Führt einen Build aus und behebt automatisch Typfehler
---

// turbo-all
# Build & Fix Workflow

Dieser Workflow automatisiert den Build-Prozess und die Fehlerbehebung.

1. **Build ausführen**: `npm run build`
2. **Fehler analysieren**: Wenn der Build fehlschlägt, lies die Fehlerliste.
3. **Korrektur**: Behebe die Fehler in den entsprechenden Dateien.
4. **Validierung**: Führe `npm run type-check` aus.
