# Nodges Demonstrations-Fahrplan

## Status-Analyse

Nach Durchsicht des gesamten Codes identifiziere ich **vier Kernprobleme**, die fuer eine Demonstration geloest werden muessen. Diese haengen teilweise zusammen.

---

## Problem 1: Labels werden von Nodes verdeckt / sind zu klein

### Ursache
In [NodeLabelManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/NodeLabelManager.ts#L117-L122):
```typescript
const scale = this.config.fontSize;  // = 0.5
sprite.scale.set(scale * canvas.width / fontSize, scale, 1);
sprite.position.y += 1.5; // fester Offset
```

- Der **Y-Offset ist fest 1.5 Einheiten** -- egal wie gross der Node ist
- Die **Label-Groesse ist absolut** (`fontSize: 0.5`), nicht relativ zur Kamera-Distanz oder Node-Groesse
- Labels zeigen nur `label` oder `name` oder `id` -- keine weiteren Attribute

### Loesung

| Massnahme | Aufwand | Prioritaet |
|-----------|---------|------------|
| **Label-Offset dynamisch** an Node-Groesse koppeln: `sprite.position.y += nodeRadius + labelPadding` | Klein | Hoch |
| **Konstante Bildschirmgroesse** fuer Labels (Billboard-Skalierung basierend auf Kamera-Distanz) | Mittel | Hoch |
| **Label-Inhalt konfigurierbar**: `label`, `name`, `type`, oder frei waehlbares Attribut | Klein | Mittel |

### Design-Entscheidung: Konstante Label-Groesse

> **Empfehlung: Labels in konstanter Bildschirmgroesse rendern.**

Die Idee, Labels immer gleich gross zu lassen, ist der richtige Ansatz. In professionellen Graph-Tools (Gephi, Neo4j Bloom, Cosmograph) werden Labels typisch mit **konstanter Pixelgroesse** dargestellt -- unabhaengig vom Zoom. Das ergibt sich aus:
1. **Lesbarkeit**: Ein Label das bei Zoom-Out zu klein wird, ist nutzlos
2. **Konsistenz**: Der User erwartet stabile Textgroesse
3. **Klarheit**: Groessenunterschiede der Nodes bleiben visuell spuerbar, ohne dass Labels die Proportionen verzerren

Die Node-Groesse richtet sich dann nicht nach den Labels, sondern die Labels positionieren sich ueber den Nodes mit einem **dynamischen Offset** der von der tatsaechlichen visuellen Node-Groesse abhaengt.

Konkret:
```typescript
// Neue update()-Logik:
const distanceToCamera = this.camera.position.distanceTo(label.sprite.position);
const constantScreenScale = 0.004; // Tuning-Parameter
sprite.scale.set(
    constantScreenScale * distanceToCamera * canvas.width / fontSize,
    constantScreenScale * distanceToCamera,
    1
);
```

---

## Problem 2: Node-Groessen sind unkontrolliert

### Ursache
In [NodeManager.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts#L190-L197):
```typescript
const size = visual.size !== undefined ? visual.size : 1.0;
const baseScale = Math.pow(size, state.visualScaleExponent) * state.visualScaleMultiplier * 0.5;
```

Das Problem: `visual.size` kommt aus dem VisualMapping und kann beliebige Werte annehmen (z.B. `range: [2, 5]` bei der Mythologie). Wenn `visualScaleMultiplier = 1.0` und `visualScaleExponent = 1.0`, ergibt ein Size-Wert von 5: `5 * 1.0 * 0.5 = 2.5` Einheiten Radius. Das ist **sehr gross** im Verhaeltnis zu einem Label-Offset von 1.5.

### Loesung

| Massnahme | Aufwand | Prioritaet |
|-----------|---------|------------|
| **Zielbereich fuer Node-Radius definieren**: 0.3 - 1.5 Three.js-Einheiten | Klein | Hoch |
| **Post-Mapping Clamping** im NodeManager: `Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, size))` | Klein | Hoch |
| **Label-Offset dynamisch**: `nodeRadius * 1.2 + 0.3` statt fester 1.5 | Klein | Hoch |

### Empfohlene Zielgroessen

```
Node-Radius-Bereich:  0.3 - 1.5 Three.js-Einheiten
Label-Offset:         nodeRadius + 0.4
Label-Screenhoehe:    ~16px konstant (Kamera-kompensiert)
```

---

## Problem 3: Normalisierung funktioniert nicht gut

### Ursache
[LayoutManager.normalizeNodePositions](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/LayoutManager.ts#L707-L745) hat zwei Schwaechen:

1. **Einheitliche Skalierung auf alle Achsen**: Die Methode nimmt den groessten Extent (max von X, Y, Z) und skaliert uniform. Wenn Daten z.B. Positionen mit Y-Werten von -40 bis +40 haben (Mythology), aber X/Z nur -30 bis +30, wird alles auf den Y-Range (80) normalisiert. X/Z wird dann auf ca. 7.5 Einheiten zusammengedrueckt.

2. **Ueberschreibt bewusst gesetzte Positionen**: Wenn ein JSON explizite Positionen mitbringt (z.B. `"position": {"x": 0, "y": 40, "z": 0}` fuer Mount Olympus), werden diese durch die Normalisierung zerstoert.

3. **Wird nur nach Layout-Algorithmen aufgerufen**, nicht bei direktem Datei-Import mit vordefinierten Positionen. Aber die Daten koennen trotzdem ausserhalb des sichtbaren Bereichs liegen.

### Loesung

| Massnahme | Aufwand | Prioritaet |
|-----------|---------|------------|
| **Differenzierte Normalisierung**: Nur ausfuehren wenn Nodes KEINE expliziten Positionen haben, oder ein Flag `normalizeCoordinatesEnabled` pruefen | Klein | Hoch |
| **Achsen-unabhaengige Skalierung**: X, Y, Z jeweils separat normalisieren, um Proportionen zu erhalten | Mittel | Mittel |
| **"Fit to View"** statt Positions-Normalisierung: Kamera bewegen, nicht Daten aendern | Mittel | Mittel |

> **Empfehlung**: Wenn Daten explizite Positionen mitbringen (`position`-Feld vorhanden), sollte die Normalisierung **nur optional** sein (gesteuert ueber `state.normalizeCoordinatesEnabled`). Die Kamera sollte stattdessen per "Fit to View" automatisch so positioniert werden, dass alles sichtbar ist.

---

## Problem 4: LLM-Generierung produziert schlechte Systeme

### Ursachen (zwei separate Probleme)

#### 4a. Der System-Prompt im LLMService ist zu simpel
[LLMService.ts Z.157-180](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts#L157-L180): Der aktuelle System-Prompt ist minimal:
- Keine `visualMappings` gefordert
- Keine `dataModel`-Definitionen
- Kein Hinweis auf Farb-Differenzierung, Attribut-Reichtum oder Positionierung
- Keine Referenz auf die `nodges_build.md` Anleitung

**Ergebnis**: Das LLM erzeugt nur `id`, `type`, `label` -- ohne Attribute, ohne Mappings, ohne Farben. Alles wird monochrom in der Default-Farbe `0x00aaff` gerendert.

#### 4b. Die `nodges_build.md` Anleitung ist gut, wird aber nicht genutzt
[nodges_build.md](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/nodges_build.md) ist eine solide technische Referenz. **Aber**:
- Sie wird im LLM-Service **nie referenziert**
- Sie enthaelt keine konkreten **Beispiel-Outputs** fuer verschiedene Domaenen
- Der `prompt_goetterwelt_generator.md` in `/doc` ist ein gutes Beispiel, aber nur fuer ein Thema

### Loesung: Zweistufiges Anleitungskonzept

#### Stufe 1: `nodges_build.md` bleibt als technische Referenz
Erweitern um:
- **Minimalbeispiel eines visuell reichen Outputs** (mit dataModel + visualMappings + datenreichen Entities)
- **Abschnitt "Best Practices fuer LLM-Generierung"**: Farbkategorien, Positionierung, Attribut-Tiefe

#### Stufe 2: Neuer erweiterter System-Prompt im LLMService
Der System-Prompt in `LLMService.ts` muss **komplett ueberarbeitet** werden. Statt 20 Zeilen braucht er ca. 80-100 Zeilen die folgendes enthalten:

1. **Vollstaendiges Schema** (system, metadata, dataModel, visualMappings, data)
2. **Pflicht-Angabe von `visualMappings`** mit Farb-Diversitaet
3. **Pflicht-Angabe von `dataModel`** mit mindestens 2-3 Attributen pro Entity-Typ
4. **Positionierungsregeln** (Y-Hierarchie, X/Z-Verteilung, Mindestabstand 5-10 Einheiten)
5. **Datenreichtum-Anweisung**: Mindestens 3-5 semantische Attribute pro Entity
6. **Categorical Color Mapping**: `"color": { "source": "<attribut>", "function": "categorical" }`
7. **Groessen-Mapping**: `"size": { "source": "<attribut>", "function": "linear", "range": [0.5, 1.5] }`
8. **Ein eingebettetes Mini-Beispiel**

### Konkreter Prompt-Entwurf (Kern)

```text
Du bist ein Daten-Generator fuer Nodges, eine 3D-Netzwerk-Visualisierung.
Deine Antwort MUSS ausschliesslich gueltiges JSON sein.

PFLICHTSTRUKTUR:
{
  "system": "Systemname",
  "metadata": { "description": "...", "version": "1.0" },
  "dataModel": {
    "entities": {
      "<EntityTyp>": {
        "properties": {
          "<attr1>": { "type": "categorical", "values": [...] },
          "<attr2>": { "type": "continuous", "range": [min, max] }
        }
      }
    }
  },
  "visualMappings": {
    "defaultPresets": {
      "<EntityTyp>": {
        "color": { "source": "<kategorisches_attribut>", "function": "categorical" },
        "size": { "source": "<numerisches_attribut>", "function": "linear", "range": [0.5, 1.5] }
      },
      "<RelationshipTyp>": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#hexcode" } },
        "thickness": { "source": "constant", "function": "constant", "range": [0.08, 0.08] }
      }
    }
  },
  "data": {
    "entities": [
      { "id": "...", "type": "<EntityTyp>", "label": "...", "<attr1>": "...", "<attr2>": 42,
        "position": { "x": 0, "y": 5, "z": 0 } }
    ],
    "relationships": [
      { "id": "...", "type": "<RelationshipTyp>", "source": "...", "target": "...", "label": "..." }
    ]
  }
}

REGELN:
1. FARBVIELFALT: Verwende IMMER "function": "categorical" fuer Entity-Farben, 
   gemappt auf ein kategorisches Attribut mit mindestens 3 verschiedenen Werten.
2. GROESSEN-DIFFERENZIERUNG: Verwende "function": "linear" fuer Entity-Groessen,
   gemappt auf ein numerisches Attribut. Range MUSS [0.5, 1.5] sein.
3. DATENREICHTUM: Jede Entity muss 3-5 semantische Attribute haben (flach, NICHT verschachtelt).
4. POSITIONEN: Setze fuer jede Entity ein position-Objekt mit x, y, z.
   Y-Achse = Hierarchie (oben=wichtig). Mindestabstand 5 Einheiten.
5. VERSCHIEDENE EDGE-TYPEN: Nutze verschiedene Relationship-Typen mit 
   unterschiedlichen Farben.
6. Generiere mindestens 10 Entities und 15 Relationships.
```

---

## Priorisierte Arbeitspakete

### Paket A: Visuelle Grundlagen (Hoechste Prioritaet)
> "Ohne diese sieht nichts gut aus"

1. **LLM System-Prompt ueberarbeiten** -- Damit neue Systeme Farben, Groessen und Attribute haben
2. **Node-Groessen-Clamping** -- Maximal-Radius begrenzen
3. **Label-Offset dynamisch** -- An Node-Groesse koppeln

### Paket B: Label-Qualitaet
> "Labels muessen lesbar und informativ sein"

4. **Konstante Bildschirmgroesse** fuer Labels
5. **Label-Inhalt konfigurierbar** (welches Attribut angezeigt wird)

### Paket C: Normalisierung & Kamera
> "Daten muessen sichtbar dargestellt werden"

6. **Normalisierung optional** bei expliziten Positionen
7. **Achsen-proportionale Normalisierung** statt uniform

### Paket D: Anleitung verbessern
> "Die nodges_build.md als Referenz erweitern"

8. **nodges_build.md erweitern** um Best Practices und reicheres Beispiel

---

## Offene Entscheidungen

> [!IMPORTANT]
> Folgende Punkte brauchen dein Feedback:

1. **Sollen wir mit Paket A starten?** Das hat den groessten visuellen Effekt.
2. **Label-Groesse**: Konstante Pixelgroesse (empfohlen) oder proportional zum Node?
3. **Normalisierung**: Optional per Toggle (existiert als `normalizeCoordinatesEnabled` im State), oder intelligent automatisch (nur wenn keine Positionen im JSON)?
4. **`max_tokens` erhoehen?** Aktuell ist es bei Anthropic auf 4000 begrenzt -- fuer reichere JSONs zu wenig.
