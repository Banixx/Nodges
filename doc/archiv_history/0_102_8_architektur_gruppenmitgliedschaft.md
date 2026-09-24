# Architektur-Konzept: Ontologie der Gruppenmitgliedschaft (Clouds)

Die Entscheidung, wie eine Gruppe (bzw. eine "Cloud") im Graphen abgebildet wird, ist fundamental für die Datenstruktur (LLM-Pipeline), das Rendering (NodeManager) und die Physik (LayoutManager). 

Hier sind die vier primären Argumentationsstränge und Architektur-Ansätze zur Repräsentation einer Gruppe.

---

## Ansatz A: Die Gruppe ist eine Node-Entität, Mitgliedschaft ist eine Edge *(Gewählter Ansatz)*
**Struktur:** Es gibt einen Knoten mit `type: "group"` oder `type: "cloud"`. Die Mitglieder sind durch Kanten (z. B. `label: "belongs_to"`) mit diesem Cloud-Knoten verbunden.

**Pro-Argumente:**
1. **Metadaten-Heimat:** Die Cloud selbst ist ein vollwertiges Objekt. Das LLM kann der Gruppe Eigenschaften (Beschreibung, Farbe, Wichtigkeit, Typ) geben.
2. **Fokussierbarkeit:** Der Nutzer kann physisch auf den Cloud-Knoten klicken. Er existiert als Zentrum in der 3D-Welt.
3. **LLM-Verständnis:** LLMs verstehen dieses Entity-Relationship-Modell ("A gehört zu B") extrem gut, da es dem klassischen relationalen Denken entspricht.
4. **Visuelle Abstraktion:** Wir können den Cloud-Knoten nutzen, um die Bounding-Box zu berechnen und das "Hüllen-Rendering" an dieser zentralen Position aufzuziehen.

**Contra-Argumente:**
1. **Zerstörung der Force-Directed Physik:** Wenn 50 Knoten mit der Cloud-Node verbunden sind, zieht der Physik-Algorithmus alle 50 Knoten stark ins Zentrum (auf einen Punkt). Die Hülle würde zu einem dichten, unleserlichen Knäuel kollabieren.

**-> Lösungsstrategie (Dynamische Repulsion):**
Um das Knäuel-Problem (Contra 1) zu lösen, implementieren wir eine **fokus-basierte, dynamische Repulsion**:
- **Auto-Drift bei Fokus:** Wird eine Cloud fokussiert, driften die darin enthaltenen Knoten auseinander. Das Ziel ist eine Projektion, bei der die Knoten *aus Sicht der aktuellen Kameraperspektive* ausreichend Abstand zueinander haben, um Lesbarkeit und Durchsicht zu gewähren.
- **UI-Steuerung (Schieberegler):** Da die automatische Durchsicht bei sehr dichten, tiefen Clustern nicht immer perfekt gelingt, erhält die Visualisierungsbox der Gruppe (z.B. im MappingUI oder einem neuen Focus-Panel) einen dedizierten Schieberegler für die "Cloud Repulsion". Der Nutzer kann das Auseinanderdriften der Gruppenmitglieder manuell justieren.

---

## Ansatz B: Die Gruppe ist ein Attribut auf dem Knoten *(Verworfen)*
**Struktur:** Es gibt *keine* Cloud-Nodes und *keine* "belongs_to" Kanten. Jeder Knoten bekommt ein Attribut, z.B. `cloudId: "marketing"` oder `group: "Management"`.

**Pro-Argumente:**
1. **Sauberer Domänen-Graph:** Der Graph enthält nur die *echten* logischen Kanten zwischen den Elementen.
2. **Einfachste LLM-Struktur:** Das LLM muss nur ein simples Schlüssel-Wert-Paar zu jeder Entität hinzufügen.

**Contra-Argumente:**
1. **Verwaiste Metadaten:** Wo speichern wir die Information, *was* die Cloud ist? Das LLM hat kein Objekt, an das es lange Beschreibungen oder Meta-Infos zur Gruppe selbst hängen kann.
2. **Fehlender Fokus-Anker:** Keine anklickbare Entität im Raum vorhanden.

---

## Ansatz C: Die Gruppe ist eine Kanten-Clique (Implizite Gruppe) *(Verworfen)*
**Struktur:** Alle Mitglieder einer Gruppe werden untereinander mit Kanten verbunden. Jeder mit jedem.

**Contra-Argumente:**
1. **Der Knäuel-Albtraum (O(n²)):** Eine Gruppe von 50 Knoten erzeugt 1225 Kanten. Zerstört die visuelle Lesbarkeit komplett.

---

## Ansatz D: Hierarchische Verschachtelung (Compound Graph) *(Verworfen)*
**Struktur:** Ein Knoten-Objekt in der JSON-Datei hat ein Array `children: [ { id: "child1" }, ... ]`.

**Contra-Argumente:**
1. **LLM Halluzinationen:** Verschachteltes JSON ist fehleranfälliger für Sprachmodelle als eine flache Edge-Liste.
2. **Kompletter Rewrite nötig:** Die Nodges-Architektur müsste fundamental auf Compound-Graphen umgestellt werden.

---

> [!TIP]  
> ## Beschluss: Modifizierter Ansatz A
> Wir setzen auf "Cloud-Entitäten", um Metadaten und Klickbarkeit zu erhalten. Die physikalische Konsequenz (Knäuelbildung) lösen wir proaktiv über interaktive, fokus-basierte Repulsions-Kräfte, die der Nutzer per Slider feinjustieren kann.

## Ausführungsplan

1. **Cloud-Geometrie und Bounding Box (Rendering):** 
   - `NodeManager.ts` berechnet die Hülle basierend auf den verknüpften Child-Knoten (geometrischer Schwerpunkt & Radius). (Dies entspricht dem Code, den wir bereits skizziert hatten).
2. **Interaktion (Fokus Mode):**
   - Klick auf eine Cloud fokussiert die Kamera auf die Bounding-Box.
3. **Dynamische Physik (Drift):**
   - Implementierung eines separaten "Force-Modifiers" im Layout-System für fokussierte Clouds.
4. **UI-Erweiterung:**
   - Hinzufügen des "Cloud Repulsion" Sliders in der UI, wenn eine Cloud selektiert/fokussiert ist.
