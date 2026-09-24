# Antigravity Aufrufen von Skills

## 1. Wie werden Skills aktiviert?

Im Gegensatz zu Workflows (die mit Slash-Befehlen wie `/fragen` aufgerufen werden) funktionieren Skills auf folgende Arten:

### A) Nennung im Chat-Prompt (Empfohlen)
Sie koennen den Skill direkt namentlich anfordern:
- `Nutze den Skill versioning-and-commit`
- `Fuehre den Skill versioning-and-commit aus`

### B) Automatische Ausloesung durch die Aufgabenstellung (Trigger-Matching)
- Der Agent vergleicht Ihre Anfrage mit der `description` in der `SKILL.md`-Datei.
- Beispiel: Wenn Sie sagen `Erhoehe die Patch-Version und pushe die Aenderungen`, erkennt der Agent den Skill `versioning-and-commit` automatisch und fuehrt ihn aus.

### C) Aufruf ueber den Dateipfad
Sie koennen dem Agenten auch direkt den Pfad nennen:
- `Fuehre die Schritte aus C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/versioning-and-commit/SKILL.md aus.`

## 2. Speicherorte verfuegbarer Skills

- **Projektspezifisch**: `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/`
- **Global**: `C:/Users/ich/.gemini/config/skills/`
