# 🛠️ Nodges 0.80 - Installation & Setup Guide

## 📋 Übersicht

Dieser Guide führt Sie durch die komplette Installation und Einrichtung von Nodges 0.80 - einer professionellen 3D-Netzwerkvisualisierungsanwendung.

### 🎯 Was Sie erhalten
- **Vollständige Nodges 0.80 Anwendung**
- **8 professionelle Layout-Algorithmen**
- **Multi-Select & Batch-Operationen**
- **Performance-optimierte Engine**
- **Beispiel-Datensätze**

## 📋 Inhaltsverzeichnis

1. [Systemanforderungen](#systemanforderungen)
2. [Schnellstart](#schnellstart)
3. [Detaillierte Installation](#detaillierte-installation)
4. [Konfiguration](#konfiguration)
5. [Erste Schritte](#erste-schritte)
6. [Fehlerbehebung](#fehlerbehebung)
7. [Erweiterte Einstellungen](#erweiterte-einstellungen)
8. [Wartung & Updates](#wartung--updates)

## 💻 Systemanforderungen

### Minimale Anforderungen
- **Betriebssystem:** Windows 10, macOS 10.14, Linux Ubuntu 18.04+
- **Browser:** Chrome 90+, Firefox 88+, Edge 90+
- **RAM:** 4 GB (8 GB empfohlen)
- **Festplatte:** 100 MB freier Speicherplatz
- **Grafik:** WebGL 2.0-kompatible Grafikkarte
- **Netzwerk:** Lokaler Server oder Webserver

### Empfohlene Anforderungen
- **Betriebssystem:** Windows 11, macOS 12+, Linux Ubuntu 20.04+
- **Browser:** Chrome 120+, Firefox 115+, Edge 120+
- **RAM:** 8 GB oder mehr
- **Festplatte:** 500 MB freier Speicherplatz
- **Grafik:** Dedizierte Grafikkarte mit WebGL 2.0
- **CPU:** Multi-Core-Prozessor für große Netzwerke

### Browser-Kompatibilität
| Browser | Minimale Version | Empfohlene Version | Status |
|---------|------------------|-------------------|---------|
| Chrome | 90 | 120+ | ✅ Vollständig unterstützt |
| Firefox | 88 | 115+ | ✅ Vollständig unterstützt |
| Edge | 90 | 120+ | ✅ Vollständig unterstützt |
| Safari | 14 | 16+ | ⚠️ Eingeschränkt unterstützt |
| Opera | 76 | 100+ | ✅ Vollständig unterstützt |

## 🚀 Schnellstart

### Option 1: Lokaler Server (Empfohlen)

#### Schritt 1: Python-Server starten
```bash
# Navigieren Sie zum Nodges-Verzeichnis
cd /pfad/zu/nodges

# Python 3 Server starten
python3 -m http.server 8080

# Oder Python 2
python -m SimpleHTTPServer 8080
```

#### Schritt 2: Anwendung öffnen
```bash
# Öffnen Sie Ihren Browser und navigieren Sie zu:
http://localhost:8080
```

### Option 2: Node.js Server

#### Schritt 1: Node.js installieren
```bash
# Laden Sie Node.js von https://nodejs.org herunter
# Installieren Sie Node.js auf Ihrem System
```

#### Schritt 2: Server starten
```bash
# Navigieren Sie zum Nodges-Verzeichnis
cd /pfad/zu/nodges

# Einfacher HTTP-Server
npx http-server -p 8080

# Oder mit live-server für automatisches Neuladen
npx live-server --port=8080
```

### Option 3: Apache/Nginx Webserver

#### Apache-Konfiguration
```apache
<VirtualHost *:80>
    DocumentRoot /pfad/zu/nodges
    ServerName nodges.local
    
    <Directory /pfad/zu/nodges>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Nginx-Konfiguration
```nginx
server {
    listen 80;
    server_name nodges.local;
    root /pfad/zu/nodges;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 🔧 Detaillierte Installation

### Schritt 1: Dateien herunterladen/kopieren

#### Verzeichnisstruktur
```
nodges-0.80/
├── index.html                 # Haupt-HTML-Datei
├── main.js                    # Hauptanwendung
├── data.js                    # Datenmanagement
├── rollover.js               # Rollover-Effekte
├── colorscheme.css           # Farbschemas
├── objects/                  # 3D-Objekte
│   ├── Node.js
│   └── Edge.js
├── src/                      # Quellcode-Module
│   ├── core/                 # Kern-Module
│   │   ├── EventManager.js
│   │   ├── LayoutManager.js
│   │   ├── StateManager.js
│   │   └── UIManager.js
│   ├── effects/              # Effekte
│   │   ├── GlowEffect.js
│   │   └── HighlightManager.js
│   └── utils/                # Hilfsprogramme
│       ├── SelectionManager.js
│       ├── BatchOperations.js
│       ├── PerformanceOptimizer.js
│       └── [weitere Module]
└── data/                     # Datensätze
    └── examples/
        ├── small.json
        ├── medium.json
        ├── large.json
        ├── mega.json
        ├── family.json
        ├── architektur.json
        └── royal_family.json
```

### Schritt 2: Abhängigkeiten prüfen

#### Externe Bibliotheken (CDN)
Die folgenden Bibliotheken werden automatisch geladen:
- **Three.js 0.160.0** - 3D-Engine
- **lil-gui 0.19.1** - Benutzeroberfläche
- **TWEEN.js 18.6.4** - Animationen

#### Keine lokale Installation erforderlich
Alle Abhängigkeiten werden über CDN geladen, keine lokale Installation nötig.

### Schritt 3: Server-Konfiguration

#### CORS-Einstellungen
Für lokale Entwicklung sind CORS-Einstellungen wichtig:

```javascript
// Für Node.js Express-Server
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
```

#### MIME-Types
Stellen Sie sicher, dass Ihr Server JavaScript-Module korrekt ausliefert:
```
.js  -> application/javascript
.json -> application/json
.html -> text/html
```

## ⚙️ Konfiguration

### Grundkonfiguration

#### Performance-Einstellungen
Bearbeiten Sie `main.js` für Performance-Anpassungen:

```javascript
// Performance-Einstellungen
const performanceSettings = {
    enableLOD: true,                // Level of Detail
    enableFrustumCulling: true,     // Frustum Culling
    maxVisibleNodes: 1000,          // Max. sichtbare Knoten
    maxVisibleEdges: 2000,          // Max. sichtbare Kanten
    autoOptimize: true              // Automatische Optimierung
};
```

#### Layout-Einstellungen
Anpassung der Layout-Algorithmen:

```javascript
// Layout-Konfiguration
const layoutConfig = {
    animationDuration: 2000,        // Animation in ms
    maxIterations: 1000,            // Max. Iterationen
    convergenceThreshold: 0.01,     // Konvergenz-Schwellwert
    enablePhysics: true             // Physik-Simulation
};
```

### Erweiterte Konfiguration

#### Speicher-Management
```javascript
// Speicher-Einstellungen
const memoryConfig = {
    enableCaching: true,            // Geometrie-Caching
    cacheSize: 100,                 // Cache-Größe (MB)
    autoCleanup: true,              // Automatische Bereinigung
    cleanupInterval: 60000          // Bereinigung alle 60s
};
```

#### Rendering-Einstellungen
```javascript
// Rendering-Konfiguration
const renderConfig = {
    antialias: true,                // Anti-Aliasing
    shadowMapSize: 2048,            // Schatten-Auflösung
    enableShadows: true,            // Schatten aktivieren
    backgroundColor: 0xf5f5dc       // Hintergrundfarbe
};
```

## 🎯 Erste Schritte

### Schritt 1: Installation testen

#### Server-Test
```bash
# Prüfen Sie, ob der Server läuft
curl http://localhost:8080

# Oder öffnen Sie im Browser
http://localhost:8080
```

#### Funktionstest
1. **Anwendung lädt:** Seite zeigt 3D-Szene
2. **Netzwerk sichtbar:** Standardnetzwerk wird geladen
3. **GUI funktional:** Rechtes Bedienfeld ist sichtbar
4. **Keine Fehler:** Browser-Konsole zeigt keine kritischen Fehler

### Schritt 2: Grundfunktionen testen

#### Navigation testen
- **Kamera drehen:** Linke Maustaste + Ziehen
- **Zoomen:** Mausrad
- **Verschieben:** Rechte Maustaste + Ziehen

#### Layout-Algorithmen testen
1. Klicken Sie **🎯 Layout Algorithmen**
2. Wählen Sie **Force-Directed**
3. Beobachten Sie die Animation

#### Multi-Select testen
1. Halten Sie **Strg** gedrückt
2. Klicken Sie mehrere Knoten
3. Grüne Auswahlboxen sollten erscheinen

### Schritt 3: Eigene Daten laden

#### JSON-Datei erstellen
```json
{
  "nodes": [
    {
      "id": "1",
      "name": "Knoten 1",
      "position": {"x": 0, "y": 0, "z": 0}
    },
    {
      "id": "2", 
      "name": "Knoten 2",
      "position": {"x": 5, "y": 0, "z": 0}
    }
  ],
  "edges": [
    {
      "start": {"id": "1"},
      "end": {"id": "2"},
      "name": "Verbindung"
    }
  ]
}
```

#### Datei importieren
1. Öffnen Sie **Import/Export** im GUI
2. Klicken Sie **📁 Datei importieren**
3. Wählen Sie Ihre JSON-Datei

## 🔧 Fehlerbehebung

### Häufige Probleme

#### Problem: Seite lädt nicht
**Symptome:** Weiße Seite, keine Inhalte
**Lösungen:**
```bash
# 1. Server-Status prüfen
netstat -an | grep 8080

# 2. Firewall prüfen
# Windows: Windows Defender Firewall
# macOS: Systemeinstellungen → Sicherheit
# Linux: ufw status

# 3. Port ändern
python3 -m http.server 8081
```

#### Problem: JavaScript-Fehler
**Symptome:** Funktionen arbeiten nicht, Konsolen-Fehler
**Lösungen:**
1. **Browser-Konsole öffnen** (F12)
2. **Fehler analysieren**
3. **Cache leeren** (Strg+F5)
4. **Anderen Browser testen**

#### Problem: Performance-Probleme
**Symptome:** Langsame Animationen, niedrige FPS
**Lösungen:**
```javascript
// Performance-Modus aktivieren
const performanceMode = {
    enableLOD: true,
    maxVisibleNodes: 500,
    maxVisibleEdges: 1000,
    enableFrustumCulling: true
};
```

#### Problem: Import funktioniert nicht
**Symptome:** Dateien werden nicht geladen
**Lösungen:**
1. **Dateiformat prüfen** (JSON, CSV, GEXF, GraphML)
2. **Dateigröße prüfen** (< 10MB empfohlen)
3. **JSON-Syntax validieren**
4. **Kleinere Testdatei verwenden**

### Erweiterte Fehlerbehebung

#### Debug-Modus aktivieren
```javascript
// In main.js hinzufügen
const DEBUG_MODE = true;

if (DEBUG_MODE) {
    console.log('Debug-Modus aktiviert');
    // Zusätzliche Logging-Ausgaben
}
```

#### Performance-Monitoring
```javascript
// Performance-Überwachung
setInterval(() => {
    const stats = performanceOptimizer.getPerformanceStats();
    console.log('FPS:', stats.fps);
    console.log('Memory:', stats.memoryUsage);
}, 5000);
```

#### Netzwerk-Debugging
```bash
# Netzwerk-Requests überwachen
# Browser DevTools → Network Tab
# Prüfen Sie auf fehlgeschlagene Requests
```

## 🔧 Erweiterte Einstellungen

### Custom Themes

#### Dunkles Theme
```css
/* In colorscheme.css hinzufügen */
.dark-theme {
    --background-color: #1a1a1a;
    --text-color: #ffffff;
    --accent-color: #00ff00;
}
```

#### Theme aktivieren
```javascript
// In main.js
document.body.classList.add('dark-theme');
```

### Custom Layout-Algorithmen

#### Eigenen Algorithmus hinzufügen
```javascript
// In LayoutManager.js
class CustomLayout {
    apply(nodes, edges, options) {
        // Ihr Layout-Algorithmus hier
        nodes.forEach(node => {
            // Neue Positionen berechnen
            node.position.x = Math.random() * 10;
            node.position.y = Math.random() * 10;
            node.position.z = Math.random() * 10;
        });
    }
}

// Algorithmus registrieren
this.algorithms['custom'] = new CustomLayout();
```

### Performance-Tuning

#### Für große Netzwerke (>1000 Knoten)
```javascript
const largeNetworkConfig = {
    enableLOD: true,
    lodDistance: 50,
    maxVisibleNodes: 500,
    enableInstancing: true,
    reducedQuality: true
};
```

#### Für kleine Geräte
```javascript
const mobileConfig = {
    shadowMapSize: 512,
    antialias: false,
    maxVisibleNodes: 200,
    enableSimpleShaders: true
};
```

## 🔄 Wartung & Updates

### Regelmäßige Wartung

#### Cache leeren
```bash
# Browser-Cache leeren
# Chrome: Strg+Shift+Delete
# Firefox: Strg+Shift+Delete
# Edge: Strg+Shift+Delete
```

#### Logs überprüfen
```javascript
// Performance-Logs analysieren
console.log(performanceOptimizer.getPerformanceStats());
console.log(stateManager.getSystemStatus());
```

### Updates installieren

#### Neue Version installieren
1. **Backup erstellen** der aktuellen Installation
2. **Neue Dateien herunterladen**
3. **Konfiguration übertragen**
4. **Funktionstest durchführen**

#### Kompatibilität prüfen
```javascript
// Version prüfen
console.log('Nodges Version:', window.NODGES_VERSION || '0.80');

// Browser-Kompatibilität
const isCompatible = 
    window.WebGLRenderingContext && 
    window.fetch && 
    window.Promise;
```

### Backup & Restore

#### Konfiguration sichern
```bash
# Wichtige Dateien sichern
cp main.js main.js.backup
cp -r data/ data.backup/
cp -r src/ src.backup/
```

#### Benutzerdaten exportieren
1. **Netzwerke exportieren** über GUI
2. **Einstellungen dokumentieren**
3. **Custom Themes sichern**

## 📊 Monitoring & Logging

### Performance-Monitoring einrichten

#### Automatisches Monitoring
```javascript
// Performance-Überwachung
const monitor = {
    interval: null,
    
    start() {
        this.interval = setInterval(() => {
            const stats = performanceOptimizer.getPerformanceStats();
            
            if (stats.fps < 30) {
                console.warn('Niedrige FPS:', stats.fps);
            }
            
            if (stats.memoryUsage.used > 100) {
                console.warn('Hoher Speicherverbrauch:', stats.memoryUsage.used);
            }
        }, 10000);
    },
    
    stop() {
        clearInterval(this.interval);
    }
};

// Monitoring starten
monitor.start();
```

### Error Logging

#### Fehler-Handler einrichten
```javascript
// Globaler Fehler-Handler
window.addEventListener('error', (event) => {
    console.error('Nodges Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Unhandled Promise Rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
});
```

## 🆘 Support & Hilfe

### Selbsthilfe-Ressourcen
1. **USER_MANUAL.md** - Vollständiges Benutzerhandbuch
2. **FEATURE_OVERVIEW.md** - Feature-Übersicht
3. **Browser-Konsole** - Fehlerdiagnose
4. **Performance-Tools** - Integrierte Monitoring-Tools

### Häufige Fragen (FAQ)

#### F: Welcher Browser ist am besten?
**A:** Chrome bietet die beste Performance, Firefox ist eine gute Alternative.

#### F: Wie groß können Netzwerke sein?
**A:** Empfohlen: <1000 Knoten. Maximum getestet: 10.000 Knoten.

#### F: Funktioniert es offline?
**A:** Ja, nach dem ersten Laden funktioniert es offline (CDN-Abhängigkeiten beachten).

#### F: Kann ich eigene Daten verwenden?
**A:** Ja, JSON, CSV, GEXF und GraphML werden unterstützt.

### Technische Spezifikationen
- **Version:** Nodges 0.80
- **Engine:** Three.js 0.160.0
- **Rendering:** WebGL 2.0
- **Unterstützte Formate:** JSON, CSV, GEXF, GraphML
- **Maximale Netzwerkgröße:** 10.000 Knoten (getestet)
- **Speicherverbrauch:** 50-100MB (typisch)

---

**🎉 Herzlichen Glückwunsch! Nodges 0.80 ist jetzt einsatzbereit!**

Für weitere Hilfe konsultieren Sie das **USER_MANUAL.md** oder die **FEATURE_OVERVIEW.md**.

**Viel Erfolg bei der Netzwerk-Visualisierung!** 🚀