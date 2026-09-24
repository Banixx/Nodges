# Nodges -- Visuelle Kommunikationsstrategien

Dieses Dokument denkt ueber den Tellerrand hinaus: Welche kreativen
Moeglichkeiten bietet Nodges zur visuellen Kommunikation von Systemen?

---

## 1. Die 7 Dimensionen der visuellen Kommunikation

Ein Node in Nodges kann theoretisch in **7 gleichzeitigen Dimensionen** Informationen tragen:

| Dimension | Visueller Kanal | Wahrnehmung | Kapazitaet |
|---|---|---|---|
| 1. **Raum** | Position (X, Y, Z) | Sofort, preattentiv | 3 kontinuierliche Werte |
| 2. **Groesse** | Skalierung | Sofort, preattentiv | 1 kontinuierlicher Wert |
| 3. **Farbe** | Hue, Saturation, Lightness | Sofort, preattentiv | 1 kategorisch ODER 1 kontinuierlich |
| 4. **Form** | Geometrie | Schnell, bewusst | 5-7 unterscheidbare Formen |
| 5. **Bewegung** | Animation | Aufmerksamkeitslenkend | 1 Frequenz + 1 Amplitude |
| 6. **Transparenz** | Opacity | Bewusst | 3-4 unterscheidbare Stufen |
| 7. **Text** | Label | Langsam, lesend | Unbegrenzt, aber langsam |

### Goldene Regel
Maximal **4 Dimensionen gleichzeitig** nutzen, sonst Ueberforderung.
Empfehlung: Position + Farbe + Groesse + 1 Detail (Form ODER Animation).

---

## 2. Metaphern-Bibliothek

Systeme lassen sich durch verschiedene Metaphern kommunizieren:

### 2.1 Organismus-Metapher
- Nodes = Organe (verschiedene Formen)
- Edges = Blutbahnen/Nerven (Flow-Animation)
- Groesse = Gesundheit
- Farbe = Zustand (gruen = gesund, rot = krank)
- **Anwendung**: Medizin, Oekosysteme, Unternehmensgesundheit

### 2.2 Stadt-Metapher
- Nodes = Gebaeude (verschiedene Hoehen/Groessen)
- Edges = Strassen (verschiedene Breiten)
- Position = geographisch
- Farbe = Nutzungstyp (Wohnen, Gewerbe, Industrie)
- **Anwendung**: Stadtplanung, Infrastruktur, Logistik

### 2.3 Galaxie-Metapher
- Nodes = Sterne/Planeten (leuchtend, verschiedene Groessen)
- Edges = Gravitationsfelder (transparent, pulsierend)
- Groesse = Masse/Einfluss
- Glow = Aktivitaet
- **Anwendung**: Soziale Netzwerke, Einflussanalyse

### 2.4 Maschine-Metapher
- Nodes = Zahnraeder/Komponenten (rotierende Animation)
- Edges = Antriebsriemen (Flow-Animation)
- Dicke = Drehmoment/Kapazitaet
- Farbe = Temperatur (blau = kalt, rot = heiss)
- **Anwendung**: Prozessoptimierung, Supply Chain

### 2.5 Fluss-Metapher
- Nodes = Seen/Reservoirs (Groesse = Fuellstand)
- Edges = Fluesse (Flow-Animation, Dicke = Durchfluss)
- Farbe = Qualitaet (klar = blau, verschmutzt = braun)
- **Anwendung**: Ressourcenmanagement, Finanzsysteme

---

## 3. Explorative Strategien

### 3.1 Die Schichtung (Top-Down)
```
1. Gesamtuebersicht (alle Nodes, nur Farbe und Position)
2. Ebenen aktivieren (nur relevante Typen)
3. Layout anpassen (Cluster oder Hierarchie)
4. Groessen-Mapping aendern (wichtige Nodes hervorheben)
5. Kamera naeher (Labels erscheinen)
6. Node selektieren (Detail-Panel oeffnen)
7. Nachbarschaft erkunden (Neighborhood Highlight)
8. Pfad finden (zwischen zwei Nodes)
```

