# Antigravity Speicherorte fuer globale Regeln

Die tatsaechliche physikalische Datei auf dem Dateisystem, in der die globalen Benutzervorgaben (User Rules) fuer Antigravity gespeichert sind, lautet:

`C:/Users/ich/.gemini/GEMINI.md`

## Überpruefung der Pfade

- **`C:/Users/ich/.gemini/GEMINI.md`**: Diese Datei existiert auf dem System und enthaelt die tatsaechlich geladenen globalen Regeln (`<RULE[user_global]>`).
- **`C:/Users/ich/.gemini/config/AGENTS.md`**: Veralteter Pfad / alte Spezifikation in früheren Versionen von Antigravity; existiert auf dem aktuellen Dateisystem nicht mehr.

## Betroffene Antigravity-Schnittstellen
Die in `GEMINI.md` definierten Regeln gelten fuer alle drei Schnittstellen:
1. **Antigravity Chat UI** (Desktop-Chatfenster)
2. **Antigravity IDE** (VS Code-basierte Entwicklungsumgebung)
3. **Antigravity CLI** (`agy` Kommandozeilentool)
