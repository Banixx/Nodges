# Erkenntnisse: Projekt-Status & Umgebung Setup

## DevContainer & Hardware-Zugriff
- **GPU-Beschleunigung**: Für flüssiges Rendering (60 FPS) ist der Zugriff auf die GPU innerhalb des Containers essentiell. Ohne Hardware-Beschleunigung sinkt die Performance auf Software-Rendering (LLVMpipe), was für große Graphen nicht ausreicht.
- **Tools**: Die Integration von FreeCAD, Blender und Studio BrickLink im Workspace deutet auf eine spätere Erweiterung Richtung 3D-Asset-Pipeline hin.

## UI-Architektur
- **Dev-Panel**: Ein dediziertes Panel für experimentelle Features und Debug-Informationen.
- **UIManager**: Zentralisiert die Steuerung aller UI-Komponenten. Erkenntnisse zeigen, dass eine klare Trennung zwischen 3D-Canvas-Interaktion und DOM-UI notwendig ist, um Event-Bubbling-Probleme zu vermeiden.

## QA & Versionierung
- Die manuelle Versionsprüfung (Tracing) hat sich als wichtigstes Werkzeug gegen aggressive Browser-Caches (Brave/Firefox) erwiesen.
- Jeder größere Meilenstein löst eine Inkrementierung der Version (z.B. von v0.98.1 auf v0.98.1.1) aus.
