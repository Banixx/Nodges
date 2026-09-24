# Analyse der Build-Prozesse, Versionen und Gruppen-Positionierung in Nodges

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Uebersicht der Build-Prozesse und Versionen

Nodges hat sich ueber mehrere Versionen hinweg von einfachen Prompt-Generatoren zu einer vielschichtigen Graph-Erstellungsarchitektur entwickelt. Aktuell koennen Graphen ueber verschiedene Build-Pipelines generiert werden:

### 1.1 Die Build-Pipelines im Detail

1. **Build 5 (3-Pass Pipeline):**
   - **Funktionsweise:** Teilt den Generierungsprozess in drei aufeinanderfolgende LLM-Schritte auf: 1) Ontologie-Definition, 2) Entitaets- und Relationsextraktion, 3) Visuelles Mapping.
   - **Vorteil:** Hohe strukturierte Kontrolle ueber Schemata und Attribute.
   - **Nachteil:** Hoehere Latenz und Token-Kosten durch 3 Aufrufe.

2. **Build 6 (Single-Pass Pipeline):**
   - **Funktionsweise:** Generiert den gesamten Wissensgraphen (Knoten, Kanten und visuelle Eigenschafts-Zuordnungen) in einem einzigen LLM-Aufruf.
   - **Vorteil:** Sehr schnell und kostenguenstig.
   - **Nachteil:** Schwankende Beziehungsdichte bei komplexeren Texten.

3. **Build 8 & Build 10 (Wikidata / SPARQL Pipelines):**
   - **Funktionsweise:** Nutzen strukturierte Datenquellen (Wikidata SPARQL) fuer faktenbasierte Wissensgraphen.
   - **Vorteil:** Maximale Faktentreue ohne Halluzinationen.
   - **Nachteil:** Beschraenkt auf bereits in Wikidata existierende Entitaeten.

4. **Build 12 (LightRAG Pipeline):**
   - **Funktionsweise:** Nutzt ein lokales oder gehostetes LightRAG Backend (GraphRAG), um unstrukturierte Freitexte semantisch zu erfassen, Entitaeten und Beziehungen zu extrahieren und in Wissensgraphen zu ueberfuehren.
   - **Vorteil:** Hervorragende semantische Texterfassung und Kontextabdeckung.
   - **Herausforderung:** LightRAG gibt standardmaessig eine flache Liste von Entitaeten und Beziehungen aus. Explizite Container-Gruppen (`groupId`) fehlen oft oder muessen nachtraeglich strukturiert werden.

---

## 2. Herausforderung: Beziehungsdichte und Gruppenbildung

Dass bei der Texterfassung mit LightRAG noch Gruppen und Beziehungen fuer die gewuenschte Ordnung fehlen, liegt an zwei Faktoren:

1. **Informationsextraktion:** LightRAG konzentriert sich primaer auf direkte semantische Beziehungen zwischen Begriffen. Hoehere Ordnungsstrukturen (wie Themencluster, Kategorien oder Hierarchien) entstehen erst durch explizite Beziehungstypen (z.B. `part_of`, `belongs_to`, `category`) oder automatische Cluster-Algorithmen.
2. **Schema-Transformation:** LightRAG erzwingt ein flaches `entities`/`relationships`-Format. Damit Nodges Gruppen anzeigen kann, muessen Gruppen entweder als eigene Knoten-Typen existieren oder ueber Attribute (z.B. `entity_type`, `community`, `group`) definiert sein.

---

## 3. Loesungsansaetze fuer die Positionierung im Raum

Um Knoten nicht nur entlang einer einzelnen Achse (`entity_type`) anzuordnen, sondern klare raeumliche Gruppen im 3D-Raum zu bilden, stehen in Nodges verschiedene Verfahren zur Verfuegung:

### 3.1 Mehrdimensionales Achsen-Mapping (Categorical Grid Layout)
Anstatt nur eine Achse zu belegen, werden alle drei Raumachsen (X, Y, Z) mit unterschiedlichen Attributen belegt:
- **X-Achse:** `entity_type` (z.B. Person, Organisation, Konzept, Ereignis)
- **Y-Achse:** `group` / `domain` / `community` (z.B. Politik, Wirtschaft, Recht)
- **Z-Achse:** `importance` / `temporal_year` (z.B. Hierarchieebene oder Zeitverlauf)

*Ergebnis:* Knoten ordnen sich automatisch in einem klaren 3D-Raster (Matrix) an. Gruppen bilden sichtbare Cluster im Raum, ohne dass Kantenberechnungen noetig sind.

### 3.2 Force-Directed Layouts (Force Graph in Nodges)
Nodges verfuegt ueber ein in WebWorkern isoliertes Physics-Engine-System (`layout-worker.ts`), darunter:
- `force-directed` (Standard-Physikmodell)
- `fruchterman-reingold` (Kanten-Feder-Modell mit Raumverteilung)
- `spring-embedder`

**Funktionsweise:**
- **Abstossung (Repulsion):** Alle Knoten stossen sich gegenseitig ab wie gleichpolige Magnete.
- **Anziehung (Attraction):** Kanten wirken wie elastische Federn und ziehen verbundene Knoten zusammen.

**Voraussetzung fuer Gruppenbildung:**
Damit der Force Graph saubere Cluster bildet, werden Kanten benoetigt. Wenn bei LightRAG Beziehungen fehlen, kann ein einfaches Post-Processing-Skript (oder ein Community-Detection-Schritt wie Louvain) synthetische Gruppen-Kanten oder Attraktor-Kraefte zu einem Gruppen-Zentrum hinzufuegen.

### 3.3 Hybrides Layout (Kombination aus Achsen und Force)
Ein besonders effektiver Ansatz fuer Nodges:
1. **Fixierung einer Hauptachse:** Z.B. Y-Achse starr nach `entity_type` oder `group` ausrichten.
2. **Force-Directed in den verbleibenden Ebenen:** Innerhalb der jeweiligen Y-Ebene ziehen sich verbundene Knoten ueber das Force-Layout in X/Z-Richtung zusammen.

---

## 4. Empfohlenes weiteres Vorgehen ("Wie weiter?")

1. **LightRAG Post-Processing (Datenanreicherung):**
   - Beim Erfassen von Texten in LightRAG zusaetzlich Community-Detection durchfuehren oder das Attribut `group` bzw. `subgroup` aus den Entitaetstexten derive-en.
   - Beziehungsdichte erhoehen, indem auch implizite Gruppenbeziehungen als Kanten erfasst werden.

2. **Experimentieren mit den Nodges-Layouts:**
   - Im UI-Mapping-Panel von Nodges das Layout auf `force-directed` oder `fruchterman-reingold` umstellen, um zu beobachten, wie sich die vorhandenen Kanten auf die Raumaufteilung auswirken.
   - Den 3D-Raster-Modus testen, indem X-, Y- und Z-Achsen unterschiedlichen Kategorien zugewiesen werden.

3. **Entwicklung von Cluster-Attraktoren (Optional):**
   - Erweitern von `LayoutManager.ts` um implizite Gruppen-Attraktoren: Knoten derselben Gruppe werden stetig zu einem gemeinsamen Gruppenzentrum im Raum gezogen.
