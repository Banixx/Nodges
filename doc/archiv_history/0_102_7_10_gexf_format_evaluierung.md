# Evaluierung des GEXF-Formats als Alternative zu JSON in Nodges

Die Verwendung des GEXF-Formats (Graph Exchange XML Format) anstelle des aktuellen Nodges-JSON-Formats fuer die interne Datenhaltung und Generierung ist nicht ratsam; die Bereitstellung als Import- und Export-Schnittstelle bietet jedoch erhebliche Vorteile fuer die Interoperabilitaet.

---

## 1. Gegenueberstellung: GEXF vs. Nodges-JSON

Die folgende Tabelle vergleicht die Eignung beider Formate fuer die Kernanforderungen von Nodges:

| Kriterium | GEXF (XML) | Nodges-JSON |
| :--- | :--- | :--- |
| **LLM-Generierbarkeit** | Schlecht (hohe XML-Fehlerrate bei Tags, kein nativer Structured Output Support) | Exzellent (Zod-to-JSON-Schema, hochgradig optimiert fuer Structured Outputs) |
| **Token-Effizienz** | Sehr gering (verbose XML-Tags erhoehen Token-Verbrauch um das 2- bis 3-fache) | Sehr hoch (kompakte Key-Value-Paare sparen Generierungskosten) |
| **Parsing-Performance** | Niedrig (erfordert DOMParser und XML-Traversierung im Browser) | Extrem hoch (natives `JSON.parse` ist im Webbrowser hochgradig optimiert) |
| **Visual Mapping & Ontologie**| Statisch (speichert nur fertige Werte wie Farbe oder Position) | Dynamisch (speichert flexible Mapping-Regeln, Presets und Ontologie-Layer) |
| **Interoperabilitaet** | Sehr hoch (Unterstuetzung durch Gephi, NetworkX, Cytoscape und R) | Gering (propriaetaeres Format, nur in Nodges nutzbar) |
| **Erweiterbarkeit** | Komplex (erfordert Namespaces wie `viz:` oder benutzerdefinierte Attribute) | Einfach (beliebige Objekte und Metadaten koennen direkt geschachtelt werden) |

---

## 2. Analyse der Einsatzszenarien

### A. GEXF beim Erstellen eines Systems (LLM-Generierung)
Die direkte Generierung von XML-basiertem GEXF durch ein LLM waehrend der Systemerstellung ist mit schwerwiegenden Nachteilen verbunden:
1. **Fehleranfaelligkeit**: LLMs neigen bei XML-Ausgaben zu Syntaxfehlern (unvollstaendige End-Tags, falsche Namespaces). JSON-Ausgaben koennen ueber moderne APIs (z. B. OpenAI Structured Outputs) mit einem JSON-Schema erzwungen werden, was eine 100%ige Syntaxkorrektheit garantiert.
2. **Kosten und Latenz**: XML erfordert deutlich mehr Zeichen als JSON. Ein Graph mit 100 Knoten und Kanten verbraucht bei der Generierung als GEXF ein Vielfaches an Token, was die Latenz erhoeht und die API-Kosten in die Hoehe treibt.
3. **Validierung**: Nodges validiert eingehende Graphen robust mit Zod. Die Validierung von komplexen XML-Strukturen ist in TypeScript deutlich aufwaendiger und weniger elegant als die direkte Validierung von JSON-Objekten.

### B. GEXF als natives Speicherformat (Datenhaltung)
Ein vollstaendiger Ersatz des JSON-Formats durch GEXF wuerde die Kernfunktionalitaet von Nodges einschraenken. Das Herzstueck von Nodges ist die Trennung von Ontologie, Rohdaten und Visual Mapping.
* GEXF speichert visuelle Eigenschaften statisch (z. B. `<viz:color r="255" g="0" b="0"/>`).
* Nodges benoetigt das Wissen darueber, *warum* eine Farbe rot ist (z. B. ein dynamisches Visual Mapping, das den Attributwert "Gefahr" auf eine rote Farbpalette abbildet). Diese logischen Verknuepfungen lassen sich in GEXF nicht standardkonform speichern.

### C. GEXF als Import- und Export-Schnittstelle (Lesbarkeit und Austausch)
Der Import und Export von GEXF-Dateien ist bereits ueber den `ImportManager` und `ExportManager` rudimentaer integriert. Dies sollte weiter ausgebaut werden:
1. **Import-Optimierung**: Beim Einlesen einer `.gexf`-Datei sollten die Attribute automatisch analysiert und in ein dynamisches Nodges-`dataModel` sowie passende `visualMappings` konvertiert werden. Dadurch wird die statische Datei im System vollstaendig interaktiv.
2. **Export-Ausbau**: Der Export von Nodges-Graphen als `.gexf` ermoeglicht es Benutzern, ihre 3D-Szenen in professionellen Analysetools wie Gephi weiterzubearbeiten.

---

## 3. Fazit und Empfehlung

Ein Wechsel des primaeren Speicher- und Generierungsformats von JSON auf GEXF wird **dringend abgelehnt**. Das native JSON-Format ist fuer die KI-gestuetzte Pipeline und das dynamische Rendering in Three.js unverzichtbar.

Empfohlen wird stattdessen ein **hybrider Ansatz**:
1. **JSON als Kernformat beibehalten**: Interne State-Verwaltung, LLM-Schnittstellen und Speicherung nutzen weiterhin das massgeschneiderte JSON-Schema.
2. **GEXF als First-Class Import/Export**: Der GEXF-Parser im `ImportManager` und der Serializer im `ExportManager` werden weiter ausgebaut, um beim Import automatisch Standard-Mappings zu generieren und beim Export moeglichst viele Metadaten verlustfrei in XML-Attribute zu uebertragen.
