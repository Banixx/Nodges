# Aktualisierungsplan: Nodges von 0.103.0 auf 0.105.1

## Ziel
Aktualisierung des lokalen Arbeitsverzeichnisses unter [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges) auf den neuesten Stand des Branches `pi` (`origin/pi`, Commit `d4391c0`, Version 0.105.1).

## Ausgangslage
- Lokaler Branch: `pi`
- Aktueller lokaler Commit: `1d177e5`
- Status: Sauber (`working tree clean`)
- Remote: `origin/pi` ist 9 Commits voraus
- Aktualisierungsart: Fast-Forward moeglich (keine Konflikte)

## Geplante Schritte

1. **Git Fast-Forward Pull**:
   - Befehl: `git pull --ff-only origin pi`
   - Bringt den lokalen Branch `pi` auf Commit `d4391c0`.

2. **Abhaengigkeiten aktualisieren**:
   - Da `package.json` und `package-lock.json` im Remote modifiziert wurden, muessen die Node-Abhaengigkeiten aktualisiert werden.
   - Befehl: `npm install`

3. **Verifikation**:
   - Pruefen des neuen Git-Status (`git status`).
   - Pruefen der Versionsnummer in [C:/Users/ich/Desktop/code/_projects/Nodges/package.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges/package.json).
   - Pruefen des TypeScript-Builds (`npm run build`).

4. **Abschlussdokumentation**:
   - Erstellen des Abschlussberichts im `doc/`-Ordner unter dem neuen Versionsprefix `0_105_1_`.
