# Fehlerbehebung: {"detail":"Not Found"} beim Erstellen einer LightRAG Datenbank

## Problembeschreibung
Beim Erstellen einer neuen LightRAG-Wissensdatenbank im Frontend erschien die Fehlermeldung `Fehler: {"detail":"Not Found"}`.

## Ursachenanalyse
1. **Altprozess im Speicher:** Das Python-Backend (`lightrag-backend/main.py`) lief in einem bereits gestarteten Hintergrundprozess. Wenn am Python-Code neue Endpunkte (`/databases/create`) hinzugefuegt werden, laedt der Python-Prozess ohne explizite `reload`-Option den Code nicht automatisch neu.
2. **FastAPI 404 Antwort:** Das laufende FastAPI-Backend lieferte auf den unbekannten Endpunkt `/databases/create` die Standard-FastAPI-Meldung `{"detail":"Not Found"}` mit HTTP Status code 404 zurueck.
3. **Status-Code Typo im Code:** Im Backend gab es zudem bei einer Exception-Bedingung einen Typo (`status_code=44` statt `404`), welcher behoben wurde.

## Durchgefuehrte Loesungsmassnahmen
1. **Routen-Aliase & Auto-Reload in `lightrag-backend/main.py`:**
   - Hinzufuegen von Slash-Aliasen fuer `/databases`, `/databases/create`, `/databases/select`, `/databases/{db_name}`.
   - Aktivieren von Auto-Reload in Uvicorn (`uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`).
2. **Verbesserte UI-Fehlerbehandlung in `FilePanelUI.ts`:**
   - Wenn der Server HTTP 404 meldet, erscheint nun eine klare Handlungsanweisung, dass das LightRAG-Backend neu gestartet werden muss.

## Anleitung fuer den Benutzer
Um die neuen Datenbank-Funktionen von LightRAG zu nutzen, starten Sie bitte den Python-Backend-Server neu:
```bash
npm run lightrag
```
Oder manuell ueber Terminal:
```bash
.\lightrag-backend\venv\Scripts\python.exe lightrag-backend/main.py
```
Graph JSON Datenbanken koennen ohne Python Backend direkt im Browser erstellt und verwendet werden.
