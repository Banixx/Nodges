# Ergebnisbericht: 3-Runden Test Ping-Pong & Stabilisierung des COM-Busses

> **Version:** 0.106.31  
> **Datum:** 28. September 2026  
> **Autor / Harness:** conT (Host / Windows 11 / Antigravity)  
> **Partner:** piCon (Linux-Docker-Container `pi-harness`)  
> **Status:** Erfolgreich abgeschlossen & beidseitig verifiziert  

---

## 1. Ausgangslage & Zielsetzung

Im Vorhaben wurde ein 3-Runden-Test-Ping-Pong zwischen `conT` und `piCon` vereinbart.
Ablageort: [W:/com/feature/Protokollblatt.txt](file:///W:/com/feature/Protokollblatt.txt) (im Feature-Root ohne Multi-Harness-Unterordner).
Jede Zeile enthaelt die sekundengenaue Uhrzeit, das handelnde Harness und die ausgefuehrte Aktion.

---

## 2. Ablauf und Protokoll

Das vollstaendige Protokollblatt umfasst alle drei Runden:

```text
2026-09-28 15:33:07 | conT | Protokollblatt initialisiert, 3 Runden Ping-Pong Test gestartet. Runde 1 Ping an piCon gesendet.
2026-09-28 15:33:35 | piCon | Runde 1 empfangen und beantwortet. Autonomer Trigger und Ziel-Filter arbeiten korrekt. Ping an conT fuer Runde 2 abgesetzt.
2026-09-28 17:57:05 | conT | Runde 2 Pong von piCon verarbeitet. Waechter conT neu gestartet (PID 23104). Ping fuer Runde 2 an piCon gesendet.
2026-09-28 17:57:41 | piCon | Runde 2 gegengezeichnet. Waechter-Neustart conT (PID 23104) quittiert. Runde 3 eingeleitet, Ping an conT abgesetzt.
2026-09-28 18:35:25 | conT | Runde 3 Pong von piCon erhalten. PID-Erkennung in nodges-com.ps1 und watch_com.ps1 robust repariert (PID 27752). 3 Runden Ping-Pong Test erfolgreich abgeschlossen.
2026-09-28 18:36:17 | piCon | 3-Runden-Test bestaetigt und abgeschlossen. PID-Erkennung (nodges-com-watch-windows.pid) in nodges-com.ps1/watch_com.ps1 geprueft, keine Fehler. Beide Waechter stabil.
```

---

## 3. Technische Befunde & Reparaturen

1. **Zeitzone Container-Waechter (piCon):**
   - Beim ersten Durchlauf lief der Container-Waechter (`watch_com.mjs`) noch mit UTC-Zeitstempel.
   - piCon hat den Waechter neu gestartet, sodass ab 15:33:54 einheitlich in Europe/Berlin protokolliert wird.

2. **PID- und Prozess-Erkennung auf Host (conT):**
   - Beim Status-Check und Single-Instance-Check von `watch_com.ps1` und `nodges-com.ps1` traten bei CIM-Abfragen Pipeline-Syntaxfehler auf (`.CommandLine: The term ... is not recognized`), was zu Haengern fuehren konnte.
   - Die Erkennung wurde auf ein dateibasiertes PID-Verfahren (`tools/com-bus/nodges-com-watch-windows.pid`) umgestellt.
   - Der conT-Waechter laeuft nun sauber und stabil im Hintergrund.

---

## 4. Fazit

Der COM-Bus ist in beide Richtungen autonom funktionsfaehig. Die Signalisierung, Quittierung und Zeitstempel-Harmonisierung sind vollstaendig hergestellt.
