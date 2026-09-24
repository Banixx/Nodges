# Implementierungsplan: Visuelle Zeitsteuerung und Premium-Slider

Dieses Dokument beschreibt die geplante Modernisierung der zeitbasierten Steuerung (Time Slider) in Nodges. Ziel ist eine optisch ansprechende, reaktive und informative Benutzeroberflaeche, die dem Benutzer sofort Feedback ueber den zeitlichen Verlauf und die Aktivitaet von Knoten und Kanten gibt.

## 1. Design- und UX-Verbesserungen

### Premium Glassmorphism Panel
Das Container-Element des TimePlayers wird optisch an das bestehende Design-System angepasst und aufgewertet:
- **Hintergrund:** Transluzentes Dunkelgrau mit starkem Weichzeichner (`rgba(30, 30, 28, 0.75)` mit `backdrop-filter: blur(16px)`).
- **Rahmen:** Feiner, dezenter Rahmen (`1px solid rgba(255, 255, 255, 0.1)`).
- **Schatten:** Weicher, tiefer Schatten (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5)`).
- **Positionierung:** Zentriert am unteren Bildschirmrand mit modernem Padding und abgerundeten Ecken (`border-radius: 16px`).

### Interaktiver Custom Slider
Der Standard-HTML-Range-Input wird durch ein modernes, vollstaendig gestyltes Steuerelement ersetzt:
- **Track (Schiene):** Sehr schmaler, dezenter Pfad (`height: 4px`), farblich im Hintergrund gedimmt.
- **Thumb (Schieberegler):** Kontrastreicher, runder Griff, der bei Hover und Drag sanft pulsiert/waechst (Farbe: Accent-Color).
- **Keyframe-Ticks (Zeitmarken):** Dynamische, kleine Markierungen (Punkte/Linien) entlang des Tracks. Diese Ticks repraesentieren die Zeitpunkte, an denen Knoten/Kanten aktiv werden (`validFrom` / `validTo`) oder historische Keyframes in ihren `temporal.history`-Daten besitzen. Dadurch sieht der Benutzer auf einen Blick, wo sich Daten im Zeitstrahl befinden.

### Transport-Controls & Play-State Animationen
Die Steuerungselemente werden erweitert und animiert:
- **Play/Pause-Button:** Erhaelt eine kreisrunde, ansprechende Optik mit sanften Hover-Transitions.
- **Geschwindigkeitsregler (Speed Controls):** Ein dezenter Selektor fuer die Abspielgeschwindigkeit (`0.5x`, `1x`, `2x`, `5x`, `10x`), um langsame Verlaeufe zu beschleunigen oder schnelle Details in Zeitlupe zu betrachten.
- **Rewind/Skip-Buttons:** Optionale Buttons fuer "Zurueck zum Anfang" (Rewind) und "Vorwaerts zum Ende" (Skip).

### Intelligente Zeitstempel-Formatierung
Statt roher Zahlenwerte wird die Zeitanzeige im Slider kontextsensitiv formatiert:
- **Geologische Zeitraeume (z.B. AI Planetengenerierung):** Grosse negative/positive Zahlen werden formatiert (z.B. `-4.6 Mrd. Jahre` oder `3.2 Mio. Jahre`).
- **Unix-Timestamps (in Millisekunden/Sekunden):** Konvertierung in lesbare Datums- und Uhrzeitformate (z.B. `12.07.2026`).
- **Jahreszahlen (z.B. Korallenriff):** Darstellung als Jahr (z.B. `1950` oder `450 v. Chr.`).
- **Standardwerte:** Formatierung mit Tausendertrennzeichen und maximal zwei Nachkommastellen (z.B. `1.250,5`).

---

## 2. Technische Umsetzung

Die Umsetzung erfolgt primaer in [TimePlayerUI.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/TimePlayerUI.ts) sowie durch Ergaenzungen in der CSS-Struktur [main.css](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/styles/main.css).

### CSS-Klassen in `main.css` [NEW]
Wir definieren dedizierte CSS-Klassen fuer das Zeitpanel, anstatt alle Styles direkt via Javascript inline zu setzen:
- `.time-player-panel` -- Hauptcontainer mit Glassmorphism-Effekt.
- `.tp-btn` -- Styling fuer Play, Rewind, Skip und Speed Buttons.
- `.tp-slider-container` -- Flexbox zur Ausrichtung des Sliders und seiner Ticks.
- `.tp-slider` -- Custom-Styling des `input[type="range"]` (Webkit-Thumb, Track, active-States).
- `.tp-tick` -- Absolute Positionierung der Keyframe-Ticks auf dem Track.
- `.tp-speed-select` -- Stilvoller Selektor fuer die Abspielgeschwindigkeit.

### Logik-Erweiterung in `TimePlayerUI.ts` [MODIFY]
- **Keyframe-Extraktion:** Beim Empfangen von neuen Graphdaten (`handleDataChange`) werden alle eindeutigen temporalen Eckdaten (`validFrom`, `validTo`, `history[].timestamp`) gesammelt, sortiert und gefiltert.
- **Tick-Rendering:** Fuer jeden extrahierten Zeitstempel wird ein kleines DOM-Element (`span.tp-tick`) erstellt und relativ auf der Timeline positioniert. Bei Hover zeigt ein Tooltip den entsprechenden Zeitstempel an.
- **Speed-Integration:** Bindung des Speed-Selektors an das `playbackSpeed`-Attribut im StateManager.
- **Formatierungsfunktion:** Eine Hilfsmethode `formatTimestamp(val: number): string` sorgt fuer die kontextsensitiv angepasste Zeitdarstellung.

---

## 3. Verifikationsplan

### Automatisierte Tests
- Pruefung, ob das Projekt fehlerfrei transpiliert und baut (`npm run build`).
- Ausfuehrung der Unit-Tests (`npm test`), um sicherzustellen, dass keine Regressionen entstehen.

### Manuelle Verifikation
- Laden der Datei `korallenriff_build5.json` und Verifikation der Ticks fuer die Jahre 1950, 1970, 1980 und 1990.
- Interaktives Abspielen und Pausieren sowie Veraendern der Abspielgeschwindigkeit.
- Scrubbing ueber den Slider und Pruefung, ob Knoten und Kanten praezise und ohne Verzoegerung ein- und auszublenden werden.
- Ueberpruefung der responsiven Darstellung und des visuellen Wow-Effekts.
