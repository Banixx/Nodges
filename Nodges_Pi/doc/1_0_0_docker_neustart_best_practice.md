# Best Practice: Neustart abgebrochener Docker Compose Tasks

Wenn Docker-Builds oder Container-Tasks vorzeitig unterbrochen wurden, koennen Sie das Setup mit folgenden Schritten sauber wiederherstellen und ausfuehren:

## Empfohlene Vorgehensweise (Best Practice)

1. **Reste aufraeumen**:
   - Führen Sie `docker compose down` aus, um halb gestartete Container, Netzwerke und waise Ressourcen sauber zu entfernen.
   ```bash
   docker compose down
   ```

2. **Neustart mit Build und Cache-Nutzung**:
   - Starten Sie den Build erneut mit `docker compose up -d --build`.
   - Docker nutzt die bereits heruntergeladenen Layer (Caching), wodurch der erneute Anlauf wesentlich schneller verlaeuft.
   ```bash
   docker compose up -d --build
   ```

3. **Live-Logs im Vordergrund verfolgen**:
   - Wenn Sie den Fortschritt direkt im Vordergrund mitverfolgen moechten, nutzen Sie den Befehl `docker compose logs -f`.
   ```bash
   docker compose logs -f
   ```
   - Alternativ koennen Sie das `-d` weglassen und `docker compose up --build` direkt im Terminal ausfuehren.
