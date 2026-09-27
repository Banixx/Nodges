# 15 Interoperabilitaet, Export und Multi-Build Formate

Dieses Kapitel dokumentiert die Schnittstellen zur Datenportabilitaet, Rueckwaertskompatibilitaet und wissenschaftlichen Nachnutzung von Graphdaten in Nodges (Stand Version **0.106.8**).

---

## 1. Datenexport und Interoperabilitaet mit wissenschaftlichen Tools (GEXF)

> **Visualisierung:** Siehe [15_ExportImportFormate_001.mmd](15_ExportImportFormate_001.mmd)

Nodges versteht sich nicht als proprietaeres Datensilo. Graphen, die ueber generative KI-Pipelines oder manuelle Modellierung entstehen, koennen fuer weiterfuehrende mathematische Analysen an etablierte Desktop-Tools exportiert werden:

### 1.1 Das GEXF-Format (Graph Exchange XML Format)
- **Gephi-Kompatibilitaet:** *Gephi* gilt als akademischer De-facto-Standard fuer topologische Berechnungen (Modularitaetsklassen, Eigenvector-Centrality, HITS-Algorithmus).
- **Strukturelle Uebersetzung:**  
  Nodges-JSON-Entitaeten werden verlustfrei in `<node>`-Elemente und Beziehungen in `<edge>`-Tags ueberfuehrt. Das generische `properties`-Dictionary wird als typisierte `<attribute>`-Liste abgebildet.
- **Bidirektionaler Workflow:**  
  1. *Generierung in Nodges:* Schnelle Extraktion von Domaenenwissen mittels LLM.
  2. *Export nach GEXF:* Ueberfuehrung in Gephi fuer tiefe statistische Netzwerkanalysen.
  3. *Re-Import in Nodges:* Visualisierung des mathematisch angereicherten Graphen im modernen 3D-Glassmorphism-Design.

---

## 2. Multi-Build Format Kompatibilitaet

> **Visualisierung:** Siehe [15_MultiBuildKompatibilitaet_002.mmd](15_MultiBuildKompatibilitaet_002.mmd)

Die Evolution von Nodges brachte unterschiedliche Schema-Generationen hervor (Schema 3.0 bis 5.2). Das System folgt dem Prinzip: **Keine Gueltigkeit aelterer Datensaetze wird entwertet; Daten werden verlustfrei normalisiert statt zwangskonvertiert.**

### 2.1 Parallele Schema-Erkennung im `DataParser`
Der `DataParser` identifiziert beim Einlesen automatisch die vorliegende Schema-Generation:
- **Heuristische Analyse:** Pruefung von Versionsbezeichnern (`schemaVersion`) sowie der Verteilung von `properties`, `stateVector` und temporalen Keyframes.
- **Zod Union-Validierung:** Die Schemadefinition nutzt `z.union`, um sowohl klassische Strukturen (Attribute direkt im Knotenobjekt) als auch moderne flache Repraesentationen zu parsen.
- **Interne Normalisierung:** Die Three.js-Render-Engine arbeitet ausschliesslich gegen den normalisierten internen Zustand; Unterschiede frueherer Build-Formate werden vor der Mesh-Erzeugung transparent ausgeglichen.

---

## 3. Automatisierte Information-Extraction-Pipelines (Tripel-Extraktion)

> **Visualisierung:** Siehe [15_IEPipelineTripleExtraktion_003.mmd](15_IEPipelineTripleExtraktion_003.mmd)

Fuer den Import unstrukturierter Fachliteratur (z. B. Forschungsberichte oder PDFs) nutzt Nodges automatisierte Tripel-Extraktoren:
- **Subjekt-Praedikat-Objekt Extraktion:** Inferenz-Modelle identifizieren Entitaeten und Praedikate direkt aus Fliesstexten.
- **Deterministische Schema-Erzeugung:** Die extrahierten Relationen werden vollautomatisch in gueltige Nodges-JSON-Knoten und Kanten uebertragen, ohne dass der Anwender manuell JSON-Dateien bearbeiten muss.
