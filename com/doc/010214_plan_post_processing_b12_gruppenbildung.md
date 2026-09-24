# Implementierungsplan: Post-Processing fuer Gruppenbildung (B12 Schweizer Politik)

Dieser Plan beschreibt die Erstellung und Ausfuehrung eines Node.js-Post-Processing-Skripts, welches die rohen LightRAG-Entitaeten aus `public/data/b12/B12_02_Antwort_01_27.json` in eine strukturierte Gruppenhierarchie fuer Nodges transformiert.

## 1. Uebersicht & Zielsetzung

LightRAG hat das politische System der Schweiz als flaches Netzwerk aus Entitaeten und Beziehungen extrahiert. Das Post-Processing-Skript wird:
1. Uebergeordnete Entitaeten (z. B. Organisationen, Gewalten, foederale Ebenen) als Gruppen-Cluster identifizieren.
2. Mitgliedsknoten ueber Kanten (wie `part_of`, `member_of`) den entsprechenden Gruppen zuordnen (`group_id` / `parent_id`).
3. Das `dataModel` und die `visualMappings` anpassen, sodass Nodges die Gruppen visuell farblich und raeumlich abgrenzen kann.

## 2. Geplante Aenderungen

### [NEW] [postprocess_b12_groups.cjs](file:///c:/Users/ich/Desktop/code/_projects/Nodges/scripts/postprocess_b12_groups.cjs)
- Skript zur Verarbeitung von `public/data/b12/B12_02_Antwort_01_27.json`.
- Erzeugung der Ausgabedatei `public/data/b12/B12_02_Antwort_01_27_processed.json`.

## 3. Verifikationsplan

- Ausfuehrung via `node scripts/postprocess_b12_groups.cjs`.
- Prüfung des generierten JSONs auf Einhaltung des Nodges-Schemas.
