# Dashboard: Test-Infrastruktur (Single Harness conT)

> **Projekt:** Test-Infrastruktur Harmonisierung | **Harness:** conT (Single-Harness Windows 11) | **Stand:** 28. September 2026 | **Modus:** Autonom  
> **Ablagepfad:** [dashboard.md](./dashboard.md) ([W:/com/feature/test_infrastruktur/dashboard.md](file:///W:/com/feature/test_infrastruktur/dashboard.md)) | **HTML-View:** [dashboard.html](./dashboard.html)

---

## 1. Name & Beschreibung

| Attribut | Wert |
|---|---|
| **Projektname** | **Test-Infrastruktur Harmonisierung** |
| **Betriebsmodus** | **Single Harness conT** (Host Windows 11 / Antigravity, autonomer Betrieb) |
| **Beschreibung** | Schlanke, einseitige Steuerungs- und Analyseplattform fuer die Nodges Test-Infrastruktur. Konsolidiert statische Pruefungen, Modultests, 3D-Canvas-E2E-Laeufe und Backend-Integritaet ohne Multi-Harness-Ping-Pong-Overhead. |
| **Primaere Pfade** | `W:/com/feature/test_infrastruktur/`, `W:/src/`, `W:/e2e/`, `W:/lightrag-backend/` |

---

## 2. Ziele

- **[Z-01] L0-Integritaet sichern:** Typpruefung (`tsc --noEmit`), Linting (`biome`) und Export-Checks (`knip`) direkt auf Windows stabil halten.
- **[Z-02] L1-Laufzeit geklaert:** L1-Unit-Tests (Vitest, 246 Tests) verbleiben verbindlich im Linux-Container (`test:fast` bzw. `docker exec`). Windows-Host entlastet, keine Verunreinigung des geteilten ext4 `node_modules` durch Rollup/Esbuild-Windows-Binaries.
- **[Z-03] L2-E2E-Autonomie:** Playwright-Suiten (Canvas-Mount, Sidebar-Tabs, Graph-Lifecycle, OrbitControls) fuer conT release-sicher bereitstellen.
- **[Z-04] L3-Backend-Synchronisation:** Pytest-Status (27 API-Tests) kontinuierlich im Blick behalten.
- **[Z-05] Kompakte Steuerung:** Alle relevanten Metriken jederzeit auf genau einer Bildschirmseite erfassbar machen.

---

## 3. Fortschritt & Teststufen

| Stufe / Bereich | Pruefwerkzeug | Fokus | Status | Fortschritt |
|---|---|---|---|---|
| **L0: Statisch** | TypeScript, Biome, Knip | Typen, Linter, ungenutzter Code | **[ERLEDIGT]** | [====================] 100% |
| **L1: Unit-Tests** | Vitest (v8, JSDOM) | 246 Unit-Tests in 20 Testdateien (243 passed, 3 skipped, Container) | **[ERLEDIGT]** | [====================] 100% |
| **L2: E2E Browser** | Playwright (SwiftShader) | 4 Suiten (Canvas, Tabs, Graph auf Windows-Host) | **[BEREIT]** | [====================] 100% |
| **L3: Backend** | Pytest (TestClient) | 27 API-Tests in Python-Venv (Container) | **[ERLEDIGT]** | [====================] 100% |
| **Workflow** | Single-Harness conT | Umstellung, L1-Klaerung & autonome Steuerung | **[ERLEDIGT]** | [====================] 100% |

**Gesamtfortschritt Projekt Test-Infrastruktur:** **100%**

---

## 4. Status & Naechste Schritte

- **Aktueller Status:** L1-Laufzeit vollstaendig geklaert und verifiziert. Unit-Tests laufen im Container stabil gruen (243 passed, 3 skipped). Dualitaetskonflikt geloest: Stufe L1 verbleibt fest im Container (`test:fast` / `docker exec`); conT steuert autonom ohne `node_modules`-Verschmutzung und fokussiert host-seitig auf L0 (statisch) und L2 (E2E).
- **Naechste Aktion:** Test-Infrastruktur Harmonisierung erfolgreich abgeschlossen. Ergebnisse in `com/entscheidungen.md` und `com/todo.md` hinterlegt.
- **Verknuepfte Dokumente:**
  - Rapport-Historie: [W:/com/feature/test_infrastruktur/rapport_test_infrastruktur.md](file:///W:/com/feature/test_infrastruktur/rapport_test_infrastruktur.md)
  - Uebersicht: [W:/com/feature/test_infrastruktur/README.md](file:///W:/com/feature/test_infrastruktur/README.md)
  - Offene Punkte im Gesamtsystem: [W:/com/todo.md](file:///W:/com/todo.md)
