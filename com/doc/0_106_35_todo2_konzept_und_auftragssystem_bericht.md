# Ergebnisbericht: Neukonzeption Task- und Auftragssystem (Feature todo2)

> **Datum:** 2026-09-29  
> **Version:** 0.106.35  
> **Autor / Harness:** conT (Antigravity Windows 11)  
> **Geltungsbereich:** Multi-Harness (conT, piCon, dopi)  
> **Referenzdokumente:** [com/todo2.md](file:///W:/com/todo2.md), [com/feature/todo2/dashboard.md](file:///W:/com/feature/todo2/dashboard.md), [com/feature/todo2/dashboard.html](file:///W:/com/feature/todo2/dashboard.html), [com/feature/todo2/rapport_todo2.md](file:///W:/com/feature/todo2/rapport_todo2.md)

---

## 1. Zusammenfassung

Gemaess Benutzeranforderung wurde das Task-Management grundlegend neu konzipiert. Die bisherige Praxis, Agenten ueber Datei-Pings wecken zu wollen, hat sich in der Praxis als wirkungslos erwiesen, da LLM-Harnesses wie piCon oder conT nicht durch Dateisystem-Events autonom hochfahren oder reagieren. Stattdessen benoetigen die Agenten beim Start eine praezise, modulare und hierarchische Uebersicht darueber, wo weitergearbeitet werden soll.

Hierfuer wurde das neue Feature **`todo2`** etabliert, der Entwurf [W:/com/todo2.md](file:///W:/com/todo2.md) erstellt, das dezentrale Auftragsmodell definiert sowie ein Rueckbauplan fuer das COM-Ping-System formuliert.

---

## 2. Kernarchitektur von todo2

Das System stuetzt sich auf drei Saeulen:

1. **Dreistufiger hierarchischer Aufbau (`todo2.md`):**
   - **Thema (Ebene 1):** Domaenen wie Workflow, Wissensgraph/LightRAG, Frontend/Canvas, Qualitaetssicherung, Host-Infrastruktur.
   - **Unterthema (Ebene 2):** Konkrete Arbeitspakete oder Epics (z.B. Ingestion-Pipeline, 4-Kanal-Doktrin).
   - **Task (Ebene 3):** Spezifische, abgrenzbare Einzelschritte.

2. **Dezentrale Detaillierung (`todo-feature.md`):**
   - Grosse Vorhaben blaehen nicht mehr die zentrale Taskliste auf.
   - Detailaufgaben verbleiben in `W:/com/feature/<name>/todo-feature.md` bzw. im dortigen Dashboard und werden in `todo2.md` sauber verlinkt.

3. **Status- und Zuweisungstags (Auftragssystem):**
   - Jedes Harness erkennt beim Lesen sofort seine offenen Aufgaben anhand standardisierter Tags:
     - `[READY: conT]`
     - `[READY: piCon]`
     - `[READY: dopi]`
     - `[IN ARBEIT: <Harness>]`
     - `[BLOCKED: <Grund>]`
     - `[REVIEW: User]`
     - `[ERLEDIGT]`

---

## 3. Rueckbau-Konzept fuer das COM-Ping-System

Das bisherige Ping-System (Dateibeobachter `watch_com.*`, `events.log`, `ping-*.md`) erzeugt Systemlast und Koordinationskomplexitaet ohne operativen Nutzen. Es wird vorgeschlagen, das System wie folgt zurueckzubauen:
- Deaktivierung der COM-Bus-Erweiterung in der Pi-Agent-Umgebung.
- Entfernen der Watcher-Prozesse (Node.js im Container, PowerShell auf dem Host).
- Bereinigung von `tools/com-bus/` und Streichung von Abschnitt 7 in `AGENTS.md`.
- Reduzierung der Kommunikation auf die gemeinsame, synchronisierte Aktenlage in `W:/com/`.

---

## 4. Status und naechste Schritte

- Entwurf [todo2.md](file:///W:/com/todo2.md) ist vollstaendig ausgearbeitet.
- Feature-Ordner [W:/com/feature/todo2/](file:///W:/com/feature/todo2/) mit One-Page Dashboard und Rapport ist eingerichtet.
- Nach Rueckmeldung des Benutzers kann `todo2.md` als offizielle `todo.md` uebernommen und der Ping-Rueckbau eingeleitet werden.
