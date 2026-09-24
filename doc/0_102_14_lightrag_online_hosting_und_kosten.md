# LightRAG Online-Hosting und Kostenanalyse

## Uebersicht

GitHub Pages ist ein Hosting-Dienst fuer statische Webseiten (HTML, CSS, JavaScript). Da LightRAG auf einem Python-Backend (FastAPI, NetworkX, NanoVectorDB/Vector Storage) basiert, kann die LightRAG-Engine nicht direkt auf GitHub Pages ausgefuehrt werden. Das Frontend auf GitHub Pages muss stattdessen ueber HTTP-REST-Requests mit einem extern gehosteten Backend kommunizieren.

## Wie kann LightRAG online gestellt werden?

Fuer das Hosting des Python-FastAPI-Backends von LightRAG gibt es verschiedene Moeglichkeiten:

1. **PaaS (Platform as a Service) - Render / Railway / Fly.io**
   - **Aufwand:** Sehr gering (Deployment via GitHub-Repository oder Dockerfile).
   - **Vorteil:** Automatische SSL-Zertifikate, einfaches Setup.
   - **Kosten:** Kostenloser Einstieg oder ca. 5 bis 7 USD pro Monat.

2. **Hugging Face Spaces (Docker / FastAPI)**
   - **Aufwand:** Gering.
   - **Vorteil:** Bietet kostenlose CPU-Instanzen fuer Python/FastAPI-Anwendungen.
   - **Kosten:** Kostenlos in der Basisvariante.

3. **VPS (Virtual Private Server) - z.B. Hetzner, DigitalOcean**
   - **Aufwand:** Mittel (Erfordert Einrichtung von Docker, Nginx und SSL via Certbot).
   - **Vorteil:** Volle Kontrolle, dauerhafter Speicherplatz ohne Standby-Zeiten.
   - **Kosten:** Ca. 3 bis 5 EUR pro Monat.

## Datenbank-Ansprueche und Kosten

### 1. Datenbank-Ansprueche (Hardware & Speicher)
LightRAG nutzt standardmaessig eine dateibasierte Speicherung (`./rag_storage`), bestehend aus NanoVectorDB fuer Embeddings, NetworkX/JSON fuer den Wissensgraphen sowie Doc-Status-Dateien.
- **Speicherbedarf:** Sehr gering (wenige Megabyte bis einige hundert Megabyte bei kleineren und mittleren Wissensbasen).
- **RAM-Bedarf:** Ca. 512 MB bis 2 GB RAM reichen fuer normale Abfragemengen aus.
- **Fazit:** Es wird keine teure externe Datenbank (wie Postgres oder Neo4j) zwingend benoetigt.

### 2. Kostenstruktur
- **Serverkosten:** 0 EUR (Free Tier) bis ca. 4-5 EUR / Monat.
- **API-Kosten fuer LLM & Embeddings:** 
  - Die Abfragen ueber OpenAI oder OpenRouter (z.B. GPT-4o-mini oder text-embedding-3-small) werden nach verbrauchten Tokens abgerechnet.
  - Bei moderater Nutzung liegen diese Kosten meist im Cent-Bereich pro Monat.

## Verbindung von GitHub Pages mit dem Online-Backend

Sobald das Backend unter einer öffentlichen URL (z.B. `https://mein-lightrag-backend.onrender.com`) erreichbar ist, wird die Umgebungsvariable im Frontend angepasst:

```env
VITE_LIGHTRAG_API_URL=https://mein-lightrag-backend.onrender.com
```

Dadurch kann die statische GitHub-Pages-Instanz nahtlos mit dem Cloud-Backend kommunizieren.
