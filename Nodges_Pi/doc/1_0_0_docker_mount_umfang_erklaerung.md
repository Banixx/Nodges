# Ueberpruefung des Mount-Umfangs in Docker Compose

## Frage: Ist das gesamte Laufwerk C: gemountet?

**Antwort**: Nein. Es ist nicht das gesamte Laufwerk C: gemountet, sondern ausschliesslich das Projektverzeichnis.

## Details der Mount-Konfiguration

In [docker-compose.yml](file:///c:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml) ist folgender Bind-Mount definiert:

```yaml
volumes:
  - ${REPO_PATH:-.}:/workspace
```

Gemäss der ausgewerteten Docker-Konfiguration entspricht dies exakt dem Pfad:
- **Host-Pfad**: `C:\Users\ich\Desktop\code\_projects\Nodges_Pi`
- **Container-Zielpfad**: `/workspace`

Der Container hat somit nur Zugriff auf die Dateien innerhalb dieses einen Projektordners. Andere Bereiche des Laufwerks C: sind fuer den Container unzugaenglich.
