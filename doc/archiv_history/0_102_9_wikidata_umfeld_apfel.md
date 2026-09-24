# Wikidata Umfeld: Das Apfel-Beispiel

Um Wikidata zu verstehen, muessen wir zwingend zwischen dem **Konzept** (was Wikidata speichert) und dem **physischen Objekt** (der Apfel auf deinem Tisch) unterscheiden.

## 1. Das spezifische Objekt (Dein Apfel)
Du hast einen physischen Apfel vor dir. In der realen Welt ist dieser Apfel:
- **Instanz von:** Schöner aus Boskoop
- **Zustand:** reif

*Wichtig:* Dein spezifischer Apfel existiert **nicht** in Wikidata. Wikidata ist eine Enzyklopädie für universelles, permanentes Wissen und keine Datenbank für temporäre Zustände (wie "reif" oder "faul") oder individuelle physische Kopien (wie "mein Apfel" oder "mein Auto").

## 2. Das Konzept in Wikidata (Der Boskoop)
Wikidata speichert stattdessen das abstrakte Konzept der Apfelsorte "Schöner aus Boskoop".

Sein Umfeld (das Graphen-Netzwerk) sieht in der Datenbank in etwa so aus:

### A. Klassifizierung (Die vertikale Achse)
- **Instanz von (`wdt:P31`)**: Apfelsorte (Item-ID: Q17513697)
  - *Bedeutung*: Der Boskoop ist ein konkreter Vertreter der Kategorie "Apfelsorte".
- **Unterklasse von (`wdt:P279`)**: Das Konzept "Apfelsorte" ist wiederum eine Unterklasse von "Sorte" und diese eine Unterklasse von "Pflanze".
  - *Nutzen*: Wenn du mit dem Stern-Operator (`wdt:P31/wdt:P279*`) nach allem suchst, was eine "Pflanze" ist, findet die Datenbank den Boskoop automatisch, da er über diese Kette vertikal mit der Pflanze verbunden ist.

### B. Eigenschaften und Relationen (Die horizontale Achse)
Anstelle von temporären Zuständen wie "ist reif" speichert Wikidata permanente Fakten über den Boskoop als Beziehungen zu anderen Knoten:
- **Herkunftsland (`wdt:P17`)**: Niederlande
- **Übergeordnetes Taxon (`wdt:P171`)**: Kulturapfel (Malus domestica)
- **Verwendung (`wdt:P366`)**: Backapfel, Tafelapfel
- **Erntezeitpunkt (`wdt:P...`)**: Oktober (als abstrakter Zeitraum, nicht als aktueller Zustand)

## Fazit für Nodges
Wenn ein User nach einem Objekt sucht, muss Nodges (über das LLM) verstehen, dass es nicht nach temporären Adjektiven ("reif") suchen darf, sondern die permanenten, strukturellen Verknüpfungen (horizontal wie Herkunft, vertikal wie Unterklasse) abfragen muss, um ein aussagekräftiges Umfeld im 3D-Raum darzustellen.
