# Plan: Iteratives "In Deep" Node Expansion Feature

## 1. Ausgangslage
Das 60-Sekunden-Timeout von Wikidata verbietet riesige, tief verschachtelte Abfragen in einem einzigen Durchgang. Die Lösung ist ein agentischer Ansatz: Der Nutzer beginnt mit einem flachen Graphen und kann per Rechtsklick auf einen spezifischen Knoten (z.B. "Merkur") eine gezielte, zweite Pipeline-Runde starten. Diese analysiert nur die direkte Umgebung dieses einen Knotens tiefgehend und integriert die neuen Daten nahtlos in den bestehenden Graphen.

## 2. Architektur & Komponenten

### A. Benutzeroberfläche (UI / 3D Scene)
- **Kontextmenü-Erweiterung:** Das bereits existierende Rechtsklick-Menü für Knoten wird um einen neuen Eintrag "Deep Dive" (bzw. "In Deep erforschen") ergänzt.
- **Trigger:** Beim Klick auf diesen neuen Menüpunkt wird das Label (und falls vorhanden die Wikidata-ID) des ausgewählten Knotens an die Hauptlogik übergeben, um die Expansion zu starten.

### B. LLM Service: Neue Expansion-Pipeline
Erstellung einer neuen Methode in `LLMService.ts` (z.B. `expandGraphNodeBuild10(nodeLabel, existingGraphData)`).
Diese Pipeline verläuft ähnlich wie Build 10, aber extrem fokussiert:
1. **Identifikation:** Wenn der Knoten noch keine gespeicherte Q-ID hat, sucht die Pipeline zuerst nach dem exakten Knoten-Label (z.B. "Merkur") in Wikidata, um den Ankerpunkt zu setzen.
2. **Fokus-SPARQL:** Ein spezieller `build_10_expansion_prompt.md` instruiert das LLM, alle relevanten, noch fehlenden Metadaten (Masse, Monde, Entdecker, Unterkategorien) für exakt diesen einen Knoten abzufragen.
3. **Graph-Transformation:** Die Wikidata-Ergebnisse werden vom LLM wieder in das gewohnte Nodges-JSON-Format (Entities & Relationships) übersetzt.

### C. Graph Merging (Daten-Zusammenführung)
- Die App-Logik empfängt das neue Teil-JSON.
- Eine intelligente Merge-Funktion iteriert über die neuen Daten:
  - Existierende Knoten werden um neue Properties ergänzt.
  - Völlig neue Knoten (z.B. die neu entdeckten Monde) werden hinzugefügt.
  - Neue Beziehungen (Kanten) werden registriert.
- Die 3D-Engine aktualisiert das Layout sanft (ohne kompletten Reload), sodass die neuen Äste visuell direkt aus dem geklickten Knoten "herauswachsen".

## 3. Schritt-für-Schritt Umsetzungsreihenfolge
1. **Vorbereitung (Q-IDs speichern):** Den primären Graph-Prompt so anpassen, dass das LLM die Wikidata Q-ID (falls bekannt) immer als unsichtbare Property im Knoten ablegt. Das spart bei der Expansion einen Suchschritt.
2. **UI-Entwicklung:** Den neuen "Deep Dive" Eintrag dem bestehenden Rechtsklick-Menü hinzufügen und den Event-Trigger verknüpfen.
3. **Pipeline-Logik:** Die `expandGraphNode` Funktion im `LLMService` programmieren.
4. **Merge-Engine:** Die Funktion zum verlustfreien Verschmelzen von zwei Graph-JSONs schreiben.
