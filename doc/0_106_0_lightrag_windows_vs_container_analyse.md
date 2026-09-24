# Analyse: LightRAG auf Windows vs. Container und Erreichbarkeit aus WSL2

## 1. Direkte Antwort und Ueberblick

Wenn LightRAG direkt auf dem Windows-Host laeuft (Port 8000), ist es fuer den Pi-Container in WSL2 ueber die Netzwerkadresse `http://host.docker.internal:8000` sehr gut und stabil erreichbar.

Dieser Weg ist netzwerktechnisch vollstaendig erprobt, bringt jedoch bei der Arbeitsweise des Pi-Agenten neue organisatorische und prozessuale Herausforderungen mit sich.

---

## 2. Erreichbarkeit und Netzwerk (Host vs. Container)

### 2.1 Wie die Verbindung funktioniert
- Docker Desktop richtet auf Windows automatisch den internen DNS-Namen `host.docker.internal` ein.
- Wenn im Pi-Container ein HTTP-Aufruf an `http://host.docker.internal:8000` abgesetzt wird, routet WSL2 diesen direkt an den Windows-Host auf Port 8000.
- Im Frontend (Vite) ist dafuer bereits die Konfigurationsoption `VITE_LIGHTRAG_PROXY_TARGET=http://host.docker.internal:8000` vorgesehen.

### 2.2 Potenzielle Netzwerk-Schwierigkeiten
- **Windows-Firewall**: Windows fragt beim ersten Start eines Python/Uvicorn-Servers nach Netzwerkfreigaben. Wird dies blockiert, kann der Container Port 8000 nicht erreichen.
- **Bind-Adresse in FastAPI**: LightRAG muss auf dem Windows-Host an `0.0.0.0` gebunden sein (`uvicorn main:app --host 0.0.0.0 --port 8000`), nicht nur an `127.0.0.1` (localhost), da Anfragen aus dem Docker-Netzwerk sonst abgewiesen werden.

---

## 3. Komplikationen beim Betrieb auf Windows

### 3.1 Kontrollverlust des Pi-Agenten ueber den LightRAG-Prozess
- **Im Container**: Der Pi-Agent hat Zugriff auf die Container-Shell. Er kann den LightRAG-Dienst mit `.devcontainer/start-lightrag.sh` selbst starten, stoppen, neustarten und Logs unter `/tmp/lightrag.log` direkt auslesen.
- **Auf Windows**: Der Pi-Agent hat **keinen** Zugriff auf das Windows-Betriebssystem. Er kann einen abgestuerzten LightRAG-Server auf Windows weder neustarten noch pruefen, warum er nicht antwortet. Der Benutzer muss den Server manuell in PowerShell verwalten.

### 3.2 Duale Python-Umgebungen (venv)
- Um LightRAG auf Windows zu starten, wird ein Windows-spezifisches virtuelles Python-Environment benoetigt (`lightrag-backend/venv/Scripts/python.exe`).
- Dieses muss strikt von eventuellen Linux-venvs getrennt bleiben.

### 3.3 Datenbestand und Vektorspeicher (`rag_storage`)
- Liegt der Ordner `lightrag-backend/rag_storage` auf der gemeinsamen Windows-Festplatte, koennen beide Seiten dieselben Wissensgraphen und Embeddings nutzen.
- **Achtung**: Beide Instanzen duerfen nicht zeitgleich schreibend auf dieselbe lokale NanoVectorDB oder SQLite-Datenbank zugreifen, da dies zu Dateisperren fuehrt.

---

## 4. Gegenueberstellung der beiden Optionen

| Kriterium | Option 1: LightRAG laeuft im Container (Aktuell) | Option 2: LightRAG laeuft auf Windows |
|---|---|---|
| **Erreichbarkeit fuer Pi** | Perfekt (`localhost:8000` im selben Container) | Sehr gut (`host.docker.internal:8000`) |
| **Erreichbarkeit fuer Windows/Vite** | Ueber durchgereichten Port 8000 / Vite-Proxy | Direkt (`localhost:8000`) |
| **Autonomie des Pi-Agenten** | Hoch (Pi kann Dienst starten, stoppen, loggen) | Gering (Benutzer muss Dienst auf Windows managen) |
| **Dateisystem-I/O fuer RAG** | Schnell (im Container/Linux-RAM) | 9P-Zugriff ueber Windows-Festplatte |
| **Fehleranfaelligkeit** | Gering, da isoliert | Firewall / Bind-Adress-Abhaengigkeit |

---

## 5. Empfehlung

Fuer einen reibungslosen Workflow mit dem Pi-Agenten ist es empfehlenswerter, LightRAG **im Container** laufen zu lassen, da der Agent den Prozess dort eigenstaendig ueberwachen und steuern kann. 

Falls LightRAG dennoch auf Windows betrieben werden soll, ist die Netzwerkanbindung technisch problemlos moeglich, erfordert aber, dass Sie den Python-Server auf Windows dauerhaft manuell laufen lassen.
