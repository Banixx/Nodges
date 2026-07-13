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
Nutzeranfrage: USER: sonnensystem

KI: Welche konkreten Himmelskörper oder Details des Sonnensystems möchtest du visualisieren (z.B. alle Planeten, Monde, Asteroidengürtel, oder bestimmte Objekte wie Jupiter und seine Monde)? 

USER: keine asteroiden. sonne, planeten und monde. ihre umlaufzeit ist mir wichtig.

=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===
Hier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!

- ITEM "planet": Q3863 (asteroid: minor planet of the inner Solar System; not a comet) | Q634 (planet: celestial body directly orbiting a star or stellar remnant) | Q106831515 (Planet: 2019 album of Sofiane Pamart) | Q17085620 (Planet Labs: American company specializing in satellite imaging of Earth)
- ITEM "moon": Q16877383 (Moon: family name) | Q405 (Moon: Earth's only natural satellite) | Q16291739 (Moon: unisex given name) | Q3323544 (Moon: 2009 video game)
- PROPERTY "instance of": P31 (instance of: type to which this subject corresponds/belongs. Different from P279 (subclass of); for example: K2 is an instance of mountain; volcano is a subclass of mountain) | P10241 (individual of taxon: the taxon of an individual named organism (animal, plant)) | P1647 (subproperty of: all resources related by this property are also related by that property)
- PROPERTY "orbits": P397 (parent astronomical body: major astronomical body the item belongs to) | P1418 (orbits completed: number of orbits a spacecraft has done around a body)
- ITEM "Sun": Q14647 (Sun Microsystems: defunct American computer hardware and software company) | Q132 (Sunday: day of the week) | Q525 (Sun: star at the centre of the Solar System) | Q28039407 (Sun: family name)
- PROPERTY "orbital period": P2146 (orbital period: the time taken for a given astronomic object to make one complete orbit about another object)