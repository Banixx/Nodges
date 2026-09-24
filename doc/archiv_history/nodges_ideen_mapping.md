# Nodges: Visuelles Mapping und Semantik

Dieses Dokument vertieft die theoretischen Konzepte hinter dem Mapping in Nodges. Ziel ist es, abstrakte Daten durch geeignete visuelle Variablen intuitiv begreifbar zu machen.

## 1. Kernkonzepte des intuitiven Mappings

**Visuelle Metaphern (Visual Metaphors):** 
Du übersetzt einen abstrakten Zustand (z. B. eine bröckelnde oder gelöste emotionale/rechtliche Bindung) in eine physikalische Eigenschaft (eine dünne, verblassende Linie). Das Gehirn versteht "dünn" intuitiv als "schwach" oder "weniger wichtig".

**Semantisches Mapping (Semantic Mapping):** 
Das bedeutet, dass die Wahl der visuellen Variable (hier: Liniendicke und Farbintensität) eine direkte inhaltliche Bedeutung trägt und nicht nur rein zufällig zur Unterscheidung dient (wie es bei einer willkürlichen Wahl von "blau vs. rot" der Fall wäre).

**Präattentive Wahrnehmung (Preattentive Processing):** 
Das menschliche Auge erfasst Kontraste (dick/dünn, hell/dunkel) in wenigen Millisekunden unterbewusst, noch bevor der Text (z. B. das Label "geschieden") überhaupt gelesen wird.

## 2. Weitere relevante Fachbegriffe und Konzepte im Nodges-Kontext

### Kognitive Entlastung (Cognitive Offloading)
**Allgemein:** Indem Informationen durch visuelle Merkmale (Form, Farbe, Dicke, Transparenz) kodiert werden, muss das Gehirn weniger Text lesen und interpretieren. Die hochgradig optimierte "visuelle Engine" des Menschen übernimmt die Arbeit.
**In Nodges:** Wenn ein Graph hunderte Knoten umfasst, ist es unmöglich, hunderte Info-Panels zu lesen. Nodges "lagert" diese kognitive Arbeit in die 3D-Grafikkarte (bzw. das visuelle System des Users) "aus". Wenn der User im Mapping-Panel den Regler für die Eigenschaft `Einflussscore` auf die visuelle Variable `size` zieht, poppen sofort die einflussreichsten Sphären im 3D-Raum auf. Das Gehirn muss nicht mehr "80 > 20" rechnen; es sieht einfach, dass eine Kugel massiver ist als die andere. Der Nutzer begreift die Gewichtsverteilung des Systems in einem Sekundenbruchteil.

### Gestaltgesetze (Gestalt Principles)
**Allgemein:** Prinzipien der Wahrnehmungspsychologie, die erklären, wie Menschen Muster und Gruppierungen erkennen.
**In Nodges:** Das Tool macht sich diese Gesetze bei jedem Render-Frame zunutze:
- *Gesetz der Ähnlichkeit:* Mappt der User kategorische Daten (z. B. `Server-Region` oder `Geschlecht`) auf die Farbe, erkennt er im 3D-Raum sofort "Wolken" von gleichfarbigen Sphären. Das Gehirn gruppiert sie unbewusst zu einem Sub-System.
- *Gesetz der Nähe:* Die Force-Directed-Layout-Algorithmen von Nodges berechnen physikalische Anziehung (Attraction) und Abstoßung (Repulsion). Stark vernetzte Einheiten ziehen sich zusammen und bilden räumlich isolierte Inseln. Der Nutzer erkennt rein an der 3D-Verortung, wo die dichtesten Cluster des Systems liegen.
- *Gesetz des gemeinsamen Schicksals (Common Fate):* Wenn Kanten animiert sind (z. B. durch die Mapping-Funktion `pulse`, um Datenfluss zu simulieren), werden alle Knoten, durch die dieser Puls fließt, als zusammenhängende, interaktive Einheit wahrgenommen.

### Ikonizität (Iconicity)
**Allgemein:** Beschreibt, wie stark ein physikalisches Zeichen dem ähnelt, wofür es inhaltlich steht (die "Bildhaftigkeit" eines Symbols).
**In Nodges:** Nodges nutzt die physikalischen Eigenschaften von Three.js (Geometrien, Liniendicken), um Ikonizität zu erzeugen. Eine Kante, die einen gewaltigen Datenstrom oder eine tiefe biologische Abstammung repräsentiert, wird durch das Mapping nicht nur farblich hervorgehoben, sondern bekommt eine massive Dicke (`thickness`). Eine hauchdünne, kaum sichtbare Kante hingegen sieht im 3D-Raum fragil aus – sie repräsentiert ikonisch das "Reißen" oder "Einschlafen" einer Verbindung (z. B. eine Scheidung oder ein Netzwerkausfall). Die Grafik imitiert die physische Realität der Daten.

### Affordanz (Affordance / Angebotscharakter)
**Allgemein:** Die Eigenschaft eines Objekts, die durch ihre Formgebung intuitiv suggeriert, wie man mit ihm interagieren kann oder sollte.
**In Nodges:** Die 3D-Elemente kommunizieren mit dem User. Wenn über das semantische Mapping ein Ausnahmezustand (z. B. `error: true` oder `schwanger: true`) auf einen Leuchteffekt (`glow`) oder eine Animation gemappt wird, bricht dieser Knoten visuell aus der Stille des Graphen aus. Eine leuchtende, pulsierende Sphäre im ansonsten ruhigen 3D-Raum hat eine extrem hohe Affordanz: Sie schreit förmlich "Hier weiche ich vom Normalzustand ab, klick mich an!". Sie gibt dem User den intuitiven Handlungsimpuls, die Maus genau dorthin zu bewegen und das Info-Panel zu öffnen.

### Signal-Rausch-Verhältnis (Signal-to-Noise Ratio)
**Allgemein:** Das Prinzip, essenzielle Informationen (Signal) von irrelevantem Kontext (Rauschen) zu trennen, ohne den Gesamtkontext zu zerstören.
**In Nodges:** In komplexen Netzwerken entsteht schnell das gefürchtete "Hairball"-Problem (ein unleserliches Wollknäuel). Nodges löst dies elegant über das `opacity` (Deckkraft)-Mapping. Anstatt Knoten (wie "Verstorbene" oder "Offline-Geräte") hart aus dem Speicher zu löschen und den Graphen ruckartig in sich zusammenfallen zu lassen, senkt das Mapping ihre Deckkraft auf beispielsweise 10%. Das unwichtige "Rauschen" tritt als geisterhafter Schatten in den Hintergrund. Die Topologie und der Kontext des Graphen bleiben erhalten, aber das "Signal" (die verbleibenden aktiven, fokussierten Knoten mit 100% Deckkraft) tritt kristallklar hervor.
