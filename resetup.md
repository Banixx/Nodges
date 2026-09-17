# Resetup: LightRAG im Pi-Container aktivieren

Diese Anleitung beschreibt, wie der laufende Pi-Container auf die neue
Compose-Definition umgestellt wird, damit LightRAG **im Container** startet.

Stand: Commit `2b3a97b` (Branch `pi`), Backend-Version im Container `0.105.1`.

---

## Kurzfassung (Windows, 4 Schritte)

1. Windows-LightRAG schliessen.
2. `docker-compose.yml` und `start_pi_container.cmd` nach
   `C:\Users\ich\Desktop\code\_projects\Nodges_Pi` kopieren (siehe Schritt 1).
3. In diesem Ordner ausfuehren: `docker compose up -d --force-recreate`
4. Pruefen: `docker compose exec pi-agent curl -s localhost:8000/health`

Details siehe unten.

---

## Wo liegt was (wichtig, damit du nichts verwechselst)

| Was | Pfad |
|-----|------|
| Compose-Projekt auf Windows (**hier wird `docker compose` ausgefuehrt**) | `C:\Users\ich\Desktop\code\_projects\Nodges_Pi` |
| Compose-Datei, die der Container benutzt | `...\Nodges_Pi\docker-compose.yml` |
| Windows-Kopie des Startskripts | `...\Nodges_Pi\start_pi_container.cmd` |
| Secrets/Umgebung fuer Compose | `...\Nodges_Pi\.env` |
| Repo in WSL (Quelle fuer den Container) | `\\wsl.localhost\Ubuntu\home\unixusername\nodges` |
| Repo im Container | `/workspace` |
| Repo-Snapshot von Nodges_Pi (Git) | `\\wsl.localhost\Ubuntu\home\unixusername\nodges\Nodges_Pi` |
| Backend-Startskript im Container | `/workspace/.devcontainer/start-lightrag.sh` |
| Backend-Log | im Container `/tmp/lightrag.log` |
| Compose-Startlog des Skripts | im Container `/tmp/lightrag-start.log` |

Der Container mountet das Repo aus WSL (`REPO_PATH` in `Nodges_Pi\.env`).
Deshalb ist `/workspace/.devcontainer/start-lightrag.sh` automatisch aktuell,
sobald das WSL-Repo den neuen Stand hat. Nur die **Compose-Datei selbst** und
`start_pi_container.cmd` liegen ausserhalb davon und muessen kopiert werden.

---

## Schritt 0: Windows-LightRAG stoppen

Der alte Backend-Prozess lief unter
`C:\Users\ich\Desktop\code\_projects\Nodges\lightrag-backend`.
Er antwortet mit `version 0.102.12`, die neue Container-Version ist `0.105.1`.
Beide auf Port 8000 betreiben zu wollen ist die haeufigste Fehlerquelle.

- Falls noch ein Fenster `LightRAG Backend` offen ist: mit `Ctrl+C` beenden
  oder das Fenster schliessen.
- Kontrolle im Browser oder per PowerShell:
  ```powershell
  curl.exe -s http://localhost:8000/health
  ```
  Erwartung: keine Antwort bzw. Verbindungsfehler. Antwortet dort noch
  `"version":"0.102.12"`, laeuft der alte Prozess noch.

---

## Schritt 1: Compose-Datei und Startskript auf Windows aktualisieren

Die Aenderung (LightRAG startet mit im Container) steckt im Git-Stand
`2b3a97b`, liegt aber im WSL-Repo. Die Windows-Kopie in `_projects\Nodges_Pi`
ist davon unabhaengig und muss ueberschrieben werden.

PowerShell als normaler Benutzer:

```powershell
$src = "\\wsl.localhost\Ubuntu\home\unixusername\nodges\Nodges_Pi"
$dst = "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"

Copy-Item "$src\docker-compose.yml"     "$dst\docker-compose.yml"     -Force
Copy-Item "$src\start_pi_container.cmd" "$dst\start_pi_container.cmd" -Force
```

Falls `\\wsl.localhost\Ubuntu\...` in der PowerShell nicht funktioniert,
alternativ in WSL kopieren:

```bash
cp /home/unixusername/nodges/Nodges_Pi/docker-compose.yml \
   /home/unixusername/nodges/Nodges_Pi/start_pi_container.cmd \
   /mnt/c/Users/ich/Desktop/code/_projects/Nodges_Pi/
```

Kontrolle, dass die neue Zeile angekommen ist:

```cmd
findstr /C:"start-lightrag.sh" "C:\Users\ich\Desktop\code\_projects\Nodges_Pi\docker-compose.yml"
```

Erwartete Ausgabe (eine Zeile):

```
      bash /workspace/.devcontainer/start-lightrag.sh > /tmp/lightrag-start.log 2>&1 &
```

Wenn `findstr` nichts findet, wurde die falsche Datei kopiert oder der
Windows-Ordner ist ein anderer. Dann zuerst pruefen, welcher Ordner in
`start_pi_container.cmd` per `cd /d "..."` angesteuert wird.

---

## Schritt 2: `Nodges_Pi\.env` anpassen

Datei: `C:\Users\ich\Desktop\code\_projects\Nodges_Pi\.env`
Diese Datei ist nicht im Git (enthaelt Secrets) und wird vom Container gelesen.

Aendern:

```
LIGHT_RAG_URL=http://localhost:8000
```

statt `http://host.docker.internal:8000`.
Hinweis: Der Wert wird derzeit von keinem Codeteil aktiv gelesen, ist aber
die richtige Doku, damit nicht spaeter versehentlich auf den Windows-Prozess
verwiesen wird.

