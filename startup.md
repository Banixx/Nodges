# Nodges - Startup & Progression Context

Diese Datei dient als "Gedächtnis" für den Rebuild des DevContainers. Sie enthält alle relevanten Informationen über den aktuellen Stand des Projekts, wichtige Architektur-Entscheidungen, Setup-Besonderheiten und User-Präferenzen, die aus den letzten Sitzungen gesammelt wurden.

## 1. Aktueller Status & Implementierungen
- **Versionierung**: Die aktuelle Version ist `0.98.1`. Ein automatischer Workflow (`/versionierungworkflow`) ist implementiert, um Patch-Versionen hochzuzählen.
- **Performance-Features (Dev & GPU)**:
  - **Dev Panel**: Es gibt ein neues "Dev"-Tab im UI (`index.html`), um die Performance unter verschiedenen Bedingungen zu testen (FPS-Throttling, Pixel-Ratio, GPU-Power-Preference).
  - **Dynamic Rendering**: Die Renderqualität (z. B. Geometrie-Detail der Nodes in `NodeManager.ts`, Edge-Segmente) passt sich automatisch an, basierend auf der FPS.
  - **Performance Monitor**: Eine `PerformanceMonitor`-Klasse regelt dynamische Geometrie-Multiplikatoren, um schwächere Hardware zu unterstützen und Abstürze zu vermeiden.

## 2. Setups & Infrastruktur (Docker/DevContainer)
- **Umgebung**: Node.js, Vite, Vitest, TypeScript und Three.js.
- **DevContainer Besonderheiten**:
  - **GPU Passthrough**: Der Container nutzt `--device=/dev/dri` für direkte WebGL-Hardwarebeschleunigung. (Wichtig für Performance-Tests.)
  - **Asset-Mounts**: Ein lokaler Ordner ist per Bind-Mount verknüpft (`C:/users/ich/desktop/code/ASSETS/` zu `/app/assets`), damit externe Daten einfließen können.
  - **Ports**: Port 5173 (Vite) ist ge-forwarded.

## 3. Architektur-Erkenntnisse & Codestruktur
- **State Management Phase 4**: 
  - Der Zustand ist logisch aufgeteilt in bedarfsgerechte Sub-States (`GraphState`, `SelectionState`, `UIState`, `DevState` etc.).
  - Das Subscriber-System in `StateTypes.ts` reagiert kategoriebasiert, um Render-Staus zu vermeiden. 
- **Node & Scene Rendering**: 
  - `NodeManager.ts` nutzt `THREE.InstancedMesh` für die Performance. 
  - Geometrien werden im Cache verwaltet. Bei Leistungsabfall greift der Code dynamisch ein und verringert Instanz-Details.
- **Three.js Visuals**: Die Ästhetik im UI und im Graph wird großgeschrieben (Glow-Effekte, Smooth Edge Curves, Pulsing Animations). Das sollte auch künftig bei neuen Features bedacht werden.

## 4. User Preferences & To-Dos nach Restart
- Wie gewohnt moderne, hochwertige Web-Design-Kriterien anwenden. (Interaktionen, flüssige Animationen etc.).
- Beim nächsten Start sollten nach dem Rebuild des Containers folgende Dinge geprüft werden:
  1. Der korrekte Zugriff auf Hardwareressourcen (WebGL GPU).
  2. Die Funktionalität des neu entwickelten **Dev Panels**.
  3. Ob die devcontainer.json Anpassungen (Mounts/Devices/Features) greifen.
    - *Neu hinzugefügt:* GitHub CLI (`gh`) Feature.

## 5. DevContainer Browser Workflow
- Aufgrund von Architektur-Einschränkungen (fehlendes lokales X11/Wayland im DevContainer, reiner Headless-Modus) kann der Antigravity-interne Browser für WebGL/Three.js Auswertungen keine visuell aussagekräftigen ("echten") Screenshots liefern.
- **Workflow:** UI- und 3D-Änderungen werden während der Entwicklung über den Vite Dev-Server (`localhost:5173`) ausgeliefert. Die **visuelle Kontrolle und QA übernimmt der User** im Host-Browser (Windows) mit voller GPU-Beschleunigung und echtem Rendering. Feedback erfolgt verbal oder per Screenshot durch den User.
