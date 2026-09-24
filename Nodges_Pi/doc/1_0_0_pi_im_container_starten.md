# Starten von Pi Coding Agent im Docker-Container

Um den Pi Coding Agent innerhalb des laufenden Docker-Containers auszufuehren, stehen Ihnen folgende Moeglichkeiten zur Verfuegung:

## Variante 1: Interaktive Bash-Sitzung im Container oeffnen (Empfohlen)

1. Oeffnen Sie ein Terminal im Projektverzeichnis (`C:/Users/ich/Desktop/code/_projects/Nodges_Pi`).
2. Verbinden Sie sich mit dem laufenden Container:
   ```bash
   docker compose exec -it pi-agent bash
   ```
3. Starten Sie anschliessend die CLI von Pi direkt im Container:
   ```bash
   pi
   ```

## Variante 2: Direktstart von Pi ueber Docker Compose

Sie koennen die interaktive Pi-Sitzung auch direkt mit einem Befehl starten:
```bash
docker compose exec -it pi-agent pi
```

## Variante 3: Aufruf ueber den Container-Namen

Alternativ koennen Sie den generierten Container-Namen (`pi-harness`) verwenden:
```bash
docker exec -it pi-harness pi
```
