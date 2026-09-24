# Pi Coding Agent Installation (@earendil-works/pi-coding-agent)

## Uebersicht
Das von dir genannte Paket `@earendil-works/pi-coding-agent` stellt die interaktive CLI-Anwendung `pi` zur Verfuegung.

## Ausfuehrung im Container

Du kannst den Pi Coding Agent direkt im laufenden Container verwenden:

1. **Ausfuehrung via npx**:
   ```bash
   docker exec -it pi-harness npx @earendil-works/pi-coding-agent
   ```

2. **Ausfuehrung in der interaktiven Container-Shell**:
   Wenn du in der Container-Shell eingewaehlt bist (`docker exec -it pi-harness sh`), kannst du `pi` wie folgt starten:
   ```bash
   npx @earendil-works/pi-coding-agent
   ```
   oder nach globaler Installation:
   ```bash
   pi
   ```

3. **Verwendete Umgebungsvariablen**:
   Die API-Schluessel aus der `.env`-Datei (z. B. `OPENROUTER_API_KEY`) stehen dem Agenten im Container automatisch zur Verfuegung.
