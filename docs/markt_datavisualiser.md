# Marktanalyse: Software und Webapplikationen zur Visualisierung von Systemen

**Erstellt:** 2026-09-16
**Anlass:** Einordnung des Markts fuer Systemvisualisierung als Grundlage fuer die Positionierung von Nodges.
**Fokus:** Nicht nur Subjekt-Relation-Objekt (Triple/RDF), sondern das gesamte Spektrum visueller Systemdenk-Logiken.

---

## 1. Fragestellung und Einordnung

Die Ausgangsfrage lautet: Welche Software und Webapplikationen gibt es zur Visualisierung von Systemen? Dabei wird ausdruecklich der Tellerrand des klassischen Graphen (Subjekt - Relation - Objekt) verlassen. Ein "System" ist mehr als eine Menge von Knoten und Kanten: Es hat Grenzen, Ebenen, Fluesse, Rueckkopplungen, Zustaende ueber die Zeit, Bestaende und Dynamik.

Die Recherche zeigt: Der Markt ist nicht ein Markt, sondern ein **Bündel getrennter Maerkte**, die je nach Denklogik (Paradigma) kaum miteinander verbunden sind. Genau darin liegt die relevante Beobachtung.

### 1.1 Was unter "Systemvisualisierung" verstanden wird

| Dimension | Frage an das System | Typische Visualisierung |
|-----------|--------------------|------------------------|
| Struktur | Wer haengt mit wem zusammen? | Node-Link-Graph, Adjazenzmatrix |
| Fluss | Was bewegt sich wohin, wie viel? | Sankey, Flussdiagramm |
| Dynamik | Was verstaerkt oder daempft was? | Causal Loop Diagram, System Dynamics |
| Ebene | Wie zerlegt sich das Ganze? | C4-Modell, Hierarchie, Treemap |
| Zustand | Wie veraendert sich das ueber Zeit? | Zeitachse, Animation, Verlauf |
| Raum | Wo im Raum befindet sich etwas? | 3D-Szene, Digitaler Zwilling, Geodaten |
| Bedeutung | Was bedeutet das, und warum? | Konzeptkarte, annotierte Map, Narrative |

Wichtige Erkenntnis: **Kein untersuchtes Werkzeug deckt mehr als drei dieser Dimensionen gleichzeitig ab.** Die meisten decken eine oder zwei ab.

---

## 2. Das Subjekt-Relation-Objekt-Paradigma und seine Grenzen

Das klassische Triple (Subjekt - Praedikat - Objekt, bzw. Entity - Relation - Entity) ist die Grundlage von RDF, Wissensgraphen und Property-Graphen (Neo4j). Es ist maechteg, aber es hat bekannte, gut belegte Grenzen:

- **Skalierungsproblem der Lesbarkeit:** Node-Link-Diagramme werden ab einigen tausend Kanten unlesbar ("Hairball"). Forschung vergleicht sie systematisch mit Adjazenzmatrizen; bei gewichteten Graphen und Vergleichsaufgaben schneiden Matrizen teils besser ab.
- **Kein Fluss:** Ein Triple sagt "A verursacht B", aber nicht "wie viel" und nicht "wo bleiben Bestaende".
- **Keine Rueckkopplung:** Kausale Schleifen (A verstaerkt B, B daempft A) lassen sich in Triple kaum darstellen, obwohl sie fuer Systeme zentral sind.
- **Keine Zeit:** Klassische Graphen sind statisch. Zeitliche Verlaeufe brauchen Zusatzmodelle (Temporalitat, Historie).
- **Keine Bedeutungsebene:** Ein Graph zeigt Verbindungen, aber nicht die Narrative oder Belege dahinter.

Quellen: Vergleich Node-Link vs. Adjazenzmatrix (u.a. City Research Online, WPI-Studie von Nobre et al. zur Evaluation multivariater Netzwerkvisualisierung).

---

## 3. Paradigmen jenseits von Subjekt-Relation-Objekt

