# Vergleich der Quellverzeichnisse: Windows vs. WSL2 / pi-harness Container

## Status und Antwort

Nein, der Container `pi-harness` verwendet nicht die Dateien aus dem Windows-Ordner `C:/Users/ich/Desktop/code/_projects/Nodges`, sondern greift ausschliesslich auf den separaten WSL2-Klon unter `\\wsl.localhost\Ubuntu\home\unixusername\nodges` zu.

## Struktur der beiden Arbeitsbereiche

Es existieren zwei voneinander unabhaengige Arbeitsverzeichnisse auf dem System:

1. **Windows-Arbeitsverzeichnis**:
   - Pfad: [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges)
   - Status: Lokaler Checkout fuer Windows-Tools, IDEs oder manuelle Windows-Entwicklung.

2. **WSL2-Arbeitsverzeichnis (Container-Quelle)**:
   - Pfad Host: `\\wsl.localhost\Ubuntu\home\unixusername\nodges`
   - Pfad WSL intern: `/home/unixusername/nodges`
   - Status: Dies ist das Verzeichnis, welches ueber die Umgebungsvariable `REPO_PATH` in [C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env](file:///C:/Users/ich/Desktop/code/_projects/Nodges_Pi/.env) als `/workspace` in den Docker-Container eingebunden wird.

## Konsequenzen fuer den Entwicklungs-Workflow

* **Kein automatischer Sync**: Dateiaenderungen, die in [C:/Users/ich/Desktop/code/_projects/Nodges](file:///C:/Users/ich/Desktop/code/_projects/Nodges) vorgenommen werden, tauchen nicht automatisch im Container auf.
* **Aenderungen des Pi-Agenten**: Wenn der Agent im Container Dateien bearbeitet, aendern sich die Dateien in WSL2 (`/home/unixusername/nodges`), nicht jedoch im Windows-Ordner `C:/Users/ich/Desktop/code/_projects/Nodges`.
* **Abgleich**: Ein Abgleich zwischen beiden Staenden erfolgt ueblicherweise ueber Git (Commit / Push / Pull) oder manuelles Kopieren.
