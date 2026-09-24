# Vergleich der LLM-generierten JSON-Dateien (Schweizer politisches System)

Die im Ordner `c:/Users/ich/Desktop/code/_projects/Nodges/public/data/compare_ag_llm` abgelegten JSON-Dateien weisen deutliche Unterschiede in Datenmenge, Struktur und Kompatibilität zum Nodges Build 3 Format auf.

## Übersicht

| Dateiname | Grösse (KB) | Knoten | Kanten | Format/Struktur | Visual Mappings | Data Model |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **polCh_31high.json** | 4.3 | 23 | 28 | `nodes` / `edges` | Nein | Nein |
| **polCh_31low.json** | 1.1 | 7 | 7 | `nodes` / `edges` | Nein | Nein |
| **polCh_35Fhigh.json** | 34.9 | 38 | 61 | `data.entities` / `data.relationships` | Ja | Ja |
| **polCh_35Fmed.json** | 22.5 | 26 | 36 | `data.entities` / `data.relationships` | Ja | Ja |
| **polCh_O46t.json** | 20.9 | 36 | 50 | `data.entities` / `data.relationships` | Ja | Ja |
| **polCh_OSS120.json** | 3.5 | 8 | 7 | `entities` / `relationships` | Nein | Nein |
| **polCh_S46t.json** | 19.5 | 46 | 69 | `nodes` / `edges` | Nein | Nein |

## Detailanalyse

1. **Struktur und Nodges-Kompatibilität:**
   - **Flash 3.5 und O46t Modelle (polCh_35Fhigh.json, polCh_35Fmed.json, polCh_O46t.json):** Diese Modelle liefern als einzige das vollständige, strukturierte Format (Nodges Build 3 Kompatibilität). Sie umfassen ein semantisches `dataModel`, vordefinierte `visualMappings` und kapseln die Knoten/Kanten in `data.entities` und `data.relationships`.
   - **Pro 3.1 & Claude Sonnet (31high, 31low, S46t):** Diese verwenden das einfache Legacy-Format mit flachen Arrays für `nodes` und `edges`. Sie enthalten keine visuellen Mappings oder Metadatenmodelle.
   - **OSS120:** Verwendet eine abweichende Struktur mit `entities` und `relationships` direkt auf der Root-Ebene (ohne umschliessendes `data` Objekt).

2. **Detaillierungsgrad (Knoten/Kanten):**
   - **S46t** generierte das grösste Netzwerk (46 Knoten, 69 Kanten) im reinen Legacy-Format.
   - **35Fhigh** generierte das grösste Netzwerk im modernen Format (38 Knoten, 61 Kanten).
   - **O46t** lieferte ebenfalls einen sehr umfangreichen Graphen im modernen Format (36 Knoten, 50 Kanten) und zeichnet sich durch ein sehr sauberes, kompaktes Mapping aus.
   - **31low** und **OSS120** lieferten nur sehr rudimentäre Graphen (7 bis 8 Knoten).

3. **Syntax-Probleme:**
   - **polCh_OSS120.json** ist kein valides JSON. Das Modell verwendete Schweizer Tausendertrennzeichen in numerischen Werten (z. B. `100'000` und `50'000`), was beim regulären JSON-Parsing zu Fehlern führt.

## Fazit
Die **Flash 3.5 Modelle** sowie das **O46t Modell** haben sich am besten an den geforderten Schema-Standard ("Build 2/3") gehalten und semantisch reichhaltige Graphen inklusive Metadaten und visuellen Mappings erzeugt. Für komplexe, sofort verwendbare Graphen in Nodges sind **polCh_35Fhigh.json** und **polCh_O46t.json** die qualitativ besten Ergebnisse. Modelle wie Sonnet (S46t) generieren zwar inhaltlich umfangreiche Datensätze, ignorieren jedoch das fortgeschrittene Nodges-Datenmodell komplett.
