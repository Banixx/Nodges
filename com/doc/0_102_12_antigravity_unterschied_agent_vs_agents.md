# Antigravity Unterschied zwischen .agent und .agents

## 1. Analyse der Pfade

Im Projekt existieren aktuell zwei sehr aehnliche Ordnerstrukturen fuer Agenten-Konfigurationen:

1. `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/` (Plural - Standard):
   - Dies ist der von Antigravity vorgegebene Standardpfad fuer projektspezifische Agent-Customizations.
   - Beinhaltet Rules (`AGENTS.md`), Skills (`skills/`) und Workflows (`workflows/`).
   - Beispiele: `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/workflows/fragen.md`, `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/workflows/idee.md`.

2. `C:/Users/ich/Desktop/code/_projects/Nodges/.agent/` (Singular - Historisch/Abweichend):
   - Dies ist ein aelterer oder durch fruehere Vorlagen/Tools angelegter Ordner im Singular.
   - Beispiel: `C:/Users/ich/Desktop/code/_projects/Nodges/.agent/workflows/build_fix.md`.

## 2. Handlungs-Empfehlung

Um Verwirrungen und fehlerhafte Workflow-Scans des System-Parsers zu vermeiden, sollten alle Workflows konsistent unter `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/workflows/` konsolidiert werden.
