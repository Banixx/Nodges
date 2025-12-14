# 10 Entwicklungs-Guide und Deployment

Dieses Kapitel richtet sich an Entwickler, die Nodges lokal aufsetzen, weiterentwickeln oder deployen möchten.

## 10.1 Setup und Installation

### Voraussetzungen
*   **Node.js**: Version 18 oder höher wird empfohlen.
*   **npm**: Wird automatisch mit Node.js installiert.

### Installation
1.  **Repository klonen**:
    ```bash
    git clone https://github.com/IhrRepo/Nodges.git
    cd Nodges
    ```
2.  **Abhängigkeiten installieren**:
    ```bash
    npm install
    ```
    Dies installiert alle in `package.json` definierten Pakete (Three.js, Typescript, Vite, Zod, etc.).

## 10.2 Build-Pipeline mit Vite

Nodges nutzt **Vite** als Build-Tool, was signifikante Vorteile gegenüber älteren Tools wie Webpack bietet.

### Development Server
```bash
npm run dev
```
*   Startet einen lokalen Server (meist `http://localhost:5173`).
*   **HMR (Hot Module Replacement)**: Änderungen am Code werden sofort im Browser reflektiert, ohne die Seite neu laden zu müssen. Der State (z.B. Kameraposition) bleibt dabei oft erhalten.

### Production Build
```bash
npm run build
```
*   Kompiliert TypeScript zu JavaScript.
*   Bundled und minifiziert den Code.
*   Erstellt optimierte Assets im `/dist` Verzeichnis.
*   Splitted Code in Chunks für schnelleres Laden (Lazy Loading).

### Vorschau des Builds
```bash
npm run preview
```
Startet einen lokalen Server, der das `/dist` Verzeichnis ausliefert, um den Produktions-Build vor dem Deployment zu testen.

## 10.3 Code-Style und Best Practices

### TypeScript
Nodges verwendet striktes TypeScript (`"strict": true` in `tsconfig.json`).
*   **Kein `any`**: Explizite Typen für alle Variablen und Funktionsparameter.
*   **Interfaces**: Definition von Datenstrukturen über Interfaces (in `types.ts`).

### Modul-Struktur
*   **ES Modules**: Nutzung von `import` / `export` Syntax.
*   **Dateinamen**: PascalCase für Klassen (`HighlightManager.js`), camelCase für Instanzen und Funktionen.

### Linter & Formatter
Es wird empfohlen, **ESLint** und **Prettier** zu verwenden, um einen einheitlichen Code-Stil (Einrückung, Semikolons) sicherzustellen.

---
*Ende Kapitel 10*
