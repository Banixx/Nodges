# Parallele pi-Instanzen im Container (Mehr-Agenten-Betrieb)

Stand: 2026-09-24 · Harness: piCon · Version: 0.106.4

## Ziel

Zwei oder mehr unabhaengig bedienbare pi-Prozesse laufen gleichzeitig im Container `pi-agent` und arbeiten
auf demselben Dateisystem (`/workspace`), ohne sich gegenseitig zu ueberschreiben. Jede Instanz hat ein
eigenes Kontextfenster, eine eigene Session-Datei und eine eigene Aufgabe.

## Ausgangslage (im Container geprueft am 2026-09-24)

| Pruefung | Ergebnis |
|---|---|
| Service-Name | `pi-agent` (Start ueber `start_pi_container.cmd` → `docker compose up -d`) |
| Laufende pi-Prozesse | genau einer (PID 146); kein weiterer Agent aktiv |
| tmux / screen / docker-CLI | **nicht vorhanden** im Container |
| Terminals | nur `/dev/pts/0`; bash-Tool des Agenten ist `not a tty` |
| Ressourcen | 6 CPUs, 14 GB RAM, davon ca. 11,8 GB frei |
| Session-Speicherung | eigene JSONL-Datei je Session in `/home/.pi/agent/sessions/--workspace--/` |
| Sperren | keine: keine Prozess-Sperre, kein `index.lock`-Schutz ausserhalb von Git |

Konsequenz: Mehrere Instanzen sind technisch moeglich, aber **unkontrolliert** – die Koordination muss
organisatorisch erfolgen (Datei-Eigentum plus Anspruchsliste).

## Varianten

| Variante | Start | Kontext | Geeignet fuer |
|---|---|---|---|
| A. Zweites CMD-Fenster | `docker compose exec -it pi-agent pi -n "instanz-b"` | getrennt | dauerhaft bediente zweite Rolle (z. B. Frontend parallel zu Skripten) |
| B. Headless-Kollege | aus bash: `pi --no-session -p "<aufgabe>"` | getrennt | kurze, klar abgegrenzte Aufgaben mit Rueckgabe als Text ("Subagent light") |
| C. Fork der laufenden Session | `pi --fork <session-id> -n "variante-b"` | Kopie des Stands | "Was waere, wenn wir es anders loesen" |
| D. Subagenten-Extension | Beispiel `examples/extensions/subagent/` nach `~/.pi/agent/extensions/` | getrennt, Tool-Aufruf | automatische Ketten (scout → planner → worker), spaeter |

Variante B ist praktisch identisch zu D, nur ohne Extension und ohne Workflow-Vorlagen. Bei B **muss**
`--no-session` mitgegeben werden, weil das bash-Tool `PI_SESSION_FILE` und `PI_SESSION_ID` an das Kind
vererbt.

Interaktiv (ohne `-p`) geht aus dem bash-Tool heraus nicht – dafuer fehlt das TTY. Variante A muss daher
vom Windows-Host aus gestartet werden.

## Verbindliche Regeln fuer den Parallelbetrieb

1. **Git nur von einer Instanz.** `git add .`, Versionsbump in `package.json` und Push (`sgc`) laufen
   ausschliesslich in der Hauptinstanz. Grund: `.git/index.lock` und widersprechende Versionsnummern.
2. **Datei-Eigentum statt gemeinsamer Bearbeitung.** Pro Datei genau eine zustaendige Instanz. Vor der
   ersten Aenderung Anspruch in der Liste unten eintragen (Kurzform: `- [in Arbeit | instanz-b] <pfad>`).
3. **LightRAG nur von einer Instanz** beschreiben (`lightrag-backend/rag_storage`), sonst drohen
   inkonsistente Indizes.
4. **Kein zweiter Vite-Server.** Port 5173 ist belegt; HMR wirkt fuer alle Instanzen, da identisches
   Dateisystem.
5. **Sessions benennen** (`-n`), damit `/resume` die Instanzen auseinanderhalten kann.
6. **Projektregeln gelten je Instanz:** Deutsch, kein sz (immer "ss"), keine Emojis, Fragezeichen-Regel.

## Startbefehle

Zweite Instanz (Windows, neues CMD-Fenster):

```cmd
cd /d "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"
docker compose exec -it pi-agent pi -n "instanz-b"
```

Headless-Aufgabe aus dem Container:

```bash
pi --no-session -p "Aufgabe ..." --name instanz-b-task
```

## Konfliktstellen (Kurzuebersicht)

| Bereich | Risiko | Gegenmassnahme |
|---|---|---|
| `package.json`, `package-lock.json` | gleichzeitiger Versionsbump | nur Hauptinstanz |
| `.git/index.lock` | abgebrochene oder parallele Git-Laeufe | nur Hauptinstanz |
| Quellcode | stille Ueberschreibung ("letzter gewinnt") | Datei-Eigentum + Anspruchsliste |
| `lightrag-backend/rag_storage` | inkonsistente Indizes | nur eine Instanz |
| `~/.pi/agent/models-store.json`, `auth.json` | gleichzeitiges Schreiben | unkritisch, aber keine Vorteile |

Alternative waere ein `git worktree` je Instanz (getrennte Arbeitskopien). Bewertung: mehr Isolation fuer
Git-Operationen, aber doppeltes `node_modules`, abweichende `W:/`-Pfade fuer conT und damit Verstoss gegen
das SSoT-Prinzip aus `AGENTS.md`. Derzeit **nicht** empfohlen.

## Anspruchsliste (Arbeitsvorrat)

Wird in `../todo.md` gefuehrt. Format:

```
- [in Arbeit | <instanz>] <pfad oder thema> (seit YYYY-MM-DD)
```

## Schritte

- [ ] Benutzer entscheidet: wie viele Instanzen, welche Rollen, welche Variante (A bis D).
- [ ] Zweite Instanz starten und Gegenprobe: beide Sessions in `/resume` sichtbar, getrennte Session-Dateien.
- [ ] Gegenprobe Konflikt: eine Testdatei von beiden Instanzen schreiben, Verhalten dokumentieren.
- [ ] Regeln aus diesem File in `AGENTS.md` uebernehmen (Abschnitt "Mehr-Agenten-Betrieb"), falls beschlossen.
- [ ] Optional: Variante D installieren (Subagenten-Extension, Agenten `scout`/`planner`/`reviewer`/`worker`).

## Offene Fragen

- Zwei Instanzen (Haupt plus eine Rolle) oder drei?
- Rollenschnitt: nach Verzeichnis (`src/three`, `lightrag-backend`, `com/`), nach Aufgabe (Code / Doku /
  Tests) oder nach Phase (Planen / Umsetzen / Pruefen)?
- Eigene Anspruchsdatei `com/locks.md` oder Eintrag in `todo.md`? (Vorschlag: `todo.md`, solange nur zwei
  Instanzen laufen.)
- Braucht die zweite Instanz ein eigenes Modell (Kosten, Geschwindigkeit)?
- Sollen sich Instanzen gegenseitig Nachrichten hinterlassen? Kandidat waere ein Abschnitt in
  `com/bericht.md` oder eine gemeinsame Datei `com/instanzen.md`.

## Sicherheitshinweis

Subagenten und zweite Instanzen schreiben direkt in `/workspace`. Solange kein Schreibauftrag besteht,
sind Rollen mit eingeschraenktem Werkzeugsatz zu bevorzugen (`tools: read, grep, find, ls` in der
Agentendefinition).
