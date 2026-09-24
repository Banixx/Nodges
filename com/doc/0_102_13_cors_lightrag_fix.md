# Dokumentation: CORS- & Proxy-Fix fuer LightRAG Backend

## Problemstellung
Bei direkten `fetch`-Anfragen vom Browser (`http://localhost:5173`) an `http://localhost:8000/health` wirft der Browser einen `NS_ERROR_CONNECTION_REFUSED` beziehungsweise einen geblockten Cross-Origin (CORS) Fehler in der Konsole, wenn das Python Backend ausgeschaltet ist oder keine direkten Header liest.

## Umgesetzte Loesung

1. **Vite Reverse Proxy**:
   - In [vite.config.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/vite.config.ts) wurde ein Proxy fuer den Pfad `/lightrag-api` eingerichtet.
   - Anfragen an `/lightrag-api/*` werden vom Vite Server an `http://localhost:8000/*` weitergeleitet.
   - Bei ausgeschaltetem Backend fängt der Vite Proxy den Verbindungsfehler ab und antwortet mit einem sauberen `503 Service Unavailable` JSON, sodass im Browser keine rohen CORS- oder Connection-Refused-Konsolenfehler mehr auftreten.

2. **Backend Uvicorn Starter & Virtual Environment**:
   - In [main.py](file:///C:/Users/ich/Desktop/code/_projects/Nodges/lightrag-backend/main.py) wurde der Import auf `openai_complete_if_cache` aus `lightrag.llm.openai` aktualisiert, wodurch die Engine in LightRAG v1.5.4 vollstaendig geladen wird.
   - In [package.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges/package.json) wurde das NPM-Skript `npm run lightrag` auf die virtuelle Python-Umgebung `.\lightrag-backend\venv\Scripts\python.exe` angepasst.
