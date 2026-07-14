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

Beispiel-Output:
{
  "query": "SELECT ?city ?cityLabel ?country ?countryLabel WHERE { ?city wdt:P31 wd:Q515; wdt:P17 ?country. SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". } } LIMIT 20"
}


USER:
Nutzeranfrage: sonnensysstem

=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===
Hier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!

- PROPERTY "part of": P361 (part of: object of which the subject is a part (if this subject is already part of object A which is a part of object B, then please only make the subject part of object A), inverse property of "has part" (P527, see also "has parts of the class" (P2670))) | P749 (parent organization or unit: parent organization or unit of an organization or unit, opposite of child organization or unit (P355); use instance of (P31) to distinguish organization (Q43229) and organization unit (Q10387680)) | P1433 (published in: larger work that a given work was published in, like a journal, a website, a collection, a book or a music album) | P59 (constellation: the area of the celestial sphere of which the subject is a part (from a scientific standpoint, not an astrological one))
- ITEM "star": Q523 (star: astronomical object consisting of a luminous spheroid of plasma held together by its own gravity) | Q1092 (Star Trek: science fiction media franchise) | Q37529922 (Star: family name) | Q462 (Star Wars: epic space opera multimedia franchise created by George Lucas)
- ITEM "planet": Q3863 (asteroid: minor planet of the inner Solar System; not a comet) | Q634 (planet: celestial body directly orbiting a star or stellar remnant) | Q106831515 (Planet: 2019 album of Sofiane Pamart) | Q17085620 (Planet Labs: American company specializing in satellite imaging of Earth)
- ITEM "moon": Q16877383 (Moon: family name) | Q405 (Moon: Earth's only natural satellite) | Q16291739 (Moon: unisex given name) | Q3323544 (Moon: 2009 video game)
- ITEM "solar system": Q544 (Solar System: the Sun, its planets and their moons) | Q124073729 (Solar System: 2017 video game) | Q98918610 (Sol System: planetary system Solar System as depicted in Star Trek) | Q7556035 (Solar System: song by The Beach Boys)
- PROPERTY "instance of": P31 (instance of: type to which this subject corresponds/belongs. Different from P279 (subclass of); for example: K2 is an instance of mountain; volcano is a subclass of mountain) | P10241 (individual of taxon: the taxon of an individual named organism (animal, plant)) | P1647 (subproperty of: all resources related by this property are also related by that property)
- PROPERTY "orbits": P397 (parent astronomical body: major astronomical body the item belongs to) | P1418 (orbits completed: number of orbits a spacecraft has done around a body)
- ITEM "asteroid": Q3863 (asteroid: minor planet of the inner Solar System; not a comet) | Q2179 (asteroid belt: the circumstellar disk (accumulation of matter) in an orbit around Sun between those of Mars and Jupiter) | Q4810751 (Asteroid: American Thoroughbred racehorse and sire) | Q113629153 (Asteroid: early access video game)