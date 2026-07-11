# Deno Deploy Proxy Anleitung

Diese Anleitung führt dich in weniger als 5 Minuten durch das sichere Deployment deines API-Proxys. Du brauchst dafür **keine** Kreditkarte und musst auch **nichts** im Terminal installieren.

## Schritt 1: Deno Deploy Account erstellen
1. Gehe in deinem Browser auf **[deno.com/deploy](https://deno.com/deploy)**.
2. Klicke oben rechts auf **"Sign in"** und melde dich bequem mit deinem bestehenden GitHub-Konto an.
3. Du wirst nach keinen Zahlungsdaten gefragt.

## Schritt 2: Ein neues "Playground" Projekt anlegen
Das "Playground" ist ein Online-Code-Editor bei Deno, mit dem du kleine Scripte wie unseren Proxy direkt im Browser hosten kannst.
1. Klicke im Deno Deploy Dashboard auf den blauen Button **"New Playground"**.
2. Deno generiert nun eine zufällige URL für dich (z.B. `fancy-dinosaur-12.deno.dev`).
3. Du siehst nun einen Code-Editor im Browserfenster.

## Schritt 3: Den Code einfügen
1. Öffne hier lokal die Datei `deno-proxy/index.ts` (ich habe sie gerade für dich erstellt).
2. Kopiere den **gesamten Inhalt** dieser Datei.
3. Füge den Code in den Deno Playground im Browser ein (überschreibe dabei den dortigen Standard-Code `Deno.serve(...)`).
4. Klicke oben rechts oder mit `Strg+S` / `Cmd+S` auf **"Save & Deploy"**.

## Schritt 4: Den API-Key sicher hinterlegen
Jetzt fehlt noch der OpenRouter Key. Er darf nicht im Code stehen, sondern muss als sichere Umgebungsvariable (Environment Variable) gespeichert werden.
1. Klicke links in der Navigation deines Playgrounds auf **"Settings"**.
2. Gehe auf der Einstellungsseite zu **"Environment Variables"**.
3. Klicke auf **"Add Variable"**.
4. Gib als Key genau diesen Namen ein: `OPENROUTER_API_KEY`
5. Füge als Value deinen OpenRouter Secret Key (`sk-or-v1-...`) ein.
6. Klicke auf **"Save"**.

## Schritt 5: Die URL in Nodges eintragen
1. Kopiere deine neue Deno-URL (z.B. `https://fancy-dinosaur-12.deno.dev`).
2. Sage mir Bescheid, wie die URL lautet! Ich trage sie dann in unsere `src/utils/LLMService.ts` als Default-Proxy ein.

Das war's! Sobald das erledigt ist, läuft Nodges sicher online über deinen Deno-Proxy.
