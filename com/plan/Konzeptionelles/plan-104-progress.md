# Plan 104 – Fortschritt und Übergabe

> **Nachtrag (Commit `2b3a97b`):** LightRAG läuft jetzt im Pi-Container auf
> Port 8000 und wird von `.devcontainer/start-lightrag.sh` gestartet. Der
> Vite-Proxy zeigt standardmäßig auf `http://localhost:8000`. Siehe
> `resetup.md`. Die Abschnitte unten mit anderem Stand sind überholt.

## Status

- Vision: `vision_104.md`
- Ausführungsleitfaden: `docs/plan-104-execution.md`
- Aktueller Stand: Bestehende Probleme werden behoben; keine Plan-104-Neuentwicklung
- Tests: 232 bestanden, 31 übersprungen
- Build: erfolgreich
- M1: noch nicht begonnen

## LightRAG-Umgebung

Aktueller Stand: eine einzige LightRAG-Instanz, die **im Pi-Container** läuft.
Der Windows-Prozess ist nicht mehr Teil des normalen Betriebs.

Umgesetzt:

- `Nodges_Pi/docker-compose.yml` startet beim Containerstart zusätzlich `.devcontainer/start-lightrag.sh` (idempotent, Health-Check vorab).
- `vite.config.ts` verwendet standardmäßig `http://localhost:8000`; Host-Betrieb nur noch per `VITE_LIGHTRAG_PROXY_TARGET`.
- `main.py` leitet `LIGHTRAG_WORKING_DIR` zentral ab, normalisiert den Pfad und listet Legacy-Datenbanken mit.
- `.gitignore` ignoriert Python-venvs, Python-Caches und `lightrag-backend/rag_storage/`.

Erledigt (vormals offen):

- Working Dir des Backends ist eindeutig (`LIGHTRAG_WORKING_DIR`, sonst `lightrag-backend/rag_storage`).
- Windows-Pfad spielt keine Rolle mehr, da das Backend im Container läuft.
- `/health` und `/databases` wurden aus dem Container getestet (Version `0.105.1`, `mock: false` bei Retrieval).
- Ein versehentlich erzeugtes `lightrag-backend/rag_storage` ist jetzt gewollter Laufzeitpfad und ignoriert.
- Paralleler Datenbankzugriff aus Windows und Container entfällt, sobald der Windows-Prozess gestoppt ist.

Noch offen:

- Server-seitige Datenbankauswahl ist weiterhin global, nicht Sitzungs-sicher.

## Offene Entscheidungen

1. Erledigt: Der Datenbankpfad ist `lightrag-backend/rag_storage` im Container (`LIGHTRAG_WORKING_DIR`).
2. Erledigt: Start erfolgt über `Nodges_Pi/docker-compose.yml` plus `.devcontainer/start-lightrag.sh`.
3. Erledigt: Proxy-Ziel ist `http://localhost:8000`, überschreibbar per `VITE_LIGHTRAG_PROXY_TARGET`.
4. Offen: Soll die Datenbankauswahl serverseitig global bleiben oder später sessionsicher gestaltet werden?

## Übergabe für `/new`

Zuerst die drei Dokumente lesen. Danach keine Dateien ändern, sondern:

1. `git status` prüfen.
2. Erreichbarkeit des Container-Backends prüfen: `curl -s http://localhost:8000/health`.
3. Bei Setupänderungen `resetup.md` und `Nodges_Pi/docker-compose.yml` lesen.
4. Danach M0 für Plan 104 durchführen.
