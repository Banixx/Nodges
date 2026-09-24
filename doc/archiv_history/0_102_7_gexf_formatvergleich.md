# GEXF vs. Nodges-JSON: Formatvergleich und Alternativen

## Kurzantwort

GEXF bringt **Dynamik (Zeitachsen)**, **Hierarchien** und **Schema-Validierung** mit, die Nodges aktuell nicht hat. Nodges verliert aber sein **Visual-Mapping-System**, die **Mapping-Funktionen** (linear, logarithmisch, heatmap...), die **Physik-Channels** (attraction, repulsion, inertia) und die **Ontologie-Trennung** (dataModel). Ein Wechsel zu GEXF waere ein massiver Rueckschritt in der visuellen Ausdrueckbarkeit.

---

## 1. Was GEXF mitbringt, was Nodges noch NICHT hat

| Feature | GEXF | Nodges-JSON |
|---|---|---|
| **Dynamik / Zeitachsen** | First-Class: Spells, Start/End-Intervalle, zeitabhaengige Attribute. Nodes/Edges koennen zu bestimmten Zeitpunkten erscheinen und verschwinden. | Rudimentaer: `temporal.validFrom/validTo` existiert, aber ohne Spells oder Intervall-Logik. |
| **Hierarchische Graphen** | Nodes koennen Sub-Nodes enthalten (`pid` Parent-ID). Echte Cluster-in-Cluster-Darstellung. | Nicht vorhanden. Zugehoerigkeit wird ueber Edges modelliert, nicht ueber Verschachtelung. |
| **XML-Schema-Validierung** | RelaxNG + XSD Schemata. Dateien sind maschinell validierbar. | Zod-Validierung zur Laufzeit, aber kein standardisiertes Dateiformat-Schema. |
| **Standardisierte Attribut-Deklaration** | Typisierte Attribute mit expliziter Deklaration (`<attributes class="node">`) inklusive Defaults. | `dataModel.properties` erfuellt aehnliche Funktion, ist aber kein externer Standard. |
| **Breite Tool-Unterstuetzung** | Gephi, NetworkX (Python), graphology (JS), rgexf (R), gexf4j (Java). | Nur Nodges selbst. |

> [!NOTE]
> Der staerkste Vorteil von GEXF ist die **Dynamik**. Die Idee, dass ein Node von 1990-2005 existiert und dann verschwindet, oder dass ein Attributwert sich ueber die Zeit aendert, ist in GEXF elegant geloest. In Nodges ist das bisher nur ein optionales `temporal`-Objekt ohne echte Engine-Unterstuetzung.

---

## 2. Was Nodges VERLIERT, wenn GEXF Standard wird

| Nodges-Feature | Status in GEXF |
|---|---|
| **Visual Mappings (das Kernstueck)** | **Existiert nicht.** GEXF kennt nur statische `viz:color`, `viz:position`, `viz:size`, `viz:shape`. Es gibt **keine Mapping-Funktionen** (linear, logarithmisch, heatmap, bipolar, pulse, categorical, geographic, sphereComplexity). Das gesamte Konzept "Eigenschaft X steuert Kanal Y via Funktion Z" fehlt. |
| **Mapping-Funktionen mit Domain/Range** | **Existiert nicht.** Kein `domain: [0, 100]`, `range: [0.1, 5.0]`, kein `palette: "sunset"`. |
| **dataModel (Ontologie-Trennung)** | **Existiert nicht.** GEXF kennt keine Trennung zwischen Schema-Entwurf und Instanz-Daten. Die 2-Stufen-LLM-Pipeline basiert fundamental auf dieser Trennung. |
| **Physik-Channels** | **Existiert nicht.** `attraction`, `repulsion`, `inertia` als mappbare Kanaele gibt es in GEXF nicht. |
| **Edge-Animations** | **Existiert nicht.** `animation_flow`, `animation_sequential`, `animation_pulse`, `animation_segments` sind Nodges-exklusiv. |
| **Glow / Opacity als Mapping-Channel** | **Teilweise.** GEXF hat `viz:color` mit Alpha-Kanal, aber kein separates Glow-Mapping. |
| **Fields (Kraftfelder)** | **Existiert nicht.** Das `fields`-Array mit `influenceRadius`, `strength`, `center` ist Nodges-spezifisch. |
| **Beliebige Properties (passthrough)** | **Eingeschraenkt.** GEXF-Attribute muessen vorab deklariert werden. Nodges nutzt `.passthrough()` fuer voellige Freiheit. |
| **Map-Overlay** | **Existiert nicht.** `metadata.map` (Kartenbilder mit Referenzgroessen) ist Nodges-spezifisch. |

> [!CAUTION]
> **Das Visual-Mapping-System ist der Kern von Nodges.** Es ist das, was Nodges von einem simplen Graph-Viewer unterscheidet. GEXF speichert nur *das Ergebnis* einer Visualisierung (feste Farbe, feste Position), nicht *die Regeln*, wie Daten in visuelle Kanaele uebersetzt werden. Ein Wechsel zu GEXF wuerde bedeuten, dass das LLM nur noch statische Farben/Groessen liefert, statt semantische Mapping-Regeln.

---

## 3. LLM-Kompatibilitaet: Das eigentliche Argument

Die Ueberlegung ist berechtigt: LLMs kennen GEXF aus Trainingsdaten, weil es ein oeffentlicher Standard ist. Das Nodges-JSON ist proprietaer und muss dem LLM jedes Mal via System-Prompt erklaert werden.

