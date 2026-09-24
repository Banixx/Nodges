# Der Multi-Step Generierungsprozess in Nodges

In der Architektur von Nodges (speziell in `LLMService.ts`) ist die LLM-Generierung modular in mehrere API-Aufrufe unterteilt, um die Ontologie von den Instanzdaten zu trennen.

## Wie der Code aktuell funktioniert

Methoden wie `generateGraphDataMultiStep` oder `generateGraphDataMultiStepBuild5` führen den Prozess sequenziell aus:

1. **Schritt 1 (Ontologie)**: Ein API-Aufruf an das LLM wird mit dem `ontology_prompt.md` abgesetzt. Das LLM antwortet mit einem JSON, das nur das Schema (z. B. `dataModel`, `visualMappings`) enthält. Dieses Ergebnis wird im Code temporär in einer Variable (z. B. `step1Data` oder `ontologyData`) gespeichert.
2. **Schritt 2 (Instanzdaten)**: Direkt im Anschluss wird ein zweiter API-Aufruf getätigt. Dabei wird dem LLM die im ersten Schritt generierte Ontologie (`step1Data`) als strikte Vorgabe im Prompt mitgegeben. Das LLM generiert nun die `data.entities` und `data.relationships`.
3. **Schritt 3 (Visual Mappings - nur Build 5)**: Ein dritter Aufruf erstellt die Zuordnungen.

Am Ende der Funktion werden alle Teilergebnisse mit dem Spread-Operator gemergt (`{ ...step1Data, ...step2Data }`) und als ein vollständiges `GraphData`-Objekt an das Frontend zurückgegeben.

## Ist die Ontologie nach dem ersten Schritt verfügbar?

**Ja, technisch gesehen liegt die reine Ontologie nach dem ersten Schritt im RAM vor.**

Aktuell läuft der Prozess im Code jedoch ohne Pause durch. Es gibt keinen automatischen Stopp, um dem Nutzer die Ontologie zur Freigabe oder Inspektion anzuzeigen, bevor der zweite Schritt gestartet wird. 
Wenn man die Ontologie nach dem ersten Schritt abfangen möchte (z. B. für einen "Approve Ontology"-Button in der UI), müsste man den Prozess in `LLMService.ts` auftrennen:
- Eine Funktion `generateOntology()` aufrufen.
- Das Ergebnis an die UI übergeben.
- Erst nach Bestätigung eine zweite Funktion `generateData(ontology)` aufrufen.

Im finalen JSON-Datensatz, der aktuell am Ende gespeichert wird, ist die generierte Ontologie jedoch vollständig im `dataModel`-Block enthalten und somit archiviert.
