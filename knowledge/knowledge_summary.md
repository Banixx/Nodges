# Knowledge Summary: Nodges

## Projekt-Kern

**Nodges** ist eine 3D-Netzwerk-Visualisierung (Three.js/TypeScript/Vite), die darauf spezialisiert ist, komplexe Graphen ("Hairballs") durch räumliche Tiefe und interaktive Exploration entflechtbar zu machen.

## Architektur-Prinzipien

- **Manager-Orchestrator-Pattern**: Zentrale `App.ts` koordiniert entkoppelte Manager (Node-, Edge-, Layout-, State-Manager).
- **Single Source of Truth**: Der `StateManager` verwaltet reaktiv den Anwendungszustand (Selektion, Hover, UI-Status).
- **Event-Bus**: Der `CentralEventManager` entkoppelt die Kommunikation zwischen Hardware-Events (Maus, Keyboard) und Applikationslogik.
- **Daten-Validierung**: Strikte `Zod`-Schemata für den Import von legacy- und future-basierten Graphdaten.

## Schlüssel-Erkenntnisse (Analysis 2026-01-10)

- **Produktionshürden**: Enge Kopplung im Bootstrapping-Prozess der `App.ts` und fehlende automatisierte Regressionstests.
- **Skalierbarkeit**: Raycasting-Performance bei sehr großen Graphen erfordert zukünftig räumliche Partitionierung (Octrees).
- **Design**: Konsequenter Verzicht auf UI-Frameworks (Vanilla HTML/CSS) zur Maximierung der Rendering-Performance.

## Best Practices für dieses Projekt

- **Vanilla Über alles**: UI-Änderungen in `src/ui/` oder `index.html` vornehmen, keine Frameworks einführen.
- **Manager-Kapselung**: Neue Funktionen in neue Manager-Klassen in `src/core/` oder `src/utils/` auslagern.
- **Event-driven**: Direkte Aufrufe zwischen Managern vermeiden, stattdessen über `CentralEventManager` oder `StateManager` kommunizieren.

---
*Status: Knowledge Item für Antigravity Manager indexiert.*
