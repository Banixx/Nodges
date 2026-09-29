# `save` ist nicht mehr automatisch — Versionierung ist sekundaer

Stand: 2026-09-29 · Harness: piCon · Version: 0.106.34 (Versionierung nachrangig)
Quelle: Benutzerbeschluss (Chat), siehe `com/entscheidungen.md` Eintrag 2026-09-29

## Beschluss

Der Benutzer hat entschieden: Speichern als Datei genuegt. Git soll nicht nach jedem Schritt
laufen, die Patch-Version ist nachrangig. Damit ist der Automatik-Teil der
Versionsstufen-Zustaendigkeit vom 2026-09-28 ersetzt.

Konkret:

- Der Normalfall ist, Dateien zu schreiben und liegen zu lassen.
- `save` (Patch +1, Commit) laeuft nur noch auf Anforderung des Benutzers oder am fachlichen
  Abschluss eines Vorhabens.
- Minor- und Major-Releases bleiben unveraendert: nur nach Ruecksprache, Major ist der einzige Push.

## Geaenderte Stellen

| Datei | Aenderung |
|---|---|
| `AGENTS.md` Abschnitt 3 | Tabellenzeile `save` und die Regel darunter: nicht mehr automatisch, Versionierung sekundaer |
| `AGENTS.md` Abschnitt 6 (Regel 6) | Zurueckhaltung: einzige ausdrueckliche Ausnahme ist die Berichtspflicht; `save` ist kein Automatismus mehr |
| `.agents/skills/save/SKILL.md` | Beschreibung und Regelteil angepasst, Hinweis auf `warum_save_hier_suboptimal.md` |
| `com/entscheidungen.md` | neuer bindender Eintrag 2026-09-29 |
| `com/feature/test5/warum_save_hier_suboptimal.md` | Vorschlagsabschnitt auf "entschieden" umgestellt |

## Begruendung

Ausfuehrlich in `com/feature/test5/warum_save_hier_suboptimal.md`. Kurz: conT und piCon teilen
dieselbe Arbeitskopie; `git add -A` nimmt bei parallelem Schreiben fremde Zwischenstaende mit,
die Versionsnummer verliert ihre Aussage, und `com/` ist ohnehin fuer beide sichtbar — es gibt
nichts zu synchronisieren.

## Status

Die Aenderungen sind als Dateien gespeichert und fuer conT ueber `W:/` sofort sichtbar.
Ein `save` wurde bewusst nicht ausgefuehrt, weil genau das jetzt nicht mehr automatisch
passiert. Es liegt an der Arbeitskopie ein offener Stand, der auf Anforderung in einem Zug
gesichert werden kann.
