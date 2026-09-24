# Technische Einschränkungen der Skalierbarkeit und Wartbarkeit (Version 0.102.7)

Diese Analyse beleuchtet die aktuellen architektonischen und technischen Entscheidungen in Nodges, die die zukünftige Skalierung (sowohl des Codes als auch der Performance) behindern.

## 1. Monolithische Datei- und Klassenstrukturen
*   **Problem**: Einige Kernkomponenten des Projekts sind extrem groß gewachsen. `MappingUI.ts` umfasst fast 150 KB Code und `App.ts` über 70 KB.
*   **Auswirkung**: Diese Klassen vereinen UI-Erstellung, Event-Handling, Zustandsverwaltung und teils Rendering-Logik an einem Ort. Dies verletzt das Single-Responsibility-Prinzip und macht Code-Änderungen fehleranfällig.

## 2. Imperatives DOM-Management (Vanilla TypeScript)
*   **Problem**: Die Benutzeroberfläche wird vollständig imperativ über Vanilla-TypeScript-DOM-Manipulationen (`document.createElement`, manuelle Event-Listener, Inline-Styles) aufgebaut.
*   **Auswirkung**: Ohne ein deklaratives UI-Framework (wie React, SolidJS oder Svelte) führt jede neue UI-Funktion zu erheblichem Boilerplate-Code. Die Konsistenz zwischen Datenzustand (State) und visueller Darstellung (DOM) muss manuell synchron gehalten werden, was zu Race-Conditions und unübersichtlichem Code führt.

## 3. Event-Bus statt strukturiertem State-Management
*   **Problem**: Die Synchronisation zwischen der Three.js-Szene, den Steuerungspanels (`MappingUI`, `CreatePanel`) und dem `StateManager` läuft über einen ereignisgesteuerten Ansatz (`CentralEventManager.ts`).
*   **Auswirkung**: Bei steigender Komplexität droht eine "Event-Hölle". Es wird extrem schwierig, Datenflüsse und die Kausalität von Zustandsänderungen nachzuvollziehen oder Fehler im Datenfluss zu isolieren. Ein zentraler, unidirektionaler Store (z.B. ähnlich Zustand oder Redux) fehlt.

## 4. Reine Client-Architektur und API-Key-Sicherheit (BYOK)
*   **Problem**: Nodges ist als statische Webanwendung (z.B. für GitHub Pages) konzipiert, bei der Benutzer ihre eigenen API-Keys mitbringen müssen (Bring Your Own Key).
*   **Auswirkung**: 
    *   **Sicherheit**: Die Verarbeitung sensibler API-Keys direkt im Browser ist sicherheitskritisch und für ein kommerzielles SaaS-Produkt ungeeignet.
    *   **Wartbarkeit**: Fehlende Server-Kapselung macht es unmöglich, globale Caching-Mechanismen, Rate-Limiting oder Modell-Fallback-Strategien zentral und sicher zu implementieren.

## 5. WebGL-Rendering und Label-Performance bei großen Graphen
*   **Problem**: Knoten und Kanten werden größtenteils als separate Mesh-Instanzen gerendert. 
*   **Auswirkung**: 
    *   Bei Netzwerken mit mehr als 1.000 Knoten/Kanten steigt der Draw-Call-Overhead drastisch an.
    *   Die Text-Labels (`NodeLabelManager.ts`, `EdgeLabelManager.ts`) werden über DOM-Overlays oder rechenintensive Sprites dargestellt. Hunderte von DOM-Labels führen zu Layout Thrashing und bringen den Browser zum Ruckeln.
