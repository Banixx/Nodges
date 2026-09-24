# Die Ontologie in Nodges

Die Ontologie in Nodges ist das fundamentale Datenschema, welches vor der eigentlichen Datengenerierung durch das LLM entworfen wird. Sie definiert strikt die semantische Struktur, die verfuegbaren Entitaeten, Beziehungen und das visuelle Mapping, ohne dass zu diesem Zeitpunkt bereits konkrete Instanzen (Daten-Knoten) existieren.

## Kernstruktur der Ontologie

Die Ontologie ist in vier Hauptbereiche unterteilt:

1. **`system`**: Der übergeordnete Name des Netzwerks.
2. **`metadata`**: Beinhaltet beschreibende Informationen wie die `schemaVersion`, eine Beschreibung und die sogenannten "Competency Questions", aus denen die Relevanz der zu generierenden Attribute abgeleitet wird.
3. **`dataModel`**: Das eigentliche Schema.
   - **`entities`**: Definiert die zulässigen Knotentypen. Jeder Typ erhält strikte `properties` (z. B. kategorisch für Regionen, kontinuierlich für Alter/Budget). Verschachtelungen sind verboten.
   - **`relationships`**: Definiert die zulässigen Kanten. Jede komplexe Abhängigkeit muss eine eigene Kante sein.
4. **`visualMappings`**: Das visuelle Regelwerk.
   - **`defaultPresets`**: Legt fest, welche semantischen Eigenschaften aus dem `dataModel` auf welche visuellen Kanäle (`size`, `color`, `thickness`, `geometry`, `position`) gemappt werden.
   - Es gelten strenge Regeln: Kanäle müssen unterschiedliche Eigenschaften abbilden, und die visuelle Skalierung (z. B. Größen-Limits von 1.0 bis 3.0) ist reglementiert.

## Prinzip "und anhand des in der Ontologie..."

Der Leitsatz beim Generieren der Instanzdaten lautet: *Befülle die Daten strikt nach den Vorgaben und anhand des in der Ontologie definierten Schemas.* 

Wenn das LLM im zweiten Schritt die Daten generiert (die eigentlichen Knotenpunkte und Verbindungen in `data.entities` und `data.relationships`), darf es ausschliesslich Typen und Properties verwenden, die zuvor in der Ontologie deklariert wurden. Die Ontologie dient somit als hartes Validierungs-Korsett, das Halluzinationen und ungültige Datenstrukturen bei der Graph-Erstellung unterbindet.
