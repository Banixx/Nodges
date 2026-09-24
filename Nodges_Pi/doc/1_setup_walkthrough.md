# Einrichtung: Pi Coding Agent Harness in Docker

## Architektur & Pfade
- **Host-Projektpfad**: `c:/Users/ich/Desktop/code/_projects/Nodges_Pi`
- **Container-Projektpfad** (als Mount): `c:/Users/ich/Desktop/code/_projects/Nodges_Pi` (im Container gemountet)
- **Konfigurationsdatei**: `c:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env`
- **WSL-Konfiguration**: `C:/Users/ich/.wslconfig`

## Pi Coding Agent Harness

**Paket**: `@earendil-works/pi-coding-agent`

### Installation im Container (einmalig)
Von einem Host-PowerShell-Terminal aus:
```cmd
docker exec pi-harness npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

### Pi Agent starten (im Container)
Zuerst in die Container-Shell wechseln:
```cmd
docker exec -it pi-harness bash
```
Dann im Container:
```bash
pi
```

## Vite Frontend (separates Terminal)

In einem zweiten PowerShell-Tab in die Container-Shell wechseln:
```cmd
docker exec -it pi-harness bash
```
Dann im Container:
```bash
npm run dev
```
Erreichbar unter `http://localhost:5173`

## Umgebungsvariablen (`c:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env`)
- `OPENROUTER_API_KEY`: API-Schluessel fuer OpenRouter
- `ANTHROPIC_API_KEY`: API-Schluessel fuer Anthropic Claude
- `OPENAI_API_KEY`: API-Schluessel fuer OpenAI
- `GITHUB_TOKEN`: GitHub Personal Access Token
