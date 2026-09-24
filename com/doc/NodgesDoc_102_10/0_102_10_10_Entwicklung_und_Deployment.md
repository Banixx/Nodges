# 07 Entwicklungs-Guide, Testing und Deployment

Dieses Kapitel richtet sich an Entwickler, die an der Codebase von Nodges (TypeScript, Vite, Three.js) mitarbeiten, und definiert die rigorosen Standards für Qualitätssicherung, Testing und den Deployment-Prozess.

---

## 1. Quality Assurance und Testing (Vitest)

Nodges nutzt modernste Pipelines und Validierungen (z.B. Zod), um Laufzeitfehler zu vermeiden. Dennoch sind Unit- und Integrationstests (besonders für den `LLMService` und `GraphDataManager`) unerlässlich. Als Framework kommt **Vitest** zum Einsatz.

### 1.1 Test-Suite und Commands
- `npm run test` – Führt die gesamte Test-Suite im Watch-Modus aus. Ideal für TDD (Test-Driven Development).
- `npm run test:ui` – Startet das Vitest UI-Dashboard im Browser. Dieses visuelle Tool ist extrem hilfreich, um komplexe Graphen-Datenstrukturen, die im Test fehlschlagen, zu debuggen.
- `npm run test:coverage` – Generiert einen V8-basierten Coverage-Report (`coverage/`). Ziel für Kern-Logik-Klassen (insbesondere alles unter `src/utils/` und `src/managers/`) ist >80% Coverage.
- `npm run export:schema` – Ein benutzerdefiniertes Skript (`vitest run src/tests/exportSchema.test.ts`), das die Zod-Schemas ausliest und als JSON-Schema für die LLMs auf die Festplatte exportiert.

### 1.2 Testing-Muster
Bei der Entwicklung neuer Features in der Build-10-Pipeline müssen Mock-Responses geschrieben werden.
Das Testen von echten LLM-APIs in der CI/CD-Pipeline ist verboten (Flakiness & Kosten). Stattdessen wird der `LLMService` gemockt, um zu verifizieren, ob Nodges mit defektem JSON, fehlenden IDs in Kanten oder falschen Typen korrekt umgeht und diese über den ErrorHandler abfängt, ohne zu crashen.

---

## 2. Error Handling und Resilience

> **Visualisierung:** Siehe [10_ErrorHandlingResilience_002.mmd](10_ErrorHandlingResilience_002.mmd)

Nodges operiert oft an der Schnittstelle zu unzuverlässigen Drittsystemen (LLMs, Wikidata, Netzwerk). Das Error-Handling ist daher ein First-Class Citizen.

### 2.1 Der zentrale ErrorHandler
Jeder Catch-Block in der Applikation sollte an den zentralen ErrorHandler (oder ein Toast-System) delegieren. 
- **Verbot von "White Screens":** Ein fehlerhafter API-Call oder ein missglücktes Zod-Parsing darf niemals dazu führen, dass die React/Vanilla-DOM-Schleife oder der Three.js-Render-Loop abstürzt.
- **Fail-Safe Mechanismen:** 
  - Erhält das System ein 429 Too Many Requests von OpenRouter, muss eine saubere Warnung ("Ratelimit erreicht, bitte lokales Modell nutzen") eingeblendet werden.
  - Wenn `App.loadGraphData` in der Mitte der Verarbeitung fehlschlägt, darf der `SceneManager` die alte (funktionierende) Szene nicht leeren. Der Zustand muss transaktionssicher (all-or-nothing) verarbeitet werden.

---

## 3. Lokale Entwicklungsumgebung

Der Tech-Stack von Nodges ist darauf ausgelegt, dass ein Entwickler das System in unter 2 Minuten lokal hochziehen kann.

1. **Abhängigkeiten:** `npm install` (Node.js >= 18 erforderlich).
2. **Dev-Server:** `npm run dev` startet den Vite-Server (meist auf `localhost:5173`) mit Hot-Module-Replacement (HMR). Änderungen an CSS oder TypeScript spiegeln sich in Millisekunden im Browser wider.
3. **Lokale LLM-Inferenz (Local-First):**
   Für die Entwicklung an Prompts oder der Build-10-Pipeline ohne Token-Kosten wird der Einsatz von Ollama dringend empfohlen.
   - Installiere Ollama lokal.
   - Starte z.B. `ollama run llama3` oder `phi3`.
   - Wähle in der Nodges-UI im CreatePanel den lokalen Provider aus. Das System feuert API-Calls dann an `http://localhost:11434/v1/chat/completions`.

---

## 4. Build und Deployment

> **Visualisierung:** Siehe [10_DevTestDeployPipeline_001.mmd](10_DevTestDeployPipeline_001.mmd)

Nodges ist eine "Frontend-only" bzw. "Static" Web-Applikation. Alle Berechnungen, LLM-Calls und API-Anfragen passieren direkt im Client (Browser). Es gibt kein proprietäres Node.js-Backend, das betrieben werden muss.

### 4.1 Produktions-Build
Der Befehl `npm run build` führt einen strikten TypeScript-Typecheck (`tsc`) aus und lässt Vite anschließend das Produktions-Bundle erstellen.
Das Ergebnis liegt im Ordner `/dist`. Die Dateien sind hochgradig minifiziert, CSS extrahiert und Three.js ge-tree-shaked (es wird nur ausgeliefert, was wirklich genutzt wird).

### 4.2 Hosting und BYOK (Bring Your Own Key)
- Das `/dist` Verzeichnis kann auf jedem statischen Webhoster abgelegt werden (GitHub Pages, Vercel, Netlify, Amazon S3).
- **BYOK-Architektur:** Da es kein Backend gibt, muss der User seine eigenen API-Keys in die Nodges-UI eintragen. Das System speichert diese Schlüssel strikt nur im lokalen `localStorage` des Browsers. Dies entbindet den Host von jeglicher DSGVO/Privacy-Haftung für sensible Daten-Prompts, da diese direkt vom Browser des Nutzers zum LLM-Provider wandern.
