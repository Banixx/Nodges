# Vite Hot Reload & Server Erreichbarkeit (Projekt: nodges)

Zusammenfassung der analysierten Probleme und Lösungsansätze:

## 1. Vite Server (Port 5173) im Firefox nicht erreichbar
**Problem:** Der Vite Dev-Server läuft im DevContainer standardmäßig nur auf der internen Adresse (`127.0.0.1`), weshalb der Host (z.B. Firefox unter Windows) nicht darauf zugreifen kann.
**Lösung:**
1. **Network Binding erlauben:** Vite muss auf allen Interfaces lauschen. Dazu entweder den Parameter `--host` beim Start übergeben (`vite dev --host`) oder in der `vite.config.ts` bzw. `vite.config.js` konfigurieren:
   ```typescript
   export default defineConfig({
     server: {
       host: true, // oder '0.0.0.0'
       port: 5173
     }
   })
   ```
2. **Port Forwarding:** Sicherstellen, dass der Port `5173` aus dem DevContainer an das Host-System weitergeleitet wird (z. B. in `.devcontainer/devcontainer.json` über `"forwardPorts": [5173]`).

## 2. Hot-Reload (HMR) funktioniert bei `versionaanzeige`, aber nicht bei `overview`
**Problem:** Wenn HMR für bestimmte Module selektiv fehlschlägt, liegt meist ein Problem im Modul-Code oder der Modul-Architektur vor.
**Lösungsansätze:**
1. **Default Exports:** Manche Frameworks/Plugins (wie React Fast Refresh oder Vue) verlangen für ein sauberes HMR, dass die betroffenen Komponenten als `default export` exportiert werden. Prüfe, wie `overview` exportiert und importiert wird.
2. **Globale State / Side Effects:** Wenn bei einer Neuausführung der Datei `overview` globale Variablen überschrieben werden oder Seiteneffekte auftreten, fängt Vite das Modul unter Umständen ab und meidet das Neuladen – stattdessen wird zu einem Full-Page-Reload geraten oder die Änderung greift schlicht nicht.
3. **Groß-/Kleinschreibung:** Überprüfe, ob Pfade bei Importen korrekt geschrieben sind (z. B. `Overview` statt `overview`). DevContainer (Linux) verzeihen anders als Windows keine falschen Groß-/Kleinschreibungen.
