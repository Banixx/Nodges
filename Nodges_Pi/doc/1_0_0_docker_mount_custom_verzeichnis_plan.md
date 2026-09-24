# Implementierungsplan: Custom-Verzeichnis in Docker-Container mounten

## Uebersicht
Es soll ein zusaetzliches WSL-Verzeichnis in den Docker-Container gemountet werden, damit der `pi` Agent von pi.dev auf benutzerdefinierte Dateien wie `AGENTS.md` oder globale Konfigurationen zugreifen und diese auch beschreiben kann (Read-Write). Das Zielverzeichnis im Container wird auf `/home/.pi` verkuerzt.

## Aenderungen an den Dateien

### 1. `.env.example`
Erweiterung um die Variable `CUSTOM_PATH`:
```env
# Pfad zum benutzerdefinierten WSL-Verzeichnis fuer globale/custom Anweisungen (z. B. AGENTS.md)
CUSTOM_PATH=/home/.pi
```

### 2. `docker-compose.yml`
Erweiterung der Volume-Mounts fuer den Service `pi-agent` mit Schreib- und Lesezugriff (Read-Write) auf das verkuerzte Ziel `/home/.pi`:
```yaml
    volumes:
      - ${REPO_PATH:-.}:/workspace
      - type: bind
        source: ${SSH_AUTH_SOCK:-/dev/null}
        target: /ssh-agent
        read_only: true
      # Custom-Verzeichnis aus WSL fuer AGENTS.md und eigene Agent-Dateien (Read-Write)
      - type: bind
        source: ${CUSTOM_PATH:-/home/.pi}
        target: /home/.pi
        read_only: false
```

### 3. `setup-pi-branch.sh`
Erweiterung des interaktiven Setup-Skripts:
* Abfrage des WSL-Pfads fuer `CUSTOM_PATH` (Standard: `/home/.pi`).
* Automatische Erstellung des Ordners in WSL, falls er noch nicht existiert.
* Schreiben des `CUSTOM_PATH` Eintrags in die generierte `.env`.

## Verifikation
1. Pruefen, ob der Mount mit `docker inspect pi-harness` korrekt auf `/home/.pi` zeigt.
2. In der Container-Shell (`docker exec -it pi-harness bash`) verifizieren, dass `/home/.pi/AGENTS.md` lesbar und beschreibbar ist.
3. Testen, ob `pi` beim Start die benutzerdefinierten Anweisungen aus `/home/.pi` bzw. `/workspace` laedt.
