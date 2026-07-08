# Analyse: Die Rolle und Dominanz von "type" in Nodges

Der Begriff `type` (sowie "Typen") ist historisch in der Architektur von Nodges stark verwurzelt. Aktuell behauptet er sich in der Tat als "dominante, grundsätzliche Einteilung". 

Nach einer Code-Analyse zeigt sich, dass `type` in zwei völlig unterschiedlichen Kontexten verwendet wird:

## 1. Der systeminterne (technische) Typ
In der Rendering-Engine (Three.js) und im Interaktions-System (Raycasting, SelectionManager) wird `type` genutzt, um zwischen grafischen Primitiven zu unterscheiden:
- `userData.type === 'node'`
- `userData.type === 'edge'`
- `userData.type === 'node_instanced'`

**Bewertung:** Diese Nutzung ist rein technisch und völlig legitim. Sie hat nichts mit dem inhaltlichen Graphen (Ontologie) zu tun.

## 2. Der ontologische (inhaltliche) Typ
In den Zod-Schemas (`types.ts`) wird `type` als zwingendes (required) Attribut für jede Entität und jede Beziehung gefordert:
```typescript
export const EntityDataSchema = z.object({
    id: z.string(),
    type: z.string(), // DOMINANT
    // ...
});
```
Diese inhaltliche Dominanz zieht sich durch folgende Bereiche:

1. **Zwang im JSON-Format:** Jede Node ("Fisch", "Koralle") und jede Edge ("ParentOf", "EnemyOf") *muss* einen Typ haben. Das zwingt dem Datensatz eine starre Kategorisierung auf.
2. **Visual Mappings (`VisualMappingsSchema`):** Das Mapping-System geht standardmäßig davon aus, dass visuelle Regeln pro `type` definiert werden (`defaultPresets: { [type: string]: Preset }`). Anstatt Mapping-Regeln global anhand von Attributen anzuwenden, ordnet die Engine Regeln zuerst einem starren Typ zu.
3. **DataModel / Ontologie:** In älteren Build-Stufen (Build 4) wurde das Schema stark nach Typen (Klassen) modelliert (ähnlich der objektorientierten Programmierung).

## Warum diese Dominanz problematisch ist (Build 5 Perspektive)
In einer hochdynamischen, attributbasierten Architektur (wie im Mapping Panel gerade vorbereitet) ist eine feste Klassifizierung ("Ich bin vom Typ Fisch") oft zu starr. 
Eine Entität kann mehrere Rollen haben oder sich im Zeitverlauf ändern. Ein `type` sollte eigentlich nur ein reguläres, optionales Attribut (z. B. `category` oder `class`) unter vielen sein, das wie jedes andere Attribut auf visuelle Eigenschaften gemappt werden kann (z. B. "Wenn Attribut X den Wert Y hat, dann Farbe Grün").

## Handlungsempfehlungen (Refactoring-Möglichkeiten)

Wenn wir die Dominanz von `type` abbauen wollen, bieten sich folgende Schritte an:

1. **Zwang entfernen:**
   In `types.ts` das Feld `type` optional machen (`type: z.string().optional()`) oder es inhaltlich komplett durch flexible Attribute ersetzen. Wenn ein Datensatz eine Art "Kategorie" mitbringt, wird diese einfach als reguläres Key-Value-Paar eingelesen.
   
2. **Visual Mapping umbauen:**
   Statt `defaultPresets` nach starren Typ-Namen (wie "Koralle") aufzuteilen, reduzieren wir das Mapping auf `global_node` und `global_edge`. Wenn der Nutzer Knoten unterschiedlich färben will, mappt er einfach ein Attribut (z.B. `Gruppe`, `Kategorie` oder `type`) auf die Eigenschaft `color`. (Das ist im neuen Mapping-Panel de facto schon möglich!).
   
3. **LLM Prompts anpassen:**
   Die Anweisung an die KI in Build 5 sollte nicht mehr zwingend fordern, jeder Entität einen fixen `type` zuzuordnen, sondern ihr erlauben, freie beschreibende Attribute zu generieren.

**Fazit:** Der Begriff `type` stammt aus einer eher tabellarischen, starren Denkweise (Build 4). Für eine flache, rein attributgetriebene Mapping-Logik (Build 5) ist er tatsächlich zu dominant und sollte zu einem gewöhnlichen, optionalen Attribut degradiert werden.
