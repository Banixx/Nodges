# Uebersicht der 5 getunten B12-Graph-Varianten fuer Kantone und Gruppenbildung

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Ausgangslage

In der urspruenglichen Datei `B12_Graph_01_28.json` waren die Kantons-Entitaeten (`Kanton Zürich`, `Kanton Bern`, `Kanton Uri`, `Kanton Thurgau` etc.) isoleut/einzeln erfasst:
- Es fehlten explizite Kanten zu einem gemeinsamen Sammelknoten `Kantone` oder `Schweiz`.
- Einzelne Kantone (wie `Kanton Uri` und `Kanton Thurgau`) besassen 0 Kanten im Graphen.
- Das Feld `group` bzw. `groupId` war unbelegt.

---

## 2. Uebersicht der 5 erstellten getunten Varianten

Die folgenden 5 optimierten Versionen wurden generiert und sowohl unter `public/data/b12/` als auch im `doc/`-Ordner abgespeichert:

### 1. `B12_Graph_01_28_tuned1.json` -- Explizite Gruppenbildung & Kanton-Hub
- **Aenderungen:** Jeder Kanton ist ueber eine starke `part_of`-Kante (`weight: 3`) mit dem zentralen Sammelknoten `Kantone` verbunden.
- **Gruppierung:** Allen Kantonsknoten wird `group: "Kantone"` und `groupId: "group_kantone"` zugewiesen.
- **Wirkung im Force Graph:** Alle 26 Kantone ziehen sich sternfoermig um den Hauptknoten `Kantone` zu einer dichten, geordneten Gruppe zusammen.

### 2. `B12_Graph_01_28_tuned2.json` -- Normalisierte Kanten & Beziehungs-Hierarchie
- **Aenderungen:** Die kommagetrennten Kanten-Labels wurden bereinigt und kategorisiert (`MEMBERSHIP`, `AUTHORIZATION`, `GOVERNANCE`, `REPRESENTATION`, `GEOGRAPHY`).
- **Wirkung im Force Graph:** Starke Gewichtung fuer Gruppenkanten bewirkt eine noch deutlichere saubere Trennung zwischen Kantonen, Bundesrat, Parlament und Gerichten.

### 3. `B12_Graph_01_28_tuned3.json` -- 3D-Stufen-Raster (Ebenen-Layout)
- **Aenderungen:** Jede Gruppe erhaelt vordefinierte initiale 3D-Koordinaten (`position: {x, y, z}`):
  - **Oberste Ebene (Y = 20):** `Bundesrat` (im Kreis angeordnet)
  - **Mittlere Ebene (Y = 0):** `Schweiz` & Hauptinstitutionen
  - **Untere Ebene (Y = -10):** Alle 26 Kantone auf einem horizontalen Ring (Radius 25)
- **Wirkung im Viewport:** Der Graph hat von der ersten Sekunde an eine klare dreidimensionale Struktur im Raum.

### 4. `B12_Graph_01_28_tuned4.json` -- Hierarchischer Foederalismus-Baum
- **Aenderungen:** Kanten sind speziell fuer hierarchische Layout-Algorithmen (`hierarchical` und `tree` in Nodges) mit `parent_of`-Beziehungen strukturiert.
- **Wirkung:** Eignet sich perfekt fuer die Baum- und Hierarchie-Visualisierung im Mapping-Panel.

### 5. `B12_Graph_01_28_tuned5.json` -- Hybrider Super-Graph mit Farbwelten
- **Aenderungen:** Kombiniert alle Verbesserungen aus Variant 1--4 und bringt vordefinierte visuelle Farb-Presets fuer jede Gruppe mit (Kantone = Smaragdgruen, Bundesrat = Gold, Judikative = Rubinrot, Parteien = Violett).
- **Wirkung:** Bietet die optisch eindrucksvollste und ausgewogenste 3D-Darstellung auf Anhieb.

---

## 3. Dateipfade der 5 Varianten

- **Public Data Ordner (direkt in Nodges ladbar):**
  - [B12_Graph_01_28_tuned1.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_Graph_01_28_tuned1.json)
  - [B12_Graph_01_28_tuned2.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_Graph_01_28_tuned2.json)
  - [B12_Graph_01_28_tuned3.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_Graph_01_28_tuned3.json)
  - [B12_Graph_01_28_tuned4.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_Graph_01_28_tuned4.json)
  - [B12_Graph_01_28_tuned5.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_Graph_01_28_tuned5.json)

- **Dokumentationsordner:**
  - [0_102_15_B12_Graph_01_28_tuned1.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_15_B12_Graph_01_28_tuned1.json)
  - [0_102_15_B12_Graph_01_28_tuned2.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_15_B12_Graph_01_28_tuned2.json)
  - [0_102_15_B12_Graph_01_28_tuned3.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_15_B12_Graph_01_28_tuned3.json)
  - [0_102_15_B12_Graph_01_28_tuned4.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_15_B12_Graph_01_28_tuned4.json)
  - [0_102_15_B12_Graph_01_28_tuned5.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_15_B12_Graph_01_28_tuned5.json)
