---
name: com
description: COM-Bus beider Harnesses — Ereignisse in com/ lesen, Status pruefen, Pings setzen. Standard vor jedem groesseren Schritt im Projekt Nodges.
---

# COM-Bus (conT und piCon)

Der Waechter traegt jede Aenderung in `com/` in `tools/com-bus/events.log` ein (der Bus liegt
bewusst ausserhalb von `com/`). Die Pi-Erweiterung `nodges-com.ts` meldet Neues normalerweise
von selbst bei jedem Prompt; wer nachgucken will, nutzt die Fernbedienung.

**piCon (Linux-Container) — Waechter `tools/watch_com.mjs`:**

```bash
bash tools/nodges-com.sh status   # Stand: laeuft der Waechter, was ist ungelesen
bash tools/nodges-com.sh read     # Neues zeigen, danach als gelesen markieren (--peek laesst Zaehler)
bash tools/nodges-com.sh ack      # nur Zaehler weiterdrehen, nichts anzeigen
bash tools/nodges-com.sh ping conT "Text"   # Weckruf an das andere Harness
bash tools/nodges-com.sh watch    # live mitlesen (Abbruch mit Strg+C)
bash tools/nodges-com.sh start    # Waechter starten (nach Container-Neustart noetig)
bash tools/nodges-com.sh stop     # Waechter anhalten
```

**conT (Windows 11) — Waechter `tools/watch_com.ps1`:**

```powershell
.\tools\nodges-com.ps1 status
.\tools\nodges-com.ps1 read
.\tools\nodges-com.ps1 ack
.\tools\nodges-com.ps1 ping piCon "Text"
.\tools\nodges-com.ps1 watch
.\tools\nodges-com.ps1 start
.\tools\nodges-com.ps1 stop
```

Alternativ via CMD: `tools\nodges-com.cmd status|read|ack|ping|watch`

Regeln:

- Wer Dateien in `com/` ablegt, die fuer das andere Harness wichtig sind, setzt zusaetzlich einen Ping.
- Gehen Pings ein oder traegt das andere Harness etwas ein, gilt: zuerst lesen, dann weiterarbeiten.
- Genau beschrieben: `com/doc/0_106_7_com_bus_picon.md` und `AGENTS.md` Abschnitt 7.
