# Fehleranalyse: GitHub Pages 404 und Ladefehler

## Problembeschreibung
Nachdem das Repository auf privat und wieder auf oeffentlich gestellt wurde, wurde GitHub Pages neu aktiviert. Die Seite laedt nun, zeigt aber einen Fehler in der Konsole: `Failed to load resource: the server responded with a status of 404 () App.ts:1`. Die UI-Elemente werden ungestylt angezeigt.

## Ursache
Beim "Neu-Erstellen" von GitHub Pages wurde standardmaessig die Quelle auf "Deploy from a branch" (z.B. den `main` Branch) gesetzt. 
Dadurch liefert der GitHub-Server nicht den kompilierten Build-Ordner (`dist/`) aus, sondern die rohen Projektdateien (Quellcode). 
Die `index.html` verweist auf `<script type="module" src="/src/App.ts"></script>`, was im Browser fehlschlaegt, da Browser keine unkompilierten TypeScript-Dateien verarbeiten koennen und der absolute Pfad `/src/...` auf GitHub Pages unter einem Unterordner (`/Nodges/`) zu einem 404-Fehler fuehrt.

## Loesung
Das Projekt enthaelt bereits eine GitHub-Actions-Workflow-Datei (`C:/Users/ich/Desktop/code/_projects/Nodges/.github/workflows/deploy.yml`), die das Projekt korrekt via Vite baut.

Damit GitHub Pages diesen Workflow nutzt, muessen folgende Schritte ausgefuehrt werden:
1. In den GitHub Repository-Einstellungen den Menuepunkt **Pages** oeffnen.
2. Unter "Build and deployment" die Einstellung **Source** (Quelle) von "Deploy from a branch" auf **"GitHub Actions"** aendern.
3. Anschliessend im Tab **Actions** den Workflow "Deploy Vite to Pages" ueberpruefen und gegebenenfalls manuell starten.

Sobald der Build durch GitHub Actions abgeschlossen ist, wird die Seite wieder vollstaendig kompiliert und korrekt mit allen Styles dargestellt.
