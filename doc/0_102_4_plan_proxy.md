# Architektur-Erweiterung: Von BYOK zu einem gesicherten Proxy

Das Projekt Nodges ist aktuell als "Bring Your Own Key" (BYOK) konzipiert, was bedeutet, dass der Nutzer seinen eigenen API-Schlüssel eingeben muss. Da GitHub Pages nur statische Inhalte (Frontend) hostet, können wir den API-Schlüssel nicht direkt im Code, in einer öffentlichen Datei oder in einem einfachen Cloud Storage deponieren. Jeder Key, den das Frontend direkt abrufen kann, ist öffentlich im Netzwerk-Tab sichtbar und kann missbraucht werden.

Um Nodges als "ai compute" Anwendung ohne BYOK-Zwang bereitzustellen, benötigen wir ein Backend (Proxy), das den Key sicher verwahrt und die Anfragen an OpenRouter (oder andere Provider) weiterleitet. Da du ein Google Produkt nutzen möchtest, eignen sich hierfür **Google Cloud Functions** (oder **Firebase Cloud Functions**).

## User Review Required

> [!WARNING]
> Ein API-Key darf **niemals** direkt vom Frontend ausgelesen werden. Selbst wenn wir ihn in Google Cloud Secret Manager speichern würden, bräuchte das Frontend Zugriff auf den Secret Manager, was den Key wiederum exponiert.

Wir müssen eine kleine Serverless-Funktion (z.B. Google Cloud Function) erstellen, die als Proxy dient:
1. Frontend sendet den Prompt an `https://deine-region-projekt.cloudfunctions.net/nodges-proxy`
2. Die Cloud Function liest den geheimen API-Key aus ihren Umgebungsvariablen.
3. Die Cloud Function sendet die Anfrage an OpenRouter.
4. Das Ergebnis wird an das Frontend zurückgegeben.

Bist du mit diesem Architektur-Ansatz (Proxy via Google Cloud / Firebase) einverstanden?

## Open Questions

> [!IMPORTANT]
> 1. **Welches Google Produkt bevorzugst du?** Firebase Cloud Functions sind oft am einfachsten einzurichten (besonders wenn du später auch Datenbanken oder Auth nutzen möchtest), reine Google Cloud Functions (GCP) sind ebenfalls eine gute Wahl.
> 2. **Soll BYOK weiterhin als Fallback existieren?** (z.B. wenn jemand die App lokal klont oder deinen Proxy umgehen will).
> 3. Möchtest du, dass ich dir den exakten Code für die Cloud Function schreibe (z.B. in Node.js) und dir erkläre, wie du sie bei Google deployen kannst?

## Proposed Changes

### Architektur & Frontend

#### [MODIFY] src/utils/LLMService.ts
- Anpassung der `_executeLLMCall` Methode.
- Einführung einer Weiche: Wenn kein lokaler Key (`BYOK`) vorhanden ist, wird die Anfrage an die Proxy-URL gesendet.
- Erstellung einer Konfigurationsvariable für die `PROXY_URL`.

### Backend (Cloud Function)

#### [NEW] proxy/index.js (Beispielhafter Ordner für die Cloud Function)
- Eine einfache Express-ähnliche Funktion für Google Cloud Functions.
- Nimmt `systemPrompt`, `userPrompt` und `model` entgegen.
- Injiziert den `OPENROUTER_API_KEY` aus den sicheren Secrets.
- Sendet die Fetch-Anfrage an `https://openrouter.ai/api/v1/chat/completions`.
- CORS-Header werden so konfiguriert, dass nur deine GitHub Pages Domain (`https://[dein-github-name].github.io`) darauf zugreifen darf, um Missbrauch zu verhindern.

## Verification Plan

### Manuelle Verifizierung
- Ich erstelle den Code für die Cloud Function. Du müsstest diese in deiner Google Cloud Konsole deployen (ich gebe dir die genauen Befehle / Schritte).
- Nach dem Deployment trägst du die generierte Proxy-URL in Nodges ein.
- Wir testen das Generieren eines Graphen lokal (mit entferntem BYOK Key), wobei die Anfrage über den Proxy laufen sollte.
- Nach erfolgreichem Test pushen wir auf GitHub Pages und verifizieren, dass "comute" ohne lokalen Key funktioniert.
