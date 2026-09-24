# 01020012 Temporale Visualisierungen - Uebersicht

Erstellt: 2026-07-19 | Version: 0.102.12

Alle Dateien liegen unter `public/data/temporal/`.

## Dateien

| Datei | Szenario | Zeitskala | Besonderheiten |
|---|---|---|---|
| `T1_tech_evolution.json` | Technologiefirmen 1975–2025 | Jahre | history-Deltas fuer Boersenwert + Importance; Firmen die sterben (validTo) |
| `T2_solar_system_formation.json` | Sonnensystem-Formation | Mio. Jahre (negativ) | Astronomische Skala; Proto-Erde + Theia kollision; logarithmische Size-Mapping |
| `T3_epidemic_spread.json` | Epidemie-Ausbreitung | Wochen (0 = Ausbruch) | Schnelle Skala; Status-Uebergaenge Healthy→Infected→Peak→Recovered; Kanten schliessen nach Lockdown |
| `T4_climate_actors.json` | Klimawandel-Akteure 1950–2030 | Jahre | Regierungen, NGOs, Abkommen; Kyoto-Protokoll mit validTo; Langzeittrends |
| `T5_medieval_trade.json` | Mittelalterliche Handelsrouten 1000–1600 | Jahre | Routen verschwinden (Pest, Osmanisches Reich); neue Seewege entstehen; Tenochtitlan mit validTo |

## Abgedeckte Temporal-Features

- **validFrom / validTo**: Alle Dateien - Entitaeten und Kanten mit Laufzeit
- **validTo: null**: T1, T2, T3, T4, T5 - Unbegrenzt laufende Objekte
- **validTo: Zahl (Sterbedatum)**: Netscape (T1), Proto-Erde/Theia (T2), Kyoto-Protokoll (T4), Tenochtitlan (T5)
- **history-Deltas**: T1, T2, T3, T4, T5 - Attributaenderungen ueber die Zeit
- **Negative Zeitwerte**: T2 (Millionen Jahre v. Chr.)
- **Sehr kurze Zeitskala**: T3 (Wochen)
- **Sehr lange Zeitskala**: T2 (Milliarden Jahre via Mio.-Einheit)

## TimePlayer-Verhalten pro Datei

| Datei | minTime | maxTime | Ticks |
|---|---|---|---|
| T1_tech_evolution | 1975 | 2025 | ~12 |
| T2_solar_system | -4600 | 0 | ~15 |
| T3_epidemic | 0 | 40 | ~12 |
| T4_climate | 1950 | 2030 | ~18 |
| T5_medieval | 1000 | 1600 | ~14 |

## Mapping-Hinweise

Alle Dateien enthalten `visualMappings.defaultPresets` mit:
- `global_node.position` → `linear` (explizit, kein Physics-Fallback)
- `global_node.size` → skaliert auf inhaltliche Relevanzgroesse
- `global_node.color` + `geometry` → kategoriale Unterscheidung
- `global_node.glow` → Intensitaet / Relevanz
- `global_edge.color` → Kantentyp
- `global_edge.thickness` → Staerke / Volumen
