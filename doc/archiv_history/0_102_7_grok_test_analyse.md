# Analyse: 10 Grok 4.20 Iterations-Tests (Build 6)

## Uebersicht der Probleme

| # | Test | Kernproblem | Ursache |
|---|------|-------------|---------|
| 1 | Sonnensystem | Nur 1 Node sichtbar, Rest versteckt hinter Edges | **Layout-Proportionen**: Nodes zu klein, Edges zu dick |
| 2 | Soziales Netzwerk | Nur 1 Node sichtbar, Klumpen | **Layout-Dichte**: Force-directed produziert zu kompakten Cluster |
| 3 | Geschichte Roms | Label-Klumpen, zu dicht | **Layout-Spacing + Label-Collision** |
| 4 | Computernetzwerk | Unverhaeltnismaessig (Bild 4) | **Mapping-Range**: `thickness: [0.8, 4]` erzeugt Monsterkabel |
| 5 | Goetter-Stammbaum | Labels ohne Node, Nodes ohne Label | **Label-Sync-Bug** in NodeLabelManager |
| 6 | Philosophie | 3 Attribute auf Farbe | **Prompt-Verstoss**: LLM ignoriert KANAL-REGELN |
| 7 | Buecher | Geht nicht (Ladefehler?) | Vermutlich Zod-Validierung (range-Problem) |
| 8 | Oekosystem | Nichts Neues (gleiche Proportionsprobleme) | Layout + Proportionen |
| 9 | WW2 | Groessen/Liniendicke schlecht | **Mapping-Range** vom LLM zu extrem |
| 10 | Edge Cases | Nichts Neues | Keine zusaetzlichen Erkenntnisse |

## Detailanalyse nach Kategorien

### 1. PROMPT-PROBLEME (Ursache: `build_6_prompt.md`)

**Problem 6 - Drei Attribute auf Farbe:**
Die `KANAL-REGELN` im Prompt (Zeile 25-26) sagen klar:
> "Ein visueller Kanal darf im GESAMTEN Netzwerk nur durch EIN EINZIGES Property gesteuert werden!"

**Aber:** In Test 6 (`grok_06`) hat Grok fuer `Stroemung.color` -> `epoche`, fuer `Philosoph.color` -> `nationalitaet`, und fuer `Konzept.color` -> `kategorie` verwendet. Technisch sind das drei *verschiedene* Properties auf dem gleichen Kanal `color`.

**Warum es passierte:** Die Regel ist mehrdeutig. "Global eindeutig" koennte das LLM als "pro Typ eindeutig" interpretieren. Das ist sogar vertretbar -- die Frage ist, ob man eine globale Farbachse will oder typspezifische Farben.

**Loesung im Prompt:**
```
GLOBALE EINDEUTIGKEIT: Alle Entity-Typen, die `color` dynamisch nutzen, 
MUESSEN das GLEICHE Property zeigen. Beispiel: Wenn Typ A `color` 
auf "region" mappt, muss Typ B ebenfalls `color` auf "region" mappen, 
ODER `color` auf `constant` setzen.
```

---

**Problem: Fehlende raeumliche Positionierung (Bild 2 - Region)**
Der User erwartet bei raeumlich kodierten Daten (z.B. `region: Nord/Sued/Ost/West`) eine raeumliche Anordnung.

**Loesung im Prompt (neuer Absatz):**
```
MAPPING-HINWEISE:
- Wenn das Thema eine raeumliche Dimension hat (z.B. Regionen, Laender, 
  Koordinaten), NUTZE `positionX`/`positionZ` mit dem raeumlichen Property.
  Beispiel: `"positionX": { "source": "region", "function": "categorical" }`.
- Wenn das Thema eine zeitliche Dimension hat (z.B. Startjahr, Epoche),
  NUTZE `positionX` oder `positionZ` mit dem zeitlichen Property, um
  eine chronologische Achse zu erzeugen.
```

---

### 2. LAYOUT/PROPORTION-PROBLEME (Ursache: Force-directed + Mapping-Ranges)

**Problem 1, 2, 3, 8: Nodes zu dicht, Edges ueberlagern alles**

