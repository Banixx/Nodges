# Ideen zur LLM-Auswahl für Nodges

Die Wahl des richtigen Large Language Models (LLM) für Nodges ist entscheidend, da die Build 5 Pipeline komplexe, streng typisierte JSON-Strukturen und mehrstufige Generierungsprozesse erfordert. Die Nutzung spezialisierter Modelle und Services kann Qualität, Geschwindigkeit und Kosten drastisch optimieren.

## 1. Die Herausforderung in Nodges
Nodges verlangt vom LLM keine klassischen Chat-Antworten, sondern fungiert als **Daten-Pipeline**:
- **Strikte JSON-Compliance**: Keine Markdown-Blöcke (` ```json `), exakte Einhaltung des `dataModel` und der Validierungsregeln.
- **Semantische Tiefe**: Erkennen abstrakter Zusammenhänge (z.B. komplexe historische oder mythologische Hierarchien).
- **Volumen**: Generierung hunderter Knoten (Nodes) und Kanten (Edges).

## 2. Ansatz: Multi-Modell-Pipeline (Routing)
Über Plattformen wie [OpenRouter](https://openrouter.ai/) kann je nach Phase der Datengenerierung ein unterschiedliches, auf die jeweilige Aufgabe spezialisiertes Modell eingesetzt werden, um die Balance aus "Intelligenz" und "Kosten" zu perfektionieren.

### Phase 1-3: Konzept, Ontologie & DataModel
*Aufgabe: Das abstrakte Verständnis der Domäne und der Aufbau der Schema-Regeln.*
* **Empfohlene Modelle**: Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro
* **Warum**: Hier wird tiefes Reasoning benötigt. Diese "High-End"-Modelle können am besten komplexe Abhängigkeiten logisch planen und ein in sich konsistentes Entitäts- und Beziehungsmodell entwerfen.
* **Kosten-Faktor**: Höher, aber diese Phase benötigt nur wenige, kurze API-Calls.

### Phase 4: Massenhafte Daten-Instanziierung (Nodes & Edges)
*Aufgabe: Das stupide Abfüllen des definierten Schemas mit konkreten Daten.*
* **Empfohlene Modelle**: GPT-4o-mini, Gemini 1.5 Flash, Llama 3.1 (70B)
* **Warum**: Sobald das Schema steht, ist die Instanziierung für das LLM relativ einfach, erzeugt aber extrem viele Token (hoher Output). Mini/Flash-Modelle sind hierfür unfassbar schnell und teilweise 90% günstiger als die großen Modelle.

### Phase 5: Visual Mappings
*Aufgabe: Regelbasierte Zuordnung von Formen, Größen und Farben gemäß dem Nodges-Format.*
* **Empfohlene Modelle**: Nous Hermes 2 Pro (oder andere Open-Weights JSON-Spezialisten auf OpenRouter), Mistral Nemo, GPT-4o-mini
* **Warum**: Das ist reine Formatierung und einfache Logik. Spezialisierte Modelle, die auf Tool-Calling und JSON-Output feingetuned sind, liefern hier fehlerfreie Ergebnisse fast zum Nulltarif.

## 3. Technologische Hebel (API-Features)

### A. Structured Outputs (JSON Schema Forcing)
Das aktuelle Problem ("LLM generiert fälschlicherweise Markdown um das JSON") lässt sich auf API-Ebene lösen.
Viele APIs (OpenAI, OpenRouter, Anthropic) unterstützen mittlerweile **Structured Outputs**.
Anstatt im Prompt zu betteln ("Deine Antwort MUSS ausschließlich gültiges JSON sein"), übergibt man der API direkt das Nodges-JSON-Schema. Die API *erzwingt* dann auf Token-Ebene, dass die Ausgabe zu 100% ein valides JSON nach diesem Schema ist. Das LLM kann physisch nichts anderes mehr halluzinieren.

### B. Fallback-Routing
OpenRouter erlaubt in der API Konfigurationen wie: `models: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o"]`. Wenn Claude überlastet ist, springt in Millisekunden GPT-4o ein. Das erhöht die Stabilität der Nodges-Infrastruktur enorm.

## 4. Konkrete Empfehlung für den nächsten Schritt
1. **API-Upgrade prüfen**: Umstellung der LLM-Aufrufe im Code auf `response_format: { type: "json_schema", json_schema: { ... } }`, falls der genutzte Provider das unterstützt. Dies eliminiert 90% der Format-Bugs im JSON.
2. **Modell-Splitting testen**: Für die Visual Mappings (Phase 5) testweise ein sehr schnelles, billiges Modell via OpenRouter ansprechen. Für das komplexe abstrakte `dataModel` ein High-End-Modell beibehalten.
