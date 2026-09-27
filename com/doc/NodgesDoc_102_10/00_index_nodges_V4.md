# Nodges – Projektdokumentation (Serie V4)

Index und Einstiegspunkt der technischen Dokumentation zu **Nodges**, einer webbasierten 3D-/4D-Netzwerkvisualisierung auf Basis von Three.js.

---

## Projektsteckbrief

| Attribut | Wert |
|----------|------|
| Projektname | Nodges |
| Beschreibung | Visualisiert Systeme als interaktive 3D-/4D-Netzwerke (explore, filter, explain) |
| Version | 0.103.1 |
| Arbeitsverzeichnis (Container) | `/workspace` |
| Gemountet auf (WSL) | `/home/unixusername/nodges` |
| Sprache | TypeScript 5.3.3 |
| Rendering | Three.js 0.161.0 |
| Build-Tool | Vite 5.1.4 |
| Tests | Vitest 1.6.1 |
| Datenschema-Validierung | Zod 3.22.4 |
| Git-Repository | `git@github.com:Banixx/Nodges.git` (branch `main`, aktiver Branch `pi`) |

---

## Kapitelübersicht

Die Dokumentation ist in einzelne, in sich abgeschlossene Markdown-Dateien aufgeteilt. Sie sind in einer logischen Reihenfolge nummeriert und bauen thematisch aufeinander auf.

| Nr. | Datei | Inhalt |
|-----|-------|--------|
| 00 | `00_index_nodges_V4.md` | Dieser Index und die Navigation |
| 01 | `01_projektueberblick_nodges_V4.md` | Vision, Feature-Set, Datenfluss auf einen Blick |
| 02 | `02_technologie_stack_nodges_V4.md` | Technologie-Stack, Abhängigkeiten und Build-Pipeline |
| 03 | `03_projektstruktur_nodges_V4.md` | Verzeichnisstruktur und Aufteilung der Quellcodes |
| 04 | `04_architektur_kern_nodges_V4.md` | Kernarchitektur, DI-Container und Manager-Koordination |
| 05 | `05_datenmodell_nodges_V4.md` | Graph-Datenmodell, Zod-Schemas und JSON-Schema |
| 06 | `06_state_management_nodges_V4.md` | StateManager, Sub-States und Subscriber-Kategorien |
| 07 | `07_event_system_nodges_V4.md` | Zentrales, typisiertes Event-System |
| 08 | `08_rendering_visualisierung_nodges_V4.md` | 3D-Rendering, VisualMappingEngine, Effekte, Minimap |
| 09 | `09_datenfluss_import_export_nodges_V4.md` | Datenfluss, Layout, Import/Export und Worker |
| 10 | `10_ui_komponenten_nodges_V4.md` | UI-Komponenten und Sidebar-Panels |
| 11 | `11_llm_und_backend_nodges_V4.md` | LLMService, LightRAG-Backend, Deno-Proxy |
| 12 | `12_entwicklung_build_deploy_nodges_V4.md` | Entwicklung, Build, CI/CD und Deployment |
| 13 | `13_tests_qualitaet_nodges_V4.md` | Testabdeckung und Qualitätssicherung |
| 14 | `14_verbesserungsvorschlaege_nodges_V4.md` | Verbesserungsvorschläge (Details und Architektur) |
| 15 | `15_refactoring_fortschritt_nodges_V4.md` | Fortschritt des App.ts-Refactorings (laufend) |

---

## Lesepfade (empfohlen)

- **Einsteiger / Gesamtüberblick:** `01` → `02` → `03` → `04`
- **Kern-Engine verstehen:** `04` → `05` → `06` → `07` → `08` → `09`
- **KI-/Backend-Themen:** `11`
- **Betrieb / Wartung:** `12` → `13`
- **Strategie / Weiterentwicklung:** `14` → `15` (`15` wird laufend aktualisiert, sofern das Refactoring fortgesetzt wird)

---

## Abkürzungen und Konventionen

- **Build N** – Bezeichner für aufeinanderfolgende Entwicklungsiterationen (Build 3, 4, 5, 6, 8, 10, 12). Sie spiegeln sich in Dateinamen, Schema-Versionen und Prompts wider.
- **Schema-Versionen** – `3.0`, `4.0`, `5.0` (Default `5.2`). Der `DataParser` unterstützt 3.0 bis 5.0 und fällt auf `5.0` zurück.
- **Entity** – Knoten eines Graphen (mit `id`, `label`, `position` und beliebigen Properties).
- **Relationship** – Kante zwischen zwei Entitäten (`source`, `target`, `relation`).
- **VisualMapping** – Regel, die Datenattribute auf visuelle Eigenschaften abbildet (Farbe, Größe, Form, Position).
- **StateManager / CentralEventManager / ServiceContainer** – zentrale Bausteine der Kernarchitektur (Details in Kapitel 04, 06, 07).

---

## Datenstand der Dokumentation

- Basis: Stand des Repositories auf Branch `pi`, Commit `5b355b9` (0.103.1).
- Erstellt: nach manueller Code-Inspektion im Container `/workspace`.
- Die V4-Dokumentationsreihe ersetzt/erweitert die früheren Berichte unter `/workspace/com/doc/` (Dateien mit Präfix `0_103_0_…`).
