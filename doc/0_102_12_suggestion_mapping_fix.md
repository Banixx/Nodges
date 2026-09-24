# Suggestion Mapping Bugfix & Logik

## Problembeschreibung
Beim Laden einer Datei konnte bisher nur das "Mapping aus Vorlage" permanent uebernommen werden. Andere generierte Vorschlaege im Suggestion-Panel hatten keinen "Uebernehmen"-Button. Wenn ein Nutzer auf eine andere Karte klickte, wurde lediglich ein "Preview-Lock" (`currentPreviewMapping`) gesetzt. Da dies jedoch nicht den globalen State aktualisierte, blieb das `MappingUI` auf dem alten Stand. Sobald die Maus das Suggestion-Panel verliess, wurde der Preview-Lock wieder angewendet, was manuelle Aenderungen im `MappingUI` ueberschrieb und den Anschein erweckte, dass man keine anderen Mappings auswaehlen konnte.

## Loesung
1. **Buttons fuer alle Karten**: Jede Suggestion-Karte erhaelt nun einen "Ansicht uebernehmen"-Button.
2. **Uebernehmen bei Klick**: Ein Klick auf die Karte oder den Button loest `onApplyMapping` aus, was das Mapping permanent im State und im `MappingUI` verankert.
3. **Aufloesung des Preview-Locks**: Die Funktion `clearPreview` wurde zur `SuggestionUI` hinzugefuegt. Diese wird von `App.ts` aufgerufen, sobald `updateVisualMappings` (z.B. durch manuelle Aenderung im `MappingUI`) getriggert wird. Dadurch wird der Preview-Lock (`currentPreviewMapping`) geloescht und ein `mouseleave` im Suggestion-Panel greift wieder korrekt auf den aktuellen State (`null`) zurueck, anstatt eine veraltete Vorschau darzustellen.
