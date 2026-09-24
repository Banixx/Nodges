# Implementation Plan - Vollstaendige LightRAG Integration & Frontend-Upload (Version 0.102.12)

Umsetzung der naechsten Entwicklungsstufen des LightRAG-Systems in Nodges: Integration der Frontend-Upload-Komponente im `CreatePanel`, Optimierung der Subgraph-Positionierung in `LightRAGService` und Absicherung der Backend-Schnittstelle.

## User Review Required

> [!IMPORTANT]
> Fuer die vollstaendige lokale Ausfuehrung der echten LightRAG-Engine auf dem Python-Backend (ohne Fallback-Mock) werden lokale Python-Bibliotheken (`lightrag-hku`, `torch`) sowie ein erreichbares LLM (z. B. Ollama lokal oder ein API-Key) vorausgesetzt. Wir implementieren im ersten Schritt die Frontend-Eingabe sowie die optimierte Graph-Transformation.

## Proposed Changes

### UI & Formulare

#### [MODIFY] [CreatePanel.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts)
- Erweiterung der Benutzeroberflaeche im LightRAG-Modus um ein Texteingabefeld bzw. einen Upload-Bereich fuer das Hinzufuegen von Dokumenten zur Wissensbasis.
- Einbindung von `LightRAGService.insertText()` mit visueller Erfolgsmeldung.

---

### Frontend Services

#### [MODIFY] [LightRAGService.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LightRAGService.ts)
- Ersetzen der zufaelligen 3D-Knotenplatzierung (`Math.random()`) durch eine strukturierte Cluster-Positionierung.
- Absicherung der Typkonvertierung von LightRAG-Subgraphen in valide Nodges `GraphData` (Schema 5.2).

## Verification Plan

### Automated Tests
- Ausfuehren der bestehenden und erweiterten Unit-Tests:
  ```bash
  npx vitest run src/tests/LightRAGService.test.ts
  ```

### Manual Verification
- Testen des LightRAG-Generierungs- und Text-Insert-Modus in der Nodges UI (`npm run dev`).
