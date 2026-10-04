# Dashboard: Feature todo2 (Multi-Harness)

> **Projekt:** Feature todo2 & Auftragssystem | **Harness:** Multi-Harness (conT / piCon / dopi) | **Stand:** 2026-09-29 | **Status:** IN ARBEIT  
> **Ablagepfad:** `W:/com/feature/todo2/dashboard.md` | **HTML-Ansicht:** [dashboard.html](file:///W:/com/feature/todo2/dashboard.html)

---

## 1. Name & Beschreibung

| Attribut | Spezifikation |
|---|---|
| **Projektname** | **Feature todo2 (Next-Gen Task- & Auftragssystem)** |
| **Betriebsmodus** | **Multi-Harness (conT, piCon, dopi)** |
| **Kategorie** | Workflow, Task-Management, Systembereinigung & Entkopplung |
| **Beschreibung** | Abloesung der alten Flach-Todo und Rueckbau des ineffektiven Ping-Systems zugunsten einer hierarchischen, dezentral verlinkten Aufgabenstruktur (Themen, Unterthemen, konkrete Tasks) mit klarer Uebergabemechanik zwischen den Harnesses. |
| **Arbeitsverzeichnis** | [W:/com/feature/todo2/](file:///W:/com/feature/todo2/) |

---

## 2. Ziele

- **[Z-01]** Konzept & Entwurf fuer `todo2.md` als hierarchische Arbeitsbasis (Themen, Unterthemen, konkrete Tasks).
- **[Z-02]** Integration mit den Feature-Ordnern (`com/feature/<name>/todo-feature.md` bzw. `dashboard.md`), sodass Details dort liegen, wo gearbeitet wird.
- **[Z-03]** Analyse und Rueckbau-Empfehlung fuer das aktuelle Ping-System (Dateibeobachter/Pings ohne aktive Agenten-Initialisierung erzeugen Overhead statt Handlungsfaehigkeit).
- **[Z-04]** Etablierung eines zustandsbasierten Auftragssystems (Ready for conT / Ready for piCon / Blocked / Review), das beim Start jedes Harnesses sofort Orientierung gibt.
- **[Z-05]** Vorbereitung des nahtlosen Wechsels von `todo.md` auf `todo2.md` ohne Informationsverlust.

---

## 3. Fortschritt & Meilensteine

| Meilenstein / Bereich | Pruef- / Arbeitsschritt | Fokus | Status | Fortschritt |
|---|---|---|---|---|
| **M1: Analyse & Konzept** | Ist-Zustand Ping-System vs. Bedarf | Diagnose & Neukonzeption | **[ERLEDIGT]** | `[====================] 100%` |
| **M2: Entwurf todo2.md** | Hierarchische Struktur & Syntax | Themes -> Epics -> Tasks | **[ERLEDIGT]** | `[====================] 100%` |
| **M3: Auftragssystem** | Zuweisungs- und Uebergabemodell | Status-Tags & Domaenen | **[ERLEDIGT]** | `[====================] 100%` |
| **M4: Rueckbauplan Ping** | Verschlankung Bus / Waechter | Ressourcen & Prozessentlastung | **[ERLEDIGT]** | `[====================] 100%` |
| **M5: Dokumentation** | Ergebnisbericht & Dashboard | Multi-Harness Dokumentation | **[ERLEDIGT]** | `[====================] 100%` |

**Gesamtfortschritt Projekt:** **100%** (Konzeptionelle Phase abgeschlossen)

---

## 4. Status & Naechste Schritte

- **Aktueller Status:** Entwurf durch Benutzer freigegeben (2026-10-01). `todo2.md` hat die alte `todo.md` abgeloest (archiviert als `todo_archiv.md`).
- **Naechste Aktionen:**
  - Rueckbau des Ping-Watchers gemaess Beschluss (piCon Container, conT Host, dopi Compose).
  - Pflege der Aufgaben fortan direkt in [todo.md](file:///W:/com/todo.md).
- **Verknuepfte Dokumente:**
  - Aktive Aufgabenmatrix: [todo.md](file:///W:/com/todo.md)
  - Detail-Rapport: [rapport_todo2.md](file:///W:/com/feature/todo2/rapport_todo2.md)
  - HTML-Dashboard: [dashboard.html](file:///W:/com/feature/todo2/dashboard.html)
  - Ergebnisbericht: [0_106_35_todo2_konzept_und_auftragssystem_bericht.md](file:///W:/com/doc/0_106_35_todo2_konzept_und_auftragssystem_bericht.md)
