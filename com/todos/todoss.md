# Aggregierter Aufgabenstand (todoss.md)

> **Status:** Aggregierter Stand aus `todo.md` und neuen Notizen aus Google Drive (`Mdt`).  
> **Aktualisiert:** 2026-10-11  
> **Hinweis:** Dies ist der aggregierte Arbeitsstand zur Abstimmung mit dem Benutzer vor Uebernahme in die Hauptmatrix `W:/com/todo.md`.

---

## 1. Neue Eingaenge aus Google Drive (Mdt-Notizen)

Die folgenden Aufgaben wurden ueber Markleaf (Mobile Drive) erfasst und korrigiert:

### 1.1 Grundfunktions-Branch fuer Nodges
- [ ] **[READY: conT]** Branch erstellen, der erlaubt, Nodges in seiner Grundfunktion anzuwenden und in einen gebrauchsfertigen Zustand zu bringen (Quelle: `Naechste Schritte planen Zustand.md`).

### 1.2 Dokumentation ueberarbeiten
- [ ] **[READY: conT / piCon]** Dokumentation pruefen und ueberarbeiten (Quelle: `Naechste Schritte Dokumentation.md`).

### 1.3 Live-Test Bild 14
- [ ] **[READY: conT]** Bild 14 in einer realen Einsatzumgebung testen (Quelle: `Bild 14 in Real testen.md`).

---

## 2. Bisherige Hauptaufgaben-Matrix (Basis: `todo.md`)

### 2.1 Thema: Workflow, Orchestrierung & Harness-Kommunikation
- [x] **[ERLEDIGT]** Analyse des bisherigen Ping-Systems und Ableitung der Ineffizienzen.
- [x] **[ERLEDIGT]** Entwurf von `todo2.md` als hierarchische Arbeitsbasis durch Benutzer freigegeben (Beschluss 2026-10-01).
- [x] **[ERLEDIGT]** Abloesung vollziehen: Bisherige `todo.md` nach `todo_archiv.md` verschoben und neues hierarchisches Auftragssystem etabliert.
- [x] **[ERLEDIGT]** Aktualisierung verbleibender Lese- und Skill-Referenzen in `W:/.agents/skills/` und `AGENTS.md`.
- [x] **[ERLEDIGT]** Entfernen der COM-Bus- und Waechter-Skripte (`watch_com.ps1`, `watch_com.mjs`, `nodges-com.*`, `sync_com.ps1`, `test-com.sh`, Verzeichnis `tools/com-bus/`).
- [x] **[ERLEDIGT]** Private Pi-Extension `nodges-com.ts` und `.bak` entfernt; aktuelle Setup- und Ablaufhinweise auf zustandsbasierte Koordination umgestellt.
- [x] **[ERLEDIGT]** Rueckbau des `com`-Skills unter `W:/.agents/skills/com/`.
- [x] **[ERLEDIGT]** Harmonisierung der Agenten-Instruktionen: Bestandsaufnahme und Berichte erstellt, `user.md` geloescht.
- [ ] **[BLOCKED: Freigabe User]** Soll-Konzept: schlanke `W:/AGENTS.md`, Bereinigung von `Nodges_Pi/AGENTS.md`; Umsetzung erst nach Freigabe.

### 2.2 Thema: Wissensgraph & LightRAG (Backend & Ingestion)
- [x] **[ERLEDIGT]** Semantisches Absatz-Chunking, Dokumenten-Endpunkte mit 36 Pytests abgesichert.
- [x] **[ERLEDIGT]** PDF-/Text-Ingestion gegen zu grosse Requests validiert (50 MB Grenze, HTTP 413).
- [x] **[ERLEDIGT]** LightRAG-Deduplizierung geprueft und synthetische Quellpfade implementiert.
- [x] **[ERLEDIGT]** BFS-basierte Subgraph-Extraktion ueber `get_knowledge_graph` statt Vollgraph-Slicing.
- [x] **[ERLEDIGT]** Dynamisches Nachladen von Nachbarschaftsebenen bei Klick auf Grenz-Knoten implementiert.

### 2.3 Thema: Frontend, 3D-Canvas & UI-Interaktion
- [x] **[ERLEDIGT]** 4-Kanal-Konzept als Standard-Preset im Simple-Mode abgestimmt.
- [x] **[ERLEDIGT]** On-Demand-Schriftanzeige (LOD / Distanz-Fading) im Three.js Render-Loop implementiert.
- [x] **[ERLEDIGT]** Edge- & Node-Inspector in `src/ui/InfoPanelUI.ts` umgesetzt.
- [x] **[ERLEDIGT]** Kontextmenue modular ausgebaut.

### 2.4 Thema: Test-Infrastruktur & Qualitaetssicherung
- [x] **[ERLEDIGT]** Test-Entkopplung (`test:fast` vs `test:all`), Knip 0 ungenutzte Dateien.
- [x] **[ERLEDIGT]** E2E-Tests fuer Dokumenten-Upload und Kontextmenue.
- [x] **[ERLEDIGT]** `.gitignore` bereinigt.
- [x] **[ERLEDIGT]** Madge Zykluspruefung: 0 Zyklen, Typecheck fehlerfrei.

### 2.5 Thema: Host-Infrastruktur & Docker
- [x] **[ERLEDIGT]** Port-Konflikte geprueft, Docker-Healthcheck standardisiert.
- [x] **[ERLEDIGT]** Live-Verifikation Container-Lifecycle erfolgreich.
- [x] **[ERLEDIGT]** Pi-Agent Update auf Version 1.1.0 abgeschlossen.
