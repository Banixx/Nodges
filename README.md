# NodgesFree - 3D System Explorer

## Übersicht

NodgesFree ist eine verbesserte Version des Nodges-Projekts, eine Spatial Analytics Engine für die browserbasierte 3D-Netzwerkanalyse. Die Anwendung ermöglicht es, beliebige Systeme in einem dreidimensionalen Raum darzustellen und interaktiv zu erkunden.

## Features

### 3D-Systemdarstellung
- Darstellung von Systemen mit Knoten und Kanten im 3D-Raum
- Unterstützung für verschiedene Geometrietypen (Kugeln, Oktaeder, Torus usw.)
- Automatische Farbcodierung basierend auf Knotentypen
- Animierte Kanten mit Puls-Effekt

### Interaktive Erkundung
- OrbitControls für intuitive Kamerasteuerung
- Zoom, Pan und Rotation
- Hover-Informationen bei Mausberührung
- Knotenauswahl mit visueller Hervorhebung
- Fokus-Funktion um direkt zu einem Knoten zu navigieren

### Prozessdarstellung
- Panel für aktive Prozesse/Verbindungen
- Animierte Indikatoren für laufende Prozesse
- Visualisierung von Beziehungen zwischen Systemkomponenten

### Steuerung
- Sidebar mit Systeminformationen
- Kontrollpanel für Zoom, Rotation und Anzeigeoptionen
- Liste aller Knoten mit Schnellzugriff
- Echtzeit-Statistiken (Knoten, Kanten, FPS)

## Installation

NodgesFree benötigt keine Build-Schritte. Die Anwendung kann direkt im Browser geöffnet werden.

### Option 1: Direkt öffnen
1. Öffne `index.html` in einem modernen Browser (Firefox empfohlen)

### Option 2: Lokaler Server
```bash
cd NodgesFree
python -m http.server 8080
# oder
npx serve .
```
Dann im Browser: http://localhost:8080

## Datenformat

NodgesFree verwendet das gleiche JSON-Format wie Nodges:

```json
{
  "system": "Systemname",
  "metadata": {
    "description": "Beschreibung"
  },
  "visualMappings": {
    "defaultPresets": {
      "knotentyp": {
        "color": { "params": { "color": "#hex" } },
        "size": { "range": [min, max] }
      }
    }
  },
  "data": {
    "entities": [
      {
        "id": "eindeutige_id",
        "type": "knotentyp",
        "label": "Anzeigename",
        "position": { "x": 0, "y": 0, "z": 0 },
        "eigenschaft": "wert"
      }
    ],
    "relationships": [
      {
        "id": "kante_id",
        "type": "kantentyp",
        "source": "quell_id",
        "target": "ziel_id",
        "label": "Verbindungsname"
      }
    ]
  }
}
```

## Mitgelieferte Beispieldaten

- `sonnensystem.json` - Darstellung des Sonnensystems mit Planeten und Monden
- `nervous_system_autonomic.json` - Autonomes Nervensystem mit Sympathikus und Parasympathikus

## Technologien

- Three.js (r160) für 3D-Rendering
- Vanilla JavaScript (kein Framework)
- OrbitControls für Kamerasteuerung
- WebGL für hardwarebeschleunigte Grafik



## Lizenz

Siehe LICENSE-Datei im Hauptverzeichnis.

