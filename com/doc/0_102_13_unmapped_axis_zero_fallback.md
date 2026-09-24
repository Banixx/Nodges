# Dokumentation: Strikter 0-Fallback fuer ungemappte Achsen bei aktivem Positions-Mapping

## Problemstellung
Sobald der Benutzer im Visual Mapping ein Attribut (wie `entity_type`) auf eine einzelne Achse (z.B. `Position (Nur X Achse)`) zuwies, wurden fuer die ungemappten Achsen (Y und Z) bisher als Fallback noch veraltete Koordinaten aus `entity.position` herangezogen.

## Anpassung
In [src/core/NodeManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/NodeManager.ts#L354-L358) wurde das Verhalten angepasst:
Sobald mindestens eine Achse (z.B. X) explizit ueber Visual Mappings zugewiesen ist, fallen ungemappte Achsen (Y und Z) strikt auf den Standardwert `0` zurueck (`isAnyPosMapped ? 0 : entity.position`).
