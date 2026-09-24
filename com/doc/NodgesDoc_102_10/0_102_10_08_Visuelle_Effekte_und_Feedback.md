# 07 Visuelle Effekte und Feedback-Systeme

Ein intuitives visuelles Feedback ist entscheidend, um dem Benutzer Orientierung in der komplexen 3D-Welt zu geben. Nodges implementiert hierfür ein mehrschichtiges System aus Highlights, Animationen und atmosphärischen Effekten.

---

## 1. Das Highlight-System (`HighlightManager`)

Der `HighlightManager` ist die zentrale Instanz für alle visuellen Hervorhebungen. Er stellt sicher, dass sich verschiedene Interaktionszustände (z.B. "Ich fahre über einen Knoten" vs. "Ich habe diesen Knoten markiert") nicht gegenseitig visuell zerstören.

### 1.1 Zustandssicherung und Backup
Bevor ein Objekt visuell verändert wird, legt der Manager ein Backup des originalen Materials an. Beim Entfernen des Highlights wird dieser Originalzustand exakt wiederhergestellt. Das verhindert "Geister-Materialien" (Material-Leaks).

### 1.2 Prioritäten-Kaskade
Da ein Objekt mehrere Gründe haben kann, hervorgehoben zu werden, existiert eine strikte Kaskade:
1. **SELECTION** (Höchste Prio): Der Benutzer fokussiert dieses Objekt aktiv.
2. **SEARCH**: Das Objekt ist Teil eines Suchergebnisses (via UI).
3. **PATH**: Das Objekt liegt auf einem berechneten Shortest-Path.
4. **HOVER** (Niedrigste Prio): Die Maus streift das Objekt kurzzeitig.

---

## 2. Highlight-Modi im Detail

> **Visualisierung:** Siehe [08_HighlightPrioritaetsKaskade_001.mmd](08_HighlightPrioritaetsKaskade_001.mmd)

### 2.1 HOVER-Modus (Feedback der Erreichbarkeit)
- **Zweck:** Signalisiert: "Dieses Objekt ist anfassbar".
- **Visuell (Nodes):** Helligkeitsboost (+30%) der Grundfarbe.
- **Visuell (Edges):** Die Kante wird visuell hervorgehoben und leuchtet bläulich.

### 2.2 SELECTION-Modus (Der Fokus)
- **Zweck:** Dauerhafte Markierung für Detailanalyse (öffnet das Sidepanel).
- **Visuell:** Ein kräftiger Glow-Effekt über die `emissive`-Color Eigenschaft des Three.js-Materials.
- **Besonderheit:** Selektierte Objekte "atmen" (Pulsation), um sie vom statischen Rest des Graphen abzuheben.

### 2.3 SEARCH & PATH (Semantische Highlights)
- **Search:** Nutzt starke Kontrastfarben (z.B. Gelb/Magenta), um Treffer im "Dschungel" tausender Knoten sofort aufblinken zu lassen.
- **Path:** Markiert Ketten von Kanten. Für maximale Lesbarkeit nutzt das System hier den **Ghosting-Effekt**: Alle nicht-beteiligten Knoten und Kanten des Graphen erhalten ein transparentes Material (`opacity: 0.1`), wodurch der Pfad optisch stark in den Vordergrund rückt.

---

## 3. Shader und Atmosphärische Effekte

> **Visualisierung:** Siehe [08_ShaderUndEffekte_002.mmd](08_ShaderUndEffekte_002.mmd)

### 3.1 Der "Breathing" Glow-Effekt
Das Pulsieren selektierter Knoten wird mathematisch über einen **Sinus-Oszillator** direkt im Render-Loop (oder per Custom Shader) gesteuert:
`Intensity = Base + Amplitude * sin(Time * Frequency)`
- Standardmäßig atmen Objekte mit 0.5 Hz. Dieser fließende Übergang wirkt beruhigend und hochwertig (Premium Aesthetics) im Vergleich zu hartem Blinken.

### 3.2 Halo-Technik (Outline Rendering)
Echte Outlines sind in WebGL performancelastig, da sie komplexe Post-Processing Pässe (z.B. Sobel Filter) benötigen. Nodges nutzt oft eine performante geometrische Alternative:
- Es wird ein zweites Mesh (Klon) erzeugt, das ca. 40% größer ist.
- Dieses erhält `opacity: 0.3` und `depthWrite: false`.
- Dadurch wird der "Halo" immer hinter dem eigentlichen Objekt gerendert und erzeugt einen weichen, geisterhaften Schein, der kaum GPU-Rechenzeit kostet.
