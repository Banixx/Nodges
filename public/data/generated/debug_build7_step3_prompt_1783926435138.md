SYSTEM:
Du erhältst Rohdaten aus einer Wikidata-Abfrage (JSON-Bindings) sowie die ursprüngliche User-Anfrage.
Deine Aufgabe ist es, diese flachen, tabellarischen Daten in das 3D-Graphenformat von Nodges umzuwandeln.

Erzeuge eine valide Nodges-Struktur mit "system", "metadata", "dataModel", "data" (entities & relationships) und "visualMappings".

WICHTIG ZUR GRAPHEN-BILDUNG:
- Jede Entität (z.B. ein Land, eine Stadt, eine Person) aus den Tabellen-Spalten wird ein eigener Knoten (Entity). 
- Nutze den generierten Label (z.B. Wert von personLabel) als Entity "label" und die URL (oder den Namen selbst, falls eindeutig) als "id".
- Die semantische Beziehung zwischen den Spalten (z.B. Stadt "liegt in" Land) wird zu einer Kante (Relationship). 
- Erfinde sinnvolle Kategorien (types) im dataModel und füge den Entitäten Attribute hinzu, falls ableitbar.

=== ZIEL-STRUKTUR (Striktes JSON) ===
{
  "system": "<Thema>",
  "metadata": { "schemaVersion": "5.0", "description": "Generiert aus Wikidata" },
  "dataModel": {
    "entities": {
      "<TypName>": { "properties": { "<propName>": { "type": "continuous", "range": [0, 100] } } }
    },
    "relationships": {
      "<KantenTyp>": { "properties": {} }
    }
  },
  "data": {
    "entities": [
      { "id": "unique_id", "type": "<TypName>", "label": "Namen eintragen", "<propName>": 42 }
    ],
    "relationships": [
      { "id": "rel_1", "type": "<KantenTyp>", "source": "id_a", "target": "id_b", "label": "..." }
    ]
  },
  "visualMappings": {
    "defaultPresets": {
      "<TypName>": {
        "size": { "source": "constant", "function": "constant", "params": { "size": 1.0 } },
        "color": { "source": "type", "function": "categorical" },
        "geometry": { "source": "constant", "function": "constant", "params": { "geometry": "sphere" } }
      },
      "<KantenTyp>": {
        "color": { "source": "constant", "function": "constant", "params": { "color": "#aaaaaa" } },
        "thickness": { "source": "constant", "function": "constant", "params": { "size": 0.1 } }
      }
    }
  }
}
=================================


USER:
Ursprüngliche Anfrage: Zeige mir Softwareentwickler und die von ihnen entwickelten Programmiersprachen

Hier sind die abgerufenen Wikidata-Ergebnisse (JSON):
[
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q286196"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q5284"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Bill Gates"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Altair BASIC"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q235086"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q11605"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Adele Goldberg"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Smalltalk"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q5301"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q17457"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Donald Knuth"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "TeX"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q15777"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q45575"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Dennis M. Ritchie"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q15777"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q34280"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q60093"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Konrad Zuse"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Plankalkül"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q42478"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92597"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Larry Wall"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q42478"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q2407"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92620"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Bjarne Stroustrup"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q2407"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q251"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92622"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "James Gosling"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Java"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q46441"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92651"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Håkon Wium Lie"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Cascading Style Sheets"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q235086"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92742"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Alan Kay"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Smalltalk"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q212569"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92744"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Kristen Nygaard"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Simula"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q83303"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92746"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "John Backus"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Fortran"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q161053"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92748"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Yukihiro Matsumoto"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q161053"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q235086"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92772"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Dan Ingalls"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Smalltalk"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q154755"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92853"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Jean Ichbiah"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q154755"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q169478"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92871"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Cleve Moler"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "MATLAB"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q34010"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92949"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Simon Peyton Jones"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q34010"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q81348"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92949"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Simon Peyton Jones"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "C--"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q300867"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92976"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Stuart Feldman"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "make"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q275472"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q92999"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Charles H. Moore"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Forth"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q47607"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q93007"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Raymond F. Boyce"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q47607"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q47607"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q93071"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Donald D. Chamberlin"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q47607"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q286196"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q162005"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Paul Allen"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Altair BASIC"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q201436"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q335027"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Seymour Papert"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Logo"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q37227"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q517764"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Rob Pike"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Go"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q46441"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q617878"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Bert Bos"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Cascading Style Sheets"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q244627"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q1053869"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Urban Müller"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Brainfuck"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q15777"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q1107006"
    },
    "personLabel": {
      "type": "literal",
      "value": "Q1107006"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q15777"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q37227"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q1107006"
    },
    "personLabel": {
      "type": "literal",
      "value": "Q1107006"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Go"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q334879"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q1691321"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Joe Armstrong"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q334879"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q207316"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q1840472"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Roberto Ierusalimschy"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Lua"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q51798"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q2094209"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Richard Hickey"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Clojure"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q319268"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q2993645"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Walter Bright"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "D"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q34010"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q3379094"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Philip Wadler"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q34010"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q201436"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q4495811"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Idit Harel Caperton"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Logo"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q201436"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q4815998"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Cynthia Solomon"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Logo"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q235086"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q5271235"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Diana Merry"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Smalltalk"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q34010"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q5388723"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Erik Meijer"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q34010"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q295232"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q5493329"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "François Lionet"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "AMOS"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q34010"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q5815940"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "John Hughes"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q34010"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q223679"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q6262259"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "John W. Eaton"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "GNU Octave"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q34010"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q6522721"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Lennart Augustsson"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q34010"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q34010"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q15432950"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Paul Hudak"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q34010"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q37227"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q16729446"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Robert Griesemer"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Go"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q359122"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q19869285"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "David Morgan-Mar"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "chef"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q154755"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q20898521"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "S. Tucker Taft"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q154755"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q93482"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q28937565"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Gavin King"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Ceylon"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q285756"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q57412484"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Michael McLennan"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Incr Tcl"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q81348"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q102265254"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Norman Ramsey"
    },
    "languageLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "C--"
    }
  },
  {
    "language": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q334879"
    },
    "person": {
      "type": "uri",
      "value": "http://www.wikidata.org/entity/Q107596747"
    },
    "personLabel": {
      "xml:lang": "en",
      "type": "literal",
      "value": "Robert Virding"
    },
    "languageLabel": {
      "type": "literal",
      "value": "Q334879"
    }
  }
]