### 3.1 Adjazenzmatrix statt Hairball
Statt Knoten und Kanten wird eine Matrix der Verbindungen dargestellt. Vorteil: Bei dichten Graphen weit lesbarer; Muster (Cluster, Bloecke) werden sichtbar. Nachteil: Pfade und Topologie sind schwerer zu verfolgen.
**Vertreter:** Gephi, Cytoscape, diverse Forschungs-Tools.

### 3.2 Sankey und Flussdiagramme: Systeme als Fluesse
Systeme werden als Fluesse von Energie, Material, Kosten oder Informationen modelliert. Die Breite der Baender kodiert die Menge. Sankeys sind Standard in der Materialflussanalyse und Energieberichterstattung.
**Vertreter:** e!Sankey (iPoint), diverse Web-Bibliotheken (D3-Sankey), Fluss-Add-ons in BI-Tools.

### 3.3 Causal Loop Diagrams und System Dynamics: Rueckkopplung
Der vielleicht groesste "Tellerrand"-Sprung. Systeme werden nicht als Netz von Dingen, sondern als Netz von **Wirkungen mit Vorzeichen** modelliert (verstaerkend / daempfend). Zentrale Konzepte: Bestaende (Stocks), Fluesse (Flows), Feedback-Loops, Zeitverzoegerungen. Causal Loop Diagrams (CLD) sind der qualitative Einstieg, Stock-Flow-Modelle die simulationfaehige Stufe.
**Vertreter:** Vensim, Stella/iThink, Powersim Studio, AnyLogic (Simulation), Kumu (Mapping + CLD), Loopy (schnelles Skizzieren), Plectica.

### 3.4 Ebenen und Zerlegung: Das C4-Modell
Simon Browns C4-Modell beschreibt Softwarearchitektur in vier Zoomstufen: System Context, Container, Component, Code. Es loest das Problem, dass ein Graph alle Abstraktionsebenen gleichzeitig zeigen will. Der Markt hat dafuer eigene Werkzeuge entwickelt.
**Vertreter:** Structurizr (Referenzimplementierung, "Diagrams as Code" per DSL, von Simon Brown), IcePanel (visuell, Enterprise, Echtzeit-Kollaboration), Visual C4 (visuell plus native Architecture Decision Records), PlantUML, Mermaid, draw.io, Archi, Gaphor, Enterprise Architect.

### 3.5 Systems Mapping und Konzeptkarten
Verbindet Netzwerk mit Narrativen: Jedes Element und jede Verbindung kann mit Text, Bildern, Videos und Attributen hinterlegt werden. Fokus auf "den Kontext schaffen, in dem andere denken koennen". Stark im Non-Profit-, UN- und Transformationsbereich verbreitet.
**Vertreter:** Kumu (fuehrend, mit eigener "System Mapping"-Disziplin), Plectica, Miro, Conceptboard.

### 3.6 Zeit und Temporalitaet
Zeitliche Verlaeufe sind eine eigene Dimension. Ansatzpunkte: Zeitachsen-Player, Animationsspuren, Verlaufsspeicherung je Element. Erste KI-Gedaechtnissysteme (Graphiti, Zep) modellieren explizit **temporale** Graphen - Fakten mit Gueltigkeitszeitraeumen.

### 3.7 Raum und 3D
Die dritte Dimension verteilt Knoten im Raum und reduziert damit visuelles Rauschen, das 2D-Netzwerke ab einer gewissen Groesse unlesbar macht. Brueckenknoten und Cluster werden sichtbar, die flache Layouts verbergen.
**Vertreter (Web/Three.js):** 3d-force-graph und three-forcegraph (vasturiano, Web Components/WebGL), Graph-Visualization (davidpiegza).
**Vertreter (Digital Twin):** NVIDIA Omniverse (DSX Blueprint, OpenUSD), Bentley iTwin, Prevu3D (Scan/BIM/Facility).

