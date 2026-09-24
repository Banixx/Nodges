# Implementierungsplan: Ursachenbehebung "package.json nicht gefunden"

## Ursachenanalyse
Aus den Container-Logs (`docker compose logs pi-agent`) geht folgendes hervor:
`npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/workspace/package.json'`

Der Pfad `//wsl.localhost/Ubuntu/home/unixusername/nodges` in WSL2 ist aktuell leer oder das Git-Repository wurde dort noch nicht geklont. Dadurch existiert im gemounteten Verzeichnis `/workspace` im Container keine `package.json` und `npm run dev` bricht ab.

## Loesungsoptionen

### Option A: Repository in WSL2 mit setup-pi-branch.sh einrichten (fuer WSL2 Worktree Workflow)
In WSL2 Terminal (Ubuntu) das Skript ausfuehren:
`bash setup-pi-branch.sh`
Dadurch wird das Repo geklont und der Worktree in `/home/unixusername/nodges` inklusive `package.json` angelegt.

### Option B: Lokales Windows-Projektverzeichnis mounten (fuer Windows-Betrieb)
`REPO_PATH=.` in C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env eintragen, da hier das funktionierende Projekt inklusive `package.json` liegt.

## Verifikation
* Ausfuehren von `.\start_pi_container.cmd` nach Umsetzung von Option B, bzw. Aufrufen von `bash setup-pi-branch.sh` in WSL2 fuer Option A.
* Verifizieren mit `docker ps`, dass der Container laeuft und `pi` startet.
