# Analyse und Aufraeumplan fuer die Git-Branches

## Kernaussage

Ja, wir koennen die lokalen Branches gruendlich aufraeumen, da `VersionA` und `VersionB` veraltete A/B-Teststaende aus dem Mai 2026 sind, die heute nicht mehr benoetigt werden.

## Was genau sind VersionA und VersionB?

Beide Branches stammen vom **10. Mai 2026** und basieren auf der veralteten Version **`0.98.1.8`** (der aktuelle Projektstand ist `0.105.x`). Es handelte sich um fruehe Varianten-Tests:

1. **`VersionA` (Commit `b962818` – "0.98.1.10A")**:
   - Enthaelt ein fruehes Experiment fuer eine Dateneditier-Funktion ([src/utils/DataEditor.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/DataEditor.ts)), Kontextmenue-Aenderungen und Test-Screenshots.
   - Wurde nie in `main` gemergt und ist technisch durch die neuere Architektur vollstaendig ueberholt.

2. **`VersionB` (Commit `b482b67` – "0.98.1.10B - Pink Schemes and Sunset Ocher")**:
   - War ein reines Farb- und UI-Experiment im ViewPanel ([src/ui/ViewPanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/ViewPanel.ts)) mit rosa und ockerfarbenen Farbschemata.
   - Wurde ebenfalls nie uebernommen und ist nicht mehr relevant.

**Empfehlung**: Beide Branches koennen ohne Datenverlust fuer das aktuelle Projekt bedenkenlos geloescht werden.

## Status aller lokalen Branches auf Windows

| Branch | Stand / Datum | Relevanz | Empfohlene Aktion |
|---|---|---|---|
| **`pi`** | 0.105.1 (aktiv) | Sehr hoch (Arbeitszweig) | **Behalten** |
| **`main`** | 0.103 | Hoch (Haupt-Referenz) | **Behalten** |
| **`refactor/pi-gem31`** | Identisch mit `pi` | Ueberfluessige Kopie | Nach Wechsel auf `pi` loeschen |
| **`refactor/pi-stabilization`** | 22. Sep 2026 | Nur eine `.mmd`-Grafik | Loeschen (Grafik vorher sichern falls noetig) |
| **`VersionA`** | Mai 2026 (0.98) | Veraltetes Experiment | **Loeschen** |
| **`VersionB`** | Mai 2026 (0.98) | Veraltetes Farbexperiment | **Loeschen** |
| **`fix-math-...-20260712`** | Juli 2026 (0.102.7) | Veralteter Agenten-Worktree | Worktree prunen, Branch **loeschen** |
| **`feature/multi-build`** | Build 5 (0.102.3) | Historischer Stand | Lokalen Branch loeschen (bleibt auf GitHub) |

## Konkrete Schritte zum Aufraeumen

Sobald die Freigabe erteilt wird, koennen folgende Befehle ausgefuehrt werden:

```powershell
# 1. Auf den aktuellen Hauptarbeits-Branch pi wechseln
git checkout pi

# 2. Veralteten Worktree aufraeumen
git worktree prune

# 3. Veraltete und ungenutzte lokale Branches loeschen
git branch -D VersionA
git branch -D VersionB
git branch -D fix-math-calculation-logic-20260712
git branch -D refactor/pi-gem31
git branch -D refactor/pi-stabilization
git branch -D feature/multi-build
```

Danach verbleiben lokal nur noch die beiden sauberen Referenzen:
- `pi` (aktuelle Entwicklung)
- `main` (Hauptzweig)
