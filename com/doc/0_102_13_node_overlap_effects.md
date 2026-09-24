# Dokumentation: Knoten-Ueberlagerungs-Effekte (Ansicht-Tab)

## Problemstellung & Ziel
Wenn mehrere Entitaeten auf der identischen 3D-Position liegen (z.B. durch gleiche Attributwerte oder ungemappte Achsen auf `0`), sollen sie fuer den Benutzer visuell unterscheidbar gemacht werden.

## Umgesetzte Steuerung im Tab "Ansicht"
In [src/ui/ViewPanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/ViewPanel.ts) wurde im Tab **Ansicht** die neue Sektion **Knoten-Ueberlagerung** integriert:

- **Schalter "Ueberlagerungs-Effekt"**:
  - Aktiviert oder deaktiviert den visuellen Trenneffekt.
- **Effekt-Optionen**:
  1. **Option 1: Statisch (`static`)**:
     - Knoten verharren ohne Bewegung auf Position 0.
  2. **Option 2: Kreisen (`orbit`)**:
     - Ueberlagernde Knoten kreisen in einer zufaelligen 3D-Bahn (X, Y, Z kombiniert) um die gemeinsame Position.
     - **Unter-Slider Orbit-Radius**: Einstellbereich `0.1` bis `2.0` (Standard `0.5`).
  3. **Option 3: Pulsieren / Groessen-Alternierung (`pulse`)**:
     - Ueberlagernde Knoten vergroessern und verkleinern sich alternierend mit individueller Phasenverschiebung.
     - **Unter-Slider Geschwindigkeit**: Range `0.5` bis `5.0` (Standard `2.0`).
     - **Unter-Slider Min Groesse**: Range `0.1` bis `1.0` (Standard `0.3`).
     - **Unter-Slider Max Groesse**: Range `1.0` bis `3.0` (Standard `1.8`).

## Technische Umsetzung
- **State**: Erweitert in [src/core/state/StateTypes.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/state/StateTypes.ts) und [src/core/StateManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/StateManager.ts).
- **Animation-Loop**: In [src/core/NodeManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts#L411) erkennt `animateOverlapEffects` alle Punktgruppen mit mehr als 1 Knoten und animiert sowohl Instanced-Meshes als auch Individual-Meshes in Echtzeit.
- **Aufruf**: In [src/App.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts#L1519) innerhalb des globalen `animate()`-Loops.
