# 13 Troubleshooting und FAQ

> **Visualisierung:** Siehe [13_TroubleshootingUebersicht_001.mmd](13_TroubleshootingUebersicht_001.mmd)

Dieses Dokument fasst bewaehrte Loesungswege fuer haeufige Probleme in den Bereichen KI-Inferenz, WebGL-Rendering, Datenmodellierung und Multi-Harness-Betrieb in Version **0.106.8** zusammen.

---

## 1. LLM-Inferenz und Pipeline-Fehler

### Fehler: "JSON Parse Error" oder "Zod Validation Failed"
- **Symptom:** Die Pipeline bricht mit einer roten Toast-Meldung ab; der bisherige Graph bleibt unveraendert im Canvas erhalten.
- **Ursache:** Das Sprachmodell hat den JSON-Codeblock durch unstrukturierten Text beschraenkt, zulaessige Typen verletzt oder Relationen mit ungueltigen `source`/`target`-IDs generiert.
- **Loesung:**
  1. Bei kleinen Modellen (z. B. 8B-Parameter) auf leistungsfaehigere Modelle (Claude 3.5 Sonnet, GPT-4o) umschalten, da diese komplexe JSON-Constraints ueber hunderte Zeilen zuverlaessiger einhalten.
  2. Im Prompt explizite Instruktionen ergaenzen: *"Antworte ausschliesslich mit dem validierten JSON-Objekt ohne Einleitung oder Markdown-Erlaeuterungen ausserhalb des Blocks."*

### Fehler: CORS-Blockade bei lokaler Ollama-Inferenz

> **Visualisierung:** Siehe [13_CORSArchitekturOllama_003.mmd](13_CORSArchitekturOllama_003.mmd)

- **Symptom:** Netzwerkfehler (`Failed to fetch`) beim Ansprechen von `http://localhost:11434`.
- **Ursache:** Lokale Inferenz-Server blockieren standardmaessig herkunftsuebergreifende Anfragen aus dem Browser (`localhost:5173`).
- **Loesung:** Ollama mit CORS-Freigabe starten:
  - Unter Windows (PowerShell): `$env:OLLAMA_ORIGINS="*"; ollama serve`
  - Unter Linux / Container: `OLLAMA_ORIGINS="*" ollama serve`

### Fehler: HTTP 429 (Too Many Requests)
- **Symptom:** Abbruch der Inferenz mit Rate-Limit-Status.
- **Ursache:** Erschoepfte Token-Quoten oder providerseitige Frequenzlimits (z. B. Free-Tier bei OpenRouter).
- **Loesung:** Guthaben aufladen oder im `CreatePanel` temporaer auf den lokalen Provider (Ollama) umschalten.

---

## 2. WebGL, Grafikspeicher und Performance

### Symptom: Bildrate sinkt deutlich ab (< 30 FPS)
- **Ursache 1:** Zu viele ungebufferte 3D-Kanten oder komplexe Bezier-TubeGeometrien bei dichten Graphen.
- **Ursache 2:** Die Physiksimulation laeuft kontinuierlich auf der CPU weiter.
- **Loesung:**
  - Im Einstellungsmenue die Kraeftesimulation nach Erreichen eines stabilen Zustands einfrieren (*Cooldown / Pause*).
  - Kantenqualitaet auf einfache Linien zurueckstellen.
  - Antialiasing auf schwaecherer Hardware deaktivieren.

### Symptom: "WebGL Context Lost" oder White Screen of Death

> **Visualisierung:** Siehe [13_VRAMLeakKausalkette_001.mmd](13_VRAMLeakKausalkette_001.mmd)

- **Ursache:** Ueberlauf des Grafikspeichers (VRAM-Leak), weil beim Graphwechsel Geometrien, Materialien und Shader nicht ordnungsgemaess freigegeben wurden.
- **Loesung:**
  - Pruefen, dass vor jedem Neuaufbau in `App.loadGraphData` saemtliche Three.js-Objekte mit `.dispose()` behandelt werden.
  - Browser-Tab mit `Strg + F5` neu laden, um den WebGL-Kontext sauber zurueckzusetzen.

---

## 3. Daten, Mappings und Raumverhalten

### Symptom: Farb- oder Groessen-Mappings zeigen keine optische Wirkung

> **Visualisierung:** Siehe [13_OntologieInstanzDivergenz_002.mmd](13_OntologieInstanzDivergenz_002.mmd)

- **Ursache:** Das Attribut wurde zwar in der Ontologie (`dataModel`) deklariert, in den konkreten Knoten (`entities`) vom LLM jedoch als `null`, `undefined` oder mit falschem Datentyp ausgegeben.
- **Loesung:** Knoten im 3D-Raum anklicken und im Inspektionspanel die tatsaechlich vorhandenen Rohdaten pruefen. Gegebenenfalls den Prompt praezisieren.

### Symptom: Knoten driften chaotisch auseinander
- **Ursache:** Die elektrostatische Abstossungskraft (*Repulsion/Charge*) ueberwiegt die Federkraft (*Link Tension*) der Kanten massiv.
- **Loesung:** Im Physik-Panel die Abstossungsstaerke reduzieren oder die Kantenlaenge herabsetzen.

---

## 4. Multi-Harness und Container-Betrieb

### Rotes Kreuz auf Netzlaufwerk W: im Windows Explorer
- **Ursache:** Kosmetischer Windows Lazy-Reconnect-Effekt nach dem Booten.
- **Auswirkung:** **Keine.** Der Zugriff von conT und PowerShell auf `W:/` funktioniert transparent.

### Git-Push wird durch Hook abgewiesen (`pre-push hook failed`)
- **Ursache:** Der versionierte Hook blockiert Pushes von reinen Patch-Versionen (`0.106.x`).
- **Loesung:** Pushes nach GitHub sind fuer Minor- und Major-Releases reserviert. Verwenden Sie `bash tools/nodges-git.sh release` fuer echte Meilensteine.

### LightRAG Backend antwortet nicht (Port 8000)
- **Pruefung:** `curl -s http://localhost:5173/lightrag-api/health`
- **Loesung:** Backend im Container mit `npm run lightrag` oder `.devcontainer/start-lightrag.sh` neu starten.
