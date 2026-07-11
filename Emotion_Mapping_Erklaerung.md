# Katalogisierung von Gefühlen und Skalen für das Mapping

Um Gefühle in Graphen für visuelle Darstellungen (wie Farbe, Kantendicke, Geschwindigkeit von Animationen) nutzbar zu machen, wurde eine Kombination aus kategorialen Emotionen und dem **Circumplex-Modell des Affekts** (nach James Russell) implementiert.

## 1. Das Gefühlsmodell (Circumplex)

Dieses Modell ordnet jede Emotion auf zwei kontinuierlichen Skalen ein:
- **Valenz (Valence):** -1.0 (sehr negativ) bis +1.0 (sehr positiv)
- **Erregung (Arousal):** 0.0 (sehr ruhig) bis 1.0 (sehr erregt/intensiv)

### Katalogisierte Gefühle in `gv4.json`

| Emotionstyp | Valenz (Farbspektrum) | Erregung (Intensität/Dicke) | Beschreibung |
|-------------|-----------------------|-----------------------------|--------------|
| **Liebe** | 0.9 | 0.6 | Sehr positiv, mittlere bis hohe Energie. |
| **Zuneigung** | 0.6 | 0.3 | Positiv, ruhige Energie. |
| **Vertrauen** | 0.5 | 0.2 | Positiv, sehr ruhig (oft bei "kind_von"). |
| **Zorn** | -0.8 | 0.8 | Sehr negativ, hohe Energie (wie Demeter zu Hades). |
| **Hass** | -0.9 | 0.8 | Extrem negativ, hohe Energie. |
| **Neid** | -0.6 | 0.6 | Negativ, erhöhte Energie. |
| **Eifersucht** | -0.7 | 0.7 | Negativ, hohe innere Anspannung. |
| **Angst** | -0.8 | 0.7 | Negativ, hohe Erregung durch Fluchtreflex. |
| **Trauer** | -0.7 | 0.2 | Negativ, sehr geringe Energie. |
| **Freude** | 0.8 | 0.7 | Positiv, hohe Energie. |
| **Neutral** | 0.0 | 0.0 | Keine ausgeprägte emotionale Färbung. |

## 2. Anwendung im Visual Mapping Panel

Diese Werte wurden in `gv4.json` als Eigenschaften bei den Kanten (Edges) hinterlegt. So können sie im Nodges Mapping Panel wie folgt angesprochen werden:
- `emotion_category` (categorical): Eignet sich für diskrete Farbzuweisungen (z.B. Hass = Rot, Liebe = Pink).
- `emotion_valence` (continuous: -1 bis 1): Eignet sich hervorragend für einen Farbverlauf (Gradient), z.B. von tiefrot (-1) über grau (0) zu leuchtend grün (+1).
- `emotion_arousal` (continuous: 0 bis 1): Eignet sich für die Dicke (Thickness) einer Kante oder für die Partikel-Geschwindigkeit (Speed), da hohe Erregung visuell durch Bewegung oder Masse übersetzt wird.

## 3. Weitere Skalen für das Knoten-Mapping (Nodes)

Um nicht nur Kanten, sondern auch Knoten sinnvoll kontinuierlich zu mappen, wurden weitere quantitative Skalen identifiziert und in `gv4.json` integriert:

- **Degree (Zentralität):** Für jeden Knoten wurde die Anzahl seiner Kanten berechnet. Ein hoher `degree`-Wert bedeutet, dass die Entität stark vernetzt ist (wie Zeus). Das ist eine perfekte kontinuierliche Skala für die Knoten-Größe (Node Size).
- **Generation:** Diese bereits in den Daten vorhandene Eigenschaft ist numerisch (z.B. 1, 2, 3) und kann als kontinuierliche Skala genutzt werden, z.B. für die Y-Position im 3D-Raum (ältere Generationen sind weiter oben).
