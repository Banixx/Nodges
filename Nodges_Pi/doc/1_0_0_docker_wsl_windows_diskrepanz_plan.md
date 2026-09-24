# Implementierungsplan: Behebung des Container-Stopps bei WSL2 vs. Windows Pfaden

## Ursachenanalyse
In der Datei C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env ist `REPO_PATH=/home/unixusername/nodges` eingetragen. Dies ist ein absoluter Linux-Pfad innerhalb von WSL2.

Wird `start_pi_container.cmd` in der Windows PowerShell gestartet, versucht Docker Desktop auf Windows, diesen Linux-Pfad einzubinden. Da dieser Pfad auf dem Windows-Host nicht existiert, bleibt `/workspace` im Container leer. Das Kommando `npm run dev` bricht ab und der Container stoppt sofort.

## Loesungsoptionen

### Option 1 (Empfohlen fuer WSL2-Workflow): Ausfuehrung in WSL2
Das Skript C:/Users/ich/Desktop/code/_projects/Nodges_Pi/setup-pi-branch.sh bzw. die Docker-Befehle direkt in der WSL2-Terminal-Umgebung (z. B. Ubuntu) ausfuehren, da dort `/home/unixusername/nodges` existiert.

### Option 2 (Fuer lokalen Windows-Betrieb): `.env` Pfad anpassen
Fuer die Ausfuehrung in der Windows PowerShell wird `REPO_PATH=./` in C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env eingetragen.

## Verifikation
* Pruefen der Container-Logs mit `docker compose logs pi-agent`.
* Nach Anpassung der `.env` (Option 2) oder Ausfuehrung in WSL2 (Option 1) verifizieren, dass der Container laeuft (`docker ps`).
