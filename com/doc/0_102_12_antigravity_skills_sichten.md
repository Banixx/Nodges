# Antigravity Skills in der IDE sichten

## 1. Speicherorte und Sichtbarkeit von Skills

In der Antigravity IDE gibt es im Gegensatz zu Rules und Workflows keine eigene visuelle Uebersichts-Registerkarte in der Benutzeroberflaeche. Skills werden stattdessen direkt als Ordnerstrukturen im Dateiexplorer verwaltet und gesichtet:

- **Projektspezifische Skills**:
  `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/`
  Beispiel: `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/rebuild-preparation/SKILL.md`

- **Globale Skills**:
  `C:/Users/ich/.gemini/config/skills/`

## 2. Aufbau eines Skills

Jeder Skill besteht aus einem eigenen Ordner mit einer zentralen Steuerungsdatei:
1. `SKILL.md`: Enthaelt den Namen, die Beschreibung (YAML-Frontmatter) und die Anweisungen fuer den Agenten.
2. Optionale Unterordner: `scripts/`, `examples/`, `resources/` und `references/`.

## 3. Automatische Erkennung

Antigravity-Agenten erkennen Skills automatisch, sobald eine `SKILL.md`-Datei im Verzeichnis `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/` oder `C:/Users/ich/.gemini/config/skills/` abgelegt wird.
