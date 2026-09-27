# 11 Historie und Entscheidungen (ADRs)

Dieses Kapitel dokumentiert die historische Entwicklung, die wesentlichen Wendepunkte (Pivots) und die Architektur-Entscheidungen (Architecture Decision Records - ADRs) von Nodges vom fruehen Prototyp bis zur aktuellen Version **0.106.8**. Es erlaeutert das rationale Fundament vergangener Entscheidungen, um zukuenftige Fehlentwicklungen zu vermeiden.

---

## 1. Die Findungsphase: Build 1 bis Build 4

> **Visualisierung:** Siehe [11_BuildEvolutionsTimeline_001.mmd](11_BuildEvolutionsTimeline_001.mmd)

In der Anfangsphase war Nodges als komponentenbasiertes 3D-Dashboard konzipiert:
- **Das Problem:** Datenattribute waren hart an 3D-Geometrien gekoppelt (z. B. `if (type === 'Server') renderCylinder()`).
- **Der Pain Point:** Jeder neue Datensatz (Wirtschaftsnetzwerke, Biologie, Soziologie) erforderte Quelltext-Modifikationen mit neuen Verzweigungen im Renderer. Eine Skalierung auf beliebige Domaenen war unmoeglich.

---

## 2. Der grosse Pivot: Build 5 (Die Drei-Saeulen-Entkopplung)

> **Visualisierung:** Siehe [11_OntologieArchitektKonzept_003.mmd](11_OntologieArchitektKonzept_003.mmd)

Build 5 markiert den wichtigsten konzeptionellen Meilenstein in der Geschichte von Nodges:
- **Entscheidung:** Vollstaendige Entkopplung von Ontologie, Instanzdaten und Visual Mapping.
- **Wirkung:** Das Attribut `type` verlor seine grafische Deutungshoheit. Daten wurden vollstaendig flach organisiert.
- **Geburt des Visual Mappings:** Farben, Skalierungen, Geometrien und Transparenzen wurden als dynamische Mappings definiert, die der Benutzer zur Laufzeit ohne Datenverlust modifizieren kann.

---

## 3. Der Kampf gegen Halluzinationen: Build 6

> **Visualisierung:** Siehe [11_ADRProblemLoesung_002.mmd](11_ADRProblemLoesung_002.mmd)

Waehrend Build 5 visuelle Flexibilitaet schuf, produzierten LLMs haeufig defekte JSON-Payloads oder erfanden Attribute, die nirgends definiert waren.
- **Entscheidung:** Einfuehrung strikter Laufzeit-Validierung ueber Zod.
- **Wirkung:** Der "JSON Schema Mode" zwang Inferenz-Modelle deterministisch in die Zielstruktur; syntaktisch unzulaessige Daten wurden blockiert, bevor sie Three.js erreichten.

---

## 4. Grounding und semantische Tiefe: Build 8 und Build 9

- **Build 8 (Wikidata-Grounding):** Extraktion verifizierter RDF-Tripel ueber Live-SPARQL-Abfragen. Faktische Falschangaben (z. B. historische Lebensdaten oder geografische Distanzen) wurden eliminiert.
- **Build 9 (Vektor-Deduplizierung):** Einfuehrung von Text-Embeddings und Kosinus-Aehnlichkeitskalkulationen, um synonyme Entitaeten ("USA" und "Vereinigte Staaten") automatisch zusammenzufuehren.

---

## 5. Die modulare Pipeline: Build 10

- **Entscheidung:** Abloesung starrer Pipeline-Monolithen durch ein frei konfigurierbares Baukastensystem im `CreatePanel`.
- **Wirkung:** Nutzer koennen Inferenz-Provider (Cloud vs. lokal via Ollama), Grounding-Methoden, Evaluierungsstufen (Human-in-the-Loop) und Kantenbewertungen modular kombinieren.

---

## 6. Build 12: LightRAG Graph Retrieval Backend

- **Kontext:** Fuer die Analyse umfangreicher unstrukturierter Dokumente reichten reine Prompt-Fenster nicht mehr aus.
- **Entscheidung:** Etablierung eines lokalen Python-FastAPI Backends (`lightrag-backend/`) mit Vektorspeicher und semantischer Graph-Indizierung.
- **Modellstandard:** OpenRouter Embedding-Modell `qwen/qwen3-embedding-8b` mit 4096 Dimensionen.

---

## 7. Der Multi-Harness Pivot und SSoT-Standard (Version 0.106.x)

Im September 2026 erreichte das Projekt einen entscheidenden Wendepunkt in der Entwicklungsorganisation:

### 7.1 Das Scheitern des 3-Checkout-Modells (winAnt)
Zuvor existierten drei getrennte Checkouts (Windows-Host `winAnt`, Linux-Container `piCon` und GitHub). Dies fuehrte zu kontinuierlichen Zeilenenden-Konflikten (CRLF vs. LF), Commit-Divergenzen und Synchronisationsverlusten.
- **ADR (2026-09-24):** Der Windows-Host-Workspace `winAnt` wird vollstaendig abgekoppelt und stillgelegt.
- **Die Loesung (conT):** Antigravity auf Windows 11 greift ueber das Netzlaufwerk `W:/` direkt auf das WSL2 ext4-Dateisystem (`/home/unixusername/nodges`) zu.
- **Single Source of Truth (SSoT):** conT und piCon arbeiten auf denselben physischen Inodes. Lokale Zwischenstaende erfordern keinen Git-Sync.

### 7.2 Branch-Konsolidierung auf `main`
- Der fruehere Entwicklungsbranch `pi` wurde vollstaendig in `main` ueberfuehrt und geloescht. `main` ist nun der einzige Arbeitszweig fuer alle Harnesses.

### 7.3 Standardisierter Git-Workflow (`tools/nodges-git.sh`)
- GitHub fungiert als reines Meilenstein-Archiv fuer stabile Minor- und Major-Versionen.
- Lokale Zwischenschritte werden mit `bash tools/nodges-git.sh save` als Patch-Versionen festgehalten.
- Git-Hooks (`pre-push`) blockieren versehentliche Pushes von Patch-Versionen.

### 7.4 Der COM-Bus (Version 0.106.7)
- Einfuehrung dateisystembasierter Waechter (`tools/watch_com.mjs` und `W:/tools/watch_com.ps1`), die Aenderungen im gemeinsamen Ordner `W:/com/` erfassen und als Benachrichtigungen in die Chat-Sessions der Agenten einspielen.

### 7.5 Tooling-Vereinheitlichung via Biome (Version 0.106.4)
- Abloesung langsamer Altlinter durch **Biome 1.9.4** fuer konsistentes Linting und Formatting in Millisekunden sowie Einfuehrung von Playwright fuer automatisierte End-to-End Browsertests.