### 3.8 Hybride Repraesentationen
Die Forschung empfiehlt zunehmend hybride Formen: Kombination mehrerer Techniken in einer Visualisierung, um Staerken zu verbinden und Schwaechen abzumildern (z.B. DynTrix fuer dynamische Graphen, Computer Graphics Forum 2024).

---

## 4. Marktsegmente und Akteure

### 4.1 Graph-Datenbanken (Datenschicht, teils mit Viewer)
| Produkt | Profil |
|---------|--------|
| Neo4j | Property-Graph, Cypher, Bloom-Viewer, breites Oekosystem |
| Amazon Neptune | Managed AWS, Property-Graph und RDF, openCypher/Gremlin/SPARQL |
| Ontotext GraphDB | RDF, semantische Repositorien, SPARQL, Ontologien |
| Stardog | Enterprise-KG, Datenintegration, Ontologie-Modellierung |
| TigerGraph | Skalierte Analytik |
| ArangoDB | Multi-Modell, Graph plus Dokumente |
| FalkorDB | Graph plus GraphRAG |

### 4.2 Visuelle Investigation (Mensch prüft den Graphen)
| Produkt | Profil |
|---------|--------|
| Linkurious | Gefuehrte Investigation, Case-Workflows, Governance |
| Kineviz | Flexible visuelle Exploration, viele Import-/Exportformate |
| Cytoscape | Open-Source-Netzwerkanalyse (stark in Bioinformatik) |
| DataWalk | Investigative Analyse, Behoerden/Justiz/AML-Kontext |
| Gephi / yEd / Pajek | Desktop-Analyse und Layout |

### 4.3 Research Maps (Korpus statt Datenbank)
Atlas, ResearchRabbit, Connected Papers. Zeigen Zitations- und Aehnlichkeitsnetze. Bewusst kein Ersatz fuer Produktions-Graphendatenbanken.

### 4.4 KI-Gedaechtnis und GraphRAG (juengstes, am schnellsten wachsendes Segment)
| Produkt | Profil |
|---------|--------|
| Graphiti | Open-Source, temporaler KI-Gedaechtnis-Graph |
| Zep | Managed temporaler Kontext |
| FalkorDB | Graph-Speicher plus GraphRAG mit zitierbarer Ausgabe |
| LightRAG | (im Nodges-Projekt eingesetzt) RAG mit Graphenstruktur |

### 4.5 Softwarearchitektur / C4
Visual C4, Structurizr, IcePanel, PlantUML, Mermaid, draw.io, Multiplayer (verbindet Diagramme mit Metadaten, Dependencies, APIs, Repos).

### 4.6 Systems Mapping / Causal Loop
Kumu (fuehrend), Vensim, Stella/iThink, Powersim, AnyLogic, Loopy, Plectica.

### 4.7 Sankey / Fluss
e!Sankey, D3-Sankey, Flussvisualisierung in BI-Werkzeugen.

### 4.8 3D im Web
3d-force-graph, three-forcegraph, Graph-Visualization (WebGL/Three.js).

### 4.9 Digitale Zwillinge
NVIDIA Omniverse, Bentley iTwin, Prevu3D, theCTOC-Liste der Digital-Twin-Software.

---

## 5. Marktzahlen und Trends

**Marktgroesse Datenvisualisierung (Angaben schwanken je Anbieter deutlich):**
- ca. 10,9 Mrd. USD (2025) auf ca. 18,4 Mrd. USD (2030), CAGR rund 11 Prozent (Mordor Intelligence)
- ca. 13,7 Mrd. USD (2026) auf ca. 34,1 Mrd. USD (2034), CAGR rund 12 Prozent (Fortune Business Insights / Verified Market Reports)
- Andere Anbieter nennen kleinere Basen (8,5 Mrd. USD, CAGR rund 9 Prozent)

Die Spannweite zeigt: "Datenvisualisierung" ist kein scharf abgegrenzter Markt. Systemvisualisierung im engeren Sinn ist ein Teilsegment davon.

