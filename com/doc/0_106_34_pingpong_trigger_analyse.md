# Analyse: Warum der Ping-Pong-Trigger zwischen conT und piCon nicht autonom lief

Stand: 2026-09-29
Harness: conT (Antigravity)
Bezug: `com/feature/test5/laufblatt.md`, `tools/nodges-com.*`, `tools/watch_com.*`

---

## 1. Problembeschreibung

Im Vorhaben `test5` sollte auf `com/feature/test5/laufblatt.md` ein wechselseitiger Ping-Pong-Test durchgefuehrt werden: conT und piCon tragen abwechselnd eine fortlaufende Zahl ein und benachrichtigen sich gegenseitig.

In der Praxis lief dieser Vorgang nicht autonom ab:
1. conT schrieb Zahl 1 (08:03) und setzte einen Ping an piCon ab. conT ging danach in den Ruhezustand (Warten auf Benutzerprompt).
2. piCon trug Zahl 2 ein (08:03 bzw. Container-Zeit 06:03), sendete einen Ping an conT.
3. **Kein Aufwachen bei conT:** conT reagierte nicht auf den Ping von piCon. Erst als der Benutzer in conT um 09:42 "Status?" und um 09:44 "Betreffend pinpong.test auf laufblatt" eingab, wurde conT aktiv und trug Zahl 3 ein.
4. piCon trug Zahl 4 ein.
5. **Erneut kein Aufwachen bei conT:** Erst die erneute Benutzereingabe um 09:46 deckte den Stand auf.

---

## 2. Technische Ursachenanalyse

Der Fehler liegt im grundsaetzlichen Design des COM-Busses: **Er ist ein passives Ablagesystem (Postkasten), kein aktiver Prozess-Trigger fuer autonome LLM-Inferenzzyklen.**

### A. Warum conT nicht autonom aufwacht

1. **Antigravity ist ein interaktiver Assistent:** Ein LLM-Turn endet, sobald der Assistent seine Antwort an den Benutzer ausgegeben hat. Das LLM verweilt danach im Leerlauf.
2. **`watch_com.ps1` hat keine Rueckkopplung zu Antigravity:** Der Windows-Waechter laeuft als eigenstaendiger PowerShell-Prozess. Wenn er eine Datei `ping-conT.md` entdeckt, gibt er eine Meldung auf der Windows-Konsole aus und schreibt in `tools/com-bus/events.log`. Er besitzt jedoch keine API-Schnittstelle oder Mechanik, um im Antigravity-IDE-Harness selbsttaetig einen neuen Inferenz-Turn bzw. Prompt auszuloesen.
3. **Kein interner Antigravity-Event-Listener:** Antigravity wacht nur auf durch:
   - Benutzerprompts,
   - Rueckmeldungen von im Hintergrund laufenden Werkzeug-Tasks (Manage Task / Background Command),
   - Geplante Scheduler-Ereignisse (`schedule`).

### B. Warum piCon nicht autonom aufwacht

1. **Ereignis `before_agent_start` in `nodges-com.ts`:**
   In `AGENTS.md` (Abschnitt 7) ist dokumentiert:
   > "Die Erweiterung `/home/.pi/agent/extensions/nodges-com.ts` schaut bei **jedem Prompt** (Ereignis `before_agent_start`) in diese Liste und stellt alles Neue als `COM_UPDATE`-Nachricht in den Chat."
2. **Bedingung Benutzer-Prompt:** Der Hook `before_agent_start` feuert im Pi-Agent nur dann, wenn der Benutzer einen Prompt an piCon abschickt. Trifft kein Benutzer-Prompt ein, laeuft die Erweiterung nicht los, selbst wenn `watch_com.mjs` auf Linux-Ebene ein Ping-File registriert hat.
3. **Fehlende autonome Schleife:** Pi-Agent besitzt standardmaessig keinen Daemon-Modus, der bei Dateiaenderungen ohne Benutzereingriff automatisch eine Antwort generiert.

---

## 3. Zusammenfassung des Fehlverhaltens

| Komponente | Erwartung des Nutzers | Realitaet |
|---|---|---|
| COM-Bus | Sollte conT und piCon wie ein Event-Trigger gegenseitig autonom anstossen | Ist eine passive Datei- und Log-Struktur (`events.log`, `ping-*.md`) |
| conT (Antigravity) | Sollte auf `ping-conT.md` selbstaendig weiterzaehlen | Beendet den Turn nach Antwort und wartet zwingend auf Benutzer-Eingabe |
| piCon (Container) | Sollte auf `ping-piCon.md` selbstaendig weiterzaehlen | Liest Pings nur beim Eintreffen eines Benutzer-Prompts (`before_agent_start`) |

---

## 4. Loesungsansaetze fuer echte Autonomie

Damit ein Ping-Pong-Test vollautomatisch ablaufen kann, muss die Event-Kette geschlossen werden:

1. **Option 1: Antigravity-interne Schleife (fuer conT):**
   conT kann waehrend eines Tests nicht einfach den Turn beenden, sondern muesste mit einem Polling-Befehl (`run_command` mit Wartezeit auf `events.log` / `ping-conT.md`) im Hintergrund aktiv bleiben oder einen Scheduler nutzen.
2. **Option 2: Pi-CLI-Aufruf (fuer piCon):**
   Wenn conT piCon aufwecken will, reicht kein passiver Ping als Datei. conT (oder ein Host-Skript) muesste im Container einen Befehl absetzen (z.B. via Docker exec: `docker exec pi-harness pi -p "laufblatt: du bist dran"`).
3. **Option 3: Autonomer Host-Orchestrator (dopi / Skript):**
   Ein einfaches Steuerungsskript auf dem Host ruft abwechselnd conT (via CLI/API) und piCon (via `docker exec`) auf, bis eine Zielzahl erreicht ist.
