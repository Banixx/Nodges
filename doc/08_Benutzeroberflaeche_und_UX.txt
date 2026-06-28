# 08 Benutzeroberfläche (UI) und UX-Design

In Nodges ist das UI kein Selbstzweck, sondern das Navigationsinstrument für die 3D-Welt. Wir verfolgen eine "Canvas-First"-Strategie: Die Daten stehen im Mittelpunkt, das Interface ordnet sich unter.

## 08.1 Die Hybrid-Architektur (DOM + WebGL)

Nodges nutzt zwei Welten gleichzeitig:

1. **WebGL (Canvas)**: Für das High-Performance Rendering der 3D-Daten.
2. **HTML/CSS (DOM)**: Für Texte, Formulare und komplexe Layouts.

**Der Vorteil**: HTML ist unschlagbar flexibel für Textdarstellung und Accessibility. Durch die Überlagerung (Z-Index) können wir die Vorteile beider Welten nutzen, ohne die Performance der 3D-Engine durch teure "Text-in-WebGL"-Tricks zu belasten.

## 08.2 Das "Glassmorphism" Design-Konzept

Um den futuristischen und leitenden Charakter einer 3D-Anwendung zu unterstreichen, nutzt Nodges ein modernes **Glassmorphism-Design**:

* **Transparenz**: Panels sind leicht durchsichtig (`backdrop-filter: blur(10px)`). Man sieht den Graphen "hinter" dem Menü noch leicht durchschimmern.
* **Kontrast**: Dunkle Hintergründe mit neonfarbenen Akzenten sorgen für maximale Lesbarkeit in dunklen Arbeitsumgebungen.

---

## 08.3 Kern-Komponenten des Interfaces

### 1. Main-Sidebar (Rechts) und Tab-System

Die Sidebar ist die Steuerungszentrale der Applikation. Sie beherbergt die verschiedenen Einstellungen, unterteilt in thematische Tabs:

* **Tab-Navigation**: Ein horizontales Tab-Menü mit Custom-Scrollbar und horizontalem Scroll-Support (z.B. per Mausrad).
* **Tab-Inhalte**:
    * **System**: Zeigt den UI-Modus-Umschalter sowie allgemeine Datei-Informationen (Knoten, Kanten, FPS) und die Farblegende.
    * **Ebenen (Expert)**: Steuerung der Transparenz und Sichtbarkeit einzelner Ebenen/Gruppen basierend auf Attributen.
    * **Files (Simple)**: Der Dateimanager mit direktem Zugriff auf Beispieldateien sowie Aktionen zur Erstellung neuer Graphen ("New"), dem Öffnen von Dateien ("Open") und dem Exportieren ("Save As").
    * **Ansicht (Simple)**: Steuerung der 3D-Umgebung und Rendering-Optionen (Kanten-Dicke, Highlight-Effekte).
    * **Create (Dev)**: Werkzeuge zum manuellen Hinzufügen von Knoten und Kanten.
    * **Mappings (Expert)**: Konfiguration des dynamischen Visual Mappings (Kanal-Mapping für Farbe, Größe und Presets).
    * **Layout (Expert)**: Auswahl des Layout-Verfahrens (Force-Directed, Grid, Sphere, Helix) und Tuning der Physik-Simulation.
    * **Dev (Dev)**: Spezifische Debugging-Optionen für Entwickler.

### 2. Drei-Stufen-Modus (UI Complexity Mode)

Um den Benutzer nicht mit Optionen zu überladen, implementiert Nodges drei Komplexitätsstufen, die über den `StateManager` gesteuert werden:

* **Simple**: Standardmodus für Betrachter. Zeigt nur die Tabs "System", "Files" und "Ansicht" sowie grundlegende Info-Zeilen.
* **Expert**: Für fortgeschrittene Analysten. Schaltet zusätzlich "Ebenen", "Mappings" und "Layout" sowie erweiterte Info-Zeilen (z.B. Achsenbereiche) frei.
* **Dev**: Für Entwickler. Schaltet alle Steuerungselemente und die Tabs "Create" und "Dev" frei.
* **Implementierung**: Elemente im HTML werden mit `data-min-mode` annotiert (z.B. `data-min-mode="expert"`). Die Sichtbarkeit wird über CSS-Regeln gesteuert.

### 3. Dateimanager & Custom Save As Modal

* **New / Open**: Löscht das aktuelle System oder öffnet einen systemeigenen Datei-Dialog zum Laden valider JSON-Daten.
* **Save As**: Öffnet ein maßgeschneidertes, im Glassmorphism-Stil gehaltenes Modal, das den Export des aktuellen Graphen in den Formaten JSON (Future-Format) und Markdown ermöglicht.

### 4. Floating Panels (Legend, Info)

* **Legend Panel**: Zeigt dynamisch die Farbkodierung und Größen-Mappings an.
* **Info Inspector Panel**: Sobald ein Objekt im 3D-Raum angeklickt wird, öffnet sich dieses schwebende Panel und stellt alle Attribute als Key-Value-Paare dar. Ein automatischer Textumbruch (Word-Wrap) verhindert Clipping bei langen Werten oder tief verschachtelten JSON-Objekten.

---

## 08.4 UX-Leitsätze in Nodges

### "Never lose context"

In 3D verliert man schnell die Orientierung. Unser UI hilft:

* **Minimap**: Eine Echtzeit-Übersichtskarte des Graphen zur Orientierung in der 3D-Szene.
* **Fokus-Zoom**: Doppelklick auf ein Objekt zoomt die Kamera sanft auf das Ziel (Cinematic Camera Fly-to).

### "Meaningful Motion"

Animationen sind nicht nur Zierde. Wenn sich ein Panel öffnet, schiebt es sich sanft ins Bild. Wenn Daten geladen werden, gibt es einen Fortschrittsbalken. Jede Bewegung signalisiert dem User: "Hier passiert etwas".

### "Fail Fast, Show Clear"

Wenn eine Datei fehlerhaft ist, erscheint kein "Error 500", sondern ein informatives Overlay: "Fehler in Zeile 45: Koordinate 'z' fehlt". Wir führen den User zur Lösung.

---
*Dokumentations-Status: V2.1 (Updated)*
*Geprüft gegen Build: 0.101.3*
