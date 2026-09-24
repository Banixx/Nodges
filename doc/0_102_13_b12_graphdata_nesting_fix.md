# Dokumentation: Korrektur der GraphData-Verschachtelung fuer Build 12

## Problemstellung
Beim Verarbeiten des LightRAG-Ergebnisses in `CreatePanel.ts` trat in der Konsole folgender Fehler auf:
`[Nodges ERROR] Import-Fehler: TypeError: can't access property "forEach", this.currentEntities is undefined`

## Ursache
Die Methode `LightRAGService.queryGraph` liefert bereits ein vollstaendiges `GraphData`-Objekt (`{ metadata, data: { entities, relationships } }`) zurueck. In [CreatePanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts) wurde dieses Objekt fälschlicherweise in ein weiteres `data`-Feld verpackt (`data: lightRagResult.graphData`). Dadurch entstand eine doppelte Verschachtelung (`data.data.data.entities`), weshalb Nodges `entities` an der erwarteten Stelle `data.data.entities` nicht finden konnte.

## Loesung
In [CreatePanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts#L1389) wurde die Zuweisung korrigiert, sodass `graphData.data` direkt auf `lightRagResult.graphData.data` verweist.
