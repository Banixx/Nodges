# Nodges -- Zeitdimension und Systemsimulation

Dieses Dokument entwirft die Vision einer zeitbasierten Darstellung
in Nodges: Wie sich ein System ueber die Zeit entwickelt, wie Nodes
wachsen, schrumpfen, und wie Fluesse entlang von Edges dargestellt werden.

---

## 1. Die Vision: Lebendige Systeme

Nodges zeigt bisher **statische Momentaufnahmen** eines Systems.
Die Zeitdimension verwandelt Nodges von einem **Betrachter** in einen **Simulator**.

### Kernidee
```
System = Nodes + Edges + Zeit

Zum Zeitpunkt t=0: Startzustand (alle Nodes haben Anfangswerte)
Zum Zeitpunkt t=n: Werte haben sich durch Edge-Interaktionen veraendert
```

### Beispiel: Oekosystem
- Nodes: Wald, See, Industrie, Bevoelkerung
- Edges: "verschmutzt" (Industrie → See), "benoetigt" (Bevoelkerung → Wald)
- Zeitschritt: Industrie sendet alle 2s einen Impuls → See-Gesundheit sinkt
- Visuell: See-Node wird kleiner/dunkler, Edge pulsiert staerker

---

## 2. Datenmodell fuer die Zeitdimension

### 2.1 Edge-Zeitparameter

Jede Edge erhaelt optionale zeitliche Eigenschaften:

```json
{
  "id": "e1",
  "type": "einfluss",
  "source": "industrie",
  "target": "see",
  "label": "verschmutzt",
  "temporal": {
    "interval": 2.0,
    "effect": {
      "target_property": "gesundheit",
      "operation": "subtract",
      "value": 5
    },
    "animation": "flow",
    "direction": "source_to_target",
    "accumulate": true
  }
}
```

### 2.2 Node-Zeitparameter

Nodes erhalten dynamische Properties:

```json
{
  "id": "see",
  "type": "natur",
  "label": "Bergsee",
  "gesundheit": 100,
  "temporal": {
    "decay": {
      "property": "gesundheit",
      "rate": -1,
      "interval": 5.0
    },
    "thresholds": [
      { "property": "gesundheit", "below": 20, "trigger": "warning" },
      { "property": "gesundheit", "below": 0, "trigger": "death" }
    ]
  }
}
```

### 2.3 Globale Zeitsteuerung

```json
{
  "simulation": {
    "tickRate": 1.0,
    "maxTicks": 100,
    "timeUnit": "Monat",
    "autoPlay": false
  }
}
```

---

## 3. Visuelle Abbildung der Zeit

### 3.1 Node-Veraenderungen ueber die Zeit

| Veraenderung | Visueller Parameter | Beispiel |
|---|---|---|
| Wert steigt | Node wird groesser | Bevoelkerung waechst |
| Wert sinkt | Node wird kleiner | Ressource schrumpft |
| Schwellwert unterschritten | Farbe wechselt (gruen → rot) | Gesundheit kritisch |
| Akkumulation | Glow wird intensiver | Reichtum haeuft sich an |
| Inaktivitaet | Opacity sinkt | Node "verblasst" |
| Ueberlastung | Vibration/Jitter | Stress, Ueberlastung |
| Tod/Entfernung | Fade-Out + Schrumpfung | Ausloeschung |
| Geburt/Entstehung | Fade-In + Wachstum | Neuentstehung |

### 3.2 Edge-Veraenderungen ueber die Zeit

| Veraenderung | Visueller Parameter | Beispiel |
|---|---|---|
| Impuls wird gesendet | Flow-Animation (Lichtpaket) | Datentransfer |
| Haeufiger Impuls | Schnellere Animation | Hoehere Frequenz |
| Unipolar (nur eine Richtung) | Pfeilrichtung + Flow | Einbahnstrasse |
| Bidirektional | Gegenlaeufige Flows | Handelsbeziehung |
| Staerke nimmt zu | Edge wird dicker | Verstaerkung |
| Verbindung reisst | Edge wird gestrichelt/transparent | Stoerung |
| Neue Verbindung | Edge wachst von Source zu Target | Neue Beziehung |

### 3.3 Globale Zeitvisualisierung

