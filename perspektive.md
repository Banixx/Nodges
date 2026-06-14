# Perspektive: Optimierung der LLM-Integration in Nodges

Diese Perspektive beleuchtet den Weg von der einfachen Daten-Generierung hin zu einer "Smart Visualization", bei der das LLM nicht nur Daten liefert, sondern aktiv die visuelle Semantik mitgestaltet.

## 1. Von flachen Daten zu semantischen Strukturen
Aktuell generiert das LLM hauptsächlich `id`, `type` und `label`. Um das Nutzererlebnis zu maximieren, sollte die "Schedule" (der System-Prompt) das LLM anweisen, **metrische und kategorische Attribute** hinzuzufügen:

*   **Wichtigkeit/Gewichtung:** Eigenschaften wie `size`, `importance` oder `weight` für Knoten.
*   **Beziehungsstärke:** Eigenschaften wie `strength` oder `frequency` für Kanten.
*   **Gruppierung:** Eigenschaften wie `category`, `cluster` oder `department`.

**Vorteil:** Nodges kann diese Attribute automatisch auf visuelle Variablen (Größe, Farbe, Dicke) mappen, was den Graphen sofort lesbar macht.

## 2. Das LLM als "Visual Designer"
Ein großer Hebel liegt darin, das LLM anzuweisen, direkt `visualMappings` im JSON mitzuliefern. Anstatt nur Daten zu liefern, "sagt" das LLM der Anwendung:
*   "Färbe alle Personen vom Typ 'Mitglied' blau ein."
*   "Skaliere die Knoten basierend auf ihrer 'influence' Eigenschaft."

Da Nodges bereits eine mächtige `VisualMappingEngine` besitzt, muss das LLM lediglich die Konfiguration dieser Engine im JSON-Format ausgeben.

## 3. Layout-Vorschläge durch die KI
Unterschiedliche Daten benötigen unterschiedliche Layouts. Ein Stammbaum sieht hierarchisch am besten aus, ein soziales Netzwerk kraftgesteuert (force-directed). 
Das LLM könnte im `metadata` Feld des JSON einen `suggestedLayout` Parameter mitgeben. Nodges könnte diesen beim Laden auslesen und automatisch den passenden Algorithmus im `LayoutManager` triggern.

## 4. Automatisierung vs. Manuelle Kontrolle
Die aktuelle Architektur von Nodges erlaubt eine gute Balance:
1.  **Auto-Balancing:** Beim Laden können Koordinaten normalisiert und die Kamera automatisch positioniert werden (`fitCameraToScene`).
2.  **Mapping-Overrides:** Nutzer können die KI-Vorschläge im "Mappings"-Tab jederzeit manuell verfeinern.

## 5. Zukünftige Iterationen (Feedback-Loop)
Das "Maximieren des Nutzererlebnisses" wird ein iterativer Prozess sein:
*   **Refinement:** Wenn die Darstellung nicht passt, könnte der Nutzer dem LLM im Prompt sagen: "Mache die zentralen Knoten größer" oder "Blende unwichtige Verbindungen aus".
*   **Self-Correction:** Nodges könnte die aktuelle Konfiguration (welche Knoten sind sichtbar, welches Layout ist aktiv) als Kontext an das LLM zurückgeben, um inkrementelle Änderungen am Graphen vorzunehmen.

## Fazit
Die beste Anleitung für das LLM ist eine, die ihm nicht nur sagt, *was* es generieren soll (Daten), sondern auch *wie* diese Daten zu bewerten sind (Metadaten) und *wie* sie idealerweise aussehen sollten (Visual Mappings). Ziel ist es, dass der erste Klick auf "Generieren" bereits ein ästhetisch ansprechendes und aussagekräftiges Ergebnis liefert.
