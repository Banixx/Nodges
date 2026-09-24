# Fehleranalyse: Fehlende Build-Metadaten bei Build 12 (LightRAG) JSON Exports

## Problembeschreibung
Beim Erstellen von JSON-Dateien über Build 12 (`build12_lightrag`) wurde in den gespeicherten JSON-Dateien unter `public/data/b12/B12_Graph_*.json` im `metadata`-Objekt lediglich `schemaVersion` (und `description`), jedoch kein `build`-Feld sowie keine weiteren Generierungs-Metadaten (`nodgesVersion`, `prompt`, `buildParameters`, `generationDetails`) vorgefunden.

## Ursachenanalyse
In `src/ui/CreatePanel.ts` wurde die Speicherung der Graph-Datei für Build 12 in den Zeilen 1398–1418 direkt im `else if (pipeline === 'build12_lightrag')`-Zweig durchgeführt:

```typescript
// Zeilen 1398-1403 in CreatePanel.ts (vor dem Fix)
await fetch('/api/save_graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: `../b12/B12_Graph_${fileSuffix}.json`, content: JSON.stringify(graphData, null, 2) })
});
```

Die zentrale Metadaten-Injektion (welche `graphData.metadata.build = pipeline`, `nodgesVersion`, `prompt` und `buildParameters` setzt) befand sich jedoch erst ab Zeile 1460 – NACH dem Abschluss aller Pipeline-Verzweigungen:

```typescript
// Zeilen 1460ff (vor dem Fix)
if (graphData) {
    if (!graphData.metadata) graphData.metadata = {};
    graphData.metadata.schemaVersion = graphData.metadata.schemaVersion || "5.0";
    graphData.metadata.nodgesVersion = pkg.version;
    graphData.metadata.build = pipeline;
    // ...
}
```

Dadurch wurde das JSON-Dokument bei Build 12 bereits in das Dateisystem (`public/data/b12/`) geschrieben und dem Benutzer zum Download angeboten, bevor die Metadaten angereichert wurden.

## Vorgeschlagene Behebung
1. Die Metadaten-Injektion in `CreatePanel.ts` wird vor das Abspeichern verlegt oder in eine strukturierte Hilfsmethode `enrichGraphMetadata` ausgegliedert.
2. `enrichGraphMetadata` wird sofort nach der Initialisierung von `graphData` aufgerufen, sodass sämtliche Exporte, Zwischenspeicherungen (`/api/save_graph`) und Downloads die vollständigen Metadaten (`build`, `schemaVersion`, `nodgesVersion`, `prompt`, `buildParameters`) beinhalten.
