# Nodges Knowledge Plan

Dieser Plan dient als strategische Blaupause, um das vorhandene Projektwissen aus den Brain-Logs, bestehenden Artefakten (wie `knowledge_artifact.md`) und Konzeptdateien (wie `perspektive2.md`) in hochqualitative, fokussierte Knowledge Items (KIs) zu übersetzen.

## Zielsetzung
Das Projektwissen soll in spezialisierte Dokumente aufgeteilt werden, damit der Agent in zukünftigen Sitzungen priorisiert auf exakte Architektur- und Designvorgaben zugreifen kann, ohne rohe Logs durchsuchen zu müssen.

## Geplante Struktur der Knowledge Items

### 1. KI-Architektur: Datenfluss und LLM-Integration
*   **Fokus:** Die strikte Trennung der Zuständigkeiten (Separation of Concerns).
*   **Inhalt:** Das LLM agiert ausschließlich als unlimitierter Datenlieferant (extrahiert alle verfügbaren Properties). Nodges (und der User) behalten die absolute Kontrolle über die visuelle Filterung und das Mapping.

### 2. KI-Visualisierung: Mapping-Heuristiken
*   **Fokus:** Automatisiertes und interaktives Mapping in Three.js.
*   **Inhalt:** Kategorische Daten (Strings) werden automatisch auf Farbgruppierungen gemappt. Kontinuierliche Daten (Numerisch) steuern Größen- und Leuchtkraftparameter (Glow).
*   **Prinzip:** Live-Iteration in der UI durch den User ohne neue API-Calls an das LLM.

### 3. KI-Interface: UI/UX Paradigmen
*   **Fokus:** Navigation, Layout und Theme.
*   **Inhalt:** Umgang mit Sidebar-Tab-Overflows, Integration des `LegendPanel`, dynamische Editor-Funktionen (wie im `CreatePanel` oder beim Editieren von Knoten-Attributen) und die Dark Theme Vorgaben.

### 4. KI-Infrastruktur: Stack & Workflows
*   **Fokus:** Entwicklungsumgebung und Versionierung.
*   **Inhalt:** TypeScript, Vite, Three.js Stack. Vorgaben für Git-Workflows (A/B Testing), Branching und DevContainer-Regeln.

## Weiteres Vorgehen
Wir werden diesen Plan als Basis nutzen, um die einzelnen Knowledge Items im Detail auszuarbeiten und dauerhaft im System (`C:/Users/ich/.gemini/antigravity/knowledge`) zu verankern.
