# Dokumentation: Speicherort-Anpassung fuer Build 12 (public/data/b12)

## Ziel
Alle mit Build 12 (LightRAG Microservice) generierten Graph- und Zwischenschritt-Dateien sollen automatisch unter `public/data/b12/` auf dem Server/Dateisystem gespeichert werden.

## Umgesetzte Aenderungen

1. **[CreatePanel.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts)**:
   - Bei der Pipeline `build12_lightrag` wird die erzeugte Graph-Datei automatisch ueber `/api/save_graph` als `../b12/B12_Graph_[Timestamp].json` unter `public/data/b12/` abgelegt.
   - Bei aktivierten Zwischenschritten (`saveSteps`) werden Rohdaten und Antworten als `B12_Step1_Rohdaten_[Timestamp].txt` sowie `B12_Step2_Antwort_[Timestamp].json` ebenfalls in `public/data/b12/` gespeichert.

2. **[vite.config.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/vite.config.ts)**:
   - Der Pfad `**/public/data/b12/**` wurde zur `watch.ignored`-Liste hinzugefuegt, um automatische Browser-Reloads beim Schreiben der JSON-Dateien zu verhindern.
