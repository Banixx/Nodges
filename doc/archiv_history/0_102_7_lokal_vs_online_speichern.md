# Unterschiede beim Speichern: Lokal vs. Online

Die Speicherfunktion fuer Graphen und Debug-Logs ueber den Endpunkt `/api/save_graph` verhaelt sich unterschiedlich, je nachdem, wo Nodges ausgefuehrt wird.

## Lokale Entwicklung (Localhost)
Im lokalen Entwicklungsmodus (`npm run dev`) wird der Endpunkt `/api/save_graph` durch ein Plugin in der `vite.config.ts` bereitgestellt. 
Dieser Dev-Server hat direkten Schreibzugriff auf dein lokales Dateisystem (Node.js `fs` Modul) und kann die vom Frontend gesendeten Payloads problemlos als Dateien im Ordner `public/data/generated` ablegen.

## Online-Betrieb (Produktion)
Im gebauten Zustand (`npm run build`) und beim Hosting auf statischen Servern (wie GitHub Pages oder reinen Webservern) existiert dieser Vite-Dev-Server nicht mehr.
Die Web-App bestuende dann nur noch aus statischem HTML, CSS und JavaScript. Ein HTTP-POST an `/api/save_graph` wuerde ins Leere laufen (404 Fehler), da es im Hintergrund keinen aktiven Node.js-Prozess gibt, der den Befehl zum Schreiben auf eine Festplatte entgegennehmen koennte. 
Um das Online-Speichern zu ermoeglichen, muesste entweder eine dedizierte Backend-Datenbank angebunden werden, oder das Frontend muesste einen klassischen Datei-Download im Browser ausloesen (wodurch der Nutzer die Datei manuell auf seinem Geraet speichert).
