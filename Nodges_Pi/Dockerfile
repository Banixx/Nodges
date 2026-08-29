# Basis-Image mit Node.js 22 slim (fuer Pi Agent Harness >= 0.75.0, kleinerer Download)
FROM node:22-slim

# Build-Argumente für Non-Root User (müssen mit deinem WSL-User übereinstimmen)
ARG USER_ID=1000
ARG GROUP_ID=1000

# Installiere System-Tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    build-essential \
    curl \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Non-Root User mit Host-UID/GID anlegen oder bestehende GID/UID 1000 umbenennen
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

# Arbeitsverzeichnis vorbereiten
WORKDIR /workspace
RUN chown piuser:piuser /workspace

# Git-Systemkonfiguration (für automatische Commits nötig)
RUN git config --system user.name "Pi Agent" && \
    git config --system user.email "pi-agent@localhost"

# Pi Coding Agent global installieren (noch als root)
RUN npm install -g @earendil-works/pi-coding-agent

# Auf Non-Root wechseln – ab hier läuft alles ohne root-Rechte
USER piuser

# Container im Hintergrund aktiv halten
CMD ["tail", "-f", "/dev/null"]
