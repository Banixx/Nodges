# Anleitung: Knotenabstand im Force-Directed Layout anpassen

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Problemstellung

Die Knoten haben sich durch das Force-Directed Layout erfolgreich in Haufen (Cluster) strukturiert. Innerhalb der Haufen liegen die Knoten jedoch noch sehr nahe beieinander und ueberlappen sich optisch.

---

## 2. Loesungsschritte in Nodges

### Schritt 1: Layout-Engine aufklappen
Klicken Sie in der rechten Spalte auf die Zeile **`⚙ Layout-Engine`** (den Text oder den kleinen Pfeil). Dadurch oeffnet sich das Parameter-Menue.

### Schritt 2: Abstoessungskraft (Repulsion) erhoehen
- Suchen Sie den Regler **`repulsionStrength`** (Abstoessungskraft).
- Erhoehen Sie den Wert von standardmaessig `1000` auf **`3000` bis `5000`**.
- Dadurch stossen sich nahe Knoten deutlich staerker voneinander ab.

### Schritt 3: Anziehungskraft (Attraction) senken
- Suchen Sie den Regler **`attractionStrength`** (Anziehungskraft).
- Senken Sie den Wert von `0.1` auf **`0.02` bis `0.05`**.
- Dadurch ziehen die Kanten die Knoten nicht mehr so eng zusammen.

### Schritt 4: Play-Button `▶` erneut druecken
Klicken Sie erneut auf **`▶`**, damit der LayoutWorker die neue Physik berechnet und die Knoten auseinanderschiebt.

---

## 3. Alternative Optionen

1. **Algorithmus `fruchterman-reingold` testen:**
   Im aufgeklappten Layout-Engine-Menue den Algorithmus auf **`Fruchterman-Reingold`** umstellen und den Parameter **`area`** auf `800` bis `1000` stellen. Dieser Algorithmus verteilt Cluster gleichmaessiger.

2. **Knotengroesse anpassen:**
   Falls die Kugelkoerper optisch zu gross wirken, ziehen Sie im Mapping-Panel das Attribut `Grösse` leicht herunter.
