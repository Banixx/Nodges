# Analyse des Verhaltens bei Datei-Umbenennung (gg.json / ff.json)

Dieses Dokument beschreibt das Verhalten des Systems beim Umbenennen geoeffneter Dateien und beim Laden der daraus resultierenden Dateien `gg.json` und `ff.json`.

---

## 🔍 Detailanalyse der Vorkommnisse

### 1. Leeren der Szene beim Umbenennen einer geoeffneten Datei
Wenn eine Datei im Ordner `public/data/` (z. B. unter `g35/`) umbenannt wird, waehrend sie in Nodges geoeffnet ist, geschieht Folgendes:
- Der Vite-Entwicklungsserver registriert die Aenderung an den statischen Assets (Loeschen der alten Datei, Erstellen der neuen Datei).
- Dies loest einen automatischen **Hot Reload** (vollstaendiges Neuladen der Seite) im Browser aus.
- Da beim Start der Anwendung standardmaessig keine Default-Daten geladen werden (die Methode `loadDefaultData` in `src/App.ts` ist leer), startet Nodges nach dem Neuladen mit einer vollstaendig leeren 3D-Szene und einem leeren Mapping-Panel.

### 2. Fehlgeschlagenes Laden von gg.json und ff.json vor dem Fix
Sowohl `gg.json` als auch `ff.json` wurden aus Gemini-generierten Dateien erstellt. Diese Dateien enthielten in ihren Metadaten den Eintrag:
```json
"schemaVersion": "draft-07"
```
Vor dem Einbau des Schema-Fallbacks in `src/core/DataParser.ts` fuehrte jeder Versuch, diese Dateien zu laden, zu einem kritischen Validierungsfehler:
> `Data Validation Failed: Unsupported schema version "draft-07"`

Daher blieben die Szene und das Mapping-Panel beim Versuch, diese Dateien zu oeffnen, leer.

---

## 🛠️ Status nach der Fehlerbehebung

Nachdem wir die Fallback-Logik in `src/core/DataParser.ts` implementiert haben (wo unbekannte Versionen wie `"draft-07"` automatisch auf die unterstuetzte Version `"5.0"` normalisiert werden), verhalten sich die Dateien wie folgt:

1. **Erfolgreiches Laden**: Die Dateien `gg.json` (31 Knoten, 40 Kanten) und `ff.json` (6 Knoten, 7 Kanten) lassen sich nun fehlerfrei laden.
2. **Korrektes Mapping**: Das Mapping-Panel wird vollstaendig mit den Attributen gefuellt und die Graphen werden korrekt in der 3D-Szene dargestellt.
3. **Warnung in Konsole**: In der Browser-Konsole erscheint lediglich eine Warnung ueber den erfolgreichen Fallback von `"draft-07"` auf `"5.0"`.

*Hinweis: Um den Fix wirksam zu machen, muss das Browser-Fenster nach dem Code-Update einmal neu geladen werden.*
