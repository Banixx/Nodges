# Beispiel: Systemische Betrachtung von Ergotherapie & Arbeitsagogik in Nodges

Dieses Dokument beschreibt die Gemeinsamkeiten und Unterschiede von Ergotherapie und Arbeitsagogik. Es strukturiert die Konzepte und Schnittmengen der beiden Disziplinen in Form eines interaktiven, dreidimensionalen Graphen in Nodges.

## Visual Mappings im Vergleichsmodell

1. **Farbe nach Disziplin-Fokus (Bipolar):**
   Das Attribut `disziplin_fokus` drueckt aus, wie stark ein Konzept der jeweiligen Profession zugeordnet ist. Es reicht von `-1.0` (reine Ergotherapie) bis `1.0` (reine Arbeitsagogik).
   - Ergotherapie-Konzepte leuchten in Blau (`#2980b9`).
   - Arbeitsagogik-Konzepte leuchten in Orange (`#e67e22`).
   - Gemeinsame Konzepte der Schnittmenge (`disziplin_fokus: 0.0`) werden als neutrale Mischfarbe (Mischung aus Blau und Orange, z.B. ein erdiger Violett/Grau-Ton) dargestellt.

2. **Knotengroesse und Leuchten nach Wichtigkeit (Kategorisch/Boolean):**
   Die Eigenschaft `ist_kern` markiert essentielle Schluesselbegriffe und Professionen.
   - Kernkonzepte werden groesser dargestellt (`size: 2.5`).
   - Sie erhalten im 3D-Raum einen pulsierenden Leuchteffekt (`glow: 1.0`), um die zentralen Knotenpunkte sofort hervorzuheben.

3. **Verbindungsstaerke (Linear):**
   Die Eigenschaft `staerke` der Beziehungen beeinflusst die Kantenbreite (`thickness`). Eng verknuepfte Pfade (wie das Medium der jeweiligen Profession, `staerke: 1.0`) werden dicker gezeichnet, waehrend indirekte Zusammenhaenge duenner dargestellt werden.

4. **Praxis-Datenfluss (Pulsierende Animation):**
   Das Attribut `aktivitaet` steuert das Pulsieren entlang der Kanten. Die Haupt-Therapie- und Agogikprozesse pulsieren schneller und visualisieren so den dynamischen Arbeits- und Therapieprozess.

## Systemische Einteilung der Knoten

- **Philosophische Basis & Schnittmengen** (Zentral angeordnet, `disziplin_fokus: 0.0`):
  - *Mensch-Umwelt-System* (Systemischer Ausgangspunkt)
  - *Ressourcenorientierung* (Arbeitsweise)
  - *Umweltanpassung* (Methodik)
  - *Sinnhaftigkeit & Selbstwirksamkeit* (Triebfeder)
  - *Gesellschaftliche Teilhabe & Integration* (Gemeinsames Hauptziel)

- **Ergotherapie-Fokus** (Links angeordnet, `disziplin_fokus: -1.0` bis `-0.4`):
  - *Ergotherapie* (Profession)
  - *Bio-psycho-soziales System* (Systemfokus)
  - *Betaetigung (Occupation)* (Zentrales Medium)
  - *Handlungsfaehigkeit im Alltag* (Spezifisches Ziel)
  - *Gesundheitliche & kognitive Grundlagen* (Basis fuer Arbeit)

- **Arbeitsagogik-Fokus** (Rechts angeordnet, `disziplin_fokus: 0.4` bis `1.0`):
  - *Arbeitsagogik* (Profession)
  - *Sozio-oekonomisches System* (Systemfokus)
  - *Arbeit (produktive Taetigkeit)* (Zentrales Medium)
  - *Handlungsfaehigkeit im Beruf* (Spezifisches Ziel)
  - *Berufliche Integration* (Ziel)

## Zusammenspiel in der Praxis
Besonders hervorzuheben ist die Kante zwischen **Gesundheitliche & kognitive Grundlagen** und **Handlungsfaehigkeit im Beruf**. Sie visualisiert den fliessenden Uebergang: Die Ergotherapie schafft die gesundheitlichen Voraussetzungen, auf denen die Arbeitsagogik fuer die Integration in den Arbeitsprozess aufbaut.
