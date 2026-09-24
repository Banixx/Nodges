# Loesung fuer den Fehler "missing mount target" in Docker Compose

## Ursache

Der Fehler `service volume services.pi-agent.volumes.[0] is missing a mount target` wird durch die Zeile 17 in `docker-compose.yml` verursacht:
```yaml
- ${REPO_PATH:?Error: REPO_PATH in .env setzen}:/workspace
```
Da die Variable `REPO_PATH` in der Datei `.env` nicht deklariert ist, kann Docker Compose den Pfad nicht aufloesen.

## Behebung

1. In `.env` die Variable `REPO_PATH=./` definieren.
2. In `docker-compose.yml` einen Fallback-Wert `${REPO_PATH:-.}:/workspace` hinterlegen.