| Element | Beschreibung |
|---|---|
| **Timeline-Bar** | Horizontal am unteren Bildschirmrand. Scrubbar wie in einem Video-Player. |
| **Tick-Zaehler** | Anzeige des aktuellen Zeitschritts und der Zeiteinheit. |
| **Play/Pause/Stop** | Transport-Controls wie bei einem Media-Player. |
| **Geschwindigkeitsregler** | Zeitraffer oder Zeitlupe (0.1x bis 10x). |
| **Rueckspulen** | Zurueck zum Anfang oder zu einem Bookmark. |
| **Keystates / Snapshots** | Markierte Zeitpunkte fuer schnellen Zugriff. |

---

## 4. Interaktionsmodell

### 4.1 Transport-Controls

```
[|<] [<<] [>] [||] [>>] [>|]  [0.5x] [1x] [2x] [5x]  [t=0 ------●-------------- t=100]
 ^    ^    ^    ^    ^    ^
 |    |    |    |    |    Zum Ende
 |    |    |    |    Vorwaerts (schnell)
 |    |    |    Pause
 |    |    Play
 |    Rueckwaerts
 Zum Anfang
```

### 4.2 Interaktive Eingriffe waehrend der Simulation

Der User soll waehrend der Simulation eingreifen koennen:

- **Node-Wert aendern**: Klick auf Node → Property-Wert manuell setzen
- **Edge entfernen**: "Was passiert wenn diese Verbindung fehlt?"
- **Edge hinzufuegen**: "Was passiert wenn wir diese Verbindung herstellen?"
- **Freeze Node**: Node-Werte werden eingefroren (keine Veraenderung durch Edges)
- **Reset Node**: Zurueck auf Startwerte
- **Bookmark setzen**: Aktuellen Zustand als Snapshot speichern

### 4.3 Betrachtungsmodi

| Modus | Beschreibung |
|---|---|
| **Beobachter** | Nur Zuschauen, keine Eingriffe |
| **Analyst** | Kameraposition, Filter, Ebenen aendern waehrend die Simulation laeuft |
| **Experimentator** | Eingriffe waehrend der Simulation (Werte aendern, Edges kappen) |
| **Vergleicher** | Zwei Simulationslaeufe nebeneinander vergleichen |

---

## 5. Kamerasteuerung und Perspektive

### 5.1 Vorhandene Kamerafunktionen

- Orbit Controls (Drehen, Zoomen, Verschieben)
- Minimap (Vogelperspektive)
- Click-to-Focus (Kamera dreht sich auf ausgewaehlten Node)

### 5.2 Erweiterte Kamerafunktionen fuer Systembetrachtung

| Funktion | Beschreibung |
|---|---|
| **Follow-Cam** | Kamera folgt einem bestimmten Node (z.B. einem Impuls) |
| **Fly-Through** | Automatische Kamera-Tour entlang eines Pfades |
| **Split-View** | Zwei Kameraperspektiven gleichzeitig (Uebersicht + Detail) |
| **Ortho-Ansicht** | Orthographische Projektion fuer exakte Vergleiche |
| **Saved Viewpoints** | Kameraposition speichern und laden |
| **Auto-Frame** | Kamera zoomt automatisch, damit alles sichtbar ist |
| **Focus on Selection** | Sanfte Kamerafahrt zur Selektion |

---

## 6. Filter und Priorisierung fuer ganzheitliche Systembetrachtung

### 6.1 Vorhandene Filter

- Ebenen (Layer): Ein-/Ausblenden nach Attribut
- Hover/Selektion: Detail-Info bei Interaktion
- Neighborhood: Nachbarschafts-Highlighting (implementiert, aber nicht im UI)

### 6.2 Erweiterte Filter-Strategien

| Strategie | Beschreibung | Nutzen |
|---|---|---|
| **Attribut-Filter** | Nodes nach Wertebereichen filtern (z.B. "zeige nur Nodes mit score > 50") | Fokussierung auf relevante Teile |
| **Typ-Filter** | Nur bestimmte Entity-Typen zeigen | Vereinfachte Ansicht |
| **Edge-Typ-Filter** | Nur bestimmte Beziehungstypen zeigen | Isolierung von Wirkungsketten |
| **Grad-Filter** | Nur Nodes mit mindestens/hoechstens n Verbindungen | Hub-Erkennung |
| **Pfad-Filter** | Nur Nodes auf dem kuerzesten Pfad zwischen A und B | Kausalkettenanalyse |
| **Zeitfenster-Filter** | Nur Interaktionen in einem Zeitraum zeigen | Zeitliche Fokussierung |
| **Relevanz-Fading** | Nicht-relevante Nodes nicht ausblenden, sondern verblassen lassen | Kontext behalten |
| **Semantic Zoom** | Je naeher die Kamera, desto mehr Detail wird sichtbar | Progressive Offenlegung |

