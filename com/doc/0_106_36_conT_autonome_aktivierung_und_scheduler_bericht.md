# Automatische Aktivierung und Polling-Scheduler fuer conT (Antigravity)

**Datum:** 2026-10-01  
**Harness:** conT (Antigravity, Windows 11)  
**Ziel:** Autonome Aktivierung von conT bei eingehenden COM-Bus-Pings und Dateiaenderungen durch piCon.

---

## 1. Ausgangslage und Problemstellung

Im Multi-Harness-Setup kommunizieren **conT** (Antigravity auf Windows Host) und **piCon** (Pi-Agent im Linux-Container) ueber das gemeinsame Dateisystem (`W:/com/` bzw. `/workspace/com/`) und den COM-Bus (`tools/com-bus/events.log`).

- **piCon (Container):** Nutzt eine Pi-Agent-Erweiterung (`nodges-com.ts`) mit dem Lebenszyklus-Hook `before_agent_start`. Bei jeder Benutzerinteraktion oder jedem Agent-Zyklus wird `events.log` geprueft und Neuigkeiten werden automatisch in den Kontext eingespeist.
- **conT (Antigravity):** Besitzt als LLM-Agent keine native Betriebssystem-Interrupt-Schnittstelle. Der Windows-Waechter ([W:/tools/watch_com.ps1](file:///W:/tools/watch_com.ps1)) laeuft zwar als Hintergrundprozess und registriert Datei-Aenderungen sowie `ping-conT.md` zuverlaessig in `events.log`. Er kann jedoch von sich aus das Antigravity-Modell nicht aufwecken. Ohne Trigger bleibt conT im Leerlauf, bis der Benutzer eine Nachricht sendet.

---

## 2. Loesungsansatz: Autonomer Cron-Scheduler (`schedule`)

Antigravity verfuegt ueber ein integriertes Scheduling-System (`schedule`), das Hintergrund-Timer und wiederkehrende Cron-Jobs verwaltet. Wenn ein Cron-Job feuert, sendet das System eine Benachrichtigung mit hoher Prioritaet an den Agenten. Dies weckt das Modell vollautomatisch auf.

### Konfiguration des Schedulers:
- **Cron-Intervall:** `*/2 * * * *` (alle 2 Minuten) oder `*/5 * * * *` (alle 5 Minuten).
- **Modus:** `IsDaemon = false` (haelt die Arbeitssitzung aktiv und laeuft im Hintergrund).
- **Aktion beim Aufwachen:**
  1. Ausfuehren von `cmd.exe /c "tools\nodges-com.cmd read"`.
  2. Pruefen, ob ein neuer PING oder eine relevante Dateiaenderung vorliegt.
  3. **Falls kein neuer Ping:** Sofortiges, stilles Beenden des Turns (kein unnoetiges Token-Verschwenden).
  4. **Falls Ping oder Aufgabe vorliegt:** Direkte Bearbeitung der anstehenden Domaenenaufgabe (z.B. Frontend, Tests, Dokumentation) und optionale Rueckmeldung an piCon.

---

## 3. Umsetzung und Einrichtung

Der Scheduler wird ueber das Antigravity-Werkzeug `schedule` mit folgendem Profil aktiviert:

```json
{
  "CronExpression": "*/2 * * * *",
  "Prompt": "COM-Bus Heartbeat: Fuehre 'cmd.exe /c tools\\nodges-com.cmd read' aus. Wenn neue Pings oder Aufgaben fuer conT vorliegen, bearbeite sie; andernfalls beende den Turn ohne weitere Aktion.",
  "IsDaemon": false,
  "toolAction": "Scheduler einrichten",
  "toolSummary": "COM-Bus Polling Cron aktivieren"
}
```

---

## 4. Aktueller Status des COM-Busses (Stand 2026-10-01 09:49)

Beim Einlesen des Busses wurden folgende Pings und Aktualisierungen von piCon synchronisiert:
- **09:33:09:** Bereinigung von Farbvorlieben und Erklaerungs-Triggern in `AGENTS.md` durch piCon abgeschlossen.
- **09:38:58:** Uebersicht ueber noch offene Aufgaben fuer conT:
  1. Pruefen der Git-Hooks auf Windows-Seite.
  2. Optionale Werkzeuge erwaegen (`stats.js`, `vitest bench`, etc.).
  3. Abgleich von `vision_104.md` mit `com/ideen.md`.
- **09:44:01:** Archivierung von `todo.md` nach `com/todo_archiv.md` und Neuerstellung der schlanken `com/todo.md`.

---

## 5. Fazit und Nutzen

Durch den Einsatz des internen Cron-Schedulers wird die Luecke zwischen dem passiven Windows-Waechter und der Modell-Aktivierung geschlossen. conT agiert nun als reaktionsfaehiger Partner im Multi-Harness-Betrieb, ohne dass der Benutzer manuell als Vermittler taetig werden muss.
