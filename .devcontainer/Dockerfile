FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Chromium und essentielle OS-Abhängigkeiten installieren
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    chromium \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Setze Environment-Variablen für Browser
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
