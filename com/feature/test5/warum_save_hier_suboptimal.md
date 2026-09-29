# Warum `save` in diesem Ping-Pong-Test suboptimal ist

Stand: 2026-09-29 · Harness: piCon · Version: 0.106.34
Bezug: `com/feature/test5/laufblatt.md`, `tools/nodges-git.sh` (Befehl `save`)

## Kurzfassung

`save` ist fuer **abgeschlossene** Arbeitsschritte gebaut. Der Ping-Pong-Test ist das Gegenteil:
zwei Harnesses schreiben im Sekundentakt in **dieselbe geteilte Arbeitskopie**.
`save` wuerde bei jedem Zug die halbe, noch laufende Arbeit der Gegenseite mit einsammeln
und eine neue Patch-Version erzeugen. Nutzen: null. Risiko: gemischte Commits, Versionsinflation,
verlorene oder zerkleinerte Schreibvorgaenge.

## Was `save` technisch tut

Aus `tools/nodges-git.sh`, Abschnitt `save` (Zeilen 121-143):

1. prueft Branch (`main`) und dass kein Git-Vorgang laeuft,
2. bricht ab, wenn der Arbeitsbaum sauber ist,
3. zeigt `git status --short` (Beschluss 2026-09-27, Schutz vor unabsichtlichem Staging),
4. erhoeht die Patch-Version in `package.json` und `package-lock.json`,
5. `git add -A` — **alles**, nicht nur die eigenen Dateien,
6. Commit mit der reinen Versionsnummer plus Trailer `Harness: piCon`,
7. kein Push; Typecheck und Tests laufen hier **nicht** (die gibt es erst in `release`/`major`).

Der kritische Punkt ist Nummer 5. `git add -A` ist bewusst so gewaehlt, damit conT und piCon
ihre gemeinsame Arbeitskopie in einem Zug sichern koennen. Bei sequenzieller Arbeit ist das
richtig. Bei gleichzeitiger Arbeit ist es die Fehlerquelle.

## Warum das hier konkret schadet

**1. Geteilte Arbeitskopie, kein Lock.** conT (ueber `W:/`) und piCon (ueber `/workspace`)
zeigen auf dieselben ext4-Inodes. Zwischen `git status --short` und `git commit` liegt ein
Zeitfenster, in dem die Gegenseite weiter in die Datei schreibt. Es gibt keine Sperre und
soll auch keine geben. Ergebnis: Im Commit landet ein Zustand, den zum Zeitpunkt der
Pruefung niemand gesehen hat.

**2. Fremde Zwischenstaende im eigenen Commit.** `git add -A` nimmt jede offene Datei mit,
auch `src/` (conT) oder `lightrag-backend/` (piCon), obwohl der Commit `Harness: piCon`
traegt. Die Zuordnung wird damit inhaltlich falsch. Der Bericht zum letzten `save`
(`0.106.33`) zeigt genau das: Er sicherte nebenbei `com/txt/000_NODGES_KERN_00_BIS_11.txt`
und `tools/create_000_txt.mjs` mit, die thematisch nichts mit der AGENTS.md-Bereinigung zu tun hatten.

**3. Der Ping-Pong-Test braucht gar keine Version.** `com/` ist fuer beide Harnesses
unmittelbar sichtbar; es gibt nichts zu synchronisieren. GitHub ist per Beschluss
Meilenstein-Archiv, kein Zwischenspeicher. Fuer eine Zaehlzeile lohnt kein Commit.

**4. Versionsinflation.** Jede Zahl im Laufblatt wuerde `0.106.34 -> 0.106.35 -> ...` treiben.
Der Patch-Zaehler verliert seine Aussage ("wie viel fachliche Arbeit seit dem letzten
Meilenstein"), das Tag-Raster wird unruhig.

**5. Unlesbare Historie.** Die Commit-Nachricht ist nur die Versionsnummer. Aus
`git log --oneline` ist spaeter nicht erkennbar, in welchem Commit echte Arbeit steckte und
in welchem nur Testzeilen. Ein `release` muesste raten, wo der Meilenstein hingehoert.

**6. Unnoetige Hook-Laeufe.** `core.hooksPath = git-hooks`, der `pre-commit`-Hook laeuft bei
jedem Commit (Branch-Pruefung, Secret-Scan, Versionshinweis). Im Sekundentakt ist das
verschwendet, und ein Hook-Abbruch wuerde mitten im Testlauf blockieren.

**7. Schon passiert: Schreibkonflikt der harmlosen Art.** conTs Zeile 1 hatte kein
Zeilenende. Mein Anhaengen klebte zunaechst an, aus zwei Zeilen wurde
`... Naechste Zahl: 2.2: piCon ...`, und ich musste die Datei nachbessern. Kein Datenverlust,
aber genau das Muster, das bei parallelem `add -A` auch Commits erfassen kann.

## Wann `save` richtig ist

- Nach einem **abgeschlossenen** Arbeitsschritt oder Feature-Teil.
- Wenn der Arbeitsbaum **fachlich zusammenpasst** und keine halbfertige Gegenseite offen liegt.
- Vor einem geplanten `release`, damit der Meilenstein-Heap vollstaendig ist.

## Was in solchen Live-Tests besser passt

| Lage | Empfehlung |
|---|---|
| Schneller Ping-Pong, Minuten-Takt | **kein** `save`; Aenderungen einfach stehen lassen |
| Testlauf beendet, Ergebnis stabil | ein `save` fuer den ganzen Block ("Test5 abgeschlossen") |
| Dringender Zwischenstand noetig | `save` nur mit **gezieltem** Staging (`git add <pfad>`) statt `-A` |
| Beide Seiten schreiben laufend | vorher in `com/todo.md` oder per Ping abstimmen, wer wann sichert |

Der letzte Punkt deckt sich mit der neuen Grundhaltung in `AGENTS.md` (Abschnitt 6):
`save` ist die ausdruecklich vereinbarte Ausnahme von der Zurueckhaltung — aber erst, wenn
es einen fertigen Stand zu sichern gibt.

## Entschieden (2026-09-29)

Der Benutzer hat entschieden: **Die Versionierung ist sekundaer.** Dateien zu schreiben und liegen
zu lassen ist der Normalfall. Patch-Sicherungen (`save`) erfolgen nicht mehr automatisch nach jedem
Arbeitsschritt, sondern nur auf Anforderung oder am fachlichen Abschluss. Damit ist der Vorschlag
unten angenommen und in `AGENTS.md` (Abschnitt 3, Abschnitt 6) sowie im `save`-Skill verankert.
Eintrag in `com/entscheidungen.md`.

Der urspruengliche Vorschlag lautete: Patch-Sicherungen (`save`) erfolgen nicht in laufenden
Echtzeit-Tests, sondern an deren fachlichem Ende. Wer mitten im Test sichern muss, staged gezielt
seine eigenen Pfade und kuendigt es der Gegenseite per Ping an.
