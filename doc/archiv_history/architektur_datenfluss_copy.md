# Architektur: Datenfluss und LLM-Integration

## Kernprinzip: Separation of Concerns
Die Architektur von Nodges folgt dem Prinzip der strikten Trennung zwischen **Datenakquise** (LLM) und **Datenvisualisierung** (Nodges/Three.js). Dieses Prinzip stellt sicher, dass die Intelligenz des LLMs zur Datengenerierung genutzt wird, während die visuelle Kontrolle vollständig beim System und dem User verbleibt.

### 1. Das LLM als Datenlieferant
Das LLM hat die Aufgabe, ein Thema semantisch so tief wie möglich zu erschließen. 
*   **Keine Vorab-Filterung:** Das LLM darf keine Daten basierend auf vermuteten visuellen Einschränkungen weglassen.
*   **Maximaler Datenreichtum:** Jeder Knoten sollte ein `properties`-Objekt enthalten, das alle verfügbaren quantitativen und qualitativen Merkmale speichert (z.B. `influence_score`, `birth_year`, `region`, `category`).
*   **Schema-Anforderung:** Das Schema muss so gestaltet sein, dass das LLM ermutigt wird, über das `label` hinausgehende Attribute zu liefern.

### 2. Nodges als Visualisierungs-Engine
Nodges übernimmt die Regie über die Darstellung der gelieferten Rohdaten.
*   **Heuristisches Mapping:** Beim initialen Laden wählt Nodges automatisch (heuristisch) passende Eigenschaften für Farbe (kategorische Daten) und Größe/Leuchtkraft (kontinuierliche/numerische Daten) aus.
*   **Rohdaten-Erhalt:** Alle vom LLM gelieferten, aber initial nicht gemappten Eigenschaften bleiben als Rohdaten im Hintergrund erhalten.
*   **Live-Iteration:** Der User kann über die UI das Mapping jederzeit live ändern (z.B. "Größe nach Geburtsjahr statt Einfluss"), ohne einen neuen, teuren API-Call an das LLM auszulösen.

## Implementierungs-Status
*   **Status Quo:** Der aktuelle `LLMService.ts` liefert primär Basis-Felder (`id`, `label`, `type`). 
*   **Nächster Schritt:** Anpassung des System-Prompts in `LLMService.ts`, um das `properties`-Objekt als Standard zu etablieren und so die Grundlage für das dynamische UI-Mapping zu schaffen.

## Referenzen
*   [perspektive2.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/perspektive2.md)
*   [LLMService.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts)
