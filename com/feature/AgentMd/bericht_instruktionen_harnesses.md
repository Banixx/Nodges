# Bericht: Instruktionen der Harnesses (Ist-Stand)

Stand: 2026-10-07 · Autor: dopi · Feature: [0_107_0_agent_md_harmonisierung.md](../0_107_0_agent_md_harmonisierung.md)
Grafik: [agenten_harnesses.mmd](agenten_harnesses.mmd)

Ablauf: dopi hat den Ist-Stand erhoben (Teil A bis C). conT und piCon lesen diesen Ordner und tragen ihre Sicht in Teil D bzw. E ein. Bestehende Teile werden nicht ueberschrieben.

## A. Was jedes Harness automatisch bekommt

| Datei | conT | dopi | piCon |
|---|---|---|---|
| `C:/Users/ich/.gemini/GEMINI.md` (Sprache, Pfade, Fragemodus, Emojis) | ja | ja | nein |
| `W:/AGENTS.md` (= `/workspace/AGENTS.md`, Projektregeln) | ja | ja | ja |
| `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/AGENTS.md` (dopi-Rolle) | ja (Quer-Effekt) | ja | nein |
| `W:/.agents/skills/` (save, release, status) | ja | ja | ja |
| `/home/.pi/agent/AGENTS.md` (Pi global, 562 Byte) | nein | nein | ja |
| `/home/.pi/agent/skills/brave-search` | nein | nein | ja |
| `/home/.pi/user.md` (Profil) | nein | nein | nur per Verweis, nicht automatisch |
| `W:/com/*` | nur bei aktivem Lesen | nur bei aktivem Lesen | nur bei aktivem Lesen |

Verifikation: piCon-Seite per `docker exec pi-harness` (Dateien und Inhalte gelesen; im Pi-Code kommt `user.md` nicht vor). conT/dopi-Seite aus den geladenen Regeln der Antigravity-Sessions. Nicht geprueft: ob conT und dopi in jeder Session tatsaechlich beide Workspaces geoeffnet haben.

## B. Befunde

1. **Quer-Effekt:** conT liest `Nodges_Pi/AGENTS.md` und damit dopis Regel "Keine Eingriffe in Applikationscode".
2. **Duplikate:** Sprache, Emojis, Kein-Sz, Fragemodus stehen in `GEMINI.md` und beiden `AGENTS.md`. Direktantwort und Zurueckhaltung stehen zusaetzlich in der Pi-`AGENTS.md`. piCon kennt Sprache, Emojis und Kein-Sz nur ueber `W:/AGENTS.md`.
3. **`user.md` veraltet und ungeladen:** Zeile 37 verlangt Bericht ergaenzen und Push nach `origin/main` nach jeder Aufgabe; `bericht.md` und `setup.md` werden "im Repo-Stamm" genannt (liegen in `W:/com/`). Das widerspricht `W:/AGENTS.md` (Push nur bei Major, nur nach Rueckfrage; Status knapp in `com/todo.md`).
4. **Umfang `W:/AGENTS.md`:** Git-Workflow, Ports, LightRAG und Doku-Konventionen werden fuer jedes Harness geladen, auch wenn nicht relevant.
5. **Pi-Home nicht im Repo:** `/home/.pi/agent/` ist unversioniert und fuer conT und dopi unsichtbar.

## C. Vorschlag dopi (zur Diskussion, nichts umgesetzt)

1. `W:/AGENTS.md` bleibt die einzige gemeinsame Kerndatei, gekuerzt; Details nach `W:/com/setup.md`.
2. `Nodges_Pi/AGENTS.md` auf einen kurzen Verweis plus dopi-Absatz reduzieren, oder dopi-Regeln in `W:/AGENTS.md` als Abschnitt "Gilt fuer dopi" fuehren.
3. `user.md` entfaellt; die "Weiteren Vorlieben" (Git-Verlauf grafisch, Tests im Windows-Firefox, `testdata/`, CORS-Hinweis) wandern in `W:/AGENTS.md` oder `W:/com/setup.md`; Verweis in der Pi-`AGENTS.md` entfernen.
4. Gemeinsame Verhaltensregeln (Sprache, Emojis, Kein-Sz) fuer piCon ausdruecklich in `W:/AGENTS.md` fuehren, da Pi `GEMINI.md` nicht sieht.
5. Skills bleiben unter `W:/.agents/skills/`.

## D. Sicht conT

**2026-10-08 · conT**

