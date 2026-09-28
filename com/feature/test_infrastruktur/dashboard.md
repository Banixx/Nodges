# Dashboard: Simbian Test3 (Single Harness conT)

> **Projekt:** Simbian Test3 | **Harness:** conT (Single-Harness Windows 11) | **Stand:** 28. September 2026 | **Modus:** Autonom  
> **Ablagepfad:** [dashboard.md](./dashboard.md) ([W:/com/setup/test3/dashboard.md](file:///W:/com/setup/test3/dashboard.md)) | **HTML-View:** [dashboard.html](./dashboard.html)

---

## 1. Name & Beschreibung

| Attribut | Wert |
|---|---|
| **Projektname** | **Simbian Test3** |
| **Betriebsmodus** | **Single Harness conT** (Host Windows 11 / Antigravity, autonomer Betrieb) |
| **Beschreibung** | Schlanke, einseitige Steuerungs- und Analyseplattform fuer die Nodges Test-Infrastruktur. Konsolidiert statische Pruefungen, Modultests, 3D-Canvas-E2E-Laeufe und Backend-Integritaet ohne Multi-Harness-Ping-Pong-Overhead. |
| **Primaere Pfade** | `W:/com/setup/test3/`, `W:/src/`, `W:/e2e/`, `W:/lightrag-backend/` |

---

## 2. Ziele

- **[Z-01] L0-Integritaet sichern:** Typpruefung (`tsc --noEmit`), Linting (`biome`) und Export-Checks (`knip`) direkt auf Windows stabil halten.
- **[Z-02] L1-Laufzeit klaeren:** Vitest-Ausfuehrung auf dem Host entkoppeln bzw. mit passenden optionalen Windows-Binaries absichern.
- **[Z-03] L2-E2E-Autonomie:** Playwright-Suiten (Canvas-Mount, Sidebar-Tabs, Graph-Lifecycle, OrbitControls) fuer conT release-sicher bereitstellen.
- **[Z-04] L3-Backend-Synchronisation:** Pytest-Status (27 API-Tests) kontinuierlich im Blick behalten.
- **[Z-05] Kompakte Steuerung:** Alle relevanten Metriken jederzeit auf genau einer Bildschirmseite erfassbar machen.

---

## 3. Fortschritt & Teststufen

| Stufe / Bereich | Pruefwerkzeug | Fokus | Status | Fortschritt |
|---|---|---|---|---|
| **L0: Statisch** | TypeScript, Biome, Knip | Typen, Linter, ungenutzter Code | **[ERLEDIGT]** | [====================] 100% |
| **L1: Unit-Tests** | Vitest (v8, JSDOM) | 246 Unit-Tests in 20 Testdateien (243 passed, 3 skipped) | **[ERLEDIGT]** | [====================] 100% |
| **L2: E2E Browser** | Playwright (SwiftShader) | 4 Suiten (Canvas, Tabs, Graph) | **[BEREIT]** | [====================] 100% |
| **L3: Backend** | Pytest (TestClient) | 27 API-Tests in Python-Venv | **[AKTIV]** | [====================] 100% |
| **Workflow** | Single-Harness conT | Umstellung & autonome Steuerung | **[AKTIV]** | [====================] 100% |

**Gesamtfortschritt Projekt Simbian Test3:** **95%**

---

## 4. Status & Naechste Schritte

- **Aktueller Status:** Single-Harness-Projektumgebung in `test3` erfolgreich etabliert. Ping-Pong-Abhaengigkeiten entkoppelt.
- **Naechste Aktion:** Rollup-Windows-Binaries fuer lokale L1-Ausfuehrung pruefen oder Stufe L1 fest an den Container binden gemaess Entscheidungsmatrix.
- **Verknuepfte Dokumente:**
  - Rapport-Historie: [W:/com/setup/test3/rapport_test_infrastruktur.md](file:///W:/com/setup/test3/rapport_test_infrastruktur.md)
  - Uebersicht: [W:/com/setup/test3/README.md](file:///W:/com/setup/test3/README.md)
  - Offene Punkte im Gesamtsystem: [W:/com/todo.md](file:///W:/com/todo.md)
