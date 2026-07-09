# Walkthrough: Firebase Proxy Integration

Das Ziel dieser Aufgabe war es, das Nodges-Projekt so zu erweitern, dass auf GitHub Pages ein von dir zur Verfügung gestellter ("built-in") API-Key genutzt werden kann, ohne dass dieser im Frontend kompromittiert wird. Die Lösung kombiniert den bestehenden "Bring Your Own Key" (BYOK) Modus mit einem sicheren Firebase Proxy-Fallback.

## Was geändert wurde

### 1. Firebase Proxy Backend (`firebase-proxy/`)
- Es wurde ein neuer Ordner `firebase-proxy` angelegt.
- `package.json`: Enthält die Definitionen für `firebase-functions`, `firebase-admin` und `cors`.
- `index.js`: Beinhaltet die Serverless Function `nodgesProxy`. 
  - Die Funktion nutzt CORS, um sicherzustellen, dass Anfragen nur von `https://banixx.github.io` (und lokal) akzeptiert werden.
  - Der API-Key wird sicher über den Firebase Secret Manager (`OPENROUTER_API_KEY`) bezogen.
  - Die Funktion leitet die Anfragen 1:1 an OpenRouter weiter und liefert die Antworten zurück.

### 2. Anpassung des Frontends (`src/utils/LLMService.ts`)
- Eine `PROXY_URL`-Konstante wurde hinzugefügt. (Diese musst du nach dem Deployment der Firebase-Funktion anpassen).
- Die Methode `_executeLLMCall` prüft nun, ob für "OpenRouter" ein lokaler API-Key (BYOK) vorliegt.
- **Fallback-Logik**: Wenn kein Key gefunden wird, schaltet Nodges automatisch auf den Proxy-Modus um und sendet den Prompt (anstatt direkt an OpenRouter) an deine Firebase Cloud Function.
- Die Fehlerbehandlung und das Request-Mapping wurden angepasst, um sowohl Proxy- als auch Direktaufrufe sauber abzufangen.

### 3. Dokumentation
- Die Deployment-Schritte für die Firebase Cloud Function wurden im Dokument `doc/0_102_4_firebase_deploy.md` detailliert zusammengefasst.

## Was zu tun ist (Nächste Schritte)
1. Folge der Anleitung in `doc/0_102_4_firebase_deploy.md`, um die Funktion bei Firebase hochzuladen und den API Key sicher als Secret zu speichern.
2. Kopiere die von Firebase ausgegebene URL in die Datei `src/utils/LLMService.ts` (Zeile 12: `public static readonly PROXY_URL = ...`).
3. Führe einen Build aus und pushe das Update auf den `main`-Branch (`https://banixx.github.io/Nodges/`), damit es live geht.
