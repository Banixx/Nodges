# Versionierung Info

Der Workflow zur Versionierung wurde ausgefuehrt. 
Die Version in `package.json` wurde erfolgreich auf `0.102.5` erhoeht.

**Hinweis:** 
In der `index.html` ist die Versionsnummer nicht mehr hartkodiert. Die Version wird nun dynamisch in der `App.ts` aus der `package.json` geladen und in der UI angezeigt (siehe Kommentar in `index.html`: `// Version is now handled in App.ts`). Daher war in `index.html` keine Aenderung notwendig.
