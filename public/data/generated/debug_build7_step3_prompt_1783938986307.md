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

Beispiel-Output:
{
  "query": "SELECT ?city ?cityLabel ?country ?countryLabel WHERE { ?city wdt:P31 wd:Q515; wdt:P17 ?country. SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". } } LIMIT 20"
}


USER:
Nutzeranfrage: USER: sonnensysstem

KI: Möchtest du die Planeten des Sonnensystems, deren Monde oder auch Zwergplaneten und andere Himmelskörper wie Asteroiden visualisieren?

USER: sonne, planeten, momde und zwergplaneten ja, asteroiden nein.

=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===
Hier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!

- ITEM "dwarf planet": Q2199 (dwarf planet: planetary-mass object in hydrostatic equilibrium which is not a satellite of another one, but which has still not significantly cleared its neighborhood to dominate it gravitationally and maintain its cohesion) | Q111747236 (Dwarf Planet: ) | Q29370670 (possible dwarf planet: astronomical object that is supposed to be a dwarf planet) | Q109641594 (dwarf-planet moon: astronomical object that orbits a dwarf planet)
- PROPERTY "instance of": P31 (instance of: type to which this subject corresponds/belongs. Different from P279 (subclass of); for example: K2 is an instance of mountain; volcano is a subclass of mountain) | P10241 (individual of taxon: the taxon of an individual named organism (animal, plant)) | P1647 (subproperty of: all resources related by this property are also related by that property)
- ITEM "planet": Q3863 (asteroid: minor planet of the inner Solar System; not a comet) | Q634 (planet: celestial body directly orbiting a star or stellar remnant) | Q106831515 (Planet: 2019 album of Sofiane Pamart) | Q17085620 (Planet Labs: American company specializing in satellite imaging of Earth)
- PROPERTY "parent astronomical body": P397 (parent astronomical body: major astronomical body the item belongs to)
- ITEM "moon": Q16877383 (Moon: family name) | Q405 (Moon: Earth's only natural satellite) | Q16291739 (Moon: unisex given name) | Q3323544 (Moon: 2009 video game)
- ITEM "Sun": Q14647 (Sun Microsystems: defunct American computer hardware and software company) | Q132 (Sunday: day of the week) | Q525 (Sun: star at the centre of the Solar System) | Q28039407 (Sun: family name)