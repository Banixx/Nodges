# Build 5 Pipeline-Test: Sonnensystem

## Testaufbau

- **Thema**: Sonnensystem (Sterne, Planeten, Zwergplaneten, Monde)
- **Pipeline**: 3-Schritt-Simulation (Ontologie → Daten → Visual Mapping) + Validierung
- **Ziel**: Pruefen ob die Prompt-Struktur funktionale JSON-Dateien erzeugt

---

## Ergebnisse pro Phase

### Phase 1+2: Ontologie (Competency Questions + Schema)

| Kriterium | Ergebnis |
|:---|:---|
| Competency Questions erzeugt | 5 Fragen |
| Werte-neutral (kein visualMappings) | Korrekt |
| Dynamische Typen | 4 Entity-Typen (Stern, Planet, Zwergplanet, Mond) |
| Kanten mit Properties | 3 Kanten-Typen, davon 2 mit Properties |
| Typ-spezifische Attribute | Korrekt (Stern hat keine Anzahl_Monde) |
| Keine Verschachtelung | Korrekt |

> [!NOTE]
> Die Ontologie enthaelt absichtlich kein `visualMappings`-Objekt. Das ist die zentrale Neuerung gegenueber Build 4.

### Phase 4: Datengenerierung

| Kriterium | Ergebnis |
|:---|:---|
| Entities erzeugt | 18 (1 Stern, 8 Planeten, 3 Zwergplaneten, 6 Monde) |
| Relationships erzeugt | 20 (17 UMKREIST, 3 GRAVITATIV_BEEINFLUSST) |
| Schema-Bindung | Alle Typen existieren im dataModel |
| Null-Handling | Triton `validFrom: null` (Entstehungszeitpunkt unbekannt) |
| Temporale History | Uranus, Neptun, Pluto, Ceres mit Entdeckungs-Keyframes |
| 3D-Positionierung | Y-Achse fuer Distanz, sinnvolle Cluster |

### Phase 5: Visual Mapping

| Kriterium | Ergebnis |
|:---|:---|
| Alle Entity-Typen abgedeckt | 4 Presets |
| Alle Edge-Typen abgedeckt | 3 Presets |
| Verschiedene Geometrien | icosahedron, sphere, dodecahedron, octahedron |
| Datengetriebene Mappings | Size nach Masse/Radius, Thickness nach Exzentrizitaet/Staerke |

### Phase 6: Validierung

```
=== VALIDIERUNG ===
Entities: 18
Relationships: 20
Entity-Typen: Stern, Planet, Zwergplanet, Mond
Rel-Typen: UMKREIST, ENTDECKT_VON, GRAVITATIV_BEEINFLUSST

Fehler: KEINE
Warnungen: KEINE

Status: ALLE 8 VALIDIERUNGEN BESTANDEN (V1-V8)
```

### Phase 7: Rendering in Nodges

![Sonnensystem gerendert in Nodges – 18 Knoten, 20 Kanten](C:/Users/ich/.gemini/antigravity/brain/9322e8c4-4064-4679-a4ff-63cc202adb3d/sonnensystem_rendered.png)

**Ergebnis**: Die JSON-Datei wird **fehlerfrei geladen und gerendert**. Alle 18 Knoten und 20 Kanten sind sichtbar.

---

## Erkenntnisse und offene Punkte

### Was funktioniert
1. Die 3-Schritt-Prompt-Architektur erzeugt valide, konsistente JSON-Dateien
2. Schema-Version 5.0 wird nach dem DataParser-Fix korrekt akzeptiert
3. Die Validierungsregeln fangen strukturelle Fehler zuverlaessig ab
4. Competency Questions steuern die Attribut-Auswahl zielgerichtet

### Was noch nicht funktioniert

| Problem | Ursache | Loesung |
|:---|:---|:---|
| Alle Knoten gleiche Farbe/Form | `VisualMappingEngine` wendet typ-spezifische Presets nicht automatisch an | AP-3: Engine muss Build-5-Presets pro Typ auswerten |
| "Mapping aus Vorlage" ohne Effekt | Die Suggestion-UI uebergibt Presets nur global, nicht pro Typ | AP-4: UI muss typ-spezifische Uebernahme unterstuetzen |

### Code-Aenderung durchgefuehrt

render_diffs(file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/core/DataParser.ts)

---

## Test-Dateien

| Datei | Beschreibung |
|:---|:---|
| [Phase 1 Ontologie](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_1_build_5_test_phase1_ontologie.json) | Werte-neutrales Schema mit CQs |
| [Phase 4 Daten](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_1_build_5_test_phase4_daten.json) | 18 Entities, 20 Relationships |
| [Phase 5 Visual](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_1_build_5_test_phase5_visual.json) | Typ-spezifische Visual Mappings |
| [Finales JSON](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/sonnensystem_build5.json) | Merged + validiert, ladbar in Nodges |
