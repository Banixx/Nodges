# Suchbericht: Mapping-Limits und VisualMappingEngine

Die Suche nach früheren Konversationen zu den Themen "VisualMappingEngine", "clamping logic" und Mapping-Limits hat ergeben, dass in der Session `8de380c5-43c6-4681-8258-6c69026f82ec` bereits signifikante Arbeiten am Clamping durchgeführt wurden.

## Ergebnisse der Historie:

*   **Clamping der Mapping-Werte:** Es wurde festgestellt, dass extrem große oder kleine Werte aus LLM-Antworten das visuelle Layout stören.
*   **Edge Thickness:** In der `VisualMappingEngine` wurde ein Clamping für die Dicke von Kanten zwischen `0.01` und `0.3` eingeführt.
*   **Node Size:** Die Knotengröße wurde nach dem Mapping auf Werte zwischen `0.3` und `3.0` limitiert.

Diese serverseitigen Limits wurden implementiert, um fehlerhafte oder zu extreme Daten vom LLM abzufangen, bevor sie den Three.js-Renderer erreichen.

## Aktualisierung der LLM-Prompts

Passend dazu wurde der Prompt `public/prompts/build_6_prompt.md` nun direkt an der Quelle verbessert, um dem LLM klare Anweisungen zu geben:

1.  **Limitierung:** Das LLM wurde angewiesen, die maximale Größe in dynamischen Size-Mappings auf maximal das 3-fache der minimalen Größe zu begrenzen (z. B. min: 1.0, max: 3.0). Die Kanten-Dicke (`thickness`) ist nun strikt auf Werte zwischen `0.03` und `0.25` limitiert.
2.  **Räumlichkeit & Zeitlichkeit:** Es wurden explizite Hinweise hinzugefügt, räumliche Konzepte (wie geografische Koordinaten) bevorzugt auf `position.x` und `position.z` zu mappen. Für zeitliche Entwicklungen (z.B. Epochen oder Zeitstempel) soll die Eigenschaft `animation` in Betracht gezogen werden.
