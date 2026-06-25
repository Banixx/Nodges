# 10 Entwicklungs-Guide und Deployment

Dieses Handbuch richtet sich an Entwickler, die Nodges erweitern, warten oder deployen moechten. Es spiegelt den Architektur-Stand nach dem grossen Refactoring (Juni 2026) wider.

## 10.1 Schnellstart

### Voraussetzungen

- Node.js >= 18
- npm >= 9

### Setup

```bash
# 1. Repository klonen
git clone <repo-url>
cd Nodges

# 2. Abhaengigkeiten installieren
npm install

# 3. Development-Server starten
npm run dev
# -> http://localhost:5173
```

### Build & Deploy

```bash
# Production-Build erstellen
npm run build
# -> Erstellt /dist Ordner (statische Dateien)

# Lokal testen (Preview)
npm run preview
```

## 10.2 Architektur und Konzepte

Nodges basiert auf **Vanilla TypeScript (OOP)** und **THREE.js**, ohne schwergewichtiges Frontend-Framework (wie React oder Vue). Die Architektur ist modular aufgebaut.

### Wichtige Diagramme (in /_assets/Nodges/)

- **Architektur-Uebersicht**: `N_arch_dependencies.mmd`
- **Initialisierungs-Sequenz**: `N_init_sequence.mmd`
- **Typisiertes Event-System**: `N_event_types.mmd`
- **Fehlerbehandlung**: `N_fehlerbehandlung.mmd`

### Kern-Konzepte

1. **Service Container (DI)**
   - Alle Manager werden in `App.ts` initialisiert und im `ServiceContainer` registriert.
   - Zugriff ueber `this.container.get<T>('Name')` moeglich (aber Dependency Injection im Constructor bevorzugt).

2. **Event-Driven Architecture**
   - `CentralEventManager` fungiert als Bus.
   - Events sind streng typisiert (`EventTypes.ts`).
   - Komponenten abonnieren Events statt direkt miteinander zu kommunizieren (lose Kopplung).

3. **State Management**
   - `StateManager` haelt den gesamten Anwendungszustand (einschließlich `uiMode` für Simple, Expert, Dev).
   - Unterstuetzt **Undo/Redo** durch Kapselung von Zustandsaenderungen.
   - UI reagiert auf State-Changes, nicht umgekehrt.

4. **Web Worker**
   - Rechenintensive Layouts (Force-Directed) laufen im Hintergrund (`layout-worker.ts`).
   - Kommunikation via typisierte Messages (`WorkerTypes.ts`).
   - Automatischer Timeout nach 30s.

## 10.3 Fehlerbehandlung und Debugging

### Error Handling

Statt `console.error` nutzen wir den zentralen `ErrorHandler`:

```typescript
import { errorHandler } from './core/ErrorHandler';

try {
    // ...
} catch (e) {
    errorHandler.handle(e, {
        category: 'import',
        severity: 'error',
        userMessage: 'Datei konnte nicht geladen werden'
    });
}
```

Dies triggert automatisch eine **Toast-Notification** (via `NotificationService`) fuer den Benutzer.

### DOM-Referenzen

Vermeide harte DOM-Zugriffe. Wenn noetig, pruefe `/_assets/Nodges/N_dom_id_registry.md` fuer eine Liste aller gueltigen IDs.
Zur Einbindung neuer Controls sollte das `data-min-mode` Attribut verwendet werden, um die korrekte Modus-Filterung ("Simple", "Expert", "Dev") sicherzustellen.

### Debugging-Tools

- **Stats**: FPS und Node-Data in der System-Spalte.
- **Visual Helpers**: Grid und Axes (in `App.ts` aktivierbar).
- **Log-Level**: Der NotificationService loggt Details in die Konsole, auch wenn nur eine kurze Toast-Nachricht erscheint.

## 10.4 Tests

Wir nutzen **Vitest** fuer Unit- und Integrationstests.

```bash
# Alle Tests ausfuehren
npm test

# Tests mit UI (Watch-Mode)
npm run test:ui

# Coverage Report
npm run coverage
```

**Wichtig:** Neue Features muessen getestet werden. Mocking von THREE.js und DOM ist in der Test-Umgebung vorbereitet.

## 10.5 Deployment

Nodges ist eine **Static Web App**. Der Inhalt des `/dist` Ordners kann auf jedem statischen Webserver gehostet werden:

- **Vercel / Netlify**: Einfach Repository verbinden (Build Command: `npm run build`, Output: `dist`).
- **GitHub Pages**: Via Actions deploybar.
- **Docker / Nginx**: Copy `/dist` to `/usr/share/nginx/html`.

## 10.6 Coding Guidelines

- **Kein `any`**: Nutze Interfaces und Typen (`src/types.ts` oder spezifische Dateien).
- **Async/Await**: Bevorzuge async/await gegenueber `.then()`.
- **Dateistruktur**:
  - `src/core/`: Singleton-Manager und Kernlogik (z.B. `VisualMappingEngine.ts`, `StateManager.ts`)
  - `src/utils/`: Hilfsklassen (Import, Export, Math, `FileHandler.ts`)
  - `src/ui/`: UI-Logik und Manager (z.B. `UIManager.ts`, Modals)
  - `src/effects/`: Visuelle Effekte (Shader, Post-Processing)

---
*Stand: 19.06.2026 - Version 0.101.2*
