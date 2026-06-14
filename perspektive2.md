# Perspektive 2: Semantische Anreicherung und intelligentes Mapping (Korrektur)

Basierend auf deinem Feedback korrigieren wir die Architektur: Die Filterung der Daten darf **nicht** durch das LLM passieren. Das LLM ist der Datenlieferant, Nodges (und der User) übernehmen die Regie über die Visualisierung.

## 1. Die Rolle des LLMs: Maximaler Datenreichtum
Das Schema in `LLMService.ts` muss so angepasst werden, dass das LLM ermutigt wird, **alle** relevanten Eigenschaften (Properties) zu einem Thema zu extrahieren. Es gibt kein künstliches Limit im Prompt. 

Wenn wir das LLM bitten, zu einem Thema einen Graphen zu erstellen, sollte es für jeden Knoten alle erfassbaren und sinnvollen Eigenschaften ermitteln. Das Schema sieht dann beispielhaft so aus:
```json
{
  "id": "aristoteles",
  "label": "Aristoteles",
  "type": "Philosoph",
  "properties": {
    "influence_score": 98,
    "school_of_thought": "Peripatetiker",
    "birth_year": -384,
    "written_works_count": 200,
    "region": "Griechenland",
    "students_count": 50,
    "controversy_index": 4.2,
    "main_discipline": "Metaphysik"
    // ... und beliebig viele weitere
  }
}
```

## 2. Die Rolle von Nodges: Intelligente Standard-Heuristik
Sobald dieses umfangreiche Datenpaket in Nodges geladen wird, greift die Visualisierungs-Logik. Um den Nutzer nicht visuell zu überfordern, wählt Nodges **beim Erstellen des Graphen** heuristisch einige wenige (z.B. die ersten oder passendsten) Eigenschaften aus und mappt sie auf visuelle Parameter. Die restlichen Eigenschaften bleiben als Rohdaten im Hintergrund erhalten.

Die Logik dafür basiert auf Datentypen:

### A. Kategorische Daten ➔ Gruppierung (Farbe)
*   *Heuristik:* Nodges sucht nach der ersten String-Eigenschaft (z.B. `school_of_thought` oder `region`).
*   *Aktion:* Diese wird automatisch einer Farbpalette zugewiesen. Das menschliche Auge erfasst diese Knoten sofort als zusammengehörige Gruppe.

### B. Kontinuierliche Daten ➔ Skalierung (Größe)
*   *Heuristik:* Nodges sucht nach numerischen Eigenschaften (z.B. `influence_score`, `written_works_count`).
*   *Aktion 1 (Größe):* Ein numerischer Wert skaliert den Radius der Sphäre.
*   *Aktion 2 (Leuchtkraft/Glow):* Ein weiterer numerischer Wert steuert die Intensität des Glow-Effekts.

## 3. Die Rolle des Users: Iteration und Schieberegler
Hier entfaltet sich das volle Potenzial: Da das LLM im ersten Schritt (One-Shot) bereits die gesamte Fülle an Eigenschaften geliefert hat, muss der User für Änderungen **keinen neuen API-Call** an das LLM schicken.

*   **Mapping-UI / Schieberegler:** In der UI (z.B. im Mappings-Tab oder als schnelle Regler im Create-Tab) tauchen Dropdowns oder Regler auf, die alle geladenen Eigenschaften auflisten. 
*   **Live-Iteration:** Der User sagt: "Größe soll nicht mehr `influence_score` sein, sondern `written_works_count`". Da die Daten bereits im Speicher liegen, passt sich der Graph in Echtzeit an.

## Fazit
Die strikte Trennung ist genial: 
1. **LLM:** "Hier sind absolut alle Daten, Zahlen und Kategorien, die ich zu den Knoten finden konnte."
2. **Nodges:** "Ich baue dir daraus sofort einen optisch ansprechenden Graphen, indem ich eine logische Größe- und Farb-Logik auf die Datensätze anwende."
3. **User:** "Ich nutze die UI-Regler, um live durch die restlichen Eigenschaften zu surfen und die Visualisierung genau an meine Fragestellung anzupassen."
