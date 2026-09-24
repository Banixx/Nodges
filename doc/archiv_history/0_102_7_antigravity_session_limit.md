# Antigravity Session Limit Analyse

## Aktueller Zustand (Stand 12.07.2026)

- **Verzeichnis `C:/Users/ich/.gemini/antigravity/conversations`**: Es befinden sich dort genau 25 `.pb` Dateien.
- **Verzeichnis `C:/Users/ich/.gemini/antigravity/brain`**: Es befinden sich dort genau 25 Session-Ordner (und der Systemordner `tempmediaStorage`).
- **Verzeichnis `C:/Users/ich/Desktop/code/Antigravity_Archiv`**: Das Langzeitarchiv enthält die älteren Sessions.

## Das 25-Session-Problem

Wie in der vorherigen Analyse unter [0_102_7_antigravity_session_analyse.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/doc/0_102_7_antigravity_session_analyse.md) dokumentiert, führt ein Überschreiten der Grenze von 25 aktiven Sessions im Hauptverzeichnis dazu, dass der interne VS-Code-Sidebar-Indexer blockiert oder desynchronisiert. Nach einem IDE-Neustart werden dann oft nur noch sehr wenige (oder keine) historischen Sessions im Panel angezeigt.

Da wir aktuell exakt 25 Sessions erreicht haben, wird die Erstellung einer weiteren Session die Grenze überschreiten und das Problem erneut auslösen.

## Empfohlene Massnahme

Es sollte der Workflow `/archiv_sessions` ausgeführt werden, um die Anzahl der aktiven Sessions im Hauptverzeichnis wieder auf die 10 neuesten zu reduzieren und die restlichen 15 ins Archiv zu verschieben.
