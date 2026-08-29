# Diagnose: Absturz des shell/pi Dev-Containers

Version: 0.103.0
Datum: 2026-08-10

## Kurzfassung

- **Kein OOM / kein Ressourcen-Problem:** Der cgroup-Zähler `memory.events` meldet
  `oom 0` und `oom_kill 0`, `pids.events.max 0`. Es war ausreichend Speicher frei
  (~12 GB), Platte quasi leer (1 % belegt). Ein Kernel-/Memory-Crash ist damit
  ausgeschlossen.
- **Der Container selbst hat NICHT neu gebootet:** Bootzeit laut `/proc/stat`
  (`btime 1786344807`) = 06:53:27 UTC, Uptime ~88 Minuten zum Zeitpunkt der Analyse.
  Die vorherige pi-Session (07:36–08:18) lief innerhalb genau dieser einen Boot-Session.
- **Was passiert ist:** Der **pi-Agent-Prozess bzw. die Session wurde neu gestartet.**
  Die vorherige Session endete um 08:18:26 abrupt nach dem Tool-Aufruf
  `kill 49 48` (Beendigung des alten Vite-Servers). Um 08:20:45 begann eine neue Session.
- **GUI-/Browser-Komponenten fehlen:** Xvfb, Chrome, fluxbox, x11vnc und websockify
  laufen nicht. Die Ports 5900 (VNC), 6080 (noVNC) und 9222 (CDP) sind nicht offen.
  Die komplette Umgebung aus `.devcontainer/start-vnc.sh` ist also nicht aktiv.

## Befunde im Detail

| Prüfpunkt | Ergebnis |
|-----------|----------|
| `memory.events` (cgroup) | `oom 0`, `oom_kill 0` |
| `pids.events` | `max 0` |
| `MemAvailable` | ~13 GB frei |
| `/dev/shm` | 64 MB, 0 % belegt |
| Disk `/` | 1 % belegt |
| Bootzeit Container | 06:53:27 UTC (kein Neustart seit der Vor-Session) |
| Laufende Prozesse jetzt | pi (PID 20), `npm run dev`/vite (PID 33/44/45), esbuild (PID 57) |
| Vite | erreichbar auf Port 5173 (HTTP 200) |
| Xvfb / Chrome / VNC / noVNC | **nicht** aktiv (Ports 5900/6080/9222 zu) |

## Ablauf (aus der vorherigen Session rekonstruiert)

1. 07:36 Nutzer: "kannst du das projekt starten" – Vite lief bereits auf 5173.
2. 07:41 Frage nach API-Key (Key lag nur im browser-localStorage und geht bei
   Container-/Browserwechsel verloren).
3. 08:17 Nutzer: "openrouter" → es wurden `.env` und `.env.example` angelegt.
4. Danach Versuch, den Dev-Server mit `fuser -k 5173/tcp` + `nohup npm run dev`
   neu zu starten. Der Neustart scheiterte zunächst wegen "Port bereits belegt",
   der alte Vite-Prozess wurde anschliessend per `kill 49 48` beendet.
5. 08:18 Session-Endung, 08:20:45 neue Session → hier liegt der beobachtete "Absturz".

## Bewertung

- Ein Absturz im Sinne von Kernel/OOM/Reboot hat **nicht** stattgefunden.
- Der beobachtete "Absturz" entspricht einem **Neustart der pi-Agent-Session**
  (nicht des Containers). Das passiert z.B. bei einem Abbruch/Beenden des
  Agent-Prozesses während des Dev-Server-Umbaus.
- Die Browser/Monitoring-Umgebung (VNC/Chrome) ist derzeit nicht gestartet,
  was bei einem Neuaufsetzen des Containers zu erwarten ist (`start-vnc.sh`
  wurde nicht ausgefuehrt bzw. ist nicht aktiv).

## Auffaelligkeit / Folgehinweis

- Die angelegte `/workspace/.env` enthaelt nur einen **Platzhalter**
  (`VITE_OPENROUTER_API_KEY=sk-or-XXXX-HIER-DEINEN-KEY-EINFUEGEN`).
  Der tatsaechliche Key ist in der Umgebung als `OPENROUTER_API_KEY` vorhanden,
  aber nicht in `.env`. Fuer funktionierenden OpenRouter-Zugriff muss der echte
  Key dort eingetragen werden.
