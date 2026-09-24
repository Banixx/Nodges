# Erklaerung: Geltungsbereich der Textattribut-Normalisierung

## Frage
Was ist mit Geltungsbereich gemeint, dort wo es angewendet werden kann?

## Antwort
Ja, genau das ist damit gemeint: Der Geltungsbereich beschreibt alle konkreten Visualisierungseigenschaften und Systemkomponenten in Nodges, auf welche die automatische Text-zu-Zahl-Umwandlung (0 bis 100) angewendet wird.

## Detaillierte Aufschluesselung des Geltungsbereichs

### 1. Knoten-Eigenschaften (Nodes)
- **Positionen (`positionX`, `positionY`, `positionZ`)**: Textkategorien werden in gleichmaessig verteilte Raumkoordinaten umgerechnet.
- **Groesse (`size`)**: Textkategorien steuern stufenlos die physische Groesse des Knotenobjekts.
- **Leuchten / Glow (`glow`)**: Textkategorien steuern die Intensitaet der Leucht-Aura.
- **Physik-Kraefte (`attraction`, `repulsion`, `inertia`)**: Textkategorien beeinflussen die physikalische Masse und Anziehungs-/Abstossungskraefte im Layout.

### 2. Kanten-Eigenschaften (Edges)
- **Dicke (`thickness`)**: Textkategorien bestimmen die Rohr-/Liniendicke der Verbindungen.
- **Opazitaet (`opacity`)**: Textkategorien steuern die Transparenz der Kanten.
- **Kruemmung (`curvature`)**: Textkategorien bestimmen den Biegungsgrad geschwungener Kanten.

### 3. Abgrenzung (Was nicht unter die 0-100 Skalierung faellt)
- **Diskrete Geometrie-Formen**: Die Auswahl von 3D-Formen (z. B. `sphere`, `cube`, `cone`) verwendet ein festes Zuordnungs-Schema statt eines stufenlosen 0-100 Wertes.
- **Diskrete Farb-Paletten**: Wenn jeder Textkategorie eine eigenstaendige Farbe aus einer Palette zugewiesen wird (statt einer stufenlosen 0-100 Farbskala/Heatmap).