Kontrolle der Mount-Quelle (muss auf das WSL-Repo zeigen):

```
REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges
```

---

## Schritt 3: Container neu erstellen

**Verzeichnis:** `C:\Users\ich\Desktop\code\_projects\Nodges_Pi`
Genau dorthin wechseln, weil dort die soeben aktualisierte
`docker-compose.yml` liegt.

Eingabeaufforderung (cmd) oder PowerShell:

```cmd
cd /d "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"
docker compose up -d --force-recreate
```

Erklaerung:
- `up -d` startet die Dienste im Hintergrund.
- Wegen der geaenderten `command:`-Zeile wuerde Compose den Container schon
  selbst neu erstellen; `--force-recreate` erzwingt es zusaetzlich.
- `--build` ist **nicht** noetig, weil sich der `Dockerfile` nicht geaendert
  hat. Nur wenn du spaeter den `Dockerfile` anfasst:
  `docker compose up -d --build`.

Der Container fuehrt beim Start automatisch aus:

```
npm install
bash /workspace/.devcontainer/start-lightrag.sh > /tmp/lightrag-start.log 2>&1 &
exec npm run dev
```

`start-lightrag.sh` ist idempotent: laeuft bereits ein gesundes Backend auf
Port 8000, passiert nichts. Fehlt das Python-venv, wird es neu erstellt und
`requirements.txt` installiert.

---

## Schritt 4: Verifizieren

Ebenfalls im Compose-Ordner auf Windows:

```cmd
docker compose exec pi-agent curl -s localhost:8000/health
```

Erwartete Ausgabe (wichtig sind `version` und `storage_root`):

```json
{
  "status": "online",
  "service": "LightRAG Local API",
  "lightrag_engine_active": true,
  "version": "0.105.1",
  "storage_root": "/workspace/lightrag-backend/rag_storage",
  "working_dir": "/workspace/lightrag-backend/rag_storage",
  "databases_dir": "/workspace/lightrag-backend/rag_storage/databases",
  "embedding_model": "text-embedding-3-small",
  "embedding_base_url": "https://openrouter.ai/api/v1",
  "embedding_key_set": true
}
```

Zusatzkontrolle ueber den Vite-Proxy (so sieht es das Frontend):

```cmd
docker compose exec pi-agent curl -s localhost:5173/lightrag-api/health
```

Beide Antworten muessen identisch sein und `0.105.1` zeigen. Kommt dort
`0.102.12`, laeuft noch die Windows-Instanz statt der Container-Instanz.

Danach den Agenten oeffnen:

```cmd
docker compose exec -it pi-agent pi
```

---

## Fehlerbehebung

**`docker compose` findet keine Datei / falscher Dienst**
Du bist im falschen Verzeichnis. Es muss
`C:\Users\ich\Desktop\code\_projects\Nodges_Pi` sein, und dort muss
`docker-compose.yml` liegen (`dir` zur Kontrolle).

**Health-Check weiterhin `0.102.12`**
Windows-LightRAG laeuft noch. Prozess beenden (Schritt 0) und danach:

```cmd
docker compose exec pi-agent bash /workspace/.devcontainer/start-lightrag.sh
docker compose exec pi-agent curl -s localhost:8000/health
```

**Health-Check `503` oder `offline` ueber den Vite-Proxy**
Das Container-Backend laeuft nicht. Log ansehen:

```cmd
docker compose exec pi-agent cat /tmp/lightrag-start.log
docker compose exec pi-agent tail -n 50 /tmp/lightrag.log
```

**Backend startet manuell neu**

```cmd
docker compose exec pi-agent bash /workspace/.devcontainer/start-lightrag.sh
```

**Kompletter Neustart des Containers**

```cmd
cd /d "C:\Users\ich\Desktop\code\_projects\Nodges_Pi"
docker compose restart pi-agent
```

**Port 8000 wird von Windows aus nicht erreicht**
Das ist korrekt und gewollt: Port 8000 wird nicht nach aussen
veroeffentlicht, das Frontend nutzt den internen Vite-Proxy. Nur wenn du den
Backend-Port direkt von Windows testen willst, muesste in der
`docker-compose.yml` unter `ports` zusaetzlich `- "8000:8000"` stehen.

---

## Was diese Umstellung bedeutet

- LightRAG laeuft jetzt im Container, nicht mehr als Windows-Prozess.
- Code-Aenderungen an `lightrag-backend/main.py` wirken direkt, ohne Sync
  in einen zweiten Checkout und ohne Windows-Neustart.
- Der Windows-Checkout `C:\Users\ich\Desktop\code\_projects\Nodges` wird fuer
  das Backend nicht mehr gebraucht.
- Der Vite-Proxy zeigt auf `http://localhost:8000`. Wer weiter gegen eine
  externe Instanz arbeiten will, setzt
  `VITE_LIGHTRAG_PROXY_TARGET=http://host.docker.internal:8000` und startet
  `start-lightrag.sh` nicht.

## Optionales Aufraeumen (spaeter)

- `AGENTS.md`, Problem 6: VNC/Chrome sind im Compose-`Dockerfile` nicht
  enthalten; ein Rebuild behebt das **nicht**. VNC muesste dort ergaenzt
  werden.
- `.env.example` (Repo-Wurzel) und fuenf Dateien unter `docs/` beschreiben
  noch `host.docker.internal:8000` als Standard.
- `/workspace/rag_storage` (Repo-Wurzel, Daten vom 7. August) wird nicht mehr
  genutzt.
