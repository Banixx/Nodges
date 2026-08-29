# Umsetzung: Fixes Build12 (Punkte 1-7 der kritischen Analyse)

Version: 0.103.0 | Status: **umgesetzt und getestet**

## Entscheidung Punkt 4
Manuelle Datenbank-Wahl in der UI (Option 3).

## Umgesetzte Fixes

| Punkt | Fix | Umsetzung |
|-------|-----|-----------|
| 1 | Mock explizit kennzeichnen | Healthcheck vor Build; Abbruch bei Offline-Server; Warnung im Log bei Mock-Engine; `metadata.mock = true` und `metadata.generationDetails.mock = true` in der Ergebnis-JSON; Backend liefert `mock`/`engine_active` in `/query` und `/insert`. |
| 2 | Doppelte Metadaten-Injektion | Generische `enrichGraphMetadata`-Injektion ueberspringt `build12_lightrag` (dort bereits im Pipeline-Block injiziert, da vor dem Serverspeichern noetig). |
| 3 | Teilgraph statt Vollgraph | Backend begrenzt den extrahierten Wissensgraph auf `LIGHTRAG_MAX_GRAPH_NODES` (Default 150) und `LIGHTRAG_MAX_GRAPH_EDGES` (Default 300), per Env konfigurierbar, mit Log-Warnung bei Begrenzung. |
| 4 | Manuelle Datenbank-Wahl in der UI | Neues Select im LightRAG-Panel (Default + vorhandene DBs via `listDatabases`), Eingabefeld + Button zum Anlegen neuer DBs (`createDatabase`), `change`-Event aktiviert die gewaehlte DB (`selectDatabase`), Build aktiviert die gewaehlte DB vor dem Insert, `metadata.activeDatabase` wird gespeichert. |
| 5 | Relation-Fallback | `normalizeRelation` behaelt die Originalrelation bei und loggt eine `console.warn`, statt still `allowedSet[0]` zu erzwingen. |
| 6 | Schema-Validierung | `GraphDataSchema.safeParse` nach der Generierung; bei Erfolg wird das validierte (mit Defaults angereicherte) Objekt verwendet; bei Fehlern Warnung im Log + `generationLog.validation` mit Issue-Details. |
| 7 | Eindeutige Dateinamen | Suffix geaendert von `counter_Tag` auf `counter_Tag_StundeMinute` (z.B. `01_28_2215`), kollisionsfester pro Session. |

## Neue/geaenderte Funktionen

### `src/utils/LightRAGService.ts`
- `listDatabases()`, `selectDatabase(name)`, `createDatabase(name)` (neue Service-Methoden)
- `queryGraph()` gibt zusaetzlich `mock: boolean` zurueck
- `insertText()` gibt zusaetzlich `mock?: boolean` zurueck
- `normalizeRelation()`: Fallback geaendert (Original statt `allowedSet[0]`)

### `src/ui/CreatePanel.ts`
- Klassenvariable `lrDatabaseSelect`
- `reloadLightRagDatabases()` (laedt DB-Liste, Fallback auf Default)
- UI-Block "LightRAG-Datenbank" mit Select, Eingabefeld und Anlegen-Button
- Build12-Zweig: Healthcheck, DB-Aktivierung, Mock-Warnung, Mock-Kennzeichnung, `activeDatabase`-Metadaten
- Generische Metadaten-Injektion: `build12_lightrag` wird uebersprungen
- `GraphDataSchema.safeParse`-Validierung nach allen Pipelines
- Datei-Suffix mit Stunden/Minuten

### `lightrag-backend/main.py`
- `mock`/`engine_active`-Flags in `/query` (echt + Fallback) und `/insert`
- `MAX_GRAPH_NODES` / `MAX_GRAPH_EDGES`-Begrenzung der Knowledge-Graph-Extraktion

## Tests
- `npx vitest run src/tests/LightRAGService.test.ts`: 3 Tests bestanden
- `npx tsc --noEmit`: keine Fehler in den geaenderten Dateien (vorbestehende Fehler in `src/core/BuildFormatUtils.ts` unveraendert)
- Laufender Dev-Server transformiert alle geaenderten Module fehlerfrei (HTTP 200)