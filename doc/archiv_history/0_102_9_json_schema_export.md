# Export des JSON-Schemas fuer externe Programme

Das JSON-Schema fuer Nodges wurde erfolgreich generiert und ist einsatzbereit.

## Speicherort des Schemas
Das exportierte JSON-Schema liegt unter:
[nodges_schema.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges/public/data/nodges_schema.json)

## Wie wurde es geloest?
Wir nutzen das bestehende Test-Setup mit Vitest, um das in TypeScript/Zod definierte Schema dynamisch zu exportieren. 

* **Export-Skript**: Liegt unter [exportSchema.test.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/tests/exportSchema.test.ts).
* **Automatisierung**: In der [package.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges/package.json) wurde ein npm-Skript hinterlegt.

## Schema aktualisieren
Wenn du das Zod-Schema in `src/types.ts` aenderst, kannst du das JSON-Schema fuer externe Programme mit folgendem Befehl im Terminal aktualisieren:

```bash
npm run export:schema
```
