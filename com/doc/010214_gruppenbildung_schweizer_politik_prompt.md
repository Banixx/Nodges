# Konzept zur Gruppenbildung und Prompt fuer das politische System der Schweiz

## 1. Moeglichkeiten der Gruppenbildung in Nodges

Die Gruppenbildung in Netzwerkgraphen wie Nodges kann ueber drei wesentliche Ansaetze realisiert werden:

1. **Attribut-basiertes Clustering (Metadaten & Tags)**
   - Knoten erhalten spezifische Attribute (z. B. `kanton: "ZH"`, `gewalt: "Exekutive"`, `partei: "FDP"`).
   - Der Graph nutzt diese Metadaten zur automatischen visuellen Gruppierung, Einfaerbung oder raeumlichen Anordnung.

2. **Hierarchische Gruppen-Knoten (Parent-Child Containment)**
   - Gruppen werden als eigenstaendige Parent-Knoten modelliert (z. B. "Bundesrat", "Staenderat", "Kanton Bern").
   - Untergeordnete Einheiten verweisen ueber eine `parentId` direkt auf ihren Gruppen-Knoten.

3. **Explizite Gruppen-Kanten (Membership-Edges)**
   - Verknuepfung von Entitaeten mit Gruppenknoten ueber dedizierte Kantentypen (z. B. `belongs_to`, `member_of`, `represents`).

---

## 2. Prompt fuer das politische System der Schweiz (Fokus auf Gruppenbildung)

Der folgende Prompt weist eine KI an, Daten zum politischen System der Schweiz so zu strukturieren, dass Gruppen und Hierarchien optimal erfasst und in Graphen uebernommen werden koennen:

```text
Du bist ein Experte fuer politische Systeme und Graph-Datenbanken. Erfasse das politische System der Schweiz und strukturiere alle Entitaeten in klar abgegrenzte Gruppen und Hierarchien.

Achte besonders auf folgende Gruppierungsebenen:
1. Foederale Ebene (Bund, Kantone, Gemeinden)
2. Gewaltenteilung (Exekutive, Legislative, Judikative)
3. Organisationseinheiten (z. B. Bundesrat, Nationalrat, Staenderat, Bundesgericht, Parteien, Fraktionen, Departemente)
4. Akteure & Mitglieder (z. B. Bundesraete, Parlamentsmitglieder, Parteimitglieder)

Gib das Ergebnis ausschliesslich als valides JSON-Objekt mit folgender Struktur aus:

{
  "groups": [
    {
      "id": "group_exekutive_bund",
      "label": "Exekutive (Bund)",
      "category": "Gewaltenteilung",
      "parentGroupId": "group_bund",
      "description": "Die ausfuehrende Gewalt auf Bundesebene"
    },
    {
      "id": "group_bundesrat",
      "label": "Bundesrat",
      "category": "Gremium",
      "parentGroupId": "group_exekutive_bund",
      "description": "Siebenkoepfige Landesregierung der Schweizerischen Eidgenossenschaft"
    }
  ],
  "nodes": [
    {
      "id": "node_person_1",
      "label": "Name der Person oder Institution",
      "groupId": "group_bundesrat",
      "attributes": {
        "partei": "Partei-Name",
        "kanton": "Kanton-Kuerzel",
        "funktion": "Mitglied / Praesident"
      }
    }
  ],
  "edges": [
    {
      "source": "node_person_1",
      "target": "group_bundesrat",
      "relation": "member_of"
    },
    {
      "source": "group_bundesrat",
      "target": "group_exekutive_bund",
      "relation": "part_of"
    }
  ]
}

Analysiere das politische System der Schweiz vollstaendig nach diesen Vorgaben und erstelle das JSON.
```
