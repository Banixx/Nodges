# Parallelbetrieb von Branches in Git und auf GitHub

Dokumentation zur Funktionsweise paralleler Branches auf GitHub und im lokalen Repository [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges).

---

## 1. Was bedeutet "nebeneinander laufen" in Git?

In Git ist ein Branch kein separater Klon des gesamten Projekts in einem neuen Ordner, sondern ein **beweglicher Zeiger auf einen bestimmten Commit**.

- **Auf GitHub:** Alle drei Branches (`main`, `pi`, `feature/multi-build`) existieren gleichzeitig und unabhaengig voneinander im selben Repository. GitHub speichert die Historie aller drei Zweige parallel. Ein Commit auf `pi` veraendert `main` nicht, solange kein Merge oder Pull Request durchgefuehrt wird.
- **Lokal im Dateisystem:** Im lokalen Ordner [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges) existiert die Historie aller Branches in der Git-Datenbank (`.git`). Im sichtbaren Arbeitsbereich (Working Tree) ist jedoch immer nur **genau ein Branch aktiv ausgecheckt** (aktuell `refactor/pi-gem31`).

---

## 2. Der Status der drei GitHub-Branches im Detail

### 1. `main` (Stand v0.103)
- Ist der Standard-Branch (Default Branch) auf GitHub.
- Wenn jemand das Repository auf GitHub oeffnet oder ohne Parameter klont, sieht er diesen Stand.
- Enthaelt die stabile Codebasis vom Juli 2026, besitzt aber noch keine DevContainer-Konfiguration fuer den Pi-Agenten und keine LightRAG-Backend-Anbindung.

### 2. `pi` (Stand v0.105.2)
- Ist der eigentliche Hauptarbeitszweig der vergangenen Monate.
- Laeuft parallel zu `main`, ist diesem jedoch inhaltlich weit voraus (DevContainer, Docker Compose fuer Pi, LightRAG Python-Backend, Minimap, Refactorings).
- Da dieser Zweig noch nicht in `main` gemergt wurde, bleibt `main` unberuehrt auf Stand v0.103 stehen.

### 3. `feature/multi-build` (Stand v0.102.3)
- Ein alter Entwicklungsstand aus dem Juni 2026.
- Liegt seitdem unveraendert parallel im Repository und wird nicht mehr aktiv weiterentwickelt.

---

## 3. Wechsel zwischen Branches im lokalen Arbeitsbereich

Um lokal zwischen den Staenden zu wechseln, wird der Befehl `git checkout` bzw. `git switch` verwendet:

```bash
# Auf den Stand des Pi-Zweigs wechseln
git checkout pi

# Auf den Stand des GitHub-Hauptzweigs wechseln
git checkout main
```

Beim Wechsel passt Git die Dateien im Arbeitsverzeichnis [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges) in Sekundenbruchteilen exakt an den jeweiligen Commit-Stand des gewaehlten Branches an.
