# Detaillierte UI-Konzepte für Nodges

Ich habe drei interaktive Prototypen (als HTML-Dateien) erstellt, die Sie im Browser öffnen können, um das "Look & Feel" direkt zu erleben.

Hier ist die detaillierte Beschreibung der Logik hinter jedem Design.

---

## Konzept A: "The Command Center" (Professional)

**Datei:** `concept_a_command.html`

Dieses Design orientiert sich an Profi-Tools wie VS Code, Blender oder Unity. Es geht davon aus, dass der Nutzer *arbeiten* und *konfigurieren* will.

### Key Features

1. **Tabbed Sidebar**: Anstatt alle Panels untereinander zu stapeln (was zu Scrolling führt), gibt es Reiter ("Tabs") oben: *LAYOUT*, *FILES*, *SYSTEM*.
2. **Dense Data Display**: Nutzung von Monospace-Schriften und kompakten Rastern (Grid), um viele Informationen (Knotenanzahl, FPS, XYZ) auf wenig Raum darzustellen.
3. **Technische Ästhetik**: Dunkles Theme, feine Linien, blaue Akzente. Wirkt stabil und vertrauenswürdig.

**Pro:**

* Skaliert perfekt (beliebig viele Einstellungen möglich).
* Bekanntes UX-Pattern für Entwickler/Analysten.
**Contra:**
* Nimmt permanent Bildschirmplatz weg (300px).
* Weniger "immersiv".

---

## Konzept B: "The Floating HUD" (Immersive)

**Datei:** `concept_a_hud.html`

Dieses Design maximiert die Sichtbarkeit des Graphen. Das UI tritt in den Hintergrund und erscheint nur bei Bedarf.

### Key Features

1. **Glass Dock**: Eine schwebende Toolbar am unteren Bildschirmrand für globale Funktionen (wie macOS Dock oder iPad).
2. **Context Menus**: Einstellungen für Knoten erscheinen nicht in einer entfernten Sidebar, sondern direkt *neben* dem Objekt (als schwebende Karte/Pop-up). Dies reduziert Mauswege drastisch.
3. **Neon & Blur**: Starke Nutzung von `backdrop-filter` und Leuchteffekten, um modern und futuristisch zu wirken.

**Pro:**

* Maximale Immersion ("Wow"-Faktor).
* Schnelle Interaktion durch Nähe zum Objekt.
**Contra:**
* Komplexer zu implementieren (Positionierung der Pop-ups im 3D-Raum).
* Menüs können Inhalte verdecken.

---

## Konzept C: "The Node Aesthetic" (Thematisch)

**Datei:** `concept_c_nodes.html`

Ein experimenteller Ansatz, bei dem das UI selbst aussieht wie ein Netzwerk.

### Key Features

1. **Hexagon-Buttons**: Wabenförmige Buttons, die organisch angeordnet sind.
2. **Vernetzung**: UI-Elemente sind mit Linien verbunden, die pulsieren (wie die Edges im Graphen).
3. **Satelliten-Menü**: Ein Haupt-Button entfaltet bei Klick weitere Optionen drumherum.

**Pro:**

* Perfektes Branding für "Nodges".
* Spielerisch und einzigartig.
**Contra:**
* Ungewohnt in der Bedienung (schlechte "Discoverability").
* Schwer zu erweitern (Platzierung neuer Hexagons ist geometrisch limitiert).

---

## Meine Empfehlung zur Umsetzung

Ich empfehle eine **Evolution** statt Revolution, basierend auf **Konzept A** mit Elementen von **B**:

1. **Struktur von A übernehmen**: Bauen Sie eine saubere Sidebar mit Tabs (`Layout`, `Files`, `Settings`), um das aktuelle Platzproblem zu lösen. Dies ist der funktional wichtigste Schritt.
2. **Style von B einfließen lassen**: Nutzen Sie den "Glassmorphismus" (Blur-Hintergründe) und die runden Ecken für diese Sidebar, damit es nicht zu steif wirkt.
3. **Kontext-Info**: Für reine *Informationen* (was ist das für ein Knoten?), nutzen Sie das schwebende Pop-up aus Konzept B (wie der aktuelle `HoverInfoPanel`, nur schöner).
