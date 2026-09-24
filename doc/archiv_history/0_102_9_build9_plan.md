# Plan fuer Build 9: Vektorstore-Integration & Entity Resolution

Dieses Dokument beschreibt den Implementierungsplan fuer Build 9 zur Integration von Vektorbettungen (Embeddings) und semantischer Deduplizierung (Entity Resolution) in Nodges.

## Phase 1: Embedding-Generierung in LLMService

### Ziel
Erweiterung des `LLMService.ts` zur Unterstuetzung von Vektorgenerierungen ueber OpenRouter mit dem Modell `google/gemini-embedding-2`.

### Aufgaben
1.  **Methode `generateEmbedding` implementieren**:
    *   Schnittstelle zur Abfrage des OpenRouter Embeddings-Endpoints (`https://openrouter.ai/api/v1/embeddings`).
    *   Verwendung des API-Keys des aktiven Providers.
2.  **Fehlerbehandlung und Rate-Limiting**:
    *   Fehlertoleranz bei Timeout- oder Rate-Limit-Fehlern (z.B. Batch-Verarbeitung von Chunks).

---

## Phase 2: In-Memory Vektorstore & Aehnlichkeitsberechnung

### Ziel
Da Nodges eine reine Client-App (Single Page Application) ist, implementieren wir einen leichtgewichtigen In-Memory Vektorstore im Browser, um keine externe Datenbank-Infrastruktur vorauszusetzen.

### Aufgaben
1.  **Vektor-Datenstruktur**:
    *   Speicherung der generierten Embeddings gekoppelt an die Entitaets-ID im NodeManager oder einem neuen `VectorStoreManager.ts`.
2.  **Kosinus-Aehnlichkeit (Cosine Similarity)**:
    *   Implementierung der mathematischen Berechnung fuer die Aehnlichkeit zweier Vektoren $A$ und $B$:
        $$\text{Similarity} = \frac{A \cdot B}{\|A\| \|B\|}$$
3.  **Entity Resolution (Deduplizierung) Algorithmus**:
    *   Vergleich aller Entitaeten untereinander.
    *   Erstellung von Clustern fuer Entitaeten mit einer Kosinus-Aehnlichkeit ueber einem Schwellenwert (z.B. $> 0.85$).
    *   Zusammenfuehren der duplizierten Knoten zu einer einzigen Entitaet.
    *   Umleiten aller betroffenen Kanten (Relationships) auf die verbleibende Haupt-Entitaet.

---

## Phase 3: Semantische Suche und UI-Integration

### Ziel
Nutzung der Embeddings fuer interaktive Features in der Nodges-Benutzeroberflaeche.

### Aufgaben
1.  **Erweiterung des Mappings & CreatePanels**:
    *   Checkbox fuer "Semantische Deduplizierung aktivieren" bei der Generierung von Graphen.
    *   Visuelle Fortschrittsanzeige fuer die Embedding-Generierung.
2.  **Semantische Suche in der 3D-Szene**:
    *   Ein Suchfeld im UI, das den Suchbegriff vektorisiert.
    *   Berechnung der Aehnlichkeit des Suchbegriffs zu allen vorhandenen Knoten.
    *   Visuelle Hervorhebung (z.B. Pulsieren, Farbaenderung oder Groessenskalierung) der semantisch relevantesten Knoten, selbst wenn der exakte Name nicht uebereinstimmt.

---

## Phase 4: Validierung und Tests

### Ziel
Sicherstellung der mathematischen Korrektheit und der API-Stabilitaet.

### Aufgaben
1.  **Unit Tests**:
    *   Testen der Kosinus-Aehnlichkeit mit bekannten Vektoren.
    *   Testen des Deduplizierungs-Algorithmus (Verschmelzen von Knoten und Umleiten von Kanten).
2.  **Integrationstests**:
    *   Mocking des OpenRouter Embedding-Endpoints in Vitest.

---

## Phase 5: Rueckwaertskompatibilitaet (Abwaertskompatibilitaet)

### Ziel
Sicherstellung, dass bestehende Pipelines nicht beeintraechtigt werden.

### Vorgaben
*   **Keine Aenderung an Build 5 bis 8**: Alle bestehenden Generierungs-Pipelines (einschliesslich Wikidata SPARQL in Build 8) laufen autark und unveraendert weiter.
*   **Optionale Features**: Die Vektorstore-Integration und Deduplizierung wird als optionaler Zusatzschritt entworfen, der nur bei Aktivierung oder explizitem Aufruf von Build 9 ausgefuehrt wird.
