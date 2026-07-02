# 14 Troubleshooting und FAQ

Dieses Dokument sammelt typische Probleme und Fragestellungen auf Entwicklungs- oder Anwendungsseite, inklusive diagnostischer Schritte und Lösungsansätzen.

## A. Allgemeine Lade- und Performance-Probleme

### Symptom: Der Browser "friert ein" (UI blockiert), wenn extrem große Graphen (>20.000 Knoten) geladen werden.
*   **Ursache**: Die JSON-Validierung durch `Zod` oder das Parsing via JSON.parse blockiert synchron den Main-Thread.
*   **Diagnose**: Überprüfe das Performance-Tab in den Chrome DevTools. Zeigt der Main-Thread einen langen, ununterbrochenen Block während des Datei-Uploads?
*   **Lösung (kurzfristig)**: Auf kleinere Graphenausschnitte ausweichen.
*   **Lösung (architektonisch)**: Validierung (Parsing, Zod-Prüfung) muss konsequent in den `import-worker.ts` asynchron ausgelagert werden.

### Symptom: Starke Frame-Drops nach längerem Laufen der Anwendung oder wiederholtem Neu-Laden (Memory Leak).
*   **Ursache**: WebGL/Three.js Ressourcen (Geometrien, Materialien, Texturen) werden im VRAM nicht korrekt aufgeräumt.
*   **Diagnose**: Chrome DevTools befragen: "Memory" -> "Allocation instrumentation on timeline". Alternativ in Three.js die `renderer.info.memory` Konstanten ausgeben. 
*   **Lösung**: Stelle sicher, dass an jedem `NodeManager`, `EdgeObjectsManager` oder in Hilfssystemen (`GlowEffect`) beim Wechseln der Szene (wie durch die "New" oder "Open" Aktionen) explizit `dispose()` auf allen Materials und Geometries aufgerufen wird, und dass Mesh-Referenzen auf `null` gesetzt werden, damit der Garbage Collector greifen kann.

## B. Visuelles Rendering

### Symptom: "Z-Fighting" oder extremes Flackern an Kanten und überlappenden Knotenrändern.
*   **Ursache**: Identische Tiefenwerte im Z-Buffer bei sich streng überlappenden Meshes.
*   **Lösung**: Bei Highlights oder Halos, deren Geometry oft exakt skaliert über den Basis-Nodes liegt: Verwende `depthWrite = false` oder `depthTest = false` auf dem Material des Halos, oder verschiebe Render-Reihenfolgen durch Manipulation des `renderOrder`-Eigenschafts (z.B. Hintergrund = 0, BasisNodes = 1, Halos = 2, UI = 3).
*   **Alternativ**: Sicherstellen, dass instanzierte Sphären eine mikroskopisch vergrößerte Hitbox / Halo-Größe haben (`scale * 1.05`), um den Puffer zu trennen.

### Symptom: Knoten sind unsichtbar, obwohl laut Konsole Daten im `StateManager` geladen sind.
*   **Ursache**: Der `InstancedMesh`-Buffer (`instanceMatrix`) fordert oft manuell an, geupdated zu werden.
*   **Diagnose**: Prüfe in `NodeManager`: Ist `mesh.instanceMatrix.needsUpdate = true` aufgerufen worden, nachdem Positionen verändert wurden?
*   **Lösung**: Sobald die Float32-Buffer eines InstancedMesh beschrieben sind, **muss** Three.js benachrichtigt werden, diese Buffers final zur GPU zu flushen. Das Setzen von `needsUpdate` ist hierfür zwingend.

## C. Setup und DevContainer

### Symptom: WebGL wird nicht genutzt, stattdessen Fallback auf langsame Software-Renderer im Container (`llvmpipe`), kein NVIDIA Support.
*   **Ursache**: Der Docker-Daemon reicht die GPU-Geräte nicht in den DevContainer durch. 
*   **Lösung**: Stelle sicher, dass `nvidia-container-toolkit` auf dem Host installiert ist und überprüfe in der `devcontainer.json`, dass die Hardwarebeschleunigung in den Docker-Args steht (`--gpus all`).

### Symptom: `npm run dev` startet, aber HMR (Hot Module Replacement) von Vite funktioniert nicht. Veränderungen im Code laden die Seite nicht neu.
*   **Ursache**: Im Container (insbesondere Windows WSL) funktionieren File-Watch-Events (inotify) partiell nicht.
*   **Lösung**: Füge in der `vite.config.ts` die Polling-Optionen für den Entwicklungs-Server ein, falls nötig:
    ```json
    server: {
      watch: {
        usePolling: true
      }
    }
    ```

## D. Benutzeroberfläche & UI-Komplexitätsmodus

### Symptom: Bestimmte Tabs (wie Mappings, Layout, Ebenen) oder erweiterte Info-Zeilen (wie Achsenbereiche) fehlen in der Sidebar.
*   **Ursache**: Der aktive UI-Modus steht auf "Simple".
*   **Lösung**: Im "System"-Tab oben unter "UI-Modus" auf "Expert" oder "Dev" umschalten, um alle erweiterten Steuerungen und Tabs freizuschalten.

### Symptom: Das Save As Modal lädt den Export nicht herunter oder schließt sich nicht.
*   **Ursache**: Scripting-Blockade im Browser oder Validierungsfehler.
*   **Lösung**: Fehlerkonsole (F12) auf Zod-Validierungsfehler prüfen. Falls der Graph ungültige Referenzen aufweist, kann der Export-Parser blockieren. Überprüfe auch Pop-up-Blocker im Browser, da Downloads dynamisch über `Blob` URLs ausgelöst werden.

---
*Dokumentations-Status: V2.1 (FAQ Updated)*
*Geprüft gegen Build: 0.101.3*
