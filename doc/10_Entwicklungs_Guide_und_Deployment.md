# 10 Entwicklungs-Guide und Deployment

Dieses Kapitel ist das Handbuch für alle, die unter die Motorhaube von Nodges schauen, den Code erweitern oder die Anwendung für die Welt bereitstellen möchten.

## 10.1 Lokale Entwicklung: Einsteigen leicht gemacht

Nodges ist so konfiguriert, dass der "Time-to-Code" (die Zeit vom Klonen bis zur ersten Änderung) weniger als 2 Minuten beträgt.

### Setup-Schritte
1.  **Repository beziehen**: `git clone [...]`
2.  **Abhängigkeiten laden**: `npm install`. Wir nutzen ein flaches Dependency-Modell, um Versionskonflikte zu vermeiden.
3.  **Dev-Server starten**: `npm run dev`. Dank **Vite** startet der Server in Millisekunden.

### Der HMR-Vorteil (Hot Module Replacement)
Wir haben die App so strukturiert, dass bei Code-Änderungen nur die geänderten Module im Browser ausgetauscht werden.
*   Ändere die Highlight-Farbe im Code -> Die 3D-Szene aktualisiert sich sofort, **ohne** dass die Seite neu lädt.
*   Die Kamera-Position und das aktuelle Layout bleiben erhalten. Das ermöglicht einen extrem schnellen Iterationszyklus ("Trial and Error").

## 10.2 Debugging-Strategien

3D-Code ist schwer zu debuggen, da "Fehler" oft visuell sind (z.B. ein Objekt ist an der falschen Stelle). Nodges bietet Tools:
*   **Visual Helpers**: Im `DebugManager` können wir Achsen-Kreuze, Bounding-Boxen der InstancedMeshes und Licht-Positionen einblenden.
*   **Stats-Overlay**: Ein kleines Panel in der Ecke zeigt Draw-Calls, Dreiecks-Zahlen und GPU-Speicherverbrauch an.
*   **Log-Levels**: Wir nutzen ein abgestuftes Logging (`INFO`, `WARN`, `ERROR`, `DEBUG_RAY`). Über die URL (`?debug=true`) kann man tiefe Trace-Logs aktivieren.

## 10.3 Die Build-Pipeline

Wenn die Entwicklung abgeschlossen ist, transformiert Vite den TypeScript-Quellcode in ein hochoptimiertes Produkt.

`npm run build` führt folgende Schritte aus:
1.  **TypeScript Check**: Der Compiler prüft alle Typen. Bei Fehlern bricht der Build ab (Sicherheitsnetz).
2.  **Tree-Shaking**: Code, der nicht benutzt wird (z.B. ungenutzte Three.js Funktionen), wird radikal entfernt. Das reduziert die Dateigröße um bis zu 60%.
3.  **Minifizierung**: Der Code wird unlesbar gemacht und komprimiert, um Ladezeiten zu minimieren.
4.  **Content Hashing**: Dateien erhalten Namen wie `main-a6f2b.js`. Dies verhindert Cache-Probleme beim Deployment von Updates.

## 10.4 Deployment-Optionen

Nodges ist eine "Static Web App". Es gibt kein Backend (außer man will eines anbinden). Dies macht das Hosting extrem einfach und günstig.

### Empfohlene Plattformen
*   **Vercel / Netlify**: Ideal durch automatische "Deploy on Push" Integration.
*   **GitHub Pages**: Perfekt für Dokumentations-Demos oder Open-Source Präsentationen.
*   **Docker**: Für Firmen-Intranets stellen wir eine minimale `nginx`-basierte Dockerfile bereit, die den Graphen sicher hinter einer Firewall ausliefert.

## 10.5 Versions-Workflow

Wir nutzen das **Semantic Versioning** (Major.Minor.Patch).
Besonderheit: In unserem Repository gibt es einen Workflow `/versionierungworkflow`, der automatisch die Patch-Version erhöht und die Dokumentation synchronisiert. Dies stellt sicher, dass die "About"-Box in der App immer korrekt ist.

---
*Ende Kapitel 10*
