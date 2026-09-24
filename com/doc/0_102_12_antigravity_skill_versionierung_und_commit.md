# Antigravity Skill fuer Versionierung und Git-Commit

Der Skill wurde unter folgendem Pfad erstellt:

`C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/versioning-and-commit/SKILL.md`

## Funktionsweise und Ablauf

1. **Versionierung**: Lese `C:/Users/ich/Desktop/code/_projects/Nodges/package.json` und erhoehe die Patch-Version um 1.
2. **Staging**: Fuehre `git add .` aus.
3. **Commit**: Fuehre `git commit -m "[Version]"` aus (die Commit-Message besteht ausschliesslich aus der neuen Versionsnummer, z.B. `"0.102.13"`).
4. **Push**: Fuehre `git push` aus.
