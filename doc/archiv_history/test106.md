# Test106 – NaCl-Kristall in Lösung (Elektrostatik)

## Was wird simuliert?

Ein Natriumchlorid-Kristall (Kochsalz), der sich in Wasser auflöst. Es handelt sich um ein reales physikalisches System, das drei fundamentale Kräfte demonstriert:

- **Anziehung (Coulomb):** Na+ und Cl- ziehen sich gegenseitig an (entgegengesetzte Ladungen)
- **Abstoßung (Coulomb):** Na+ stößt Na+ ab, Cl- stößt Cl- ab (gleiche Ladungen)
- **Trägheit (Masse):** Cl- (35.45 u) ist träger als Na+ (22.99 u), H₂O (18 u) ist am leichtesten

## Bestandteile

| Typ     | Anzahl | Farbe   | Form   | Masse   | Ladung |
|---------|--------|---------|--------|---------|--------|
| Na+ Ion | 6      | Blau    | Kugel  | 22.99 u | +1     |
| Cl- Ion | 6      | Rot     | Kugel  | 35.45 u | -1     |
| H₂O     | 16     | Hellblau| Torus  | 18.02 u | 0      |

## Verbindungen

- **Ionenbindung** (12): Elektrostatische Coulomb-Bindung Na+↔Cl-
- **Hydratation** (14): Wassermoleküle umgeben Ionen (Hydrathülle)
- **Wasserstoffbrücke** (8): H-Brücken zwischen benachbarten H₂O-Molekülen

## Anwendung in Nodges

### 1. Datei laden
→ Files-Tab → "Test106" anklicken

### 2. Layout-Engine aktivieren
→ Mapping-Panel (unten links) → rechte Spalte nach unten scrollen → "Layout-Engine" einschalten → ▶ klicken

**Empfohlene Parameter für Force-Directed:**
- Max. Iterationen: 800
- Abstoßungskraft: 2000
- Anziehungskraft: 0.15
- Dämpfung: 0.85

### 3. Mappings erkunden
Die visualMappings sind vorkonfiguriert:
- **Größe** → Ionenradius (Cl- erscheint größer als Na+)
- **Anziehung** → Ladung (stärkere Ladung = stärkere Anziehung)
- **Abstoßung** → Ladung (gleich geladene Ionen stoßen sich ab)
- **Trägheit** → Masse (schwere Ionen bewegen sich langsamer)
- **Farbe** → Typ-codiert (Blau=Na+, Rot=Cl-, Hellblau=H₂O)
- **Geometrie** → Kugeln für Ionen, Torus für Wasser

### 4. Beobachtungen

Nach dem Force-Directed-Layout sollte sichtbar werden:
- Na+ und Cl- ordnen sich **alternierend** an (Anziehung entgegengesetzter Ladungen)
- Gleich geladene Ionen halten **Abstand** (Abstoßung gleicher Ladungen)
- Wassermoleküle bilden **Hüllen** um die Ionen (Hydratation)
- Cl- bewegt sich **langsamer** als Na+ (höhere Trägheit durch größere Masse)

## Physikalischer Hintergrund

Das Coulombsche Gesetz beschreibt die Kraft zwischen geladenen Teilchen:

    F = k · (q₁ · q₂) / r²

- Gleiche Vorzeichen → abstoßend (F > 0)
- Entgegengesetzte Vorzeichen → anziehend (F < 0)
- Die Kraft nimmt quadratisch mit dem Abstand ab

In Wasser löst sich NaCl, weil die Dielektrizitätskonstante des Wassers (ε ≈ 80) die Coulomb-Kraft um den Faktor 80 abschwächt. Gleichzeitig stabilisieren die Dipole der Wassermoleküle die freien Ionen durch Hydratation.
