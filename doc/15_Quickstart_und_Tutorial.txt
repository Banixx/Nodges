# 15 Quickstart und Tutorial-Guide

Willkommen in Nodges. Um die Einstiegshürde in diese Architektur möglichst klein zu halten, zeigt dieser Guide die absoluten Grundlagen: Wie erzeugt man auf dem sichersten Weg ein lauffähiges 3D-Graph-Projekt?

## Schritt 1: Das Projekt Starten

Voraussetzung: Du entwickelst im vorkonfigurierten DevContainer, der alle Dependencies (`npm`, `three`, `vite`) regelt.
Starte einfach den Vite-Dev-Server im Terminal:

```sh
npm run dev
```

Du kannst die App nun unter `http://localhost:5173` im Browser aufrufen.

## Schritt 2: Nutzung des UI-Complexity-Modus und des Dateimanagers

Wenn du die App zum ersten Mal öffnest, befindet sie sich im Modus **Simple**:

1.  **Dateien laden und verwalten**: Wechsle zum Tab **Files** in der rechten Sidebar.
    *   Klicke auf eine der gelisteten Beispieldateien, um sie direkt zu laden.
    *   Nutze den Button **Open**, um eine eigene JSON-Datei von deinem Dateisystem zu öffnen.
    *   Über **New** kannst du den Graphen leeren und ein leeres Projekt starten.
    *   Mit **Save As** kannst du das aktuelle Projekt als JSON oder Markdown exportieren.
2.  **Modus umschalten**: Wechsle zurück zum Tab **System** und klicke unter **UI-Modus** auf **Expert**.
    *   Hierdurch werden die fortgeschrittenen Steuerungsmöglichkeiten (Layout-Algorithmen, Visual Mappings, Transparenz-Ebenen) sichtbar.

## Schritt 3: Die 3 Säulen eines Nodges-Graphen

Ein Graph wird in Nodges aus grundlegend 3 Elementen gesteuert:
1.  **GraphData** (`types/DataFormats.ts`) - Die reine, strukturelle Mathematikebene.
2.  **StateManager** (`core/StateManager.ts`) - Die zentrale Wahrheit über den UI-Zustand.
3.  **App.ts** (`core/App.ts`) - Startet WebGL und delegiert Instanzen an die verschiedenen *Manager*.

### So sieht das minimale Graph-JSON aus ("The Dummy")

Um Nodges überhaupt erst etwas zeichnen zu lassen, laden wir (beispielsweise per "Open" oder aus den Files) strukturierte Daten. Hier ist ein Graph mit genau "2 Punkten und einer Verbindung":

```json
{
  "directed": false,
  "nodes": [
    { "id": "Alpha", "metadata": { "label": "Start", "weight": 5 } },
    { "id": "Beta", "metadata": { "label": "End", "weight": 3 } }
  ],
  "edges": [
    { "source": "Alpha", "target": "Beta", "metadata": { "strength": 1.0 } }
  ]
}
```

Wenn diese Datei geladen wird, feuert der **DataParser**. Er jagt das JSON durch die Zod-Typen. Ist alles valide, reicht er es an das System weiter.

## Schritt 4: Der Weg vom Upload zum Bildschirm (Life-Cycle)

Verstehen des Datenpfades (One-Way Data-Flow):

1.  **State-Update**: `StateManager.update({ graphData: neuesJson })` wird aufgerufen.
2.  **Observer (Der Manager wacht auf)**: Die Manager (`NodeManager`, `EdgeObjectsManager`, `LayoutManager`) überwachen den *GraphData* State und werden getriggert.
3.  **Layout (Mathematik)**: Der `LayoutManager` sieht die Knoten, erkennt, dass noch keine räumlichen X/Y/Z-Koordinaten existieren, und stößt den `layout-worker` (im Hintergrund-Thread) an, ein Grid oder Force-Layout zu erzeugen.
4.  **Koordinaten fließen zurück**: Der Worker liefert `[x, y, z]` Arrays zurück in den State.
5.  **Rendering (Die Grafik)**: Der `NodeManager` holt diese `[x, y, z]` Arrays ab und übersetzt sie in verschobene Transformations-Matrizen (`Matrix4`). Diese lädt er in den instanzierten Float32Array-Buffer (`InstancedMesh`) und "bittet" die Grafikkarte, zu zeichnen.

## Schritt 5: Einfache Eingriffe in den Code

Wie reagiere ich auf **Klicks** auf den neuen "Beta" Knoten?

Alle Benutzer-Inputs laufen über Events durch den `InteractionManager`, damit du nicht selbst nervige Raycasting-Berechnungen machen musst. Willst du reagieren, abonniere einfach den `CentralEventManager`:

```javascript
import { EVENT_TYPES } from './events/EventTypes';

// Irgendwo in deiner Feature-Logik
centralEventManager.subscribe('click', (payload) => {
    const { object } = payload;
    if (object) {
       console.log("Hurra! Es wurde geklickt auf:", object.userData.id);
       
       // Ändere den globalen Zustand:
       stateManager.update({ selection: { hoveredObject: null, selectedObject: object } });
    }
});
```

Dieser einfache Event-Drive garantiert, dass du keine "Manager-Spaghetti" produzierst. Manager müssen sich nicht direkt kennen, sie "hören" und "senden".

## Zusammenfassung
Du baust **keine** Three.js `Meshes` direkt! Formatiere stattdessen Arrays, jage sie durch den *State*, höre auf *Events* und vertraue darauf, dass die Manager die Pixel auf den Bildschirm schieben.

---
*Dokumentations-Status: V2.1 (Quickstart Updated)*
*Geprüft gegen Build: 0.101.2*
