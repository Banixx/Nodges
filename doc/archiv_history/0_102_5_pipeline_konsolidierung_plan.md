# Konsolidierung der LLM-Pipeline (Build 6 Single-Step mit Zod)

Dieses Dokument beschreibt den Plan zur Implementierung der neuen "Build 6" LLM-Architektur (Single-Step Generierung via Zod Structured Outputs). Wie gewünscht, wird diese Funktionalität vollständig parallel zu Build 5 aufgebaut, sodass Sie im Interface jederzeit zwischen der alten und der neuen Methode wechseln können.

## User Review Required

Der Plan wurde an Ihre Antworten angepasst. Wir behalten Build 5 vollständig bei und integrieren einen UI-Schalter, um Build 6 risikofrei zu testen. Wenn Sie mit diesem Plan einverstanden sind, können wir mit der Implementierung (Code) beginnen.

## Proposed Changes

### 1. Abhängigkeiten & Tooling
#### [MODIFY] [package.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/package.json)
- Hinzufügen von `zod-to-json-schema` als Dependency zur dynamischen Umwandlung von `GraphDataSchema`.

### 2. Core Service Updates
#### [MODIFY] [src/utils/LLMService.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts)
- **Beibehalten** von `generateGraphDataMultiStepBuild5` (keine Änderungen an Build 5).
- **Hinzufügen** der neuen Funktion `generateGraphDataBuild6`.
- Nutzung von `zod-to-json-schema`, um `GraphDataSchema` in ein JSON-Schema zu parsen.
- Anpassung von `_executeLLMCall`, um das JSON-Schema optional als Payload (`response_format` oder System-Prompt-Erweiterung) an die Provider zu senden.

### 3. Prompting (Build 6)
#### [NEW] `public/prompts/build_6_prompt.md`
- Ein neuer, einzelner System-Prompt, der die Kernanweisungen für Ontologie, Daten und Visual Mappings kombiniert und das Modell auf strikte Schema-Einhaltung hinweist.
- Die alten `/prompts/build_5_*.md` Dateien bleiben unangetastet.

### 4. Benutzeroberfläche (UI)
#### [MODIFY] [src/components/ui/CreatePanel.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/components/ui/CreatePanel.ts)
- Einbau eines kleinen Schalters / Dropdowns im Erstellungs-Panel: "Pipeline: Build 5 (Multi-Step) | Build 6 (Single-Step Zod)".
- Je nach Auswahl wird entweder die alte oder die neue Funktion aus dem `LLMService` aufgerufen.
- Die Ladeanzeigen passen sich entsprechend an (3 Schritte bei Build 5, 1 Schritt bei Build 6).

## Verification Plan

### Automated Tests
- TypeScript Compiler (`npm run build`) muss erfolgreich durchlaufen.

### Manual Verification
- App starten und sicherstellen, dass der neue Schalter im CreatePanel sichtbar ist.
- Einen Graphen mit "Build 5" generieren (um sicherzustellen, dass alte Funktionalität nicht beschädigt wurde).
- Einen Graphen mit "Build 6" generieren und prüfen, ob a) die Generierung schneller ist und b) das resultierende JSON valide ist und visuell korrekt gemappt wird.
