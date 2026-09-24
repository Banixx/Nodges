# JSON-Schema in Nodges

Es gibt keine statische JSON-Schema-Datei (.json) in der Codebase. Das Schema wird stattdessen dynamisch ueber TypeScript und Zod definiert und bei Bedarf zur Laufzeit konvertiert.

## Technische Umsetzung

1. **Zod-Definition**: In der Datei [types.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/types.ts) wird die Struktur der Graphdaten ueber das Zod-Schema `GraphDataSchema` definiert.
2. **Dynamische Konvertierung**: In der Datei [LLMService.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts) wird dieses Zod-Schema fuer LLM-Aufrufe mit der Bibliothek `zod-to-json-schema` in ein JSON-Schema konvertiert.
3. **Anpassung**: In `LLMService.ts` wird das Schema bereinigt (z. B. Entfernen von `$schema` und Anpassung an strict-Modi fuer APIs wie OpenAI).