**Relevante Trends:**
1. **GraphRAG:** Wissensgraphen werden zur Grundlage fuer LLM-Reasoning. Microsoft Research GraphRAG baut hierarchische Graphen aus unstrukturiertem Text. Multimodale Erweiterungen (MMGraphRAG) integrieren Bilder.
2. **KI-Gedaechtnis als eigene Kategorie:** Temporale Graphen fuer Agenten (Graphiti, Zep) sind neu und wachsen schnell.
3. **Verifikation und Belegpflicht:** Der Markt verlangt zunehmend die Rueckverfolgbarkeit einer Aussage zu ihrer Quelle ("Source trail", zitierbare Ausgaben).
4. **Hybride Visualisierung:** Forschung und Praxis kombinieren Techniken, statt sich auf ein Paradigma festzulegen.
5. **3D zur Rauschreduktion:** Dritte Dimension wird gezielt gegen die Unlesbarkeit grosser 2D-Netzwerke eingesetzt.
6. **Digital Twins ziehen in die IT:** Von der Fabrik hin zu Rechenzentrum und Infrastruktur (NVIDIA Omniverse DSX/OpenUSD).

---

## 6. Beobachtung: Die Luecke im Markt (White Space)

Die Recherche zeigt eine auffaellige Fragmentierung. Die Werkzeuge sind nach Denklogik getrennt:

- Wer **Graphen** will, bekommt Datenbanken (Neo4j) oder Investigationstools (Linkurious) - aber keine Integration von Fluss, Zeit und Ebene.
- Wer **Architektur** will, bekommt C4-Werkzeuge (Structurizr, IcePanel) - aber keine 3D-Erkundung und keine RAG-Anbindung.
- Wer **Dynamik** will, bekommt System-Dynamics-Software (Vensim, Stella) - aber keine allgemeine Graphenbasis.
- Wer **Narrativ und Bedeutung** will, bekommt Kumu - aber keine Code- oder Infrastruktur-Anbindung.
- Wer **3D** will, bekommt Rendering-Bibliotheken (3d-force-graph) - aber keine inhaltliche Modellierung.
- Wer **KI-Anbindung** will, bekommt GraphRAG-Backends (Graphiti, Zep, LightRAG) - aber kaum eine visuelle Oberflaeche.

**Die Luecke:** Es fehlt weitgehend ein Werkzeug, das Struktur, Ebene, Zeit, Fluss und Bedeutung in *einer* erkundbaren - idealerweise raeumlichen - Oberflaeche verbindet und gleichzeitig an eine Wissens-/RAG-Schicht angebunden ist.

---

## 7. Einordnung fuer Nodges

Nodges ist laut Projektvision (Plan 104) bewusst nicht nur ein Wissensgraph-Viewer, sondern soll gleichzeitig sein:
3D-Codekarte, Architektur-Dokumentation, Abhaengigkeitsanalyse, Debugging-Werkzeug, Wissensbasis und Praesentationsoberflaeche. Technisch: TypeScript/Vite, Three.js, einheitliches `GraphData`-Modell, LayoutManager, VisualMappingEngine, LightRAG/FastAPI-Anbindung.

### 7.1 Codebasierte Ist-Aufnahme: Deckungsgrad je Dimension

Verifiziert an der Codebasis am 2026-09-16 (`src/types.ts`, `NodeManager`, `VisualMappingEngine`, `EdgeObjectsManager`, `TimePlayerUI`, `LightRAGService`). Bewertet werden die sieben Dimensionen aus Abschnitt 1.1.

