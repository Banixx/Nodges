# Blaupause: Multi-Harness Kommunikations- und Kollaborations-Framework

> Version: 0.106.8  
> Stand: 27. September 2026  
> Ablage: `W:/com/setup/harness_chat_setup.md` (bzw. `/workspace/com/setup/harness_chat_setup.md`)  
> Beteiligte Harnesses: **conT** (Antigravity Windows 11) & **piCon** (Pi-Agent im Linux-Container)

---

## 1. Uebersicht und Zielsetzung

In einem Multi-Harness-Setup arbeiten zwei autonome KI-Agenten parallel auf demselben Dateisystem (ext4 Single Source of Truth via Netzlaufwerk `W:/` und Container-Mount `/workspace`). Um Missverstaendnisse, Code-Kollisionen und Informationsverlust zu vermeiden, bedarf es eines standardisierten, asynchronen Kommunikationsmusters ("Harness-Chat via Rapport").

Dieses Dokument dient als **verbindliche Blaupause** fuer die Durchfuehrung von Diskussions-, Planungs- und Umsetzungsprozessen zwischen den Harnesses.

---

## 2. Struktur einer Rapport-Datei (`rapport_<thema>.md`)

Fuer groessere Vorhaben oder Builds wird eine dezidierte Datei unter `com/plan/<thema>/rapport_<thema>.md` angelegt. Diese folgt zwingend einem einheitlichen Aufbau:

### Standard-Aufbau:

1. **Kopfbereich & Metadaten:**
   - Titel des Vorhabens / Builds.
   - Status (`In Vorbereitung`, `Aktiv in Diskussion`, `In Umsetzung`, `Abgeschlossen`).
   - Partner, Ablagepfad und Stand.
2. **Verlaufsprotokoll (tabellarisch zuoberst):**
   - Wer hat wann was gemacht?
   - Spalten: `Datum / Zeit`, `Harness` (conT / piCon), `Aktion / Schritt`, `Ergebnis / Artefakt`.
3. **Zweck und Gebrauchsanweisung:**
   - Kurze Erlaeuterung fuer Mensch und KI, wie die Datei gepflegt wird.
4. **Fachlicher Ausgangsstand & Kontext:**
   - Problemstellung, Anforderungen, Rechercheergebnisse.
5. **Fragen an das Partner-Harness:**
   - Konkret nummerierte Fragen mit Kontext, Code-Zeilen und technischer Zielsetzung.
6. **Ideen und Loesungsansaetze:**
   - Architekturentwuerfe, UI/UX-Konzepte, Backend-Vorschlaege.
7. **Arbeitsaufteilung & Naechste Schritte:**
   - Tabellarische Zuteilung der Aufgaben an conT bzw. piCon.
8. **Rueckmeldungen und Diskussionsbeitraege des Partners:**
   - Explizite Antworten auf die Fragen, Testergebnisse und Dokumentation durchgefuehrter Aenderungen.

---

## 3. Der asynchrone Kommunikationszyklus

Der Ablauf folgt vier wiederkehrenden Phasen:

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
|    - ping an Partner: bash tools/nodges-com.sh ping <ziel> "..."  |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 3. Analyse & Umsetzung durch Partner (z.B. piCon)                |
|    - Liest rapport_<thema>.md                                     |
|    - Beantwortet Fragen unter "Rueckmeldungen & Diskussion"       |
|    - Fuehrt Code-Apassungen & Tests im eigenen Bereich durch      |
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

### 3.1 Das strukturierte 3-Runden Ping-Pong Muster fuer komplexe Builds

Fuer Vorhaben mit Backend-, Schnittstellen- und UI-Abhaengigkeiten (wie Build 14) erfolgt der Austausch in drei aufeinander aufbauenden Ping-Pong-Runden:

| Runde | Thema / Fokus | conT (Windows / Frontend) | piCon (Container / Backend) |
|---|---|---|---|
| **Runde 1: Schnittstelle & DTOs** | Datenstruktur, Endpunkte, Rohdaten | Formuliert Datenbedarf, DTO-Felder (`weight`, `keywords`, `description`, `sources`) und Abfragemethoden. | Prueft Bibliotheken (`lightrag-hku`), baut/erweitert Backend-Endpunkte (`main.py`) und verifiziert Rohdaten live. |
| **Runde 2: Expansion & Datenvertrag** | Datenumwandlung, Typisierung, Schemata | Implementiert Kantenexpansion (1 Sammelkante -> $n$ Beziehungen) und Mapping auf Schema 5.2. | Verifiziert Ingestion-Pfade, Gleaning, Chunking-Strategien und Konsistenz im Backend. |
| **Runde 3: Visualisierung & E2E-Gate** | Three.js Rendering, UI-Integration, Tests | Integriert Build in UI (`CreatePanel.ts`), schuetzt vor Deduplizierungs-Bugs und verdrahtet Visual Presets. | Fuehrt Gesamttest im Container aus (Typecheck, Vitest, Backend-Health) und bestaetigt Freigabe. |

---

---

## 4. Regeln fuer die Harness-Kommunikation

1. **Dateisystem ist die Quelle:** Der Chat zwischen den Agenten findet Primaer in der Rapport-Datei statt, nicht in fluechtigen LLM-Kontextfenstern. Was in der Markdown-Datei steht, bleibt fuer beide Seiten persistent.
2. **Klingel nutzen:** Nach jeder substantiellen Aktualisierung der Rapport-Datei wird ein Ping via `nodges-com.sh` abgesetzt.
3. **Keine stillen Annahmen:** Wenn Schnittstellen oder DTOs geaendert werden, muessen Felder, Typen und Fallbacks explizit in der Rapport-Datei beschrieben werden (wie in Frage 2 von Build 14 geschehen).
4. **Schreib- und Sprachdisziplin:**
   - Sprache: Deutsch.
   - Kein Sz (immer "ss").
   - Absolutes Verbot von Emojis und Unicode-Emoticons.
   - Absolute Pfade mit Schraegstrichen (`/`) verwenden.
5. **Ergebnis-Dokumentation:**
   - Abgeschlossene Vorhaben werden in `com/doc/` archiviert (mit Versionspraefix).
   - Offene Todos werden kurz in `com/todo.md` gepflegt.
