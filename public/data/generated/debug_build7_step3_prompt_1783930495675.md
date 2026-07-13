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
Nutzeranfrage: pferderassen und ihre heimat

=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===
Hier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!

- ITEM "horse breed": Q1160573 (horse breed: selectively bred form of the domesticated horse) | Q16000367 (horse breeder: occupation of breeding horses) | Q1265288 (horse breeding: human-directed process of selective horse breeding) | Q111186776 (Horse Breeding in the Medieval World: )
- ITEM "homeland": Q23594 (Homeland: American political thriller television series (2011-2020)) | Q10563546 (Homeland: novel by Cory Doctorow) | Q3786440 (Homeland: album by Miriam Makeba) | Q1709213 (Homeland: role-playing video game for the Nintendo GameCube)
- PROPERTY "country of origin": P495 (country of origin: country of origin of this item (creative work, food, phrase, product, etc.))