| Dimension | Deckungsgrad | Konkreter Code-Beleg |
|-----------|--------------|----------------------|
| **Struktur** | **voll** | `GraphData` mit `data.entities` / `data.relationships`; `PathFinder`, `NetworkAnalyzer` |
| **Raum** | **voll** | `position {x,y,z}`, Property-Typ `spatial`, Three.js-Rendering, Mapping-Funktionen `geographic` und `sphereComplexity`, `mapX`/`mapY` |
| **Zustand (Zeit)** | **weitgehend** | `TemporalDataSchema` mit `validFrom`/`validTo`/`history` (Zeitstempel plus Aenderungen), `TimePlayerUI`, zeitliche Interpolation in `NodeManager` (`getInterpolatedTemporalValues`), Property-Typ `temporal` |
| **Fluss** | **teilweise** (Richtung ja, Menge nein) | `animation_flow`, `animation_sequential`, `animation_pulse`, `animation_segments` an Relationships; `EdgeObjectsManager` setzt `animConfig.flow`. Es fehlt eine Mengen-Kodierung (keine Sankey-Breite) |
| **Ebene** | **teilweise** (Gruppen statt Zoom-Modell) | `addNodeToGroup` in `interfaces.ts`, Gruppierung nach Typ (`entitiesByType`), `fallback_group` in `NodeManager`. Es fehlt ein C4-artiges Ebenen-/Abstraktionsmodell |
| **Bedeutung** | **teilweise** (RAG ja, Belege unstrukturiert) | `LightRAGService`, `LLMService`, `GraphGenerationService`, `metadata.description`/`author`. Belege pro Kante sind nur ueber freie `properties` (passthrough) moeglich, nicht strukturiert |
| **Dynamik** | **schwach** | Nur physikalische Kraefte-Simulation (`attraction`/`repulsion`/`inertia`) und `FieldData` mit `center`/`strength`/`influenceRadius`/`behavior`. **Keine kausale Rueckkopplung mit Vorzeichen.** Treffer fuer „feedback“ im Code bedeuten Auswahl-Feedback, nicht System-Rueckkopplung |

**Zwischenfazit:** Nodges deckt alle sieben Dimensionen an, aber nur drei davon vollstaendig (Struktur, Raum, Zeit). Vier sind ansatzweise oder schwach vorhanden (Fluss, Ebene, Bedeutung, Dynamik). Das deckt sich mit der Beobachtung aus Abschnitt 6: Auch Nodges ist bisher eher ein strukturell-raeumlicher Generalist als ein vollstaendiger Systemvisualisierer.

### 7.2 Bewertung gegen den Markt

| Marktdimension | Nodges-Ansatz | Konkurrenz |
|----------------|---------------|-----------|
| Struktur | GraphData mit Entities/Relationships | gedeckt von Neo4j, Gephi, Cytoscape |
| Ebene | Gruppen, Projektbereiche, Cluster | C4-Werkzeuge (Structurizr, IcePanel) |
| Zeit | temporale Attribute (`temporal`, `history`) in den Schemas | selten; KI-Gedaechtnis-Tools (Graphiti, Zep) |
| Bedeutung/RAG | LightRAG-Anbindung, Quellenkontext | GraphRAG-Backends, aber kaum visuell |
| Raum/3D | Three.js, 3D-Netzwerk | 3d-force-graph (nur Rendering) |
| Multidimensional | Ein Datenmodell fuer alle Zwecke | weitgehend ungedeckt |

**Moegliche Differenzierung:** Nodges besetzt genau die Luecke aus Abschnitt 6, wenn es die Verbindung von 3D-Raum, einheitlichem Datenmodell und RAG-Wissensschicht konsequent weiterverfolgt. Der Markt hat viele Spezialisten, aber kaum Generalisten mit raeumlicher Tiefe.

**Staerkste vorhandene Hebel (aus 7.1):**
1. **Zeit** ist im Datenmodell bereits tiefer verankert als bei den meisten Konkurrenten (`validFrom`/`validTo` plus `history[]` mit Interpolation). Das ist der aussichtsreichste Kandidat fuer ein Alleinstellungsmerkmal.
2. **`FieldData` und die Kraefte-Parameter** (center, strength, influenceRadius, behavior) sind ein natuerlicher Anknuepfungspunkt, um echte Rueckkopplung nachzuruesten, ohne das `GraphData`-Modell umzubauen.
3. **Fluss** ist ueber `animation_flow` bereits vorbereitet und koennte durch eine Mengen-Kodierung (Kantenbreite) zum Sankey-aehnlichen Paradigma erweitert werden.

