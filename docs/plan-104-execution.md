# Plan 104 – Ausführungsleitfaden

Dieses Dokument trennt die langfristige Vision (`vision_104.md`) von den konkret auszuführenden Arbeitsschritten.

## Arbeitsregel für neue Sessions

Bei `/new` zuerst in dieser Reihenfolge lesen:

1. `AGENTS.md`
2. `docs/plan-104-execution.md`
3. `docs/plan-104-progress.md`
4. `vision_104.md` nur für den übergeordneten Zielrahmen

Danach zuerst den aktuellen Repository-Zustand und die im Fortschrittsdokument offenen Punkte prüfen. Keine Implementierung beginnen, bevor Scope und Risiken des nächsten Meilensteins klar sind.

## Zielarchitektur LightRAG

- LightRAG läuft ausschließlich auf dem Windows-Host.
- Der Windows-Prozess ist der einzige Besitzer von Port 8000 und der LightRAG-Daten.
- Vite im Container greift über `http://host.docker.internal:8000` auf den Windows-Prozess zu.
- Der Container startet keinen eigenen LightRAG-Prozess.
- Windows- und Container-Python-Umgebungen bleiben getrennt.
- LightRAG-Datenbankdateien werden nicht gleichzeitig von zwei Prozessen geöffnet.

## Ausführungsreihenfolge Plan 104

### M0 – Audit und Abgrenzung

- Bestand und APIs prüfen
- Annahmen der Vision gegen den Code prüfen
- Scope des nächsten Meilensteins festlegen
- Datenvertrag und Abnahmekriterien formulieren

### M1 – statische Projektkarte

- Projektdateien erfassen
- relative TypeScript-Importe analysieren
- GraphData-Ausgabe erzeugen
- deterministische IDs und Tests ergänzen

### M2 – fachliche Absicherung

- Auflösung von Erweiterungen und `index`-Imports testen
- nicht auflösbare Imports behandeln
- Entscheidung über Python-Importe treffen

### M3 – Nodges-Integration

- Projektgraph explizit laden
- Architekturmodus integrieren
- Auswahl, Detailinformationen und Nachbarschaft prüfen

Weitere Visionsteile (Git-Historie, Laufzeitdaten, KI-Erklärungen, Animationen und Berichte) bleiben nachgelagerte Meilensteine.

## Abnahmeregel

Ein Meilenstein gilt erst als abgeschlossen, wenn seine Kriterien geprüft, Tests/Build ausgeführt und die Ergebnisse in `docs/plan-104-progress.md` dokumentiert wurden.
