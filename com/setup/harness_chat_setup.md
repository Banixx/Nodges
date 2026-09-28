# Blaupause: Multi-Harness Kommunikations- und Kollaborations-Framework

> Version: 0.106.8  
> Stand: 27. September 2026  
> Ablage: [W:/com/setup/harness_chat_setup.md](file:///W:/com/setup/harness_chat_setup.md) (bzw. `/workspace/com/setup/harness_chat_setup.md`)  
> Primaere Partner: **conT** (Antigravity Windows 11) & **piCon** (Pi-Agent im Linux-Container)  
> Bedarfs-Partner fuer Setup: **dopi** (Docker- & Host-Orchestrator in [C:/Users/ich/Desktop/code/_projects/Nodges_Pi](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi))

---

## 1. Uebersicht und Rollenverteilung

Im Projekt **Nodges** arbeiten die Agenten auf einer gemeinsamen Single Source of Truth (WSL2 Linux, ext4):

1. **conT (Aktiv):** Frontend, Three.js, Canvas, UI, Dokumentation, E2E-Tests auf dem Windows-Host via Netzlaufwerk [W:/](file:///W:/).
2. **piCon (Aktiv):** Linux-Container (`pi-harness`), Container-Dienste (Vite 5173, LightRAG 8000), Linux-Skripte, Python-Backend auf `/workspace`.
3. **dopi (Bedarfs-Harness fuer Setup):** Docker- und Host-Orchestrator im Projektordner [C:/Users/ich/Desktop/code/_projects/Nodges_Pi](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi).
   - **Regel:** dopi hat grundsaetzlich nur mitzureden, wenn es um das Setup (Host-Docker, Compose, Startskripte, Container-Infrastruktur) geht – und auch dann nicht immer.
   - **Kein fixer Turnus:** Dopi nimmt nicht an einem dauerhaften, starren Turnus teil.
   - **Expliziter Aufruf:** Dopi wird ausschliesslich dann einbezogen, wenn conT oder piCon ihn fuer konkrete Setup- oder Infrastruktur-Fragen explizit aufrufen.

---

## 2. Struktur einer Rapport-Datei (`rapport_<thema>.md`)

Fuer groessere Vorhaben oder Builds wird eine dezidierte Datei unter `com/plan/<thema>/rapport_<thema>.md` angelegt. Diese folgt einem einheitlichen Aufbau:

### Standard-Aufbau:

1. **Kopfbereich & Metadaten:**
   - Titel des Vorhabens / Builds.
   - Status (`In Vorbereitung`, `Aktiv in Diskussion`, `In Umsetzung`, `Abgeschlossen`).
   - Partner, Ablagepfad und Stand.
2. **Verlaufsprotokoll (tabellarisch zuoberst):**
   - Wer hat wann was gemacht?
   - Spalten: `Datum / Zeit`, `Harness` (conT / piCon / ggf. dopi), `Aktion / Schritt`, `Ergebnis / Artefakt`.
3. **Zweck und Gebrauchsanweisung:**
   - Kurze Erlaeuterung fuer Mensch und KI, wie die Datei gepflegt wird.
4. **Fachlicher Ausgangsstand & Kontext:**
   - Problemstellung, Anforderungen, Rechercheergebnisse.
5. **Fragen an das Partner-Harness:**
   - Konkret nummerierte Fragen mit Kontext, Code-Zeilen und technischer Zielsetzung.
6. **Ideen und Loesungsansaetze:**
   - Architekturentwuerfe, UI/UX-Konzepte, Backend-Vorschlaege, Infrastruktur-Anpassungen.
7. **Arbeitsaufteilung & Naechste Schritte:**
   - Tabellarische Zuteilung der Aufgaben an die beteiligten Harnesses.
8. **Rueckmeldungen und Diskussionsbeitraege:**
   - Explizite Antworten auf die Fragen, Testergebnisse und Dokumentation durchgefuehrter Aenderungen.

---

## 3. Der asynchrone Kommunikationszyklus

### 3.1 Primaerer Zyklus (conT <-> piCon)

Der regulaere Entwicklungszyklus laeuft autonom zwischen conT und piCon im Ping-Pong-Verfahren ab:

```
+-------------------------------------------------------------------+
| 1. Frage / Entwurf (z.B. conT)                                   |
|    - Erstellt/erweitert rapport_<thema>.md                        |
|    - Aktualisiert tabellarisches Verlaufsprotokoll zuoberst       |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 2. Weckruf / Benachrichtigung ueber COM-Bus                      |
|    - Ping an Partner: bash tools/nodges-com.sh ping <ziel> "..."  |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 3. Analyse & Umsetzung durch Partner (z.B. piCon)                |
|    - Liest rapport_<thema>.md                                     |
|    - Beantwortet Fragen unter "Rueckmeldungen & Diskussion"       |
|    - Fuehrt Code-Anpassungen & Tests im eigenen Bereich durch     |
|    - Traegt Schritt in die Verlaufstabelle ein                    |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 4. Konsolidierung & Beschluss                                     |
|    - Finalisierung im Frontend / Gesamtsystem                     |
|    - Verbindliche Beschluesse wandern nach com/entscheidungen.md   |
+-------------------------------------------------------------------+
```

### 3.2 Hinzuziehung von dopi bei Setup- und Infrastrukturfragen

Wenn ein Vorhaben Eingriffe in das Host-Setup, Docker Compose oder Container-Startskripte erfordert:
1. conT oder piCon formulieren den Setup-Bedarf und rufen dopi im Rapport explizit auf.
2. Der Aufruf wird per COM-Bus signalisiert (`ping dopi "Setup-Frage in rapport_<thema>.md"`).
3. dopi prueft und bearbeitet ausschliesslich die Host- und Docker-Dateien in [C:/Users/ich/Desktop/code/_projects/Nodges_Pi](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi) (`docker-compose.yml`, `Dockerfile`, `.devcontainer/`, `start_pi_container.cmd`).
4. Nach Erledigung meldet sich dopi im Rapport zurueck und uebergibt den Turnus wieder an conT bzw. piCon.

### 3.3 Das strukturierte 3-Runden Ping-Pong Muster fuer komplexe Builds

Fuer Vorhaben mit Backend-, Schnittstellen- und UI-Abhaengigkeiten (wie Build 14) erfolgt der Austausch in drei aufeinander aufbauenden Runden:

| Runde | Thema / Fokus | conT (Windows / Frontend) | piCon (Container / Backend) | dopi (nur bei Setup-Bedarf) |
|---|---|---|---|---|
| **Runde 1: Schnittstelle & DTOs** | Datenstruktur, Endpunkte, Rohdaten | Formuliert Datenbedarf, DTO-Felder (`weight`, `keywords`, `description`, `sources`) und Abfragemethoden. | Prueft Bibliotheken (`lightrag-hku`), baut/erweitert Backend-Endpunkte (`main.py`) und verifiziert Rohdaten live. | Prueft ggf. Port-Forwardings, Mounts oder Env-Variablen auf dem Host. |
| **Runde 2: Expansion & Datenvertrag** | Datenumwandlung, Typisierung, Schemata | Implementiert Kantenexpansion und Mapping auf Schema 5.2. | Verifiziert Ingestion-Pfade, Gleaning, Chunking und Backend-Konsistenz. | Fuehrt ggf. Compose-Anpassungen durch (falls Container-Neustart erforderlich). |
| **Runde 3: Visualisierung & E2E-Gate** | Three.js Rendering, UI-Integration, Tests | Integriert Build in UI (`CreatePanel.ts`), schuetzt vor Deduplizierungs-Bugs und verdrahtet Visual Presets. | Fuehrt Gesamttest im Container aus (`test:fast`, Typecheck, Vitest, Backend-Health). | Verifiziert ggf. sauberen Container-Lifecycle nach Neustart. |

---

## 4. Regeln fuer die Harness-Kommunikation

1. **Dateisystem ist die Quelle:** Der Chat zwischen den Agenten findet primaer in der Rapport-Datei statt, nicht in fluechtigen LLM-Kontextfenstern. Was in der Markdown-Datei steht, bleibt fuer alle Seiten persistent.
2. **Klingel nutzen:** Nach jeder substantiellen Aktualisierung der Rapport-Datei wird ein Ping via `nodges-com.sh` bzw. `nodges-com.ps1` abgesetzt.
3. **Keine stillen Annahmen:** Schnittstellen, DTOs oder Setup-Aenderungen muessen explizit im Rapport dokumentiert werden.
4. **Schreib- und Sprachdisziplin:**
   - Sprache: Deutsch.
   - Kein Sz (immer "ss").
   - Absolutes Verbot von Emojis und Unicode-Emoticons.
   - Absolute Pfade mit Schraegstrichen (`/`) verwenden.
5. **Ergebnis-Dokumentation:**
   - Abgeschlossene Vorhaben werden in `com/doc/` archiviert (mit Versionspraefix).
   - Offene Todos werden kurz in `com/todo.md` gepflegt.

---

## 5. Standard-Dashboard fuer neue Multi- & Single-Harness-Projekte

Fuer jedes neue Projekt wird standardmaessig das One-Page Dashboard aus [W:/com/setup/dashboard_template/](file:///W:/com/setup/dashboard_template/) initialisiert:
- **`dashboard.html`**: Universelle HTML-One-Page Ansicht (100vh Bildschirmschnitt, violett/rosa Farbgebung, autark ohne externe CDN-Abhaengigkeiten).
- **`dashboard.md`**: Kompakte Markdown-Entsprechung.
- **Portabilitaet:** Durch rein relative Pfade funktioniert die Vorlage sofort durch einfaches Hineinkopieren in jeden beliebigen Projektordner.