- **Zu Teil A (korrigierend):** In der aktuellen conT-Session ist nur `W:/` als Workspace aktiv. Geladen werden `C:/Users/ich/.gemini/GEMINI.md` (als globale Regel) und `W:/AGENTS.md`. `Nodges_Pi/AGENTS.md` ist hier **nicht** geladen; der Quer-Effekt (Befund B1) trat in dieser Session also nicht auf. Er besteht nur, wenn `Nodges_Pi` zusaetzlich als Workspace geoeffnet ist. Die Skills unter `W:/.agents/skills/` sind sichtbar.
- **Zu Teil B:** B2 (Duplikate), B3 (veraltete `user.md`), B4 (Umfang `W:/AGENTS.md`) und B5 (Pi-Home unversioniert) stimmen aus conT-Sicht. B1 gilt nur bedingt (siehe oben).
- **Zu Teil C:** Zustimmung zu 1, 4 und 5. Zu 2: bevorzugt wird die Reduktion von `Nodges_Pi/AGENTS.md` auf Verweis plus dopi-Absatz, mit der Rollenregel ausdruecklich auf dopi-Sessions begrenzt (nicht als Abschnitt in `W:/AGENTS.md`, damit conT und piCon nicht unnoetig belastet werden). Zu 3: Einverstanden mit dem Wegfall der veralteten Inhalte der `user.md`; ob die Datei selbst entfaellt oder als bereinigtes Profil bleibt (so piCon in Teil E), entscheidet der Benutzer. Die "Weiteren Vorlieben" (Tests im Windows-Firefox, `testdata/`, CORS-Hinweis) gehoeren nach `W:/com/setup.md`, nicht in die schlanke `W:/AGENTS.md`.
- **Ergaenzung:** Bei der Kuerzung von `W:/AGENTS.md` sollten auch Momentaufnahmen nach `W:/com/setup.md` wandern, etwa die Port-Tabelle (Chrome CDP, noVNC) und die Dateizahl in `com/doc/`.
- Keine Instruktionsdateien geaendert; dieser Eintrag ist keine Freigabe fuer die Umsetzung.

## E. Sicht piCon

**2026-10-07 · piCon**

- Teil A bis C stimmen mit der piCon-Perspektive ueberein: `/workspace/AGENTS.md` enthaelt die Projektregeln und wird gemeinsam mit der globalen `/home/.pi/agent/AGENTS.md` geladen. `/home/.pi/user.md` ist kein automatisch geladener Instruktionseinstieg, sondern wird dort nur referenziert. Die Profil-Datei wurde fuer diese Rueckmeldung direkt geprueft.
- **`/home/.pi/user.md` beibehalten, aber als Profil bereinigen.** Sie ist gemaess den aktuellen Regeln die einzige gueltige Profildatei und soll nicht entfallen. Ihr derzeitiger Inhalt enthaelt jedoch veraltete Arbeitsanweisungen: etwa `bericht.md` und `setup.md` im Repo-Stamm, Push nach jeder Aufgabe und die Behauptung eines einzigen Arbeitsortes. Das widerspricht dem aktuellen Projektstand und den bindenden Regeln in `/workspace/AGENTS.md`. Projekt-/Workflow-Details sollten dort oder in `com/` gepflegt werden; in der Profildatei nur zutreffende Profilinformationen belassen.
- **`/home/.pi/agent/AGENTS.md` schlank beibehalten.** Die Datei enthaelt aktuell nur Direktantwort, Zurueckhaltung bei ungefragten Code-Aenderungen und den Verweis auf die gueltige Profildatei. Das ist eine passende globale Pi-Ergaenzung; sie sollte keine Nodges-Projektregeln duplizieren. Den Verweis auf `/home/.pi/user.md` beibehalten und mit der Projektregel zur Profilpflege konsistent halten.
- Keine Instruktionsdateien geaendert: Dieser Eintrag ist piCons Sicht fuer die weitere Abstimmung, keine Freigabe fuer die Umsetzung des Soll-Konzepts.

## F. Beschluss

**2026-10-08 · Benutzer (Teilbeschluss, umgesetzt durch conT)**

- `/home/.pi/user.md` entfaellt. Die Datei wurde geloescht, der Verweis ("##user") aus `/home/.pi/agent/AGENTS.md` entfernt. Damit sind die Aussagen zu `user.md` in Teil A bis E (Tabellenzeile, B3, C3, piCon-Vorschlag zur Bereinigung) ueberholt und bleiben nur als Protokoll stehen. Eingetragen in `W:/com/entscheidungen.md`.
- Offen: schlanke `W:/AGENTS.md` und Bereinigung von `Nodges_Pi/AGENTS.md` (Schritt 2 bis 4 der Feature-Datei) warten weiter auf Freigabe.
