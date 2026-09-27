# 08 Visuelle Effekte und Feedback-Systeme

Dieses Kapitel behandelt die visuelle Rueckkopplung und Feedback-Architektur von Nodges in Version **0.106.8**. Es beschreibt, wie differenzierte Hervorhebungen (*Highlights*), prozedurale Shader, Pulsationseffekte und Kantenstroeme dem Anwender intuitive Orientierung in dreidimensionalen Informationsraeumen bieten.

---

## 1. Das Highlight-System (`HighlightManager`)

Der `HighlightManager` koordiniert saemtliche visuellen Selektions-, Hover- und Fokus-Zustaende von Knoten und Kanten, um visuelle Konflikte und Speicherlecks (Material-Leaks) auszuschliessen.

### 1.1 Zustandssicherung und Material-Wiederherstellung
Bevor ein Objekt durch Farbe, Leuchten (*Emissive*) oder Skalierung hervorgehoben wird, sichert der Manager den urspruenglichen Materialzustand im internen Zwischenspeicher. Nach Beendigung der Interaktion (z. B. Unhover oder Deselektion) wird exakt der Ausgangszustand wiederhergestellt. Dadurch wird verhindert, dass temporaere Effekte permanente Materialaenderungen im Szenengraphen hinterlassen.

### 1.2 Die Prioritaeten-Kaskade

> **Visualisierung:** Siehe [08_HighlightPrioritaetsKaskade_001.mmd](08_HighlightPrioritaetsKaskade_001.mmd)

Da ein Element gleichzeitig mehrere Gruende fuer ein optisches Feedback aufweisen kann (z. B. Teil eines Suchergebnisses waehrend des Maus-Hoverns), greift eine deterministische Prioritaetenordnung:

```
[1. SELECTION] (Hoechste Prioritaet) ──► Aktiver Benutzerfokus & Detailanalyse
      ▲
[2. SEARCH]                          ──► Relevanztreffer einer Filterabfrage
      ▲
[3. PATH]                            ──► Pfadverbindung / kuerzeste Route
      ▲
[4. HOVER]     (Niedrigste Prioritaet)──► Kurzzeitige Mauszeiger-Beruehrung
```

1. **SELECTION (Prioritaet 1):** Das Objekt ist aktiv selektiert. Dieses Highlight ueberschreibt alle anderen Darstellungsformen und bleibt auch bei Mausbewegungen stabil erhalten.
2. **SEARCH (Prioritaet 2):** Hebt Knoten hervor, die einer aktiven Such- oder Filterabfrage entsprechen (z. B. leuchtendes Cyan oder Magenta).
3. **PATH (Prioritaet 3):** Visualisiert Kausal- oder Verbindungsrouten. Alle nicht auf dem Pfad liegenden Knoten werden gedaempft (*Ghosting*).
4. **HOVER (Prioritaet 4):** Gibt fluechtiges Feedback ueber die Interaktionsfaehigkeit eines Elements unter dem Cursor.

---

## 2. Highlight-Modi und Wahrnehmungspsychologie

### 2.1 Hover-Modus (Feedback der Erreichbarkeit)
- **Knoten:** Erhoehung der Helligkeit (Luminanzboost um ca. 30 %) der Grundfarbe signalisiert: "Dieses Element reagiert auf Klick".
- **Kanten:** Aufhellung und Verstaerkung des Linienkontrasts bei gleichzeitiger Hervorhebung der beiden Endknoten.

### 2.2 Selection-Modus (Aufmerksamkeitsanker)
- **Emissive Glow:** Der Knoten erhaelt einen intensiven Leuchtwert ueber das Three.js-Material.
- **Nachbarschafts-Aufhellung (1st-Degree Neighbors):** Um den lokalen Systemkontext offenzulegen, werden alle direkt verbundenen Nachbarknoten und Inzidenzkanten mitsamt ihren Labels hervorgehoben, waehrend entfernte Netzwerkteile dezent abgedunkelt werden.

### 2.3 Ghosting-Effekt (Fokussierung bei Such- und Pfadmodi)
Anstatt unbeteiligte Knoten vollstaendig auszublenden (was die raeumliche Gesamtstruktur zerstoeren wuerde), reduziert Nodges deren Deckkraft auf `opacity: 0.1` bis `0.15`. Der Anwender behaelt die globale Landmarken-Orientierung, waehrend der informative Pfad kontrastreich im Vordergrund steht.

---

## 3. Shader und Atmosphaerische Effekte

> **Visualisierung:** Siehe [08_ShaderUndEffekte_002.mmd](08_ShaderUndEffekte_002.mmd)

### 3.1 Der "Breathing" Glow-Oszillator
Um selektierten Entitaeten eine organische, lebendige Praesenz zu verleihen, moduliert ein mathematischer Sinus-Oszillator die Leuchtintensitaet:

$$\text{Intensity}(t) = I_{\text{base}} + A \cdot \sin(2\pi \cdot f \cdot t)$$

- **Standardfrequenz:** $f = 0{,}5\text{ Hz}$ (ein vollstaendiger Atemzyklus alle zwei Sekunden).
- Dieser weiche, sinusfoermige Verlauf wirkt beruhigend und hochwertig, waehrend ein hartes Rechteck-Blinken kognitive Irritationen erzeugen wuerde.

### 3.2 Performante Halo-Geometrien (Outline-Alternative)
Schwere Post-Processing-Sobel-Shader zur Kantenhervorhebung wuerden auf mobilen Geraeten und Laptops spuerbare Bildratenverluste verursachen. Nodges setzt fuer Entitaets-Outlines auf eine ressourcenschonende Geometrie-Technik:
- Ein dupliziertes Mesh wird um ca. 35 % bis 40 % groesser skaliert.
- Dem Klon wird ein transparentes Material (`opacity: 0.25`, `depthWrite: false`) zugewiesen.
- Der Halo wird hinter dem Hauptknoten gezeichnet und erzeugt einen weichen, diffusen Glashof bei minimaler GPU-Last.

### 3.3 Kanten-Partikelfluss (Flow Animation)
Auf Kanten koennen prozedurale Partikel oder Shader-Textur-Verschiebungen aktiviert werden, die entlang der Bezier-Kurve stroemen. Die Frequenz und Geschwindigkeit spiegeln dynamische Datenwerte wider (z. B. Paketuebertragungsrate, Geldflussvolumen oder neuronale Signalstaerke).
