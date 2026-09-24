# 10 Troubleshooting und FAQ

> **Visualisierung:** Siehe [13_TroubleshootingUebersicht_001.mmd](13_TroubleshootingUebersicht_001.mmd)

Dieses Dokument sammelt häufige Probleme (sowohl für Entwickler als auch für Endnutzer) und deren Lösungen, aufgeteilt in Backend/LLM, Frontend/WebGL und Architektur-Themen.

---

## 1. LLM und Generierungs-Probleme

### Fehler: "JSON Parse Error" oder "Zod Validation Failed"
- **Symptom:** Der Generierungsprozess bricht mit einer roten Toast-Meldung ab; der alte Graph bleibt erhalten.
- **Ursache:** Das LLM hat (trotz JSON Schema Mode) halluziniert. Entweder hat es Text außerhalb des JSON-Blocks geschrieben, oder es hat Attribute eingefügt, die es in der Phase 1 (Ontologie) nicht definiert hatte. Auch fehlende IDs in Kanten sind ein häufiger Zod-Fehler.
- **Lösung:** Wenn Sie ein sehr kleines Modell (wie Llama-3-8B oder GPT-4o-mini) nutzen, switchen Sie auf ein potenteres Modell (GPT-4o, Claude 3.5 Sonnet). Kleine Modelle haben Probleme, komplexen Constraints über hunderte Zeilen JSON treu zu bleiben.

### Fehler: CORS Error bei lokaler Ollama-Inferenz

> **Visualisierung:** Siehe [13_CORSArchitekturOllama_003.mmd](13_CORSArchitekturOllama_003.mmd)

- **Symptom:** Fetch-Error beim Versuch, das lokale Modell auf Port `11434` anzusprechen.
- **Ursache:** Ollama blockiert standardmäßig Cross-Origin-Requests aus dem Browser (`localhost:5173`).
- **Lösung:** Sie müssen Ollama mit aktivierten CORS-Headern starten. Unter Windows (PowerShell):
  `$env:OLLAMA_ORIGINS="*"; ollama serve` (oder spezifisch `http://localhost:5173`).

### Fehler: 429 Too Many Requests
- **Symptom:** Abbruch der Pipeline.
- **Ursache:** Rate-Limiting durch den Provider (z.B. OpenRouter Free-Tier) oder fehlendes Guthaben.
- **Lösung:** API-Key aufladen oder auf "Local" Provider umstellen.

---

## 2. WebGL, Engine und Performance

### Symptom: Der Graph ruckelt stark (< 30 FPS)
- **Ursache 1:** Zu viele Kanten (Relationships). Das Rendern von tausenden Linien oder Zylindern belastet die GPU stark.
- **Ursache 2:** Die Physik-Engine läuft kontinuierlich auf der CPU.
- **Lösung:**
  - Reduzieren Sie im UI die "Force" oder setzen Sie "Cooldown", damit die Physik zur Ruhe kommt.
  - Nutzen Sie `InstancedMesh` für Geometrien (bereits Standard in der Engine).
  - Schalten Sie Antialiasing in den Settings ab, wenn Sie auf schwacher Hardware arbeiten.

### Symptom: White Screen of Death beim Laden großer Graphen

> **Visualisierung:** Siehe [13_VRAMLeakKausalkette_001.mmd](13_VRAMLeakKausalkette_001.mmd)

- **Ursache:** Out-of-Memory (VRAM) Fehler der Grafikkarte. Alte Materialien wurden beim `clearScene` nicht korrekt disposed.
- **Lösung:** Prüfen Sie den `SceneManager.ts` daraufhin, ob alle Texturen, Geometrien und Arrays mit `.dispose()` behandelt wurden. Laden Sie die Seite mit `Ctrl + F5` neu.

---

## 3. Daten und Mapping

### Symptom: Ein Mapping (Farbe/Größe) hat keine Auswirkungen

> **Visualisierung:** Siehe [13_OntologieInstanzDivergenz_002.mmd](13_OntologieInstanzDivergenz_002.mmd)

- **Ursache:** Die Eigenschaft (z.B. `influence`) existiert zwar in der Ontologie (`dataModel`), wurde aber vom LLM in den eigentlichen `entities` nicht befüllt (Null oder Undefined).
- **Lösung:** Klicken Sie auf einen der Knoten, um die Rohdaten einzusehen. Prüfen Sie, ob das Feld befüllt ist. Falls nicht, generieren Sie den Graphen neu und fordern Sie das LLM im Prompt explizit auf: *"Achte zwingend darauf, das Feld 'influence' bei jedem Knoten mit einem Wert zwischen 1 und 100 zu füllen."*

### Symptom: Knoten fliegen chaotisch auseinander (Cluttering)
- **Ursache:** Die Repulsion-Force (Abstoßung) der Physik-Engine ist viel höher als die Link-Force (Anziehung der Kanten), oder der Graph ist unverbunden (Islands).
- **Lösung:** Justieren Sie die Physik-Slider im UI (Charge Strength verringern, Link Distance anpassen).
