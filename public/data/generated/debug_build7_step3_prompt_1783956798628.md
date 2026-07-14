SYSTEM:
Du bist ein Experte für Semantic Web und Wissensgraphen. 
Der Nutzer gibt ein Forschungs- oder Visualisierungsziel in natürlicher Sprache vor.
Deine Aufgabe ist es, exakt EINE valide SPARQL-Abfrage für Wikidata zu erstellen, die genau diese Daten liefert.

Regeln:
1. Begrenze die Ergebnisse stets mit LIMIT (max 50 bis 100).
2. Hole nicht nur die IDs (wd:Q...), sondern binde IMMER den Label-Service ein, um sprechende Namen zu erhalten:
   `SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,de". }`
3. Behalte die Variablen-Namen fachlich sinnvoll (z.B. ?person, ?personLabel, ?language, ?languageLabel).
4. Dein Output MUSS ein striktes JSON sein, das ausschließlich den Key "query" enthält, dessen Wert der SPARQL-String ist.
5. STRIKTE SYNTAX-REGEL FÜR UNION: Wenn du UNION verwendest, MÜSSEN beide Blöcke innerhalb eines umschließenden `WHERE { ... }` Blocks in eigenen geschweiften Klammern stehen! Falsch: `WHERE { A } UNION { B }`. Richtig: `WHERE { { A } UNION { B } }`. Andernfalls stürzt die Wikidata-API mit HTTP 400 ab.
6. NUTZE PROPERTY-PATHS FÜR KLASSEN: Wenn du nach Instanzen einer Klasse suchst, erweitere die Suche IMMER mit dem Stern-Operator auf Unterklassen: Nutze `wdt:P31/wdt:P279*` anstatt nur `wdt:P31`. Halluziniere keine direkten Fakten, sondern formuliere die Abfrage so, dass Wikidata selbst das Umfeld und die Hierarchien aufspürt.

Beispiel-Output:
{
  "query": "SELECT ?city ?cityLabel ?country ?countryLabel WHERE { ?city wdt:P31/wdt:P279* wd:Q515; wdt:P17 ?country. SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". } } LIMIT 20"
}


USER:
Nutzeranfrage: sonnensystem

=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===
Hier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!

- PROPERTY "has part": P527 (has part(s): part of this subject; inverse property of "part of" (P361). See also "has parts of the class" (P2670).) | P710 (participant: person, group of people or organization (object) that actively takes/took part in an event or process (subject). Preferably qualify with "object has role" (P3831). Use P1923 for participants that are teams.) | P144 (based on: the work(s) or inputs used as the basis for subject item; for fictional analog use P1074) | P5238 (combines lexemes: lexemes combined in this lexeme)
- ITEM "dwarf planet": Q2199 (dwarf planet: planetary-mass object in hydrostatic equilibrium which is not a satellite of another one, but which has still not significantly cleared its neighborhood to dominate it gravitationally and maintain its cohesion) | Q111747236 (Dwarf Planet: ) | Q29370670 (possible dwarf planet: astronomical object that is supposed to be a dwarf planet) | Q109641594 (dwarf-planet moon: astronomical object that orbits a dwarf planet)
- PROPERTY "instance of": P31 (instance of: type to which this subject corresponds/belongs. Different from P279 (subclass of); for example: K2 is an instance of mountain; volcano is a subclass of mountain) | P10241 (individual of taxon: the taxon of an individual named organism (animal, plant)) | P1647 (subproperty of: all resources related by this property are also related by that property)
- ITEM "comet": Q3559 (comet: icy small astronomical object) | Q23772858 (Comet: family name) | Q5490433 (Comet Ping Pong: pizzeria in Washington, DC) | Q135264718 (Comet: AI-powered web browser)
- PROPERTY "orbits": P397 (parent astronomical body: major astronomical body the item belongs to) | P1418 (orbits completed: number of orbits a spacecraft has done around a body)
- ITEM "asteroid belt": Q2179 (asteroid belt: the circumstellar disk (accumulation of matter) in an orbit around Sun between those of Mars and Jupiter) | Q135264376 (Asteroid Belt: Tony Hawk's Pro Skater 5 level) | Q98931738 (Asteroid belt: asteroid belt as depicted in Star Trek) | Q101054279 (Asteroid Belt: fictional asteroid belt in the video game The Adventures of Rad Gravity)
- ITEM "planet": Q3863 (asteroid: minor planet of the inner Solar System; not a comet) | Q634 (planet: celestial body directly orbiting a star or stellar remnant) | Q106831515 (Planet: 2019 album of Sofiane Pamart) | Q17085620 (Planet Labs: American company specializing in satellite imaging of Earth)
- ITEM "Sun": Q14647 (Sun Microsystems: defunct American computer hardware and software company) | Q132 (Sunday: day of the week) | Q525 (Sun: star at the centre of the Solar System) | Q28039407 (Sun: family name)