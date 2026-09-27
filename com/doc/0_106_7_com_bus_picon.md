# Der COM-Bus — wie conT und piCon sich gegenseitig wecken (Version 0.106.7)

## Warum das noetig ist

conT (Antigravity, Windows) und piCon (Pi-Agent, Linux-Container) schreiben beide in denselben Ordner
`com/`. Bislang hat die Gegenseite davon nichts gemerkt, solange niemand nachgesehen hat. Ein Auftrag
oder eine Rueckfrage im Chatfenster des einen Harnesses blieb fuer das andere unsichtbar.

Jetzt gibt es dafuer einen Bus (Sammelschiene): Ein Waechter (Dateibeobachter) auf jeder Seite merkt
jede Aenderung in `com/` und traegt sie in eine gemeinsame Liste ein. Beim naechsten Prompt liest
piCon diese Liste automatisch.

## Die drei Teile der piCon-Seite

| Teil | Datei | Aufgabe |
|---|---|---|
| Waechter | `tools/watch_com.mjs` | Merkt Aenderungen in `com/` und schreibt sie in `tools/com-bus/events.log` |
| Fernbedienung | `tools/nodges-com.sh` | Start, Stop, Stand, Lesen, Ping |
| Wecker | `/home/.pi/agent/extensions/nodges-com.ts` | Meldet Neues bei jedem Prompt direkt im Chat |

Die conT-Seite macht das Gleiche mit `W:/tools/watch_com.ps1` (PowerShell, `FileSystemWatcher`).

### Wie der Waechter arbeitet

Im Container sind keine `inotify-tools` installiert (`inotifywait` fehlt), und auch kein `cron`.
Darum uebernimmt Node die Arbeit: `fs.watch(..., { recursive: true })` nutzt dieselbe
Benachrichtigungsfunktion des Linux-Kernels. Schlaegt das fehl, wechselt das Skript selbsttaetig auf
kurzes Abfragen (Standardwert 1500 ms) — langsamere Ersatzspur, damit nie etwas verloren geht.

Nicht gemeldet werden: temporaere Kruessel von Editoren (`~`, `.tmp`, `.swp`, `.bak`, `.orig`),
versteckte Hilfsdateien und alles im Bus ausser gezielten Pings. Auch das eigene Protokoll meldet sich
nicht selbst zurueck — das war die eine Stolperfalle beim Bau.

Dieselbe Datei wird innerhalb von 500 ms nur einmal gemeldet, damit nicht jede Speicherwelle zu einer
Meldungslawine wird.

### Format der Liste

`tools/com-bus/events.log`, eine Zeile je Ereignis:

```
# --- Waechter piCon gestartet 2026-09-27 06:04:49 (PID 409)
2026-09-27 06:03:09  erstellt   com/watchprobe.txt   (6 B)
2026-09-27 06:03:11  geandert   com/watchprobe.txt   (11 B)
2026-09-27 06:03:13  verschoben com/watchprobe.txt   (weg)
2026-09-27 06:03:33  PING       ping-piCon.md        Bitte lies com/todo.md.
```

Arten: `erstellt`, `geandert`, `verschoben` (Datei umbenannt oder geloescht) und `PING`.
`tools/com-bus/piCon.seen` enthaelt die Zahl der bereits gemeldeten Zeilen.

## Bedienung

```bash
bash tools/nodges-com.sh status   # laeuft der Waechter? Was ist ungelesen?
bash tools/nodges-com.sh read     # Neues zeigen, danach als gelesen markieren
bash tools/nodges-com.sh ack      # nur Zaehler weiterdrehen
bash tools/nodges-com.sh watch    # live mitlesen (Abbruch mit Strg+C)
bash tools/nodges-com.sh ping conT "Bitte com/todo.md lesen"
bash tools/nodges-com.sh start    # nach einem Container-Neustart noetig
bash tools/nodges-com.sh stop
```

## Ping — die Klingel

Eine Datei in `com/` ist der Inhalt (Bleibendes, kommt ins Repo). Der Ping ist nur die Klingel
(fluechtig, `tools/com-bus/ping-<ziel>.md`). Ziel ist `conT`, `piCon` oder `all`.

Die Erweiterung liest den Inhalt der Ping-Datei und stellt ihn als eigenen, vorrangigen Block in den
Chat — Anweisungen stehen also wortwoertlich da, ohne dass erst eine Datei gelesen werden muss.

## Wichtige Randbedingungen

- **Nach jedem Container-Neustart laeuft der Waechter nicht mehr.** Erster Blick: `status`. Es gibt im
  Image keinen `cron`, einen Eintrag in die Container-Startbefehle (`postStartCommand`) waere der
  naechste Schritt, falls das stoert.
- **Der Bus liegt ausserhalb von `com/`** — unter `tools/com-bus/`. Das war der entscheidende
  Handgriff: Laegen Protokoll und Pings mitten in `com/`, haette sich das Protokoll beim Schreiben
  selbst wieder ein Ereignis ausgeloest. So bleibt `com/` sauber Inhalt, `tools/` ist Werkzeug.
  `tools/com-bus/` ist nicht versioniert (Ausnahme in `.gitignore`); alles andere in `com/` bleibt
  im Repo, wie in `AGENTS.md` Punkt 5 geregelt.
- Die Erweiterung liegt unter `/home/.pi/agent/extensions/`, also **privat im Agenten-Verzeichnis des
  eigenen Harnesses**, nicht im Repo. Sie wird beim Start von Pi geladen — diese Sitzung muss dazu neu
  gestartet oder mit `/reload` neu geladen werden.
- conT sieht Pings fuer `conT` nur, wenn dort der PowerShell-Waechter laeuft.

## Was noch fehlt (offen)

1. Automatischer Start des Linux-Waechters beim Container-Start.
2. Ein passendes Gegenstueck zu `nodges-com.sh` mit denselben Befehlen auf der Windows-Seite (conT).
3. Ob conT Pings von piCon verlaesslich bemerkt, muss im Zusammenspiel erprobt werden.
