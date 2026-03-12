# Browser-Funktionalität und Einschränkungen

Dieses Dokument beschreibt die Möglichkeiten und Grenzen der Browser-Nutzung durch die Antigravity KI in dieser Umgebung.

## Verfügbare Tools und Browser

### 1. Browser Subagent (Chrome/Chromium)
Der primäre Weg für komplexe Web-Interaktionen ist der `browser_subagent`.
- **Browser**: Verwendet ausschließlich Chrome/Chromium (wie in `GEMINI.md` gefordert).
- **Modus**: Läuft technisch "headless" in einem virtuellen Display-Buffer, um Interaktionen zu ermöglichen.
- **Funktionen**:
  - Vollständige JavaScript-Unterstützung.
  - Interaktionen wie Klicken, Tippen, Scrollen und Navigieren.
  - Erstellung von Screenshots und Video-Aufzeichnungen (WebP) zur visuellen Überprüfung.
  - Kann lokale Server (z.B. `localhost:5173`) ansteuern.
- **Einschränkung**: Firefox wird für automatisierte Interaktionen über den Subagent aktuell nicht unterstützt, obwohl er als Standardbrowser im System installiert sein mag.

### 2. Statisches Auslesen (read_url_content)
Ein dediziertes Tool für schnelles Auslesen von Inhalten.
- **Funktionsweise**: Führt einen einfachen HTTP-Request aus und konvertiert HTML in Markdown.
- **Vorteil**: Sehr schnell und effizient für Dokumentationen oder statische Artikel.
- **Einschränkung**: Unterstützt **kein JavaScript**, keine Logins und keine dynamischen Inhalte (Single Page Applications zeigen hier oft nur eine leere Seite oder Ladebalken).

### 3. Chromium Erweiterung (Offizielle Variante)
Dies ist die "native" Methode zur Interaktion mit deinem lokalen Browser.
- **Funktionsweise**: Du installierst die offizielle Antigravity Browser-Erweiterung in deinem Chromium-Browser.
- **Vorteile**:
  - **Echtzeit-Kollaboration**: Ich agiere direkt in dem Browser-Fenster, das du vor dir siehst.
  - **Sitzungs-Sharing**: Ich kann auf Tabs zugreifen, in denen du bereits eingeloggt bist (z.B. GitHub, Slack, interne Tools).
  - **Weniger Bot-Sperren**: Da es dein regulärer Browser ist, stufen Webseiten die Interaktion seltener als "Bot" ein.
- **Einschränkung**: Erfordert die manuelle Installation der Erweiterung durch den Nutzer und eine aktive Verbindung.

## Was nicht geht und warum

### 1. Interaktive Live-Sitzung
- **Problem**: Ich kann keine "Live"-Verbindung zum Browser des Nutzers herstellen, bei der wir gleichzeitig dieselbe Instanz steuern.
- **Warum**: Die Architektur basiert auf autonomen agentischen Schritten. Ich sende Befehle, der Subagent führt sie aus und liefert das Ergebnis (Screenshot/Bericht) zurück.

### 2. CAPTCHAs und Bot-Schutz
- **Problem**: Seiten mit starkem Bot-Schutz (wie Cloudflare "I am human" oder Google CAPTCHA) können meist nicht überwunden werden.
- **Warum**: Der Browser wird als automatisierte Instanz erkannt. Umgehungstechniken sind aus Sicherheits- und Stabilitätsgründen nicht implementiert.

### 3. Persistenz von Sitzungen
- **Problem**: Logins gehen nach dem Ende eines Tasks meist verloren. Jede neue Aufgabe startet in einem frischen Browser-Profil.
- **Warum**: Datenschutz und Vermeidung von Nebeneffekten zwischen verschiedenen Tasks.

### 4. Cookie-Akzeptanz
- **Einschränkung**: Gemäß den globalen Regeln (`GEMINI.md`) werden Cookie-Banner nicht akzeptiert.
- **Warum**: Dies entspricht der expliziten Benutzeranweisung ("akzeptiere die cookies nicht"). Dies kann dazu führen, dass manche Seiteninhalte durch Banner verdeckt bleiben oder Funktionen eingeschränkt sind.

### 5. Dateisystem-Zugriff via Browser
- **Problem**: Der Browser kann keine lokalen Dateien direkt über `file://` Protokolle öffnen, die außerhalb des erlaubten Scopes liegen.
- **Warum**: Sicherheits-Sandbox des Browsers und der KI-Umgebung.

## Zusammenfassung
Fuer die Entwicklung von Web-Apps (wie Nodges) gibt es drei Wege:
1. **Der Subagent**: Gut fuer isolierte Tests und Automatisierung in der Cloud-Umgebung.
2. **Der statische Reader**: Schnell fuer Dokumentationen.
3. **Die Chromium-Erweiterung**: Die beste Wahl fuer direkte Zusammenarbeit in deinem Browser, da sie Zugriff auf deinen aktuellen Kontext und Logins ermoeglicht.

Der Browser-Dienst des Subagents kann gelegentlich Verbindungsprobleme haben (`ECONNREFUSED`), weshalb die lokale Erweiterung oft die stabilere und maechtigere Alternative fuer komplexe Workflows ist.

---

## Loesung: VNC/noVNC Setup (seit 09.03.2026)

Um das `ECONNREFUSED`-Problem auf Port 9222 zu loesen, wurde ein VNC-Setup im DevContainer implementiert:

### Architektur
```
Windows 11 Host
  |-- Chrome (http://localhost:6080/vnc.html) --> noVNC Proxy
  |-- VS Code (DevContainer)
        |-- Xvfb :99 (virtuelles Display)
        |-- Fluxbox (Window-Manager)
        |-- x11vnc (VNC-Server)
        |-- websockify/noVNC (Port 6080)
        |-- Chrome mit CDP (Port 9222)
        |-- Vite Dev-Server (Port 5173)
```

### Zugriff
- **noVNC**: `http://localhost:6080/vnc.html` im Host-Browser oeffnen
- **CDP**: Port 9222 ist intern im Container verfuegbar
- **Vite**: Port 5173 wie gewohnt

### Dateien
- `.devcontainer/Dockerfile` -- VNC-Pakete installiert
- `.devcontainer/devcontainer.json` -- Port 6080, postStartCommand
- `.devcontainer/start-vnc.sh` -- Start-Script (Xvfb, x11vnc, noVNC, Chrome)

> **Hinweis**: Nach Aenderungen an Dockerfile oder devcontainer.json muss der Container neu gebaut werden (Command Palette: "Dev Containers: Rebuild Container").

