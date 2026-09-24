# Ursachenanalyse: Keine Rückmeldung auf den Ports 5173 und 8000

## Zusammenfassung
Der Docker-Container `pi-harness` läuft zwar, jedoch ist auf den weitergeleiteten Ports `5173` und `8000` kein Dienst erreichbar. In der PowerShell bleibt `docker compose up` bei `Attaching to pi-harness` stehen.

## Grund der Ursache

1. **Idle-Befehl im Dockerfile**: 
   Im [Dockerfile](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/Dockerfile) ist als Standardbefehl (CMD) folgendes definiert:
   ```dockerfile
   CMD ["tail", "-f", "/dev/null"]
   ```
   Dieser Befehl dient lediglich dazu, den Container dauerhaft laufen zu lassen, startet jedoch keinen Webserver (wie Vite oder ein Python-Backend).

2. **Kein lauschender Dienst im Container**: 
   Da `tail -f /dev/null` ausgeführt wird, hört innerhalb des Containers kein Prozess auf die Ports `5173` oder `8000`. Anfragen von ausserhalb werden daher abgelehnt.

3. **Verhalten in PowerShell**: 
   `docker compose up` hängt sich an die Log-Ausgabe des Containers an (`Attaching to pi-harness`). Da `tail -f /dev/null` keine Ausgaben erzeugt, erscheint in der Konsole keine neue Meldung.

## Lösungsschritte

### Option 1: Befehl im laufenden Container ausführen
Der Frontend-Server kann direkt im bereits laufenden Container gestartet werden:
```bash
docker exec -it pi-harness npm run dev
```

### Option 2: Anpassen der `docker-compose.yml` oder des `Dockerfile`
Der Startbefehl kann angepasst werden, um den Entwicklungsserver automatisch zu starten (z. B. `npm run dev`).
