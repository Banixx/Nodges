# Verwendete Schriftarten in Nodges

In diesem Projekt werden primaer zwei Webschriftarten ueber Google Fonts geladen und durch verschiedene System-Fallbacks sowie eine spezifische Monospace-Schriftart in einzelnen Komponenten ergaenzt. Insgesamt werden **3 spezifische Schriftart-Familien** im Code definiert.

---

## 1. Google Web Fonts (ueber index.html eingebunden)
Diese Schriftarten werden in `index.html` geladen und sind die Standard-Schriftarten fuer alle sichtbaren Oberflaechen:
*   **Inter** (Schriftstaerken: 400, 500, 600, 700) – Hauptschriftart fuer die Benutzeroberflaeche sowie fuer alle dynamischen Knoten- und Kantentexte (Canvas-Labels).
*   **JetBrains Mono** (Schriftstaerken: 400, 700) – Schriftart fuer Code, Versionen und Monospace-Darstellungen.

---

## 2. CSS-Variablen und Standard-Stacks (in src/styles/main.css)
In der zentralen CSS-Datei sind folgende Variablen und Fallbacks definiert:
*   `--font-family: 'Inter', system-ui, -apple-system, sans-serif;`
    *   Wird fuer den globalen `body` und die meisten UI-Elemente verwendet.
*   `--font-mono: 'JetBrains Mono', 'Fira Code', monospace;`
    *   Wird fuer Monospace-Text wie Versionierungsanzeigen oder Editor-Elemente verwendet.

---

## 3. Komponentenspezifische Schriftarten (im TypeScript-Code definiert)
Einzelne UI-Overlays nutzen dedizierte Schriftarten direkt im Code:
*   **Courier New (mit Fallback monospace)**:
    *   Definiert in `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/KeyboardShortcuts.ts` fuer das Hilfe-Overlay der Tastaturkurzbefehle.
*   **Inter, sans-serif**:
    *   Definiert in `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/FileHandler.ts` (Fortschrittsanzeige), `NodeLabelManager.ts` (Knoten-Labels) und `EdgeLabelManager.ts` (Kanten-Labels) fuer ein einheitliches, premium Erscheinungsbild.
