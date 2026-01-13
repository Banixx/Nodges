# Refinement: Konfigurierbares UI ("Concept A+")

Basierend auf Ihrem Feedback habe ich das "Command Center" (Konzept A) weiterentwickelt und drei Varianten erstellt, die alle gewünschten Features beinhalten:

1. **Tab-Struktur** (Layout, Ansicht, Daten).
2. **Kontext-Menüs** direkt am Graphen.
3. **Label-Steuerung** (Manuell vs. Hover).
4. **5 Farbschemata** (Dezent & angepasst).

Sie finden die HTML-Prototypen wieder im `knowledge`-Ordner.

---

## Die Varianten

### 1. Refined A1: "Classic Workbench"

**Datei:** `concept_a1_workbench.html`

* **Stil:** Klassisch, dunkel, funktional.
* **Ansicht-Tab:** Checkboxen für Labels ("Immer anzeigen", "Bei Mouseover").
* **Farben:** Große Kacheln ("Swatches") zum schnellen Umschalten.
* **Kontext-Menü:** Erscheint als Liste neben dem Knoten bei Hover.

### 2. Refined A2: "Modern Integrated"

**Datei:** `concept_a2_modern.html`

* **Stil:** Schwebendes Design, runde Ecken, Icons im Header.
* **Ansicht-Tab:** Moderne "Toggle"-Switches.
* **Farben:** Liste mit Vorschau-Bubbles und Namen.
* **Kontext-Menü:** "Quick Actions" (kleine Icons) schweben *über* dem Knoten für Schnellzugriff (Zoom, Edit).

### 3. Refined A3: "Compact Data"

**Datei:** `concept_a3_compact.html`

* **Stil:** Sehr schmal, minimale Ablenkung.
* **Ansicht-Tab:** Dropdowns um Platz zu sparen.
* **Farben:** Mini-Swatches in einer Reihe.
* **Kontext-Menü:** Tooltip-Stil (nur Infos und ein Link).

---

## Die definierten Farbschemata

Diese Schemata sind in den Prototypen integriert (klicken Sie im "Ansicht"-Tab darauf):

| Name | Background | Panel BG | Akzent | Wirkung |
| :--- | :--- | :--- | :--- | :--- |
| **1. Nodges Default** | `#1a1a1a` (Dark Grey) | `#222222` | `#3498db` (Blue) | Das gewohnte, professionelle Aussehen. |
| **2. Deep Ocean** | `#2c3e50` (Navy Slate) | `#34495e` | `#1abc9c` (Teal) | Ruhig, kühl, technisch. |
| **3. Midnight** | `#19101f` (Dark Violet) | `#2d1e36` | `#9b59b6` (Purple) | Modern, kreativ, aber dunkel genug. |
| **4. Forest** | `#0f1a15` (Black Green) | `#16261f` | `#27ae60` (Green) | Natürlich, entspannend für die Augen. |
| **5. Monochrome** | `#202020` (Neutral) | `#303030` | `#bdc3c7` (Silver) | Komplett entsättigt, Daten stehen im Fokus. |

## Empfohlene Interaktions-Logik (Labels)

Für die Implementierung schlage ich folgende Logik vor, die in den Prototypen simuliert ist:

* **Global Toggle:** Ein Schalter "Labels immer anzeigen" überschreibt alles. Alle Labels sind sichtbar (ggf. mit Distanz-Culling für Performance).
* **Hover-Logik:** Wenn "Labels immer anzeigen" AUS ist, greift "Hover":
  * Maus über Node -> Label wird eingeblendet (`opacity: 1`).
  * Kontext-Menü öffnet sich zeitverzögert (oder per Rechtsklick, um den Viewport nicht zuzumüllen).
