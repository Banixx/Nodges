# Dokumentation: Datenneutralitaet & Kategoriale X-Achsen-Verteilung

## Problemstellung
Bisher wurden beim Generieren von Wissensgraphen in Build 12 (LightRAG) kuenstliche 3D-Kugelkoordinaten (`position: { x, y, z }`) in die Entitaeten injiziert. Dies widerspricht dem Grundsatz der Datenneutralitaet. Zudem verhinderte die Ueberlagerung mit den alten Kugelkoordinaten, dass bei der visuellen Zuordnung von `entity_type` auf die X-Achse eine saubere spaltenweise Trennung im 3D-Raum entstand.

## Loesung & Umsetzung

1. **Datenneutralitaet in LightRAGService**:
   - In [src/utils/LightRAGService.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LightRAGService.ts) wurden die kuenstlichen Kugelkoordinaten entfernt.
   - Entitaeten enthalten nun ausschliesslich echte extrahierte Attribute (z.B. `entity_type`).
   - Ein automatisches `dataModel` sowie ein Standard-Preset fuer `visualMappings` (`color` nach `entity_type`) werden mitgegeben.

2. **Automatische kategoriale X-Achsen-Verteilung**:
   - In [src/core/DataParser.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/DataParser.ts) wird beim Verbinden eines Text-Attributs (wie `entity_type`) mit einer Position (z.B. `Position (Nur X Achse)`) automatisch eine kategoriale Schrittweiten-Verteilung (`params.categories`) ueber den Positionsbereich berechnet (z.B. `-60`, `-30`, `0`, `30`, `60`).

3. **Sauberes Spalten-Layout in NodeManager**:
   - In [src/core/NodeManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts) wird beim spaltenweisen X-Mapping ohne feste Y-Koordinaten jede Entitaet innerhalb ihrer Spalte vertikal zentriert und gleichmaessig verteilt. Dadurch bilden die Entitaetstypen uebersichtliche, parallele Spalten auf der X-Achse.
