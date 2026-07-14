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
Nutzeranfrage: USER: Das System der Schweizer Politk.

KI: Möchtest du das Parteiensystem, einzelne Politiker oder die Institutionen und Kantone der Schweizer Politik visualisieren?

USER: die parlamente, räte , ihre mitglieder, ihre parteien. legislative exekutive etc.

=== GEFUNDENE WIKIDATA-IDs (FAKTENCHECK) ===
Hier sind die echten IDs für diese Anfrage aus der Live-Suche. Nutze ZWINGEND diese Q-IDs und P-IDs für den Aufbau der SPARQL-Query. Rate keine IDs!

- PROPERTY "executive body": P208 (executive body: branch of government for the daily administration of the territorial entity)
- PROPERTY "position held": P39 (position held: subject currently or formerly holds the object position or public office) | P1313 (office held by head of government: political office that is fulfilled by the head of the government of this item) | P2388 (position held by head of the organization: position of the head of this item) | P1308 (position holder: persons who hold and/or held the position)
- ITEM "Swiss Federal Assembly": Q684719 (Federal Assembly of Switzerland: legislative body (parliament) of the Swiss Confederation)
- PROPERTY "instance of": P31 (instance of: type to which this subject corresponds/belongs. Different from P279 (subclass of); for example: K2 is an instance of mountain; volcano is a subclass of mountain) | P10241 (individual of taxon: the taxon of an individual named organism (animal, plant)) | P1647 (subproperty of: all resources related by this property are also related by that property)
- ITEM "Federal Council of Switzerland": Q30917 (Swiss Federal Council: executive council and head of state in Switzerland)
- PROPERTY "political party": P102 (member of political party: the political party of which a person is or has been a member or otherwise affiliated)
- ITEM "member of the Swiss Federal Assembly": Q18515554 (Member of the Swiss Federal Assembly: )
- PROPERTY "legislative body": P194 (legislative body: legislative body governing this entity; political institution with elected representatives, such as a parliament/legislature or council)
- PROPERTY "member of": P102 (member of political party: the political party of which a person is or has been a member or otherwise affiliated) | P463 (member of: organization, club or musical group to which the subject belongs. Do not use for membership in ethnic or social groups, nor for holding a political position, such as a member of parliament (use P39 for that)) | P54 (member of sports team: sports teams or clubs that the subject represents or represented) | P53 (family: family, including dynasty and nobility houses. Not family name (use P734 for family name).)