---
name: com
description: COM-Bus fuer conT — Ereignisse in com/ lesen, Status pruefen, Pings an piCon senden. Standard vor jedem groesseren Schritt im Projekt Nodges.
---

# COM-Bus (conT / Windows 11)

Der Waechter (`tools/watch_com.ps1`) traegt jede Aenderung in `com/` in `tools/com-bus/events.log` ein.
Fuer conT auf Windows steht die native Fernbedienung bereit:

```powershell
.\tools\nodges-com.ps1 status               # Status: laeuft der Waechter, wie viele ungelesene Ereignisse fuer conT
.\tools\nodges-com.ps1 read                 # Neue Ereignisse anzeigen und als gelesen markieren (-Peek laesst Zaehler)
.\tools\nodges-com.ps1 ack                  # Nur Zaehler weiterdrehen (conT.seen), nichts anzeigen
.\tools\nodges-com.ps1 ping piCon "Text"    # Weckruf an piCon ablegen
.\tools\nodges-com.ps1 watch                # Live-Mitschrift (Abbruch mit Strg+C)
.\tools\nodges-com.ps1 start                # Waechter im Hintergrund starten
.\tools\nodges-com.ps1 stop                 # Waechter anhalten
```

Alternativ via CMD: `tools\nodges-com.cmd status|read|ack|ping|watch`

Regeln:
- Wer Dateien in `com/` ablegt, die fuer piCon wichtig sind, setzt zusaetzlich einen Ping.
- Gehen Pings von piCon ein, gilt: zuerst lesen, dann weiterarbeiten.
- Details in `AGENTS.md` Abschnitt 7.
