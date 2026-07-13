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
Nutzeranfrage: Pferde, ihre Rassen und Herkunft

=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===
Hier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!

- ITEM "horse breed": Q1160573 (horse breed: selectively bred form of the domesticated horse) | Q16000367 (horse breeder: occupation of breeding horses) | Q1265288 (horse breeding: human-directed process of selective horse breeding) | Q111186776 (Horse Breeding in the Medieval World: )
- ITEM "horse": Q726 (horse: domesticated four-footed mammal from the equine family) | Q10758650 (Equus caballus: domestic horse, species of mammal) | Q190235 (Horsens: city in Horsens Municipality, Denmark) | Q187916 (horse racing: equestrian sport in which several horses simultaneously race against each other)
- PROPERTY "country of origin": P495 (country of origin: country of origin of this item (creative work, food, phrase, product, etc.))
- PROPERTY "breed": P4743 (animal breed: subject item belongs to a specific group of domestic animals, generally given by association) | P303 (EE breed number: breed identification number per the EE list of the breeds of fancy pigeons (ELFP)) | P2049 (width: width of an object) | P13612 (‎breed belongs to taxon: taxon to which members of this breed (or these breeds) belong)
- ITEM "origin": Q7376362 (river source: start of a river or stream) | Q31708 (Origin: content delivery software by Electronic Arts) | Q631351 (Origin: American technical death metal band) | Q30610044 (Origin: 2017 novel by Dan Brown)