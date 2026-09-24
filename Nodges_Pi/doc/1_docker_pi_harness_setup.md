# Zusammenfassung der bisherigen Konversation & Docker-Setup-Plan

Dieses Dokument fasst die bisherigen Erkenntnisse und die geplante Architektur für den Betrieb des **Pi Coding Agent Harness** in Docker (WSL2 / Windows 11) zusammen.

## 1. Sicherheitsvorteile von Docker für KI-Agenten
* **Dateisystem-Isolation (Blast Radius):** Befehle wie `rm -rf` betreffen nur den isolierten Container. Das Host-System bleibt geschützt.
* **Schutz sensibler Daten:** Keine automatische Exposition von `~/.ssh/`, `~/.aws/` oder globalen Umgebungsvariablen.
* **Ressourcenbegrenzung:** Beschränkung von RAM und CPU schützt den Host vor Abstürzen durch Endlosschleifen.
* **Ephemere Umgebungen:** Container können nach der Arbeit sauber verworfen werden.
* **Netzwerkkontrolle:** Granulare Steuerung des Datenverkehrs.

## 2. Architektur & Datei-Synchronisation (WSL2 / Windows 11)
* **Ablageort:** Das Repository liegt nativ im Linux-Dateisystem von WSL2 (z. B. unter `~/projects/Nodges_Pi`).
* **Volume Mount:** Docker greift per Bind-Mount direkt auf die WSL2-Dateien zu (`./:/workspace`).
* **Line Endings:** Zwingende Nutzung von `LF` über `.gitattributes` (`* text=auto eol=lf`).
* **Vite Web-Server:** Einbindung über `0.0.0.0` (`vite --host 0.0.0.0`) und Port-Mapping `5173:5173`.
* **LightRAG DB:** Speicherung der lokalen Vektor-Datenbank direkt im gemounteten Volume zur Persistenz.
* **WSL2 Networking:** Empfohlener Modus `networkingMode=mirrored` in `%USERPROFILE%\.wslconfig`.

## 3. Geplante Komponenten
1. `.gitattributes` (Erzwingen von LF-Zeilenumbrüchen)
2. `Dockerfile` (Node.js 20 + Python 3 & Build-Tools für LightRAG)
3. `docker-compose.yml` (Port-Forwarding, Volume-Mounts, `.env`-Einbindung)
4. `.env.example` (Vorlage für API-Schlüssel)
5. `package.json` & `vite.config.ts` (Vite-Konfiguration für Container-Zugriff)
