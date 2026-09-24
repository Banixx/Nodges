# Architektur-Plan: Integration der Gruppen-Ontologie in die LLM-Prompts

Das Ziel ist es, dem LLM (sowohl in der Multi-Step-Pipeline Build 5 als auch in der Single-Step-Pipeline Build 6) beizubringen, dass Gruppierungen, Hierarchien und Kategorien nicht als flache Attribute in einem Knoten vergraben werden dürfen. Stattdessen müssen sie zwingend als echte Entitäten und Kanten (Netzwerk-Beziehungen) im JSON modelliert werden.

## Die neue Kernregel für die Prompts

Wir werden in die Prompts eine klare Verhaltensanweisung einfügen, die in etwa so lautet:

> **GRUPPEN ALS ENTITÄTEN (ONTOLOGIE-REGEL):**
> Wenn das Thema übergeordnete Gruppen, Kategorien, Cluster oder Hierarchien enthält (z.B. Abteilungen, Sonnensysteme, Familienzweige), darfst du diese Zugehörigkeit **NICHT** als simples Text-Attribut in einen Knoten schreiben (vermeide z.B. `{"abteilung": "Marketing"}`). 
> Stattdessen musst du die Gruppe zwingend als **eigenständige Entität** (z.B. vom Typ `group`, `category` oder thematisch passend) definieren. Die Mitgliedschaft von Unterelementen zu dieser Gruppe muss zwingend als gerichtete Kante (z.B. `belongs_to`, `ist_teil_von`) abgebildet werden.

## Proposed Changes

### [MODIFY] public/prompts/build_5_ontology_prompt.md
- Einfügen der neuen Regel im Block `WICHTIGE REGELN FUER DIE ONTOLOGIE:`.
- Dadurch wird sichergestellt, dass die LLM-generierte Ontologie bereits zwingend Kanten für Mitgliedschaften und eigene Knotentypen für Gruppen vorsieht.

### [MODIFY] public/prompts/build_6_prompt.md
- Einfügen der neuen Regel unter `1. SCHRITT: DIE ONTOLOGIE (Schema)`.
- Dies zwingt das Single-Step-Modell (z. B. Grok), Gruppierungen beim Aufbau des Schemas direkt netzwerkfähig aufzubrechen.

### [MODIFY] public/prompts/refine_prompt.md
- Hinzufügen einer leichten Erinnerung, dass Gruppen-Entitäten und Mitgliedschafts-Kanten bei der Detaillierung des Graphen konsequent mitgedacht werden sollen.

## User Review Required

> [!IMPORTANT]
> Bist du mit der genauen Formulierung der Prompt-Anweisung (siehe Kasten oben) einverstanden? 
> Sie vermeidet bewusst das explizite Wort `cloud` (um das LLM thematisch nicht einzuschränken), zwingt das Modell aber dazu, die Zugehörigkeit graph-basiert als Kante + Entität aufzulösen.
