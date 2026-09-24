# Evaluierung des GEXF-Formats für Nodges

## 1. Einleitung
Dieser Bericht prüft die Möglichkeit und Sinnhaftigkeit, das **GEXF** (Graph Exchange XML Format) in das Nodges-Projekt zu integrieren. Untersucht wird, ob sich GEXF als vollständiger Ersatz für das bestehende eigene JSON-Format oder als zusätzliche Import-/Export-Schnittstelle eignet, insbesondere unter Berücksichtigung der bestehenden LLM-Datenpipeline.

## 2. GEXF vs. Custom JSON Format

### 2.1 Das aktuelle JSON-Format
- **Zustand**: Die aktuelle Architektur nutzt ein spezifisch entworfenes JSON-Format, welches durch Zod-Schemas streng validiert wird.
- **Vorteile**: JSON ist für Large Language Models (LLMs) extrem effizient zu generieren. Die Fehlerquote bei der Strukturierung ist gering, Token werden effizient genutzt. Zod-Validierung ist nahtlos in TypeScript integrierbar.
- **Nachteile**: Es ist ein proprietäres Format, was den Datenaustausch mit etablierten Tools (wie Gephi) erschwert.

### 2.2 Das GEXF-Format
- **Zustand**: GEXF ist ein XML-basiertes Standardformat für Graphen, entwickelt von der Gephi-Initiative.
- **Vorteile**:
  - **Interoperabilität**: Direkter Import und Export in nahezu alle gängigen Netzwerk-Analyse-Tools.
  - **Temporal Dynamics**: GEXF unterstützt nativ zeitliche Entwicklungen in Graphen (z.B. Knoten, die über die Zeit auftauchen oder verschwinden), was hervorragend zu den geplanten zeitlichen Dynamiken in Nodges passen würde.
  - **Standardisierung**: Klar definierte Knoten-, Kanten- und Attribut-Strukturen.
- **Nachteile**:
  - **Overhead**: XML ist signifikant wortreicher (verbose) als JSON. Dies bedeutet einen massiven Anstieg des Token-Verbrauchs bei der Generierung durch ein LLM.
  - **LLM-Kompatibilität**: LLMs haben tendenziell höhere Fehlerquoten bei der Generierung komplexer XML-Strukturen (z.B. nicht geschlossene Tags) im Vergleich zu strikt typisiertem JSON.

## 3. Implikationen für die Implementierung

### Szenario A: GEXF als vollständiger Ersatz (Generierung & Speicherung)
Ein Wechsel der LLM-Pipeline von JSON auf GEXF wird **nicht empfohlen**. Der Verlust an Token-Effizienz und die erhöhte Fehleranfälligkeit der LLMs bei der XML-Generierung würden die Stabilität der Systemerstellung gefährden. Die bestehenden Vitest-basierten Validierungs-Workflows (Zod) müssten durch XML-Parser ersetzt werden, was die Fehlerbehandlung verkompliziert.

### Szenario B: GEXF als Import-/Export-Format (Ergänzung)
Die Implementierung von GEXF als zusätzliche Schicht wird **stark empfohlen**. 
- **Export**: Nodges-Visualisierungen können als `.gexf` exportiert und in Tools wie Gephi weiter analysiert werden.
- **Import**: Nutzer können bestehende Datensätze (z.B. aus der akademischen Forschung) direkt in Nodges visualisieren.
- **Architektur**: Dies erfordert lediglich den Bau von zwei Konverter-Modulen (`jsonToGexf` und `gexfToJson`), ohne die robuste Kernarchitektur (JSON -> Zod -> Three.js) antasten zu müssen.

## 4. Fazit und Empfehlung
Das aktuelle JSON-Format sollte als Kernformat für die LLM-Kommunikation und interne Zustandsspeicherung beibehalten werden, um Performance, Token-Effizienz und Stabilität zu garantieren. 

Die Integration des **.gexf**-Formats ist als Import-/Export-Schnittstelle jedoch äußerst wertvoll. Es sollte ein dedizierter Parser/Serializer entwickelt werden, der die native Interoperabilität von Nodges drastisch erhöht und besonders die Nutzung von temporalen Netzwerken in Zukunft erleichtert.
