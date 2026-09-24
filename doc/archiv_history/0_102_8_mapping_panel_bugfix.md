# Mapping Panel Bugfix: Fehlende Verbindungen bei Position-Attributen

## Problembeschreibung
Der User berichtete, dass im Mapping Panel zwar die visuellen Kanäle `Position X`, `Position Y` und `Position Z` (auf der rechten Seite) orange hervorgehoben waren – was bedeutet, dass ein aktives Mapping existiert –, aber keine gestrichelten Verbindungslinien von der linken Seite (den Daten-Attributen) gezeichnet wurden. Zudem tauchten die Rohdaten-Attribute für die Position (`position.x`, `position.y`, `position.z`) überhaupt nicht in der linken Spalte auf. Da die Regel lautet: "Was gemappt ist, muss verbunden sein", stellte dies einen fundamentalen UI-State-Fehler dar.

## Ursachenanalyse
Die Analyse des Codes ergab, dass die UI-Komponente (`MappingUI.ts`) die Liste der verfügbaren Attribute über die Funktion `getAvailableProperties` in `BuildFormatUtils.ts` bezieht. 
Dort gab es jedoch einen strikten Filter, der komplexe Objekte absichtlich ignorierte:
```typescript
if (typeof (entity as any)[k] !== 'object' || Array.isArray((entity as any)[k])) {
    props.add(k);
}
```
Da die vom LLM generierten Positionsdaten als verschachteltes Objekt vorliegen (`position: { x: ..., y: ..., z: ... }`), griff dieser Filter. Das Attribut `position` wurde vollständig ignoriert und nicht an die UI übergeben.

**Die Folge:** 
1. Die linke Spalte renderte keinen Knoten für `position.x` oder `position`.
2. Als die Mapping-UI versuchte, die Kurven zu zeichnen (`drawCurves`), suchte sie nach dem HTML-Element mit `data-attr="position.x"`. Da dieses Element fehlte, konnte keine Kurve gezeichnet werden, obwohl das Mapping programmatisch korrekt im Hintergrund angewendet wurde.

## Implementierter Fix
In `BuildFormatUtils.ts` wurde der Objekt-Filter so angepasst, dass reguläre JavaScript-Objekte (wie `{x, y, z}`) nun korrekt durchgelassen werden:
```typescript
if (typeof (entity as any)[k] !== 'function') {
    props.add(k);
}
```
Dadurch erkennt `MappingUI.ts` nun das `position`-Objekt, parst dessen Untereigenschaften (`x`, `y`, `z`) und erstellt dafür eine einklappbare Attribut-Gruppe. Die HTML-Elemente für `position.x`, `position.y` und `position.z` werden generiert, wodurch der Zeichenalgorithmus für die Kurven nun seine Startpunkte findet und die gestrichelten Linien korrekt darstellen kann.