---

## 7. Strategien zur visuellen Kommunikation

### 7.1 Informationshierarchie

```
Ebene 1: STRUKTUR    → Position, Layout, Verbindungen
Ebene 2: KATEGORIEN  → Farbe, Form (Was ist es?)
Ebene 3: QUANTITAET  → Groesse, Dicke (Wie viel?)
Ebene 4: DYNAMIK     → Animation, Glow, Pulsation (Was passiert?)
Ebene 5: DETAIL      → Label, Tooltip, InfoPanel (Was genau?)
```

### 7.2 Gestalt-Prinzipien in Nodges

| Prinzip | Anwendung in Nodges |
|---|---|
| **Naehe** | Zusammengehoeriges wird raeumlich gruppiert (Cluster-Layout) |
| **Aehnlichkeit** | Gleiche Farbe/Form = gleicher Typ |
| **Verbundenheit** | Edges zeigen explizite Beziehungen |
| **Geschlossenheit** | Gruppen-Hullen umschliessen zusammengehoeriges |
| **Kontinuitaet** | Flow-Animationen zeigen Richtung und Verlauf |
| **Figur/Grund** | Fokus-Nodes sind hell und gross, Kontext ist gedimmt |

### 7.3 Narrative Techniken

| Technik | Umsetzung in Nodges |
|---|---|
| **Guided Tour** | Automatische Kamerafahrt mit Annotations an Stationen |
| **Progressive Disclosure** | Erst Uebersicht, dann Detail bei Zoom/Klick |
| **Vorher/Nachher** | Zwei Zeitpunkte ueberlagert oder nebeneinander |
| **Spotlight** | Ein Node wird beleuchtet, Rest dimmt ab |
| **Story Timeline** | Zeitstrahl mit Ereignis-Markierungen und Kameraschwenks |
| **What-If Szenarien** | Simulation mit veraenderten Parametern |

---

## 8. Architektur-Skizze: TimeEngine

```
TimeEngine
├── clock (globale Uhr, tickRate)
├── state_history[] (Array aller Zustaende pro Tick)
├── rules[] (Edge-basierte Wirkungsregeln)
├── triggers[] (Schwellwert-basierte Ereignisse)
├── play() / pause() / seek(t)
└── evaluate(tick)
    ├── Fuer jede Edge mit temporal-Daten:
    │   ├── Pruefen ob interval erreicht
    │   ├── Effect auf Target-Node anwenden
    │   └── Animation triggern
    ├── Fuer jede Node mit decay:
    │   └── Wert anpassen
    └── Fuer alle Thresholds:
        └── Trigger-Events feuern
```

---

## 9. Zusammenfassung: Nodges als System-Explorer

```
                    ┌─────────────────────────────────────────┐
                    │          NODGES SYSTEM EXPLORER          │
                    ├─────────────────────────────────────────┤
                    │                                         │
                    │   DATEN         →  Nodes + Edges + Zeit │
                    │   DARSTELLUNG   →  Position, Farbe,     │
                    │                    Form, Animation      │
                    │   FILTER        →  Ebenen, Typen,       │
                    │                    Attribute, Pfade      │
                    │   LAYOUT        →  Force, Hierarchie,   │
                    │                    Semantisch            │
                    │   KAMERA        →  Orbit, Follow,       │
                    │                    Fly-Through           │
                    │   ZEIT          →  Play, Pause,         │
                    │                    Seek, Snapshot        │
                    │   INTERAKTION   →  Eingriffe, What-If,  │
                    │                    Vergleich             │
                    │                                         │
                    └─────────────────────────────────────────┘
```

Nodges soll in erster Etappe ein Werkzeug sein, mit dem ein Benutzer
ein **System ganzheitlich betrachten** kann. Die Kombination aus
raeumlicher Darstellung, zeitlicher Animation, intelligenter Filterung
und interaktiver Kamerasteuerung ermoeglicht es, komplexe Zusammenhaenge
intuitiv zu erfassen.
