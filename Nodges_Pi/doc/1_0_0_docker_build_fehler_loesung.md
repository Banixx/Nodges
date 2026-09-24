# Docker Build Fehlerbehebung: GID 1000 Existenzproblem

## Ursachenanalyse
Das Basis-Image `node:22-slim` bringt standardmaessig bereits einen Benutzer `node` mit der UID `1000` und GID `1000` mit.
Bei der Ausfuehrung von `groupadd -g 1000 piuser` bricht der Build mit dem Fehler `groupadd: GID '1000' already exists` ab.

## Loesung
In der [Dockerfile](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/Dockerfile) wird die Benutzer- und Gruppenerstellung so angepasst, dass geprüft wird, ob die GID bzw. UID bereits existiert (z. B. der Standard-User `node`). Falls sie existieren, werden Gruppe und Benutzer auf `piuser` umbenannt und der Home-Ordner verschoben. Falls nicht, werden sie neu angelegt.

```dockerfile
# Non-Root User mit Host-UID/GID anlegen oder anpassen
RUN if getent group ${GROUP_ID} >/dev/null; then \
        groupmod -n piuser $(getent group ${GROUP_ID} | cut -d: -f1); \
    else \
        groupadd -g ${GROUP_ID} piuser; \
    fi && \
    if getent passwd ${USER_ID} >/dev/null; then \
        usermod -l piuser -d /home/piuser -m $(getent passwd ${USER_ID} | cut -d: -f1); \
    else \
        useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash piuser; \
    fi
```
