# Projektstatus Nodges - 07.05.2026

## Aktuelle Version: v0.98.1.6

## Durchgeführte Fixes:
- **Deduplizierung**: Three.js wird nun über `vite.config.ts` dedupliziert (Fehler "Multiple instances" behoben).
- **Minimap-Transparenz**: CSS-Hintergrund des Containers auf transparent gesetzt, um WebGL-Sichtbarkeit zu garantieren.
- **Rot-Test**: Erfolgreich aktiviert. Die Minimap rendert nun mit rotem Hintergrund zur Verifizierung des Viewports.
- **Git**: Worktree-Fehler bereinigt.

## Status:
- Rendering: Verifiziert (Rot-Test aktiv).
- HMR: Funktioniert nach Cache-Bereinigung und Config-Anpassung wieder zuverlässig.