### 3.2 Die Fragestellung (Bottom-Up)
```
Frage: "Wer hat den groessten Einfluss?"
→ Groesse nach influence_score
→ Force-Layout (Hubs im Zentrum)
→ Glow-Intensitaet nach Verbindungsanzahl
→ Edge-Dicke nach Staerke

Frage: "Gibt es Cluster?"
→ Force-Layout berechnen
→ Farbe nach Community-Detection
→ Gruppen-Hull um erkannte Cluster

Frage: "Wie fliesst Information?"
→ Hierarchisches Layout
→ Edge-Flow-Animation
→ Pfad-Analyse von A nach B
```

### 3.3 Die Zeitreise (Temporal)
```
1. t=0: Startzustand laden
2. Play druecken
3. Beobachten wie sich Groessen/Farben aendern
4. Interessanten Moment finden → Pause
5. Snapshot speichern
6. Eingreifen (Edge kappen)
7. Weiter abspielen
8. Vergleichen: mit und ohne Eingriff
```

---

## 4. Unkonventionelle Ideen

### 4.1 Audio-visuelle Synopsie
- Jeder Node-Typ erzeugt einen eigenen Klang
- Groessere Nodes = lauterer Klang
- Naehe zur Kamera = Stereo-Positionierung
- Ergebnis: System "klingt" gesund oder dissonant

### 4.2 Haptisches Feedback (VR/XR)
- Controller vibriert bei Naehe zu hochaktiven Nodes
- Edges "ziehen" den Controller leicht
- Groesse fuehlt sich als Widerstand an

### 4.3 Duft-Kodierung (Gedankenexperiment)
- Kategorien durch Duefte unterscheiden
- Aehnliche Duefte = aehnliche Typen
- Sinnesubergreifende Erfahrung

### 4.4 Schrift als visuelles Element
- Nicht nur Label, sondern die **Schriftgroesse als Datendimension**
- Schriftart als Typ-Indikator (serif = alt, sans-serif = modern)
- Textfarbe unabhaengig von Node-Farbe

### 4.5 Negative Darstellung
- Statt "was ist da?" zeigen "was fehlt?"
- Luecken im Netzwerk hervorheben
- Fehlende Verbindungen als gestrichelte Edges
- Erwartete aber nicht vorhandene Nodes als Phantome

### 4.6 Fraktale Nodes
- Ein Node kann bei Zoom ein eigenes Sub-Netzwerk enthalten
- Rekursive Detaillierung
- System-in-System Darstellung

### 4.7 Schwarm-Simulation
- Nodes bewegen sich wie ein Schwarm (Boids-Algorithmus)
- Aehnliche Nodes fliegen zusammen
- Attraktive Edges erzeugen Formationsflug

---

## 5. Checkliste: "Ist meine Darstellung gut?"

| Kriterium | Frage |
|---|---|
| **Lesbarkeit** | Kann ich die wichtigsten Informationen in 5 Sekunden erfassen? |
| **Hierarchie** | Ist klar, was wichtig und was unwichtig ist? |
| **Konsistenz** | Bedeutet gleiche Farbe immer das Gleiche? |
| **Ueberladung** | Nutze ich mehr als 4 visuelle Dimensionen gleichzeitig? |
| **Kontext** | Behalte ich genug Kontext, wenn ich filtere? |
| **Vergleichbarkeit** | Kann ich zwei Nodes visuell vergleichen? |
| **Erzaehlung** | Erzaehlt die Visualisierung eine Geschichte? |
| **Barrierefreiheit** | Ist die Darstellung auch bei Farbenblindheit lesbar? |
| **Performance** | Reagiert die Darstellung fluessig (60 FPS)? |
| **Aesthetik** | Ist es schoen? (Ja, das zaehlt.) |
