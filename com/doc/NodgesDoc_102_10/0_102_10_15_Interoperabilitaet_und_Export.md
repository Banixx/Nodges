# 15 Interoperabilität, Export und Multi-Build Formate

Nodges versteht sich nicht als Insel. Daten, die agentisch über LLMs generiert oder manuell strukturiert wurden, müssen portierbar bleiben. Dieses Kapitel beleuchtet die Interoperabilität mit externen Systemen und die Abwärtskompatibilität älterer Nodges-Datenformate.

---

## 1. Die Vision des GEXF-Exports (Graph Exchange XML Format)

> **Visualisierung:** Siehe [15_ExportImportFormate_001.mmd](15_ExportImportFormate_001.mmd)

Eine weitreichende historische Evaluierung (über 5 Konzept-Iterationen) hat das **GEXF-Format** als den idealen Brückenbauer zu klassischen, akademischen Netzwerkanalyse-Tools identifiziert.

### Warum GEXF?
- **Gephi-Kompatibilität:** *Gephi* ist der Goldstandard für komplexe Netzwerkanalyse (z.B. die Berechnung von Eigenvector-Centrality, Betweenness, Modularity). Gephi rendert jedoch in 2D und ist visuell oft überladen.
- Nodges kann als agentischer "Datengenerator und 3D-Präsentator" dienen, während Gephi für die harte akademische Mathematik genutzt wird.

### Die Architektur der GEXF-Übersetzung
- Das Nodges-JSON (mit seinen flachen `entities` und `relationships`) lässt sich verlustfrei in GEXF-Nodes und GEXF-Edges übersetzen.
- **Continuous/Categorical Mappings:** Nodges-Attribute werden in `<attributes>` und `<attvalues>` Tags im GEXF-Format geparst.
- **Bidirektionaler Fluss:** Ein Export von Nodges nach Gephi und ein Re-Import des mathematisch angereicherten Graphen zurück nach Nodges (für die hochästhetische 3D-Glassmorphism-Präsentation) ist das Endziel der Interoperabilitäts-Schnittstelle.

---

## 2. Multi-Build Format Kompatibilität

> **Visualisierung:** Siehe [15_MultiBuildKompatibilitaet_002.mmd](15_MultiBuildKompatibilitaet_002.mmd)

Nodges entwickelt sich rasant weiter. Das JSON-Schema (aktuell Schema 5.0) verändert sich mit jedem Major-Release (Build 1 bis Build 10). Die Philosophie von Nodges ist jedoch: **Kein Format wird konvertiert, kein Format wird gelöscht.**

### Parallele Schema-Verarbeitung
Nodges lädt verschiedene JSON-Schema-Versionen parallel und interpretiert diese korrekt, anstatt veraltete Dateien "kaputt-zu-migrieren":
- **Schema-Erkennung (`DataParser`):** Bevor der Datensatz durch Zod gejagt wird, liest der Parser die `schemaVersion` (oder analysiert die Knotenstruktur heuristisch).
- **Zod Union-Typen:** Das Zod-Schema in `types.ts` ist als `z.union` aufgebaut. Es akzeptiert sowohl Legacy-Builds (wo Attribute hart auf der Ebene von `node.properties` lagen) als auch moderne Builds (wo Daten in `stateVector` gekapselt oder flach gemappt sind).
- **Abstraktionsschicht:** Eine Utility-Klasse (`BuildFormatUtils`) greift dynamisch auf die Daten zu, sodass die Render-Engine (Three.js) nicht wissen muss, ob sie ein Build-2 oder Build-10 JSON zeichnet.

---

## 3. Wissenschaftliche IE-Pipelines (Information Extraction)

> **Visualisierung:** Siehe [15_IEPipelineTripleExtraktion_003.mmd](15_IEPipelineTripleExtraktion_003.mmd)

Ein weiteres Konzept aus den Archiven betrifft den automatisierten Ingest von unstrukturierten Texten.
- Statt Nutzer-Prompts (wie im CreatePanel) sollen wissenschaftliche Paper per PDF-Upload in Nodges geparst werden.
- Eine dezidierte **IE-Pipeline** extrahiert strukturierte Triples (Subjekt-Prädikat-Objekt) und wandelt diese direkt in Nodges-Knoten und Kanten um, ohne dass der Nutzer das JSON-Schema jemals berühren muss.
