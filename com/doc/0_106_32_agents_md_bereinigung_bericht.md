# AGENTS.md-Bereinigung: Konflikte aufgeloest

Stand: 2026-09-28 · Harness: piCon · Version: 0.106.32
Quelle: Benutzerbeschluesse im Chat (siehe `com/entscheidungen.md`, Eintraege 2026-09-28)

## Anlass

Eine Konfliktpruefung der Regeldateien ergab sechs Widersprueche bzw. Drift-Punkte
zwischen dem globalen `/home/.pi/agent/AGENTS.md` und dem Projekt-`/workspace/AGENTS.md`
sowie innerhalb des Projektfiles. Der Benutzer hat alle sechs Punkte entschieden und
zusaetzlich eine Skill-Dopplung gemeldet.

## Umsetzung je Punkt

| Nr. | Befund | Beschluss | Umsetzung |
|---|---|---|---|
| 1 | "Nur ein einziger physischer Arbeitsort" widersprach dem dopi-Ort `C:/.../Nodges_Pi` | beide Orte gueltig | `AGENTS.md` Abschnitt 2 umgeschrieben: ext4 bleibt SSoT des Projektinhalts, der Host-Ort ist als zweiter gueltiger Ort (dopi, Infrastruktur) ausdruecklich aufgenommen |
| 2 | Global (Zurueckhaltung) gegen Projekt (selbststaendiges Sichern) | Zurueckhaltung hat Vorrang | `AGENTS.md`: Git-Regel und Regel 6 verweisen jetzt auf die Zurueckhaltung als Grundhaltung; `save` und Berichtspflicht sind die ausdruecklich vereinbarten Ausnahmen |
| 3 | Feature-Struktur: Ordner mit Dashboard gegen "ein File je Vorhaben" | unveraendert lassen | keine Aenderung; die Praxis (Ordner mit `dashboard.md`/`dashboard.html` plus flache Dateien) bleibt wie vom Benutzer angelegt |
| 4 | `com/txt/` fehlte in der Dokumentation | dauerhafte Ausnahme | `AGENTS.md` Abschnitt 5: neue Tabellenzeile `txt/` mit Begruendung **NotebookLM** (liest kein `.md`), Werkzeuge und Index genannt |
| 5 | Skill `uupdate` als Alt-Name dokumentiert, existierte aber nicht | entfernen | Hinweis in `AGENTS.md` Abschnitt 3 geloescht |
| 6 | Zwei `user.md` (`/home/.pi/user.md` und `/home/.pi/agent/user.md`) | `/home/.pi/user.md` ist die einzige gueltige | globales `AGENTS.md` nennt den Pfad explizit, `/workspace/AGENTS.md` Regel 6 ergaenzt die Pfad-Perspektive (conT erreicht `/home/.pi/` nicht), `/home/.pi/user.md` zur alleingueltigen Datei erklaert und inhaltlich ergaenzt, `com/entscheidungen.md` praezisiert die Entscheidung vom 2026-09-27 |
| 7 | Vier Projekt-Skills doppelt: `com`, `release`, `save`, `status` je in `/workspace/.agents/skills/` und `/home/.pi/agent/skills/` | ein Skill-Ort | `AGENTS.md` Abschnitt 3: `/workspace/.agents/skills/` (= `W:/.agents/skills/`) ist die einzige verbindliche Quelle; die Home-Kopien werden vom Pi-Agenten als Kollision uebersprungen und sind Altlast |

## Geaenderte Dateien

- `/workspace/AGENTS.md` — Abschnitte 2, 3, 5, 6 (6 Bloecke)
- `/home/.pi/agent/AGENTS.md` — Pfad fuer `user.md` praezisiert
- `/home/.pi/user.md` — als alleingueltige Profildatei gekennzeichnet, Harness-Tabelle um dopi ergaenzt, Pfadfehler (`/home/.pi/AGENTS.md`) korrigiert, Git-Verlauf/Testdaten/Browser-Fehlerbild ergaenzt
- `/workspace/com/entscheidungen.md` — sechs neue Beschluesse vom 2026-09-28

## Offene Loeschungen (erledigt am 2026-09-28)

Nach Freigabe des Benutzers entfernt:

1. `/home/.pi/agent/user.md` — abgeloeste Profilkopie (Inhalt in `/home/.pi/user.md` uebernommen).
2. `/home/.pi/agent/skills/{com,release,save,status}/` — uebersprungene Doppelungen. `brave-search` bleibt. Vor dem Loeschen wurde der piCon-Teil des `com`-Skills in `/workspace/.agents/skills/com/SKILL.md` eingearbeitet, damit piCon nichts verliert.

Beides lag ausserhalb des Repos (nicht versioniert).

## Hinweis zur geteilten Datei

`AGENTS.md` ist eine gemeinsame Datei. Vor der Bearbeitung wurde ein COM-Ping an conT
abgesetzt, damit keine parallele Bearbeitung stattfindet.
