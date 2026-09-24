# Plan: Automatische Kategoriale Positions-Verteilung (Spread 0 - 100)

## Problemstellung
Wenn kategoriale Text-Attribute (wie `entity_type`, `name`, `source_id`) im Mapping-Panel auf Positionsachsen (`Position X/Y/Z`) gelegt werden, gibt die Engine aktuell den Text-String zurueck. Da `Number("Kanton Glarus")` zu `NaN` ausgewertet wird, fallen alle Knoten auf Koordinate `0`, was zum Bilden eines unuebersichtlichen Knäuels fuehrt.

## Loesungskonzept

1. **Automatische Index-Nummerierung fuer Text-Attribute (Spread 0 - 100)**:
   - Wenn ein Textattribut auf eine Positionsachse gemappt wird, ermittelt `VisualMappingEngine` automatisch alle eindeutigen Kategoriewerte im Datensatz.
   - Jede eindeutige Kategorie erhaelt einen gleichmaessig verteilten Zahlenwert exakt im vorgegebenen Spread von **0 bis 100** (z. B. bei 5 Kategorien: 0, 25, 50, 75, 100).

2. **Dynamische Kategorie-Karten im MappingUI**:
   - Wenn der Anwender im Mapping-Panel ein Textattribut auf Position zieht, wird automatisch ein kategorialer Verteiler im Bereich 0-100 erzeugt.

## Vorteile
- Kein visueller Knoten-Knaeuel mehr beim Mappen von Text-Attributen auf Positionen.
- Jede Entitaetsklasse (`entity_type`) bildet eine eigene sichtbare Spalte oder Ebene im Bereich von 0 bis 100.
