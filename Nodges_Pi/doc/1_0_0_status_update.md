# Status-Update zur Pi-Installation

## Aktueller Fortschritt
1. Das [Dockerfile](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/Dockerfile) wurde angepasst, um das Paket `@earendil-works/pi-coding-agent` fest im Docker-Image zu verankern (`RUN npm install -g @earendil-works/pi-coding-agent`).
2. Der Neuaufbau des Docker-Images wurde mittels `docker compose up -d --build` gestartet.

Sobald der Build abgeschlossen ist, steht der Befehl `pi` dauerhaft im Container bereit.