**Aber:**

| Aspekt | GEXF | Nodges-JSON |
|---|---|---|
| **LLM-Bekanntheit** | Hoch. LLMs kennen die Struktur. | Niedrig. Muss per Prompt erklaert werden. |
| **LLM-Generierbarkeit** | Problematisch. XML ist fuer LLMs **deutlich fehleranfaelliger** als JSON. Verschachtelte Tags, Namespaces (`viz:`), Closing-Tags -- alles potenzielle Fehlerquellen. | Sehr gut. JSON ist das natuerlichste Output-Format fuer LLMs. |
| **Token-Effizienz** | Schlecht. XML ist 2-3x groesser als aequivalentes JSON wegen Tag-Overhead. Mehr Tokens = hoeherer Preis und laengere Latenz. | Gut. Kompakt, keine redundanten Strukturen. |
| **Validierung** | Muesste XML-Parser nutzen. Aufwaendiger im Browser. | Zod-Validierung ist nativ in TypeScript integriert. |

> [!IMPORTANT]
> Die LLM-Bekanntheit von GEXF ist ein **Scheinvorteil**. LLMs generieren JSON zuverlaessiger als XML. Das Nodges-JSON-Schema wird dem LLM ohnehin im System-Prompt mitgegeben -- und genau dort koennte man alternativ das JSON-Schema via `zod-to-json-schema` automatisch aus den Zod-Definitionen generieren. Das waere praeziser als jedes GEXF-Vorwissen.

---

## 4. Alle relevanten Alternativen

| Format | Typ | Staerke | Schwaeche fuer Nodges |
|---|---|---|---|
| **GEXF** | XML | Dynamik, Hierarchien, Tool-Support | Kein Visual-Mapping, XML-Overhead, keine Ontologie-Trennung |
| **GraphML** | XML | Breitester Standard, Hyperedges, verschachtelte Graphen | Gleiche XML-Probleme wie GEXF, noch weniger Visualisierungs-Features |
| **DOT (Graphviz)** | Plaintext | Simpel, menschenlesbar, gut fuer statische Diagramme | Nicht dynamisch, keine semantischen Attribute, nicht webfaehig |
| **Cytoscape.js JSON** | JSON | Leistungsfaehige Visualisierung, CSS-aehnliches Styling, Graph-Algorithmen | Library-spezifisch, keine Ontologie-Trennung, kein 3D |
| **vis.js JSON** | JSON | Physik-Engine eingebaut, schnell einsatzbereit | Weniger maechtig als Cytoscape, kein 3D, kein semantisches Mapping |
| **JSON-LD** | JSON | Semantisches Web, maschinenlesbar, W3C-Standard | Kein Visualisierungs-Format, braucht Uebersetzungsschicht |
| **JSON Graph Format (JGF)** | JSON | Simpel, standardisiert fuer JSON-Graphen | Zu simpel, keine Attribute, keine Visualisierung |
| **Nodges-JSON** | JSON | Visual-Mapping-System, Ontologie-Trennung, Physik-Channels, LLM-optimiert | Kein externer Standard, keine Tool-Interoperabilitaet |

---

## 5. Strategische Bewertung

### Option A: Komplett zu GEXF wechseln
- **Verlust**: ~70% der Nodges-spezifischen Faehigkeiten
- **Gewinn**: Tool-Interoperabilitaet, Dynamik
- **Empfehlung**: Nein

### Option B: GEXF als Import/Export-Format
- **Verlust**: Keiner
- **Gewinn**: Datenaustausch mit Gephi, NetworkX etc.
- **Aufwand**: GEXF-Parser/Exporter in FileHandler.ts
- **Empfehlung**: Ja, sinnvoll als Ergaenzung

### Option C: Nodges-JSON zum dokumentierten Standard machen
- Das Nodges-JSON-Schema ist bereits durch Zod formal definiert
- Mit `zod-to-json-schema` (bereits in den Dependencies!) laesst sich ein offizielles JSON-Schema generieren
- Dieses Schema koennte als `.schema.json` veroeffentlicht werden
- LLMs koennten dieses Schema direkt im Prompt referenzieren
- **Empfehlung**: Ja, hoechste Prioritaet

### Option D: Hybrid -- GEXF-Dynamik uebernehmen
- Die `Spells`-Logik von GEXF in das bestehende `temporal`-System integrieren
- Hierarchische Nodes via `parentId`-Feld ergaenzen
- Kein Formatwechsel, nur Feature-Uebernahme
- **Empfehlung**: Ja, mittelfristig sinnvoll

---

## 6. Fazit

GEXF ist ein solides Austauschformat, aber es ist ein **Datencontainer**, kein **Visualisierungsregelwerk**. Nodges' Staerke liegt nicht darin, *wo* die Daten gespeichert werden, sondern *wie* Daten in visuelle Kanaele uebersetzt werden. Das Visual-Mapping-System mit seinen Funktionen, Domains, Ranges und Physik-Channels ist das Alleinstellungsmerkmal.

Der beste Weg:
1. **Nodges-JSON als Standard formalisieren** (JSON-Schema aus Zod generieren)
2. **GEXF als Import/Export** unterstuetzen (Interoperabilitaet)
3. **Dynamik-Features von GEXF adoptieren** (Spells, Hierarchien)
