# Typografie-Evaluierung: Arial vs. Inter fuer Nodges-Overlays

Dieses Dokument dokumentiert die Bereinigung und Umstellung der Schriftart "Arial" auf die standardisierte Schriftart "Inter" im gesamten Projekt.

## 1. Aktueller Status
Alle Referenzen auf "Arial" wurden erfolgreich aus der aktiven Codebasis und den Stylesheets von Nodges entfernt. Die Schriftarten werden nun einheitlich ueber die CSS-Variable `--font-family` oder direkt mit "Inter" gesteuert:

* **C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/FileHandler.ts**:
  ```typescript
  font-family: var(--font-family, 'Inter', sans-serif);
  ```
* **C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/EdgeLabelManager.ts**:
  ```typescript
  context.font = `${fontSize}px Inter, sans-serif`;
  ```
* **C:/Users/ich/Desktop/code/_projects/Nodges/colorscheme.css**:
  ```css
  font-family: var(--font-family, 'Inter', sans-serif);
  ```

## 2. Bewertung der Umstellung
Die Entfernung von "Arial" hat folgende Vorteile fuer das Nodges-Projekt:

* **Konsistenz des Design-Systems**: Die gesamte Benutzeroberflaeche und die 3D-Visualisierung nutzen nun einheitlich die Schriftart "Inter", was fuer ein harmonisches Gesamtbild sorgt.
* **Zentrale Steuerbarkeit**: Durch die Verwendung von `var(--font-family)` koennen Schriftarten global angepasst werden, ohne hartcodierte Werte in einzelnen Quellcode-Dateien anfassen zu muessen.
* **Aesthetik und Lesbarkeit**: Inter wurde speziell fuer Benutzeroberflaechen entwickelt und bietet eine hervorragende Lesbarkeit bei verschiedenen Schriftgroessen und Aufloesungen.
