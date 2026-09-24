# Speicherung von Pipeline- und Build-Metadaten im JSON-Graph

Dieses Dokument beschreibt das Konzept und die Implementierung, um Metadaten zu Schema-Version, Anwendungsversion, verwendetem Build, Build-Parametern und dem ursprünglichen Prompt direkt im generierten und exportierten JSON-Graphen abzuspeichern.

## Anforderungen
1. **Schema-Version**: Muss im JSON als `schemaVersion` hinterlegt sein (ist bereits vorhanden).
2. **Nodges-Version**: Die aktuelle Version der Anwendung (aus `package.json`) soll als `nodgesVersion` gespeichert werden.
3. **Build / Pipeline**: Der Name des verwendeten Builds (z. B. `build10`, `build8`, etc.) soll als `build` gespeichert werden.
4. **Build-Parameter**: Die spezifisch ausgewählten Parameter (z. B. `grounding`, `qualityAssurance`, `ratingMethod`, `provider`, `model`) sollen als `buildParameters` abgelegt werden.
5. **Prompt**: Der ursprüngliche Prompt für die Generierung muss im JSON enthalten sein.

## Technische Umsetzung

### 1. Auslesen der Nodges-Version
Da in `tsconfig.json` die Option `"resolveJsonModule": true` aktiv ist, können wir die `package.json` direkt importieren und deren Versions-Feld auslesen:
```typescript
import pkg from '../../package.json';
const nodgesVersion = pkg.version;
```

### 2. Anreicherung der Metadaten bei der Generierung in `CreatePanel.ts`
In der Methode `handleGenerate` in `src/ui/CreatePanel.ts` wird nach erfolgreicher Generierung der Graph geladen. Hier befüllen wir das `metadata` des Graphen mit den geforderten Daten:

```typescript
// Metadaten-Objekt sicherstellen
if (!graphData.metadata) {
    graphData.metadata = {};
}

// 1. Schema-Version
graphData.metadata.schemaVersion = graphData.metadata.schemaVersion || "5.0";

// 2. Nodges-Version aus package.json
graphData.metadata.nodgesVersion = pkg.version;

// 3. Verwendeter Build (Pipeline)
graphData.metadata.build = pipeline;

// 4. Prompt
graphData.metadata.prompt = prompt;

// 5. Build-spezifische Parameter
const buildParams: Record<string, any> = {
    provider: provider,
    model: model,
    interactionMode: mode,
    hasRagContext: !!ragText
};

if (pipeline === 'build10') {
    buildParams.grounding = this.b10GroundingSelect.value;
    buildParams.qualityAssurance = this.b10QaSelect.value;
    buildParams.ratingMethod = this.b10RatingSelect.value;
} else if (pipeline === 'build9') {
    buildParams.deduplicationThreshold = 0.85;
    buildParams.embeddingModel = 'google/gemini-embedding-2';
} else if (pipeline === 'build8') {
    buildParams.wikidataGrounding = true;
    buildParams.sparqlPipeline = true;
} else if (pipeline === 'build5') {
    buildParams.multiStep = {
        ontology: 'build_5_ontology_prompt.md',
        data: 'build_5_data_prompt.md',
        visuals: 'build_5_visual_prompt.md'
    };
}

graphData.metadata.buildParameters = buildParams;
```

### 3. Anpassungen im ExportManager in `ExportManager.ts`
Wir müssen sicherstellen, dass diese Metadaten beim Exportieren nicht bereinigt oder überschrieben werden. 
Da in `ExportManager.ts` die Daten über `exportNodgesJSON` bzw. `exportJSON` exportiert werden und dort nur `_buildVersion` gelöscht wird, bleiben die neuen Felder in `metadata` automatisch erhalten. 
Wir aktualisieren `ExportManager.ts` dahingehend, dass beim normalen Export über `exportJSON` ebenfalls standardmäßig die Metadaten übernommen werden.

### 4. Zwischenschritte im Download-Ordner speichern
Im `CreatePanel` wurde ein Kontrollkästchen hinzugefügt (`Zwischenschritte im Download-Ordner speichern`). Wenn dieses aktiviert ist, lädt die Anwendung während der Generierung die JSON- und Markdown-Zwischenschritte der jeweiligen Pipelines im Download-Ordner des Browsers herunter.
- **Build 5**: Speichert die Ontologie (Schritt 1), die Datenpunkte (Schritt 2) und die visuellen Mappings (Schritt 3).
- **Build 8 / 10**: Speichert die Zwischenschritte über den `onStepComplete`-Callback.
- **Build 9**: Speichert das generierte Roh-Netzwerk (Schritt 1) und den deduplizierten Endgraphen (Schritt 2).
- **Build 6 / Refine**: Speichert das jeweilige Graphenergebnis nach der Ausführung.
