# Verbesserung der Tab-Navigation

Die aktuelle Tab-Leiste stößt bei zunehmender Anzahl an Tabs an ihre Platzgrenzen. Statt einer fehleranfälligen "Slide-on-Hover"-Logik schlage ich eine modernere, scrollbare Tab-Leiste vor.

## User Review Required

> [!IMPORTANT]
> Ich empfehle die Verwendung einer natürlichen Scroll-Logik (Mausrad/Touch) kombiniert mit einem automatischen "Scroll-into-view" für aktive Tabs. Dies ist robuster als das Sliden bei Hover.

## Proposed Changes

### UI & Styling

#### [MODIFY] [main.css](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/styles/main.css)
- Umstellung von `.sidebar-tabs` auf `flex-wrap: nowrap` und `overflow-x: auto`.
- Ausblenden der Scrollbar für ein cleanes Design.
- Hinzufügen eines `mask-image` (Linear Gradient), um die Ränder sanft auszublenden, wenn Inhalt vorhanden ist.
- Anpassung von `.sidebar-tab`, damit diese eine Mindestbreite behalten (`flex: 0 0 auto`).

### Interaktions-Logik

#### [MODIFY] [index.html](file:///c:/Users/ich/Desktop/code/_projects/Nodges/index.html)
- Erweiterung des Tab-Click-Handlers: Wenn ein Tab aktiviert wird, soll er automatisch mittels `scrollIntoView({ behavior: 'smooth', inline: 'center' })` in den sichtbaren Bereich geholt werden.

## Verification Plan

### Manual Verification
- Testen der Tab-Leiste mit vielen Tabs (simuliert durch Duplizieren der Buttons).
- Überprüfen des horizontalen Scrollens mit dem Mausrad.
- Verifizieren, dass der aktive Tab beim Anklicken automatisch zentriert wird.
- Optische Prüfung der "Fade-out" Effekte an den Rändern.
