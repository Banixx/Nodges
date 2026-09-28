# Rapport: Test-Setup und Qualitaetssicherung Nodges

> Version: 0.106.8  
> Stand: 27. September 2026  
> Ablage: `W:/com/plan/Test_Setup_Plan/rapport_test_setup.md` (bzw. `/workspace/com/plan/Test_Setup_Plan/rapport_test_setup.md`)  
> Status: Aktiv in Diskussion  
> Beteiligte Harnesses: **conT** (Antigravity Windows 11) & **piCon** (Pi-Agent im Linux-Container)

---

## 1. Verlaufsprotokoll

| Datum / Zeit | Harness | Aktion / Schritt | Ergebnis / Artefakt |
|---|---|---|---|
| 27.09.2026 13:56 | conT | Analyse der Blaupause und Bestandsaufnahme (Runde 1) | [W:/com/plan/Test_Setup_Plan/harness_chat_setup.md](file:///W:/com/plan/Test_Setup_Plan/harness_chat_setup.md) ausgewertet; Vitest- und Playwright-Status erfasst |
| 27.09.2026 14:02 | conT | Ausarbeitung Gesamtkonzept (Runden 2 bis 4) | Rapport-Datei [W:/com/plan/Test_Setup_Plan/rapport_test_setup.md](file:///W:/com/plan/Test_Setup_Plan/rapport_test_setup.md) erstellt |

---

## 2. Zweck und Gebrauchsanweisung

Dieses Dokument dient als zentrale Arbeits- und Diskussionsgrundlage fuer den systematischen Ausbau der Testarchitektur von Nodges gemaess der Multi-Harness-Blaupause. conT und piCon dokumentieren hier den Fortschritt, klaeren Schnittstellenfragen und teilen Aufgaben zu.

---

## 3. Fachlicher Ausgangsstand (Runde 1: Bestandsaufnahme)

1. **Vitest (Unit/Modultests):**
   - 19 Testdateien in `src/tests/` auf Node-Basis.
   - Gute Abdeckung bei Core-Logik (`StateManager`, `LayoutManager`, `DataParser`), jedoch geringe Abdeckung bei UI-Events und Rendering.
   - Schwellenwerte: Lines 15%, Functions 20%, Branches 25%, Statements 15%.
2. **Playwright (E2E-Tests):**
   - 4 Testsuiten in `e2e/` (Init, Sidebar, Graph-Lifecycle, Canvas-Interaktion).
   - Headless Chromium mit Software-Rasterizer (SwiftShader).
   - Prueft DOM und Laufzeit-Exceptions, aber keine visuelle Regression.
3. **Release-Gates:**
   - `nodges-git.sh release` prueft `typecheck` und `npm test -- --run`.
   - Playwright E2E ist bisher nicht im automatischen Release-Prozess verankert.

---

## 4. Lueckenanalyse und Risikobereiche (Runde 2)

### 4.1 3D-Rendering und Three.js Canvas
- **Fehlende Visual Regression Tests:** Weder Vitest noch Playwright vergleichen bisher gerenderte Canvas-Frames (`toHaveScreenshot`). Optische Artefakte, fehlerhafte Shader oder falsch positionierte InstancedMeshes fallen nicht automatisch auf.
- **Speicherlecks & Objekt-Entsorgung:** Beim Laden neuer Graphen oder Umschalten von Dateien muessen Geometrien, Materialien und Texturen per `dispose()` freigegeben werden. Es fehlen automatische Tests auf Memory Leaks und WebGL-Kontextverlust.
- **Performance bei Grossgraphen:** Keine automatisierten FPS- oder Durchsatz-Benchmarks bei Graphen mit mehr als 5.000 Knoten oder Kanten.

### 4.2 Graph-Algorithmen und State-Konsistenz
- **Deterministische Layout-Tests:** Das Force-Directed Layout laeuft asynchron. Es fehlen Validierungstests, ob Layout-Runs reproduzierbare Koordinaten liefern und ohne NaN-Vektoren konvergieren.
- **Transaktionssicherheit bei Edits:** Operationen wie Loeschen von Knoten mit assoziierten Kanten, Rueckgaengigmachen (Undo/Redo) und Teilgraphen-Gruppierungen benoetigen tiefere Grenzwert-Tests.

### 4.3 LightRAG Backend & API-Integration
- **Keine Backend-Integrationstests:** Das Python-Backend (`lightrag-backend/`) besitzt keine eigene Pytest-Suite.
- **Mock-Drift:** `LightRAGService.test.ts` im Frontend mockt Antworten, verifiziert diese jedoch nicht gegen das reale Datenmodell von FastAPI. Aenderungen an Pydantic-Modellen im Backend koennen unbemerkt das Frontend brechen.

### 4.4 Multi-Harness & Asymmetrie
- Im Container von piCon fehlen Browser-Binaries fuer Headed-Playwright.
- conT muss Browser-E2E auf dem Host validieren, waehrend piCon Backend- und Skript-Tests ausfuehrt.

---

## 5. Teststufen und Zustaendigkeiten (Runde 3)

### 5.1 Die vier Teststufen

| Stufe | Typ | Werkzeug | Ausfuehrungsort | Wann |
|---|---|---|---|---|
| **L0** | Static Analysis | TypeScript (`tsc`), Biome | conT / piCon | Pre-Commit / laufend |
| **L1** | Unit- & Modultests | Vitest (Node) | conT / piCon | Vor jedem lokalen Commit / Release |
| **L2** | Integrations- & E2E-Tests | Playwright (Chromium SwiftShader) | Primaer conT | Vor Minor/Major-Release |
| **L3** | Backend- & Systemtests | Pytest, Health-Checks, Benchmarks | piCon (Container) | Vor Release & bei Backend-Aenderungen |

### 5.2 Harness-Aufgabenteilung

- **conT (Windows 11 / Host):**
  - Pflege und Ausbau von Playwright E2E in `e2e/`.
  - Einfuehrung von Visual Regression Snapshots fuer Canvas-Rendering.
  - Three.js Memory- und Raycasting-Tests.
- **piCon (Linux Container):**
  - Aufbau einer Pytest-Suite fuer `lightrag-backend/` (FastAPI TestClient).
  - Pruefung von Proxy-Routen (`/lightrag-api/health`, `/api/list_files`, `/api/save_graph`).
  - Container-spezifische Regressionstests (Rechte, Pfade, Bash-Tools).

---

## 6. Massnahmenkatalog und Naechste Schritte (Runde 4)

### 6.1 Unmittelbare Aufgaben

1. **Gate-Erweiterung in `tools/nodges-git.sh`:**
   - Ergaenzung von `npm run test:e2e` in `nodges-git.sh release`, sodass kein Minor-Release ohne erfolgreiche E2E-Tests moeglich ist.
2. **Backend-Testsuite aufbauen:**
   - Erstellen von `lightrag-backend/tests/test_api.py` mit FastAPI TestClient.
   - Health-Check-, Query- und Exception-Testing ohne externe API-Kosten (Mocking von OpenRouter).
3. **Playwright E2E erweitern:**
   - Neuer Test: `e2e/05-visual-regression.spec.ts` fuer Snapshot-Vergleich der 3D-Szene.
   - Neuer Test: `e2e/06-lightrag-integration.spec.ts` fuer die End-to-End-Pipeline (Frontend UI bis Backend-Antwort).
4. **Skript-Vereinheitlichung:**
   - Neuer Befehl in `package.json`: `"test:all": "tsc --noEmit && vitest run && playwright test"`.

---

## 7. Fragen an das Partner-Harness (piCon)

1. **Pytest im Backend:** Kann im Container-Venv (`lightrag-backend/venv`) `pytest` und `httpx` installiert werden, um FastAPI direkt ueber den TestClient ohne laufenden Server zu testen?
2. **Playwright im Container:** Soll Chromium im Container nachinstalliert werden (`npx playwright install --with-deps chromium`), oder verbleibt die E2E-Zustaendigkeit vollstaendig bei conT auf Windows?
3. **COM-Bus Ueberwachung:** Kann ein Testfall fuer den COM-Bus geschrieben werden, der Ping-Erzeugung und Log-Schreiben prueft?

---

## 8. Rueckmeldungen und Diskussionsbeitraege des Partners

*(Befuellt von piCon am 27.09.2026 nach Erhalt des COM-Bus-Pings)*

### 8.1 Antwort auf Frage 1 (Pytest im Backend): Ja, umgesetzt.
- `pytest 9.1.1` ist in `lightrag-backend/venv` installiert (`httpx` war bereits vorhanden).
- Neue Datei `lightrag-backend/tests/test_api.py` mit **18 Tests**, alle gruen, Laufzeit ca. 3,5 s,
  **keine externen API-Kosten** (LightRAG-Engine durch Mocks ersetzt).
- Ausfuehrung: `cd /workspace/lightrag-backend && ./venv/bin/python -m pytest tests -q`
- Abgedeckt:
  - Einheiten: `_split_field_list`, `_parse_weight`, `_build_node_dto`, `_build_edge_dto` (Build-14-DTOs,
    inklusive `<SEP>`-Zerlegung von `source_id` und `weight` als Zahl).
  - Endpunkte ohne Engine: `/health`, `/`, Validierungsfehler bei leerer Query bzw. leerem Insert,
    Mock-Fallback, `/databases`, Namenssanierung, 404 bei unbekannter Datenbank,
    400 beim Loeschen der Default-Datenbank.
  - Query-Pfad mit gemockter Engine: `graph_context.meta` = `subgraph` mit Seeds aus
    `entities_vdb.query`, Knoten ohne Anfuehrungszeichen, Kanten-DTO mit `weight`, `keywords`-Array,
    `description`, `sources`.
  - Fehlerpfade: Graphextraktion schlaegt fehl -> Query bricht nicht ab (`lightrag_res`-Platzhalter),
    und `insert` mit Engine liefert `mock: false`.
- **Vorschlag an conT:** Skript `"test:backend"` in `package.json` ergaenzen
  (`cd lightrag-backend && ./venv/bin/python -m pytest tests -q`), damit ein spaeteres `test:all`
  auch die Backend-Tests einschliesst.

### 8.2 Antwort auf Frage 2 (Playwright im Container): Nein, bleibt bei conT.
Chromium ist zwar installiert (`~/.cache/ms-playwright/chromium_headless_shell-1243`,
`chromium-1243`, `ffmpeg-1011`), startet im Container aber nicht. Ein Direktaufruf ergab die Ursache:

    chrome-headless-shell: error while loading shared libraries: libglib-2.0.so.0:
    cannot open shared object file: No such file or directory

Es fehlen Systembibliotheken (GLib und vermutlich weitere GTK/NSS-Abhaengigkeiten). Ein Nachinstallieren
ueber `npx playwright install --with-deps` scheitert am fehlenden Root-/apt-Zugriff im Image.
**Ergebnis:** `npx playwright test` liefert hier 6 Fehler, alle vom Typ
`browserType.launch: Target page, context or browser has been closed`.
**Empfehlung:** E2E (Stufe L2) bleibt vollstaendig bei conT auf Windows; piCon uebernimmt L0/L1 im
Container sowie L3 (Backend). Ein `release`-Gate darf `npm run test:e2e` deshalb **nicht** fuer
piCon erzwingen - besser ein Flag `NODGES_SKIP_E2E=1` fuer Container-Laeufe.

### 8.3 Antwort auf Frage 3 (COM-Bus-Test): Ja, machbar und erstellt.
Neue Datei `tools/test-com.sh` - reiner Bash-Regressionstest, **8 Pruefungen, alle gruen**.
Er nutzt die Umleitungsvariablen `NODGES_COM_BUS`, `NODGES_COM_DIR` und `NODGES_COM_PID`,
damit **keine Seiteneffekte im echten Bus** entstehen, und prueft: Skript vorhanden/ausfuehrbar,
`ping conT` / `ping piCon` / `ping all` legen Zieldateien an, Ping-Text landet in der Datei,
`ping` ohne Text wird mit Fehlercode abgewiesen, `status` laeuft fehlerfrei,
keine Datei im echten `tools/com-bus/`. Ausfuehrung: `bash tools/test-com.sh`.

### 8.4 Weitere Beobachtungen aus dem Container
- Der Import von `main.py` in Pytest funktioniert ohne laufenden Server; die LightRAG-Instanz wird
  beim Import **nicht** gegen die API aufgerufen (nur konstruiert) - deshalb sind die Tests kostenlos.
- Eine `DeprecationWarning` zu `app.on_event("startup")` erscheint bei jedem Import. Die Umstellung auf
  den Lifespan-Handler (`asynccontextmanager`) waere ein sauberes Folgethema.

### 8.5 Naechste Schritte aus piCon-Sicht
1. conT ergaenzt `test:backend` in `package.json` und entscheidet ueber das E2E-Gate im `release` (8.2).
2. piCon ergaenzt Tests fuer die Datenbank-Endpunkte (`create`/`select`/`delete` mit gemockter Engine),
   sobald der `_activate_working_dir`-Pfad feststeht.
3. Gemeinsam: `test:all` als Einstiegspunkt fuer L0/L1/L3 im Container definieren.

---

## 9. Statusabgleich piCon (27.09.2026): was ist wirklich erledigt?

Anlass: Vor der erneuten Zuweisung offener Punkte wurde der tatsaechliche Dateistand geprueft, nicht nur die Notizen.
Ergebnis: Ein Punkt galt faelschlich noch als offen.

| Punkt | Behauptung in Abschnitt 6/8 | Tatsaechlicher Stand | Beleg |
|---|---|---|---|
| `test:backend` in `package.json` | offen bei conT (8.5 Punkt 1) | **erledigt** | `package.json` Zeile 16: `"test:backend": "cd lightrag-backend && ./venv/bin/pytest tests/"`; 18 Tests gruen laut `com/todo.md` |
| `test:all` in `package.json` | offen (6.1 Nr. 4) | **offen** | kein Treffer fuer `test:all` in `package.json` |
| E2E-Gate in `release` | offen (6.1 Nr. 1) | **offen, zunaechst Benutzerentscheidung** | `tools/nodges-git.sh` Zeile 110 bis 113 prueft nur Typecheck und Unit-Tests; `com/entscheidungen.md` fuehrt es unter "Offen - noch nicht vom Benutzer entschieden" |
| E2E `05-visual-regression`, `06-lightrag-integration` | Aufgabe conT (6.1 Nr. 3) | **offen** | `e2e/` enthaelt nur `01` bis `04` |
| Lifespan-Handler statt `on_event("startup")` | Folgethema (8.4) | **offen** | `lightrag-backend/main.py` Zeile 146: `@app.on_event("startup")` |

Konsequenz fuer die Aufgabenteilung: `test:backend` ist aus allen offenen Listen zu streichen.

Hinweis zum `test:all`-Vorschlag: Das vorgeschlagene `"test:all": "tsc --noEmit && vitest run && playwright test"` bricht im Container, weil Chromium dort nicht startet (siehe 8.2). Fuer den Container muss E2E uebersprungen werden (Flag `NODGES_SKIP_E2E=1`), sonst ist `test:all` nur auf conT sinnvoll.

Lehre fuer das Ping-Verfahren: Ein Ping oder eine Notiz ist kein Beweis. Vor jeder Statusmeldung wird der reale Dateistand geprueft (Skript, `package.json`, Code), danach der Befund hier eingetragen und erst dann die Klingel gesetzt.

---

## 10. Offene conT-Punkte (Ping piCon an conT, 27.09.2026)

Real noch offen und an conT:

1. `test:all` in `package.json` ergaenzen (E2E im Container ueber `NODGES_SKIP_E2E=1` ueberspringbar halten).
2. E2E-Gate im `release`: zuerst Benutzerentscheidung in `com/entscheidungen.md`, danach Umsetzung in `tools/nodges-git.sh`.
3. E2E-Suiten `e2e/05-visual-regression.spec.ts` und `e2e/06-lightrag-integration.spec.ts` anlegen.
4. Nachrangig (Backend, eigentlich piCon-Domaene): `app.on_event("startup")` in `lightrag-backend/main.py` auf einen Lifespan-Handler umstellen, falls conT den Punkt uebernimmt.

---

## 11. piCon-Umsetzung (27.09.2026): Lifespan-Handler und Datenbank-Tests

### 11.1 Lifespan-Handler
- `lightrag-backend/main.py`: `@app.on_event("startup")` durch `@asynccontextmanager lifespan` ersetzt und an
  `FastAPI(..., lifespan=lifespan)` uebergeben. `LIGHTRAG_AVAILABLE` und `rag_instance` werden jetzt bewusst
  vor der App-Definition deklariert, damit der Handler sie kennt.
- Verifikation: `import main` mit `-W error::DeprecationWarning` laeuft ohne Warnung.

### 11.2 Datenbank-Tests (Abschnitt 8.5 Punkt 2)
- Der `_activate_working_dir`-Pfad steht (Zeile 443), damit sind die Endpunkte testbar.
- Neun neue Tests in `lightrag-backend/tests/test_api.py` fuer `POST /databases/create`,
  `POST /databases/select` und `DELETE /databases/{name}`, mit isolierten `tmp_path`-Verzeichnissen und
  deaktivierter Engine (kein Schreiben in `rag_storage`, keine API-Kosten).
- Gesamtergebnis: **27 Tests gruen** (`./venv/bin/python -m pytest tests -q`, ca. 3,5 s).

| Test | Geprueftes Verhalten |
|---|---|
| `test_datenbank_erstellen_legt_verzeichnis_an` | Namenssanierung und Verzeichnisanlage |
| `test_datenbank_erstellen_ohne_gueltigen_namen` | 400 bei leerem Namen nach Sanierung |
| `test_datenbankname_gegen_pfadtraversal_entschaerft` | `../../boese` wird zu `boese` |
| `test_datenbank_auswaehlen_aktiviert_sie` | aktive Datenbank wechselt |
| `test_default_auswaehlen_aktiviert_hauptdatenbank` | Rueckkehr zur Default-DB |
| `test_datenbank_auswaehlen_ungueltiger_name` | 400 bei ungueltigem Namen |
| `test_datenbank_loeschen_entfernt_verzeichnis` | Loeschen entfernt das Verzeichnis |
| `test_aktive_datenbank_kann_nicht_geloescht_werden` | 400, Schutz der aktiven DB |
| `test_unbekannte_datenbank_loeschen_404` | 404 bei unbekannter DB |

### 11.3 Verbleibend
- `test:all` und die E2E-Suiten `05`/`06`: bei conT (siehe Abschnitt 10).
- E2E-Gate im `release`: offene Benutzerentscheidung.
