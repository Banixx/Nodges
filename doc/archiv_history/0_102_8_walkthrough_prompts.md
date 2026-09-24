# Walkthrough: LLM Prompts für Gruppenzugehörigkeiten

Die Prompts, die das Sprachmodell bei der Generierung von Netzwerken (Build 5 und Build 6) anleiten, wurden erfolgreich um die neue Ontologie-Regel erweitert.

## Was wurde umgesetzt?

1. **`build_5_ontology_prompt.md` aktualisiert**
   - Im Abschnitt *Wichtige Regeln für die Ontologie* wurde eine neue, 7. Regel hinzugefügt: `GRUPPEN ALS ENTITAETEN`.
   - Das Sprachmodell wird nun explizit angewiesen, bei übergeordneten Hierarchien (wie Abteilungen, Sonnensystemen etc.) keine Text-Attribute in die Knoten zu schreiben.
   - Stattdessen wird es angewiesen, eine neue Entität vom Typ `group` zu erstellen und die Mitglieder über eine gerichtete Kante (z.B. `belongs_to`) anzubinden.

2. **`build_6_prompt.md` aktualisiert**
   - Im *1. Schritt (Die Ontologie)* wurde eine prägnante Version derselben Regel hinzugefügt.
   - Da Build 6 alles in einem Schritt macht, sorgt diese neue Direktive dafür, dass das Modell schon bei der Planung der Datenstruktur die Gruppierung in Knoten und Kanten aufbricht.

Durch diese Änderungen ist die Nodges-Pipeline nun vom Prompt bis zur Engine konsistent darauf ausgelegt, Gruppen als netzwerkfähige Objekte zu begreifen.