**Risiken:**
- Der Markt ist von etablierten Enterprise-Anbietern (Neo4j, Stardog, Palantir) besetzt; der Einstieg als Generalist ist anspruchsvoll.
- "Alles in einem Werkzeug" ist strategisch reizvoll, aber schwer fokussiert zu vermarkten.
- Die grossen BI- und Diagramming-Anbieter (Microsoft, Salesforce, SAP, Miro, Lucidchart) koennen einzelne Paradigmen schnell nachziehen.

---

## 8. Quellen der Recherche

Recherchiert mit der Brave-Search-Skill (Websuche) und Volltextextraktion (Readability). Stand der Abrufe: 2026-09-16.

| Thema | Quelle |
|-------|--------|
| KG-Tools nach Einsatzzweck | https://www.atlasworkspace.ai/blog/knowledge-graph-tools |
| Enterprise-KG-Plattformen 2026 | https://www.digetiers.com/en/insights/library/best-enterprise-knowledge-graph-platforms-2026 |
| KG-Plattformen im Vergleich | https://futureagi.com/blog/enterprise-knowledge-graph-platforms-2026/ |
| Enterprise-KG (Startupstash) | https://startupstash.com/top-enterprise-knowledge-graph-platforms/ |
| C4-Tools Vergleich 2026 | https://visual-c4.com/blog/c4-model-tools-comparison-2026 |
| C4-Modell Uebersicht | https://c4model.info/ |
| Structurizr | https://structurizr.com/ |
| IcePanel | https://icepanel.io/c4-model |
| Kumu Systems Mapping | https://kumu.io/ und https://docs.kumu.io/disciplines/system-mapping |
| Causal Loop / System Dynamics | https://www.vensim.com/documentation/usr04.html, https://sixsigmadsi.com/glossary/causal-loop-diagram/ |
| Sankey | https://en.wikipedia.org/wiki/Sankey_diagram, https://www.ipoint-systems.com/software/e-sankey/ |
| 3D-Force-Graph (Three.js) | https://github.com/vasturiano/3d-force-graph |
| GraphRAG (Microsoft Research) | https://www.microsoft.com/en-us/research/project/graphrag/ |
| GraphRAG Manifesto (Neo4j) | https://neo4j.com/blog/genai/graphrag-manifesto/ |
| KGC 2026 Notizen | https://medium.com/@giuseppefutia/notes-from-kgc-2026-c9b4ac8569e5 |
| Digital Twin Software 2026 | https://thectoclub.com/tools/best-digital-twin-software/ |
| NVIDIA Digital Twin / Omniverse | https://www.nvidia.com/en-us/glossary/digital-twin/ |
| Marktgroesse Datenvisualisierung | https://www.mordorintelligence.com/industry-reports/data-visualization-market, https://www.fortunebusinessinsights.com/data-visualization-market-103259 |
| Node-Link vs. Matrizen | https://openaccess.city.ac.uk/id/eprint/19215/1/, https://web.cs.wpi.edu/~ltharrison/docs/nobre2020evaluating.pdf |
| Hybride Graph-Repraesentation (DynTrix) | https://onlinelibrary.wiley.com/doi/10.1111/cgf.15076 |
| Multiplayer (Architektur plus Metadaten) | https://www.multiplayer.app/ |

---

## 9. Weiterfuehrende Fragen

1. Soll Nodges den Generalisten-Ansatz (alle Dimensionen) weiterverfolgen oder eine Dimension als Einstieg schaerfen?
2. Welche Zielgruppe ist realistisch erreichbar: Entwicklerteams (Codekarte), Wissensarbeiter (RAG-Exploration) oder Analyse/Investigation?
3. Besteht Bereitschaft, die temporale Dimension (Zeit/Historie) zum Alleinstellungsmerkmal auszubauen? Sie ist im Markt am schwaechsten besetzt.
4. Wie positioniert sich Nodges gegen die schnell nachziehenden Diagramming- und KI-Plattformen?
