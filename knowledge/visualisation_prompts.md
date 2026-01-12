# Prompts für Nano Banana Pro (oder andere Bild-Modelle)

Hier sind detaillierte Prompts, um die Architektur und Abläufe von **Nodges** zu visualisieren. Diese sind so gestaltet, dass sie technische Diagramme mit einem modernen, sauberen Look beschreiben.

## 1. Übersicht & Komponenten (System Architecture)

Dieser Prompt zielt auf eine klassische Architektur-Übersicht ab, die zeigt, wie die `App` als Zentrum fungiert und die verschiedenen Manager steuert.

**Prompt:**
> A professional software architecture diagram of a high-tech 3D specialized data visualization application named "Nodges".
>
> **Visual Style:** clean, modern technical blueprint, isometric 3D perspective, vector art style, dark mode background (deep charcoal), neon accent colors (cyan, magenta, lime green).
>
> **Central Hub:** A central core hexagon labeled "App (Main Controller)".
>
> **Connected Modules (surrounding the core):**
>
> 1. **"State Manager"** (Representation: Database/Storage icon, pulsing with data) connected via bidirectional arrows.
> 2. **"Event Manager"** (Representation: Signal tower/Hub) broadcasting lines to all other nodes.
> 3. **"Visual Engine"** (Representation: Paint palette/Gear) feeding into the 3D Scene.
> 4. **"3D Scene Managers"** (Group containing "Node Manager" & "Edge Manager", Representation: 3D spheres and lines).
> 5. **"Interaction Manager"** (Representation: Cursor/Hand interaction) sending signals to the Event Manager.
> 6. **"UI Layer"** (Representation: Overlay panels) floating above the layout.
>
> **Data Flow:** Flowing dotted lines moving from a "Data Parser" input block into the "App" core.
>
> **Details:** High-quality text labels, crisp lines, glowing connections showing data transmission.

---

## 2. Datenfluss & Generierung (Data Processing Pipeline)

Dieser Prompt visualisiert, wie rohe JSON-Daten in 3D-Objekte verwandelt werden.

**Prompt:**
> A flow-chart style illustration of a data processing pipeline for a node-link diagram application.
>
> **Style:** Flat design, minimalist, infographic style, white background with soft shadows.
>
> **Steps (Left to Right):**
>
> 1. **Input:** Icon of a JSON file labeled "Raw Graph Data" (Entities & Relationships).
> 2. **Process 1:** A gear/processor icon labeled "Data Parser" validating data structure.
> 3. **Process 2 (Branching):** The stream splits into two paths:
>     * **Path A:** Goes to a cube factory icon labeled "Node Manager" (creating spheres).
>     * **Path B:** Goes to a connector factory icon labeled "Edge Manager" (creating lines).
> 4. **Transformation:** Both paths pass through a "Visual Mapping Engine" filter (applying colors and sizes based on rules).
> 5. **Assembly:** Everything converges into a "Layout Engine" which arranges the spheres and lines into a force-directed graph structure.
> 6. **Output:** A beautiful 3D network cluster on a screen.
>
> **Connectors:** Smooth curved arrows connecting the steps.

---

## 3. Event Loop & Interaktion (Interaction Cycle)

Visualisiert, was passiert, wenn der Nutzer klickt (Raycasting -> Event -> State -> Update).

**Prompt:**
> A circular cycle diagram showing the user interaction loop in a 3D software.
>
> **Style:** Futuristic HUD style, glowing blue and distinct schematic lines.
>
> **Cycle Nodes:**
>
> 1. **"User Input"** (Mouse/Click icon) at the top.
> 2. arrow to **"Raycast Manager"** (Laser beam hitting a node target).
> 3. arrow to **"Central Event Hub"** (Router icon).
> 4. arrow to **"State Manager"** (Update State: Selected=ID).
> 5. **"State Change"** triggers three parallel arrows outward:
>     * One to **"Highlight Manager"** (adds Glow Effect).
>     * One to **"UI Manager"** (opens Info Panel).
>     * One to **"Scene"** (re-renders frame).
>
> **Center:** The center of the circle contains the text "Event Loop".
