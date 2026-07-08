# Testreihe: Generierung Sonnensystem mit Temporal-Objekt (Version 0.102.4)

Dieses Dokument vergleicht die Leistung, Geschwindigkeit und Schema-Konformitaet verschiedener LLM-Modelle auf OpenRouter bei der Generierung eines 3D/4D-Netzwerks des Sonnensystems ueber den Verlauf eines Jahres mit 60 Keyframes.

## Versuchsaufbau

- **Prompt**:
  > Erstelle ein 3D/4D-Netzwerk des Sonnensystems über den Verlauf eines Jahres mit 60 Keyframes (Zeitschritte von 0 bis 59). Im Zentrum steht die Sonne (fixiert). Um die Token-Limits der API nicht zu überschreiten, beschränke dich auf die Planeten Erde, Mars und Jupiter, die die Sonne umkreisen.
  > Nutze das temporal-Objekt mit validFrom, validTo und history für diese Planeten.
  > In der history muss jeder Planet für jeden Zeitschritt (0 bis 59) einen Keyframe haben, in dem seine 3D-Position ('position': { 'x': ..., 'y': ..., 'z': ... }) im Raum so verändert wird, dass er eine kreisförmige Bahn um die Sonne beschreibt (Nutze präzise x- und z-Koordinaten basierend auf Sinus/Kosinus für die Kreisbahn, y = 0).
  > Definiere eine Beziehung 'orbit' zwischen den Planeten und der Sonne.

- **Pipeline**: Build 5 Multi-Step (Ontologie -> Daten -> Visual Mappings)
- **Umgebung**: Node.js v22.18.0 mit nativem Fetch auf OpenRouter API

---

## Testergebnisse im Überblick

| Modell | Schritt 1 (Ontologie) | Schritt 2 (Daten) | Schritt 3 (Visual Mappings) | Gesamtstatus | Schema-Konformitaet | Zeit gesamt |
|---|---|---|---|---|---|---|
| **google/gemini-2.5-flash** | ✅ (4.2s) | ✅ (47.1s) | ✅ (2.5s) | 🟢 **ERFOLG** | **Hervorragend** (100% korrekt) | ~54s |
| **qwen/qwen-2.5-72b-instruct** | ✅ (17.6s) | ✅ (207.2s) | ✅ (7.9s) | 🟢 **ERFOLG** | **Hervorragend** (100% korrekt) | ~233s |
| **openai/gpt-4o-mini** | ✅ (7.9s) | ✅ (102.2s) | ✅ (11.4s) | 🟢 **ERFOLG** | **Ungenügend** (Erfand eigene Properties) | ~121s |
| **anthropic/claude-3-haiku** | ✅ (6.7s) | ❌ (Truncated) | - | 🔴 **FEHLER** | - (Abbruch bei Keyframe 18) | - |
| **qwen/qwen3-coder:free** | ❌ (Rate-Limit) | - | - | 🔴 **FEHLER** | - (HTTP 429 upstream) | - |

---

## Detaillierte Modell-Analyse

### 1. google/gemini-2.5-flash (Testsieger)
- **Geschwindigkeit**: Extrem schnell. Benötigte fuer den riesigen Daten-Schritt 2 nur **47 Sekunden**.
- **Qualität & Datenmenge**:
  - Generierte die Sonne und 3 Planeten (Erde, Mars, Jupiter) mit vollstaendigen 60 Keyframes.
  - Berechnete physikalisch sinnvolle kreisfoermige Koordinaten (Erde: Radius ~15, Mars: Radius ~25) mit trigonometrischen Sinus-/Kosinuswerten.
- **Schema-Konformität**:
  - Hielt sich exakt an das Nodges Build 5 Schema.
  - Nutzte das korrekte `history`-Format: `{ "timestamp": X, "changes": { "position": { "x": ..., "y": ..., "z": ... } } }`.
- **Dateipfad**: `public/data/0_102_sonnensystem_gemini_2_5_flash.json`

### 2. qwen/qwen-2.5-72b-instruct
- **Geschwindigkeit**: Langsam. Benoetigte ueber **3.5 Minuten** fuer den Daten-Schritt.
- **Qualität & Datenmenge**:
  - Generierte ebenfalls 60 vollwertige Keyframes fuer alle 3 Planeten.
  - Nutzte englische Labels ("Earth" statt "Erde"), weswegen automatische deutsche Skripte fehlschlagen, die Daten sind aber semantisch absolut fehlerfrei.
- **Schema-Konformität**:
  - Exzellent. Keine Abweichungen vom vorgegebenen Schema.
- **Dateipfad**: `public/data/0_102_sonnensystem_qwen_2_5_72b.json`

### 3. openai/gpt-4o-mini
- **Geschwindigkeit**: Moderat (~102 Sekunden fuer Schritt 2).
- **Qualität & Datenmenge**:
  - Generierte 60 Keyframes.
- **Schema-Konformität**: **Fehlgeschlagen.**
  - Das Modell ignorierte die im Schema definierte Struktur der zeitlichen Aenderungen.
  - Statt `"timestamp"` erfand es `"timeStep"`.
  - Statt `"changes": { "position": { "x", "y", "z" } }` schrieb es `"position": { "x", "y", "z" }` direkt auf die Keyframe-Ebene.
  - Das fuer die Visualisierung kritische `changes`-Objekt fehlt komplett, wodurch die Nodges-Engine diese Keyframes nicht lesen kann.
- **Dateipfad**: `public/data/0_102_sonnensystem_gpt_4o_mini.json`

### 4. anthropic/claude-3-haiku
- **Fehler**: Das Modell lief in das API-Output-Token-Limit von OpenRouter fuer Haiku und wurde mitten in Schritt 2 abgeschnitten (bei Keyframe 18 fuer Mars). Das JSON war dadurch unvollstaendig und ungueltig.

### 5. qwen/qwen3-coder:free
- **Fehler**: Das freie Modell wurde durch Upstream-Rate-Limits (HTTP 429 von Venice) blockiert und konnte nicht einmal Schritt 1 beenden.

---

## Fazit und Empfehlungen für Nodges

1. **Gemini 2.5 Flash** ist die absolute Empfehlung als Standard-Modell fuer komplexe 4D-Generierungen. Es ist nicht nur das schnellste Modell, sondern auch hochpraezise bei mathematischen Bahnberechnungen und 100% schema-konform.
2. **GPT-4o-mini** sollte trotz seiner Popularitaet fuer strukturierte JSON-Ablaeufe mit tief verschachtelten Strukturen (wie `temporal.history`) gemieden werden, da es dazu neigt, Properties eigenmaechtig zu vereinfachen, was zu Inkompatibilitaeten fuehrt.
3. **Claude-3-Haiku** hat ein zu geringes Token-Limit fuer dichte 4D-Netzwerke und scheidet fuer umfangreiche Generierungen aus.
