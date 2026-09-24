# Analyse der B12 Bundesrats-Daten und Kanten-Kategorisierung

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Auswertung der Bundesraete in den aktuellsten B12-JSONs

In den aktuellen B12-JSON-Dateien (`public/data/b12/B12_Graph_01_28.json` und `public/data/b12/B12_02_Antwort_01_28.json`) wurden sowohl das Kollegium des Bundesrates als auch alle 7 Einzelmitglieder inklusive ihrer Zusatzrollen, Kantone und Parteien erfasst.

### 1.1 Die 7 Bundesratsmitglieder im Graphen

1. **Guy Parmelin:**
   - **Kanton:** Waadt (VD)
   - **Partei:** SVP
   - **Sonderrolle 2026:** Bundespraesident
   - **Hintergrund:** Meisterlandwirt / Winzer
   - **Kanten:** `membership` zu `Bundesrat`, Verknuepfungen zu `SVP`, `Vaud` und `Bundespraesident`.

2. **Ignazio Cassis:**
   - **Kanton:** Tessin (TI)
   - **Partei:** FDP
   - **Sonderrolle 2026:** Vizepraesident
   - **Hintergrund:** Arzt / ehemaliger Kantonsarzt
   - **Kanten:** `membership` zu `Bundesrat`, Verknuepfungen zu `FDP`, `Ticino` und `Vizepraesident`.

3. **Karin Keller-Sutter:**
   - **Kanton:** St. Gallen (SG)
   - **Partei:** FDP
   - **Hintergrund:** Uebersetzerin, ehemalige Regierungsraetin St. Gallen
   - **Kanten:** `membership` zu `Bundesrat`, Verknuepfungen zu `FDP` und `St. Gallen`.

4. **Albert Roesti:**
   - **Kanton:** Bern (BE)
   - **Partei:** SVP
   - **Kanten:** `membership` zu `Bundesrat`, Verknuepfungen zu `SVP` und `Bern`.

5. **Elisabeth Baume-Schneider:**
   - **Kanton:** Jura (JU)
   - **Partei:** SP
   - **Hintergrund:** Sozialarbeiterin
   - **Kanten:** `membership` zu `Bundesrat`, Verknuepfungen zu `SP` und `Jura`.

6. **Beat Jans:**
   - **Kanton:** Basel-Stadt (BS)
   - **Partei:** SP
   - **Hintergrund:** Umweltwissenschaftler
   - **Kanten:** `membership` zu `Bundesrat`, Verknuepfungen zu `SP` und `Basel-Stadt`.

7. **Martin Pfister:**
   - **Kanton:** Zug (ZG)
   - **Partei:** Die Mitte
   - **Kanten:** `membership` zu `Bundesrat`, Verknuepfungen zu `Die Mitte` und `Zug`.

### 1.2 Institutionelle Knoten und Rollen
- **`Bundesrat`:** Die kollektive Exekutivbehoerde der Schweiz.
- **`Bundespraesident`:** Jaaehrlich aus den Mitgliedern gewaehltes Staatsoberhaupt primus inter pares.
- **`Vizepraesident`:** Stellvertreter des Bundespraesidenten.
- **`Bundeskanzler`:** Leiter der Bundeskanzlei (nimmt ohne Stimmrecht an Sitzungen teil).
- **`Vereinigte Bundesversammlung`:** Waehlt den Bundesrat und den Bundespraesidenten.

---

## 2. Ursache der beistandssortierten Kanten-Bezeichnungen (z.B. `enables,grants`)

Auf dem Screenshot der Mapping-UI fallen Kantenbezeichnungen wie `enables`, `enables,grants` oder `collaborate,convene,legislate` auf.

### 2.1 Warum kommt es zu diesen Bezeichnungen?
1. **Wortgetreue Extraktion durch LightRAG:** LightRAG extrahiert Beziehungen sehr genau aus den Textpassagen und uebernimmt konkrete Verben aus dem Kontext.
2. **Kanten-Deduplizierung (Merging):** Wenn zwischen zwei Entitaeten in verschiedenen Textabschnitten Beziehungen gefunden werden, faengt LightRAG diese Begriffe zusammen und fuegt sie kommagetrennt zusammen (z.B. `enables` + `grants` -> `enables,grants`).
3. **Auswirkung auf die UI:** Nodges liest diesen zusammengesetzten String als eigenstaendigen Beziehungstyp. Dadurch entstehen Dutzende sehraehnlicher, aber leicht unterschiedlicher Kantenbezeichnungen.

### 2.2 Loesungsansatz zur Kanten-Normalisierung
Um sinnvolle Beziehungs-Gruppen im Raum und in der Legende zu bilden, empfiehlt sich ein Post-Processing oder eine Mapping-Taxonomie:
- **Kanten-Kategorien (Oberbegriffe):**
  - `GOVERNANCE` (beinhaltet `determines,governs`, `characterizes`, `ensures`)
  - `MEMBERSHIP` (beinhaltet `membership`, `consistsof,includes`, `comprises`, `contains`)
  - `AUTHORIZATION` (beinhaltet `allows,empowers`, `enables`, `enables,grants`, `empowered by,include`)
  - `LEGISLATION` (beinhaltet `collaborate,convene,legislate`, `proposes`, `changes,proposes`)
  - `ELECTION` (beinhaltet `elect`, `election`, `election,lead`)

Durch eine solche Normalisierung in `VisualMappingEngine.ts` oder im Post-Processing-Skript schrumpft die Vielzahl der Kantenbezeichnungen auf wenige, übersichtliche Hauptkategorien.
