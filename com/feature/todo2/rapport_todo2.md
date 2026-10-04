# Feature-Rapport: Feature todo2 & Auftragssystem

> **Feature:** `todo2` (Next-Gen Task- & Auftragssystem)  
> **Beteiligte:** conT, piCon, dopi, Benutzer  
> **Stand:** 2026-09-29 | **Version:** 0.106.35  
> **Status:** Konzeption abgeschlossen / Abstimmung  
> **Dokumente:** Dashboard: [dashboard.md](file:///W:/com/feature/todo2/dashboard.md) & [dashboard.html](file:///W:/com/feature/todo2/dashboard.html) | Entwurf: [todo2.md](file:///W:/com/todo2.md)

---

## 1. Ausgangslage und Problemstellung

Die bisherige Aufgabenverwaltung und Harness-Koordination basierte auf zwei Saeulen:
1. Einer flachen Textdatei `com/todo.md`, die mit der Zeit zu einer unstrukturierten Mischung aus Historie, Erledigtem und offenen Stichpunkten wurde.
2. Dem **COM-Bus & Ping-System** (`tools/nodges-com.sh`, `tools/watch_com.ps1`, `tools/com-bus/events.log`), das ueber Dateisystem-Events Pings zwischen Windows (`conT`) und Linux-Container (`piCon`) vermitteln sollte.

### Reale Erfahrung aus der juengsten Praxis:
- **Pings starten keine Agenten:** Weder piCon (im Container) noch conT (in Antigravity) noch dopi starten autonom, nur weil eine Datei `ping-piCon.md` abgelegt wird. LLM-Agenten werden durch Benutzer-Prompts, geplante Runner oder explizite API-Aufrufe aktiviert – nicht durch Dateisystem-Signale, solange kein dauerhafter Hintergrund-Dienst laeuft, der aktiv API-Tokens verbraucht.
- **Overhead statt Mehrwert:** Der COM-Bus erforderte Watcher-Prozesse (Node.js im Container, PowerShell auf dem Host), PID-Management, Single-Instance-Checks, Autostart-Routinen in Docker-Compose und Event-Logs, bot aber im Alltag keinen echten Mehrwert gegenueber dem direkten Blick in eine geordnete Datei.
- **Informationsdefizit bei Arbeitsbeginn:** Wenn ein Agent (z.B. conT oder piCon) startet, braucht er keine Liste alter Pings, sondern eine glasklare Antwort auf die Frage: **"Wo genau soll jetzt weitergearbeitet werden, was ist meine Domaene, und was ist der aktuelle Zustand?"**

---

## 2. Das neue Architektur-Modell: `todo2`

Das System `todo2` loest diese Probleme durch ein hierarchisches, zustandsbasiertes Pull-Prinzip:

```
[com/todo2.md]  (Zentraler Themenbaum & globaler Status)
   |
   +---> 1. Thema: Workflow & Kommunikation
   |        +---> 1.1 Unterthema: Task-System
   |                 +---> Task A: [READY: conT]
   |                 +---> Task B: [REVIEW: User]
   |
   +---> 2. Thema: Wissensgraph & LightRAG
   |        +---> 2.1 Unterthema: Ingestion-Pipeline
   |                 +---> Detail-Link: [com/feature/build14/todo-feature.md]
   |
   +---> 3. Thema: Frontend & 3D-Canvas (conT)
   +---> 4. Thema: Test-Infrastruktur & Qualitaet
   +---> 5. Thema: Host & Docker (dopi)
```

### Die 3 Ebenen:
1. **Thema (Ebene 1):** Grobe Domaenen des Gesamtprojekts (Frontend/3D, Backend/LightRAG, Infrastruktur, Workflow, Qualitaet).
2. **Unterthema / Epic (Ebene 2):** Spezifische Handlungsstraenge oder Features (z.B. Build 14 Ingestion, 4-Kanal-Doktrin).
3. **Konkreter Task (Ebene 3):** Eindeutig zuzuordnende Arbeitsschritte mit standardisierten Status- und Zuweisungs-Tags.

---

## 3. Das dezentrale Detaillierungskonzept (`todo-feature.md`)

- **Problem frueher:** Grosse Vorhaben blaehten die globale `todo.md` auf.
- **Loesung `todo2`:** 
  - Die zentrale `todo2.md` bleibt uebersichtlich und fuehrt auf oberster Ebene nur die Kernschritte.
  - Wenn ein Feature umfangreich ist (z.B. `build14`), enthaelt der Feature-Ordner eine eigene `com/feature/<name>/todo-feature.md` (oder das bestehende `dashboard.md`).
  - In `todo2.md` wird direkt per Markdown-Link darauf verwiesen:  
    `Detail-Todo: [todo-feature.md](file:///W:/com/feature/<name>/todo-feature.md)`.
  - Dadurch ist das System vollkommen offen: Kleinere Aufgaben bleiben direkt in `todo2.md`, komplexe Vorhaben modularisieren sich selbst.

---

## 4. Das integrierte Auftragssystem (Dispatch-Tags)

Jeder Task in `todo2.md` oder in den Feature-Todos wird mit einem eindeutigen Zuweisungstag versehen:

| Tag | Bedeutung | Ausfuehrendes Harness |
|---|---|---|
| `[READY: conT]` | Aufgabe ist vollstaendig vorbereitet und liegt in der Frontend-/UI-/Canvas-Domaene | conT (Antigravity Windows) |
| `[READY: piCon]` | Aufgabe ist vorbereitet und betrifft Python, Backend, Ingestion, L1-Tests oder Linux-Tools | piCon (Docker-Container) |
| `[READY: dopi]` | Container-Erstellung, Host-Docker, Compose & Infrastruktur (Antigravity Host) | dopi (Antigravity Host Docker) |
| `[IN ARBEIT: <Harness>]` | Task wird aktuell aktiv von der jeweiligen Instanz bearbeitet | conT / piCon / dopi |
| `[BLOCKED: <Grund>]` | Blockiert durch externe Abhaengigkeit oder fehlende Vorarbeiten | - |
| `[REVIEW: User]` | Fertiggestellt, bedarf Begutachtung oder Freigabe des Benutzers | Benutzer (Banixx) |
| `[ERLEDIGT]` | Vollstaendig abgeschlossen und verifiziert | - |

**Vorteil beim Start:**
Wenn conT startet, sucht conT einfach nach `[READY: conT]`. Wenn piCon startet, greift er sich `[READY: piCon]`. Es gibt keine Uneinigkeit mehr ueber Zustaendigkeiten.

---

## 5. Rueckbau-Konzept fuer das COM-Ping-System

Da Pings keinen Startimpuls ausloesen koennen, stellt das aktuelle Ping-System unnoetigen Ballast dar.

### Empfohlene Rueckbau-Schritte:
1. **Schritt 1: Entkopplung der Agenten-Konfigurationen:**
   - Entfernen der Extension `/home/.pi/agent/extensions/nodges-com.ts` aus dem Container (kein Pruefen von `events.log` vor jedem Prompt).
2. **Schritt 2: Stilllegung der Watcher-Hintergrundprozesse:**
   - Entfernen des Autostarts des Node.js-Watchers (`tools/watch_com.mjs`) aus Container-Skripten (`start-lightrag.sh` / CMD).
   - Beenden von `tools/watch_com.ps1` auf dem Windows-Host.
3. **Schritt 3: Konsolidierung von `tools/com-bus/`:**
   - Das Verzeichnis `tools/com-bus/` (Logs, PIDs, `*.seen`-Marker) wird geloescht.
   - Die Skills `com` koennen archiviert oder auf eine einfache Datei-Inspektion reduziert werden.
4. **Schritt 4: Anpassung von `AGENTS.md`:**
   - Streichung von Abschnitt 7 (COM-Bus) und Aktualisierung von Abschnitt 5 & 6 auf das neue `todo2`-Auftragssystem.

---

## 6. Naechste Schritte und Benutzerentscheidung

1. Begutachtung des Entwurfs [todo2.md](file:///W:/com/todo2.md) durch den Benutzer.
2. Bei Freigabe:
   - Ersetzen von `com/todo.md` durch `com/todo2.md`.
   - Freigabe zur Durchfuehrung des Rueckbaus des Ping-Systems gemaess Abschnitt 5.
