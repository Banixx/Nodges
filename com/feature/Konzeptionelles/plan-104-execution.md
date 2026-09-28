# Plan 104 – Ausführungsleitfaden

> **Nachtrag (Commit `2b3a97b`):** Die Zielarchitektur unten wurde geändert.
> LightRAG läuft jetzt im Pi-Container auf Port 8000, gestartet durch
> `.devcontainer/start-lightrag.sh`; der Vite-Proxy zeigt auf
> `http://localhost:8000`. Siehe `resetup.md`.

Dieses Dokument trennt die langfristige Vision (`vision_104.md`) von den konkret auszuführenden Arbeitsschritten.

## Arbeitsregel für neue Sessions

Bei `/new` zuerst in dieser Reihenfolge lesen:

1. `AGENTS.md`
2. `docs/plan-104-execution.md`
3. `docs/plan-104-progress.md`
4. `vision_104.md` nur für den übergeordneten Zielrahmen

Danach zuerst den aktuellen Repository-Zustand und die im Fortschrittsdokument offenen Punkte prüfen. Keine Implementierung beginnen, bevor Scope und Risiken des nächsten Meilensteins klar sind.

## Zielarchitektur LightRAG

- LightRAG läuft im Pi-Container auf Port 8000.
- Das Backend wird beim Containerstart durch `.devcontainer/start-lightrag.sh` gestartet; der Container ist der einzige Besitzer von Port 8000 und der LightRAG-Daten.
- Vite im Container greift über den internen Proxy `/lightrag-api` auf `http://localhost:8000` zu.
- Der Windows-Prozess `C:\Users\ich\Desktop\code\_projects\Nodges\lightrag-backend` ist nur noch optional und muss gestoppt bleiben, solange der Container-Betrieb aktiv ist.
- Windows und Container dürfen nicht gleichzeitig dieselben LightRAG-Datenbankdateien öffnen.
- Eine externe Host-Instanz ist weiter möglich: `VITE_LIGHTRAG_PROXY_TARGET=http://host.docker.internal:8000` und `start-lightrag.sh` nicht ausführen.

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