**Ursachen:**
1. LLM erzeugt `thickness`-Ranges wie `[0.8, 4]` (Test 4 Computernetzwerk). Bei 22 Edges sieht das aus wie Stahlrohre.
2. `size`-Ranges wie `[1.8, 4.2]` (Router) bei gleichzeitig `size: 0.9` (Client) -> Router erschlaegt alles.
3. Force-directed Layout hat Default-Repulsion zu niedrig fuer dichte Graphen.

**Massnahmen:**

a) **Prompt-Haertung (Ranges begrenzen):**
```
VERHAELTNISREGELN:
- `size`-Range: Maximum 3x des Minimums (z.B. [0.5, 1.5], nicht [0.5, 4]).
- `thickness`-Range: IMMER zwischen [0.03, 0.25]. Nie ueber 0.3!
- `constant` sizes fuer Knoten: zwischen 0.5 und 1.5.
```

b) **Code-Haertung (Post-Processing Clamp):**
Im `VisualMappingEngine` einen Clamp einbauen, der extreme Werte begrenzt:
```typescript
// Nach applyMapping():
if (propName === 'thickness') return Math.min(result, 0.3);
if (propName === 'size') return Math.max(0.3, Math.min(result, 3.0));
```

c) **Layout-Spacing:**
Im `LayoutManager` die Default-Repulsion erhoehen:
- Aktuell: `repulsion: 50` (Default in VisualMappingEngine)
- Ziel: Dynamisch basierend auf Knotenanzahl: `repulsion = Math.max(80, entityCount * 3)`

---

### 3. LABEL-SYNC-BUG (Ursache: NodeLabelManager)

**Problem 5: Labels ohne Node, Nodes ohne Label**

Dies deutet auf ein Timing-Problem hin: Die Labels werden erstellt bevor alle Nodes im Scene existieren, oder nach einem Layout-Update werden die Label-Positionen nicht aktualisiert.

**Zu pruefen:**
- `NodeLabelManager.createLabelsForAllEntities()` wird aufgerufen bevor `createNodes()` fertig ist
- Oder: Force-directed Layout verschiebt Nodes, aber Labels bleiben stehen

---

### 4. TEMPORAL-FEATURE FEHLT (Kein Player)

**Beobachtung:** Die temporalen Daten (Test 3: `startYear`, `endYear` in Entities) werden zwar korrekt generiert, aber es gibt keinen Temporal-Player in der UI.

**Status:** Das Schema unterstuetzt `temporal.validFrom`/`validTo` seit Build 4, aber:
- Grok nutzt **nicht** das `temporal`-Subojekt, sondern flache Properties (`startYear`, `endYear`)
- Es existiert kein UI-Slider/Player zum Filtern nach Zeitspannen
- Der Prompt sagt nichts darueber, wie temporale Daten strukturiert sein sollen

**Massnahmen:**
1. **Prompt erweitern** mit explizitem temporal-Beispiel:
```
Fuer temporale Systeme: Nutze das `temporal`-Objekt in Entities:
{ "temporal": { "validFrom": -49, "validTo": -45 } }
```
2. **UI: Temporal-Slider** als eigenes Feature (groesseres Vorhaben)

---

## Priorisierte Massnahmen

### Phase 1: Prompt-Haertung (Sofort umsetzbar)
1. `build_6_prompt.md` erweitern:
   - Verhaeltnisregeln fuer size/thickness-Ranges
   - Eindeutigkeitsregel fuer Farbkanal praezisieren
   - Mapping-Hinweise fuer raeumliche/zeitliche Daten
   - Temporal-Objekt-Beispiel

### Phase 2: Code-Defaults (Layout + Proportionen)
2. `VisualMappingEngine`: Post-Processing-Clamp fuer extreme Werte
3. `LayoutManager`: Dynamische Repulsion basierend auf Knotenanzahl
4. `NodeLabelManager`: Label-Position-Sync nach Layout-Updates pruefen

### Phase 3: Temporal-Player (Groesseres Feature)
5. UI-Slider fuer temporale Filterung
6. Entity-Sichtbarkeit basierend auf Zeitfenster
