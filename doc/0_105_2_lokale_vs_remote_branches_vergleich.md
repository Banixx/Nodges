# Vergleich der lokalen Branches mit GitHub (Nodges)

## Kernaussage

Ja, du hast lokal vollstaendige Git-Repositories, und die Branches auf GitHub spiegeln sich lokal wider. Allerdings existiert nicht jeder lokale Branch auch auf GitHub: Einige Branches sind reine lokale Entwicklungszweige auf deinem Rechner, waehrend GitHub nur die Branches kennt, die explizit per `git push` hochgeladen wurden.

## Uebersicht: Lokale Branches vs. GitHub

| Branch-Name | Auf GitHub (`origin`)? | Im Windows-Repo (`C:/.../Nodges`) | Im WSL2- / Container-Repo | Erklaerung |
|---|---|---|---|---|
| **`pi`** | Ja (`origin/pi`) | Ja | Ja (aktiv) | Aktueller Hauptarbeits-Branch (0.105.x, Container-Support) |
| **`main`** | Ja (`origin/main`) | Ja | Ja | Urspruenglicher Haupt-Branch (0.103) |
| **`feature/multi-build`** | Ja (`origin/feature/...`) | Ja | Nein (nur Remote-Ref) | Aelterer Feature-Branch fuer Build 5 |
| **`VersionA`** | Nein | Ja | Nein | Nur lokaler Branch auf Windows |
| **`VersionB`** | Nein | Ja | Nein | Nur lokaler Branch auf Windows |
| **`refactor/pi-gem31`** | Nein | Ja (aktiv) | Nein | Nur lokaler Arbeits-Branch auf Windows |
| **`refactor/pi-stabilization`** | Nein | Ja | Nein | Nur lokaler Branch auf Windows |
| **`fix-math-...-20260712`** | Nein | Ja (Worktree) | Nein | Temporaerer Fix-Branch eines frueheren Agenten |

## Warum gibt es diesen Unterschied?

1. **Git ist dezentral**:
   - Ein lokaler Branch entsteht sofort auf deinem Rechner, sobald du `git branch <name>` oder `git checkout -b <name>` ausfuehrst.
   - Dieser Branch bleibt vollstaendig privat auf deinem Rechner, bis du ihn mit `git push -u origin <name>` auf GitHub hochlaedst.

2. **Zwei lokale Arbeitskopien**:
   - **Windows** ([C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges)): Hier wurden im Laufe der Zeit mehrere lokale Experimentier- und Refactoring-Branches angelegt.
   - **WSL2 / Container** (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`): Dieser Klon ist schlanker und enthaelt lokal im Wesentlichen nur `pi` und `main`.

3. **Auf GitHub**:
   - Auf GitHub existieren exakt die drei Branches `pi`, `main` und `feature/multi-build`.
