# Fachliche Detailanalyse: LightRAG Datenerfassung, Tripel und Nodges-Visualisierung

> Version: 0.106.8  
> Stand: 27. September 2026  
> Ablage: W:/com/doc/0_106_8_lightrag_nodges_tiefenanalyse.md

---

## 1. Erfassungsumfang und Datenmodell in LightRAG

### 1.1 Das Kanten- und Knotenkonzept am Beispiel "Vater - Tochter"
In einem klassischen Triplestore (RDF) existiert lediglich ein atomarer Satz:
`(Hans, istVaterVon, Anna)`.

In LightRAG speichert das System weit mehr als eine blosse Kante:
- **Knoten "Hans":**
  - Name: `"Hans"`
  - Entity-Type: `"PERSON"`
  - Description: LLM-profilierte Zusammenfassung aller Textstellen ueber Hans.
  - Quell-Referenzen: Verknuepfte Chunk-IDs.
- **Knoten "Anna":**
  - Name: `"Anna"`
  - Entity-Type: `"PERSON"`
  - Description: Zusammenfassung ueber Anna.
  - Quell-Referenzen: Chunk-IDs.
- **Kante "Hans -> Anna":**
  - Source: `"Hans"`
  - Target: `"Anna"`
  - Keywords: Hohe semantische Stichwoerter (z.B. `"Familie"`, `"Verwandtschaft"`, `"Erbschaft"`, `"Fuersorge"`).
  - Description: Ein koharenter Textblock des LLMs, der den genauen Kontext der Beziehung beschreibt (z.B. "Hans ist der leibliche Vater von Anna und unterstuetzte sie waehrend ihres Studiums...").
  - Weight / Strength: Ein ganzzahliger oder normierter Score (Haeufigkeit oder Bedeutung im Text).
  - Source Chunks: Chunk-IDs des Originaldokuments.

### 1.2 Programmatischer Unterschied und Grenzen
- **Unterschied:** LightRAG bettet Beziehungen (Edges) selbst als Vektoren ein. Abfragen mit globalen Begriffen finden nicht nur Knoten, sondern aktivieren direkt relationale Kanten ueber High-Level Keywords.
- **Grenzen:**
  - Standard-Deduplikation verschmilzt identisch benannte Entitaeten.
  - Ohne strikte Schemavorgaben waehlt das LLM freie Praedikate statt normierter Ontologien.
  - LightRAG liefert keine raeumlichen 3D-Koordinaten oder Rendering-Instruktionen.

---

## 2. Visualisierungspotenzial in Nodges (Three.js & Schema 5.2)

Nodges kann jeden von LightRAG gelieferten Wert direkt in 3D-Dimensionen uebersetzen:

1. **Knoteneigenschaften:**
   - `entity_type` -> Farbe (`VisualMapping: categorical`) und Geometrie (z.B. Kugel, Wuerfel, Tetraeder).
   - Vernetzungsgrad / Relevanz -> Radius (`size`).
   - Aktivierung bei Query -> Glanzeffekt / Leuchten (`glow`).

2. **Kantenbeziehungen:**
   - `weight` / Haeufigkeit -> Liniendicke (`thickness`) oder Deckkraft (`opacity`).
   - `keywords` -> Kantenfarbe (`color`) oder Partikel-Animationsgeschwindigkeit (`animation_flow`).
   - `description` -> Kontext-Panel / Tooltip bei Klick oder Hover.

---

## 3. Empfohlene Schritte fuer Nodges (Build 14)
1. Sicherstellen, dass das FastAPI-Backend (`lightrag-backend/main.py`) in `/query` alle `properties` unbeschnitten an das Frontend liefert.
2. In `src/utils/LightRAGService.ts` die Datenstruktur dynamisch in das Nodges `dataModel` einpflegen, sodass Lil-GUI und Visual Mappings sofort auf Attribute wie `weight`, `entity_type` und `keywords` zugreifen koennen.
