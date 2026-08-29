# Plan 104 – Fortschritt und Übergabe

## Status

- Vision: `vision_104.md`
- Ausführungsleitfaden: `docs/plan-104-execution.md`
- Aktueller Stand: Bestehende Probleme werden behoben; keine Plan-104-Neuentwicklung
- Tests: 232 bestanden, 31 übersprungen
- Build: erfolgreich
- M1: noch nicht begonnen

## LightRAG-Umgebung

Ziel ist eine einzige aktive LightRAG-Instanz auf Windows. Der Container startet kein eigenes Backend.

Umgesetzt:

- `.devcontainer/devcontainer.json` startet beim Containerstart nicht mehr `start-lightrag.sh`.
- `vite.config.ts` dokumentiert und verwendet weiterhin standardmäßig `http://host.docker.internal:8000`.
- `main.py` normalisiert `LIGHTRAG_WORKING_DIR` zu einem absoluten Pfad und protokolliert den Fallback.
- `.gitignore` ignoriert Python-venvs und Python-Caches.

Noch zu prüfen:

- tatsächlichen Windows-Pfad von `rag_storage` feststellen
- Windows `.env` oder Startbefehl um `LIGHTRAG_WORKING_DIR` ergänzen
- prüfen, dass Windows-LightRAG auf Port 8000 erreichbar ist
- aus dem Container `/health` und `/databases` testen
- klären, ob ein versehentlich erzeugtes `lightrag-backend/rag_storage` existiert
- Datenbankzugriff niemals parallel aus Windows und Container starten

## Offene Entscheidungen

1. Welcher konkrete absolute Windows-Pfad ist der kanonische Datenbankpfad?
2. Soll der Windows-Start über ein PowerShell-Skript standardisiert werden?
3. Soll die Frontend-Proxy-Adresse ausschließlich über `.env.local` oder über eine versionierte Entwicklungsdokumentation festgelegt werden?
4. Soll die Datenbankauswahl serverseitig global bleiben oder später sessionsicher gestaltet werden?

## Übergabe für `/new`

Zuerst die drei Dokumente lesen. Danach keine Dateien ändern, sondern:

1. `git status` prüfen.
2. Windows-Datenbankpfad beim Nutzer erfragen oder anhand der vorhandenen Windows-Konfiguration verifizieren.
3. Erreichbarkeit von `host.docker.internal:8000` testen.
4. Erst nach Bestätigung des kanonischen Pfads weitere Änderungen an Startkonfigurationen vornehmen.
5. Danach M0 für Plan 104 durchführen.
