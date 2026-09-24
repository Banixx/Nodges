# Auswertung der B12-Rohdaten und Konzept fuer ein beschraenktes Beziehungs-Set (Enum)

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Auswertung der Rohdaten (B12 Schweizer Politik)

Eine Zaehlung aller Kanten in den aktuellen B12-Rohdaten (`B12_Graph_01_28.json`) ergibt:

- **Gesamtzahl aller Kanten (Relationships):** 104
- **Anzahl unterschiedlicher Beziehungs-Strings:** 65

### Die haeufigsten Typen in den Rohdaten:
- `supports,uses`: 9
- `membership`: 7
- `affiliation`: 6
- `includes`: 4
- `member`: 4
- `neighboring`: 4
- `designates`: 3
- `similarity`: 3
- `located_in`: 3
- 45 weitere Kantenbezeichnungen kommen jeweils nur genau **1-mal** vor (z.B. `collaborate,convene,legislate`, `allows,empowers`, `enables,grants`, `changes,proposes`).

---

## 2. Reduktion auf ein Set von 10--12 Standard-Beziehungen

Obwohl das LLM wortgetreu 65 verschiedene Begriffe generiert hat, lassen sich alle 104 Kanten des Schweizer Politiksystems semantisch sauber in ein **Set von 12 Grundbeziehungen** einordnen:

| # | Beziehungstyp (Enum-Wert) | Deutsche Beschreibung | Beispiele aus den Rohdaten |
| :--- | :--- | :--- | :--- |
| 1 | `MITGLIED_VON` | Mitgliedschaft in Gremium / Organisation | `membership`, `member`, `part_of`, `includes`, `comprises` |
| 2 | `WAEHLT` | Wahl oder Ernennung von Personen/Aemtern | `elect`, `election`, `designates`, `replaces` |
| 3 | `LEITET` | Führung, Präsidentschaft, Vorsitz | `governs`, `leads`, `presides`, `leadership` |
| 4 | `VERTRITT` | Vertretung von Interessen oder Regionen | `represent`, `represents`, `Kantonsvertretung` |
| 5 | `ERMAECHTIGT` | Rechtliche Befugnis, Erlaubnis, Ermächtigung | `enables`, `allows`, `empowers`, `grants` |
| 6 | `SCHLAEGT_VOR` | Gesetzgebung, Vorschlag, Beschluss | `proposes`, `legislate`, `adopts`, `changes,proposes` |
| 7 | `GEHOERT_ZU` | Zuordnung zu Partei, Kanton oder Region | `affiliation`, `located_in`, `rooted in` |
| 8 | `KONTROLLIERT` | Aufsicht, Verfassungsrahmen, Garantie | `ensures`, `determines`, `framework for`, `defined by` |
| 9 | `NACHBAR_VON` | Geografische Nachbarschaft | `neighboring`, `GEOGRAPHY` |
| 10 | `BEEINFLUSST` | Ausloesung von Prozessen, Anstoss | `triggers`, `influences`, `invokes` |
| 11 | `IST` | Identität oder Typisierung | `is`, `similar concept` |
| 12 | `UNTERSTUETZT` | Nutzung, Unterstuetzung | `supports`, `utilizes`, `uses` |

---

## 3. Technische Umsetzung zur Erzwingung der 12 Beziehungen

Um zu verhindern, dass das LLM kommagetrennte oder frei erfundene Begriffe generiert, stehen zwei Mechanismen zur Verfuegung:

### A. Prompt-Direktive (Soft Constraint)
Im LLM-Prompt wird die Liste explizit vorgegeben:
```text
WICHTIG: Verwende fuer das Feld "relation" AUSSCHLIESSLICH einen der folgenden 12 Werte:
["MITGLIED_VON", "WAEHLT", "LEITET", "VERTRITT", "ERMAECHTIGT", "SCHLAEGT_VOR", "GEHOERT_ZU", "KONTROLLIERT", "NACHBAR_VON", "BEEINFLUSST", "IST", "UNTERSTUETZT"].
Freie Erfindungen oder kommagetrennte Listen sind strikt verboten.
```

### B. JSON-Schema Enum (Hard Constraint / Structured Outputs)
In `types.ts` / Zod-Schema wird das Feld als `z.enum([...])` definiert. Bei modernen Modellen (OpenAI, OpenRouter, Anthropic) kann das LLM durch Structured Outputs technisch **keinen anderen Wert** mehr ausgeben.
