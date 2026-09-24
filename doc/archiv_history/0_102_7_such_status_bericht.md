# Entwicklungsstand Nodges (v0.102.7)

Basierend auf der Analyse der letzten 11 Sessions und des Dokuments `doc/0_102_7_grok_test_analyse.md` wurde der aktuelle Arbeitsstand rekonstruiert.

## Aktueller Status

Wir haben die Stufe der systematischen Evaluation des Modells `x-ai/grok-4.20` abgeschlossen. Die Tests zeigten, dass das Modell zwar valide JSON-Daten generiert, das gerenderte Layout in Nodges jedoch signifikante Proportions- und Dichteprobleme aufweist (z. B. zu dicke Kanten, zu dicht gedraengte Knoten und unstrukturierte visuelle Mappings).

Zur Behebung wurden konkrete Massnahmen ausgearbeitet, die in drei Phasen unterteilt sind. Die Phasen 1 und 2 sind die unmittelbaren naechsten Schritte.

## Offene Arbeitspakete & Themen fuer neue Sessions

### 1. Phase 1: Prompt-Haertung (System-Prompts)
*   **Ziel:** Die Qualitaet der vom LLM generierten Mappings direkt an der Quelle verbessern.
*   **Dateien:** `public/prompts/build_6_prompt.md`
*   **Massnahmen:**
    *   Einfuehrung von Grenzwerten fuer Mapping-Bereiche im Prompt (z. B. `size` maximal 3-faches des Minimums, `thickness` strikt zwischen 0.03 und 0.25).
    *   Praezisierung der globalen Eindeutigkeitsregel fuer visuelle Kanaele.
    *   Hinzufuegen von Mapping-Hinweisen fuer raeumliche (x/z Koordinaten) und zeitliche Daten.

### 2. Phase 2: Code-Defaults (Layout & Proportionen)
*   **Ziel:** Fehlertoleranz und visuelle Harmonie im Rendering-Code sicherstellen, selbst wenn das LLM extreme Ranges liefert.
*   **Dateien:**
    *   `src/core/VisualMappingEngine.ts` (Clamp-Logik fuer thickness/size).
    *   `src/core/LayoutManager.ts` (Dynamische Repulsion basierend auf der Knotenanzahl statt starr 50).
    *   `src/core/NodeLabelManager.ts` (Behebung des Label-Sync-Bugs bei Repositionierung).

### 3. Phase 3: Temporal-Player (UI-Feature)
*   **Ziel:** Volle Unterstuetzung der temporalen Daten durch Steuerungs-Elemente im UI.
*   **Massnahmen:**
    *   Entwicklung eines Zeitachsen-Sliders im UI.
    *   Dynamische Filterung der Sichtbarkeit von Knoten/Kanten basierend auf dem aktiven Zeitfenster.
