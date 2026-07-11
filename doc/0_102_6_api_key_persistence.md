# API-Key Persistenz (Build 6)

Um dem Problem entgegenzuwirken, dass Firefox oder andere Browser den `localStorage` für lokale Entwicklungsumgebungen nach einem Neustart löschen, wurde in Build 6 eine persistente Fallback-Lösung implementiert.

## Umsetzung im Code
Die Klasse `LLMService` wurde erweitert, sodass sie nun neben dem `localStorage` auch direkt die Vite-Umgebungsvariablen ausliest. Dies geschieht ueber `import.meta.env`.

Zusaetzlich wurden die entsprechenden Typen für TypeScript in `vite-env.d.ts` hinzugefügt, um sauberen Zugriff auf die Umgebungsvariablen zu gewaehrleisten.

## Einrichtung fuer Entwickler
Damit API-Keys sicher und persistent lokal geladen werden, muss eine `.env.local` Datei im Hauptverzeichnis des Projekts angelegt werden. Diese Datei wird von Git ignoriert und ist somit sicher vor unbeabsichtigten Commits.

**Beispielhafter Inhalt einer `.env.local`:**
```env
VITE_OPENROUTER_API_KEY=dein_openrouter_key
VITE_OPENAI_API_KEY=dein_openai_key
VITE_ANTHROPIC_API_KEY=dein_anthropic_key
```

**Vorrangigkeit:**
1. Wurde in der UI ein Key eingegeben, ueberschreibt dieser temporaer den `.env`-Wert und speichert sich im `localStorage`.
2. Ist der `localStorage` leer, greift Nodges automatisch auf den Wert in der `.env.local` zurueck.
