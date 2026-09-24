# Build Roadmap & Schema-Analyse

## 1. Informationsverlust im aktuellen Build 4 Prompt
Ein Abgleich zwischen der abstrakten Dokumentation (`nodges_build_4.md`, `doc/nodges_build_4_schema.md`, `doc/bericht_build_4_inkl_zeit.md`) und dem an das LLM gesendeten Prompt (`public/prompts/build_4_prompt.md`) zeigt deutliche Lücken und Widersprüche auf. Wenn das LLM nur mit `build_4_prompt.md` arbeitet, gehen folgende kritische Informationen verloren:

### A. Geospatial / Karten-Integration fehlt komplett
- **Problem:** Weder das `metadata.map`-Objekt (`image`, `referenceWidth`, `referenceHeight`) noch die Node-Koordinaten `mapX` und `mapY` werden im Prompt erwähnt.
- **Folge:** Das LLM kann keine Netzwerke generieren, die auf einer geografischen Karte basieren.

### B. Delta-Logik für Keyframes ist nicht explizit
- **Problem:** Die Berichte definieren, dass das `changes`-Objekt in der Historie nur **Deltas** (nur geänderte Werte) enthalten darf, um Redundanzen zu vermeiden. Der Prompt zeigt in seinem Beispiel zwar Änderungen, formuliert diese Regel aber nicht als strikte Anweisung.
- **Folge:** Das LLM könnte bei jedem Keyframe alle Attribute unnötig duplizieren (Datenaufblähung) oder statische Werte wie Labels in die Zeitachse schreiben.

### C. Handhabung von `validTo` und unendlicher Existenz
- **Problem:** Das Konzept, dass `validTo: null` (oder das Weglassen des Feldes) bedeutet, dass ein Element bis in die Gegenwart existiert, fehlt im Prompt.
- **Folge:** Das LLM könnte Nodes unerwartet enden lassen oder Schwierigkeiten haben, durchgehende Entitäten zu modellieren.

---

## 2. Widersprüche in der Dokumentation (Die "Source of Truth" Problematik)
Die verschiedenen Markdown-Dokumente sind teilweise nicht synchronisiert und beschreiben unterschiedliche JSON-Strukturen:

- **Root-Struktur:** `doc/nodges_build_4_schema.md` nutzt `"nodes": []` und `"edges": []` auf der Hauptebene. Der Code (`LLMService.ts`) und der Prompt erwarten jedoch zwingend `"data": { "entities": [], "relationships": [] }`. Würde das LLM die `doc/`-Dateien lesen, würde der Parser unweigerlich abstürzen.
- **Position von `mapX`/`mapY`:** Im `bericht_build_4_inkl_zeit.md` liegen diese im `properties`-Objekt. In `public/nodges_build_4.md` liegen sie direkt im Root des Nodes/der Entity.

---

## 3. Was führt zum besten LLM-Ergebnis? (Empfehlungen)
Damit das LLM konsistente, visuell beeindruckende und vor allem fehlerfreie JSON-Dateien für Nodges ausspuckt, müssen folgende Instruktionen zwingend in den finalen Prompt (`build_4_prompt.md`) integriert werden:

1. **Die Struktur ist Gesetz:** Das LLM muss unmissverständlich angewiesen werden, exakt die `dataModel -> visualMappings -> data.entities/relationships` Struktur einzuhalten. (Keine Diskussion über `nodes`/`edges`).
2. **Karten-Template integrieren:** Das JSON-Beispiel im Prompt muss um das `metadata.map`-Objekt und `mapX`/`mapY` in den Entities erweitert werden, versehen mit dem Hinweis: *"Nutze mapX/mapY anstelle von position {x,y,z}, wenn eine geografische Karte gefordert wird."*
3. **Die Delta-Regel als Pflicht:** "Schreibe in `history[].changes` NUR Werte, die sich genau zu diesem `timestamp` ändern. Kopiere keine unveränderten Basis-Properties."
4. **Typensicherheit bei Timestamps:** Definiere im Prompt, dass Timestamps konsequent als reine Zahlen (z.B. Jahreszahlen) oder einheitliche ISO-Strings generiert werden sollen.
5. **Klare Trennung (Root vs. Properties):** Es muss klar sein, dass `temporal`, `position` und `mapX`/`mapY` direkt im Root der Entity liegen, während inhaltliche Daten (z.B. Einwohnerzahl) im Root ODER im `properties`-Objekt liegen dürfen (abhängig vom Parser). Der Prompt mischt dies derzeit etwas unglücklich.

---

## 4. Roadmap für die nächsten Schritte

*   **[Schritt 1] UI-Fixing:** Im `CreatePanel.ts` muss der Dateipfad im Dropdown für Build 4 und Build 3 auf `/prompts/build_4_prompt.md` (bzw. `/prompts/build_3_prompt.md`) korrigiert werden. *(Wird sofort behoben)*
*   **[Schritt 2] Prompt Engineering:** Die Datei `public/prompts/build_4_prompt.md` muss überarbeitet werden, um Geospatial-Features, die Delta-Regel und die strengen Formatvorgaben aufzunehmen.
*   **[Schritt 3] Doku-Konsolidierung:** Alle veralteten Dokumente im `/doc/`-Ordner (insb. `nodges_build_4_schema.md`) sollten aktualisiert werden, sodass sie 1:1 dem Schema aus dem Code entsprechen (`entities`/`relationships` statt `nodes`/`edges`).
