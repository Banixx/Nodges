# Konzept-Analyse: Attribute-Normalisierung im Mapping Panel

## Fragestellung des Anwenders
1. Werden Farben auch normalisiert?
2. Macht es Sinn, einfach alle Attribute vornormalisiert fuer das Mapping Panel zu hinterlegen?

## Antworten und technische Bewertung

### 1. Normalisierung bei Farben
- **Bei kontinuierlichen numerischen Attributen (z. B. `degree`, `created_at`)**: Ja, hier ist eine Normalisierung auf den Bereich [0, 1] erforderlich, um den Wert auf einer Farbskala (Heatmap / Lerp zwischen zwei Farben) stufenlos abzubilden.
- **Bei kategorialen Text-Attributen (z. B. `entity_type`)**: Nein, hier wird keine [0, 1]-Skalierung genutzt, sondern ein kategoriales Farb-Mapping (Zuordnung diskreter Farben pro Kategorie aus einer Farbpalette).

### 2. Sinnhaftigkeit einer pauschalen Vornormalisierung aller Attribute
- **Fuer numerische Attribute (Sinnvoll)**:
  Alle Zahlenwerte sollten beim Einlesen automatisch mit Min/Max analysiert und auf den Bereich [0, 1] vornormalisiert werden. Das vereinfacht das Mapping auf Positionen, Groessen, Transparenz und Farbskalen erheblich.
- **Fuer kategoriale Text-Attribute (Nicht sinnvoll als Zahl [0, 1])**:
  Textwerte wie Namen, Pfade oder Typen haben keine natuerliche mathematische Reihenfolge. Eine Umwandlung von Text in ein Zahlenintervall [0, 1] fuehrt zu willkuerlichen Distanzen im 3D-Raum.
- **Empfohlenes System-Verhalten**:
  1. Datentyp-Erkennung beim Import (Numerisch vs. Kategorial).
  2. Numerische Attribute automatisch auf [0, 1] normalisieren.
  3. Kategoriale Attribute als geordnete/ungeordnete Mengen hinterlegen und fuer Farben/Geometrien als Kategorie-Palette anbieten.
