# Firebase Cloud Functions - Deployment Guide

Diese Anleitung zeigt dir, wie du den Proxy für Nodges deployest, um API-Keys sicher zu nutzen, ohne dass die Nutzer (oder GitHub Pages) sie im Klartext sehen können.

## Voraussetzungen

1. Du hast Node.js installiert.
2. Du hast einen Firebase Account und ein neues Firebase Projekt erstellt (in der [Firebase Console](https://console.firebase.google.com/)).
3. Dein Firebase Projekt hat den **Blaze Plan** (Pay as you go). Cloud Functions benötigen den Blaze Plan für ausgehende Netzwerk-Anfragen. (Kosten entstehen meistens keine, da der Free-Tier sehr hoch ist).

## Schritt-für-Schritt Anleitung

1. **Firebase CLI installieren (falls noch nicht geschehen)**
   Öffne ein Terminal und führe aus:
   ```bash
   npm install -g firebase-tools
   ```

2. **Bei Firebase einloggen**
   ```bash
   firebase login
   ```

3. **In den Proxy-Ordner wechseln**
   Navigiere in deinem Terminal in den Ordner `firebase-proxy` deines Projekts.
   ```bash
   cd c:\Users\ich\Desktop\code\_projects\Nodges\firebase-proxy
   ```

4. **Firebase initialisieren**
   Führe den folgenden Befehl aus und wähle dein erstelltes Projekt aus:
   ```bash
   firebase init functions
   ```
   * Wähle "Use an existing project" und wähle dein Projekt.
   * Wähle JavaScript.
   * Wähle "No" bei ESLint (wir haben den Code schon).
   * Wähle "Yes", um Abhängigkeiten via npm zu installieren (oder führe `npm install` im Ordner `firebase-proxy` selbst aus).
   * Überschreibe **NICHT** die `package.json` oder `index.js`, falls du danach gefragt wirst ("No" antworten).

5. **API Key als Secret anlegen**
   Dies speichert den OpenRouter Key sicher in der Google Cloud (Secret Manager).
   ```bash
   firebase functions:secrets:set OPENROUTER_API_KEY
   ```
   Füge den Key ein, wenn du danach gefragt wirst.

6. **Funktion deployen**
   ```bash
   firebase deploy --only functions
   ```

7. **URL im Code aktualisieren**
   Nach dem Deployment zeigt das Terminal eine "Function URL" an (z.B. `https://us-central1-dein-projekt.cloudfunctions.net/nodgesProxy`).
   Kopiere diese URL und füge sie in der Datei `src/utils/LLMService.ts` in die Variable `PROXY_URL` ein.

8. **Nodges neu bauen und auf GitHub Pages pushen**
   Nun wird Nodges bei fehlendem BYOK-Key automatisch auf deine Firebase Cloud Function zurückgreifen.
