# Behebung des Knotensichtbarkeitsproblems (Nodes)

Dieses Dokument beschreibt die Ursache und Loesung fuer das Problem, bei dem Knoten (Nodes) nach dem Laden bestimmter Graphendaten (wie `gg.json` oder `ff.json`) nicht in der 3D-Szene gerendert beziehungsweise an falschen Koordinaten platziert wurden.

## Ursache

In `src/core/NodeManager.ts` wurde die Positionierung der Knoten beim Erstellen der Geometrien (sowohl fuer `THREE.Mesh` als auch fuer `THREE.InstancedMesh`) wie folgt berechnet:

```typescript
const x = visual.positionX !== undefined ? visual.positionX : 0;
const y = visual.positionY !== undefined ? visual.positionY : 0;
const z = visual.positionZ !== undefined ? visual.positionZ : 0;
```

Wenn eine Graph-Datei geladen wird, die kein explizites Visual Mapping fuer die Position definiert (sondern stattdessen auf den im Datenmodell hinterlegten statischen Koordinaten basiert), ist `visual.positionX/Y/Z` zu diesem Zeitpunkt `undefined`.

Dadurch wurden alle Knoten faelschlicherweise auf `(0, 0, 0)` gesetzt. Da die Kanten (Edges) in `EdgeObjectsManager.ts` jedoch direkt auf die `entity.position`-Attribute zugreifen und korrekt gezeichnet wurden, blieben die Knoten an `(0, 0, 0)` konzentriert und waren fuer den Benutzer nicht an den Endpunkten der Kanten sichtbar.

## Loesung

Der Fallback fuer die X-, Y- und Z-Koordinaten im `NodeManager` wurde so angepasst, dass bei Fehlen eines expliziten visuellen Mappings (`visual.positionX` ist `undefined`) auf die im Datenobjekt (`entity.position`) hinterlegten Koordinaten zurueckgegriffen wird. Nur wenn auch diese nicht vorhanden sind, faellt das System auf `0` zurueck.

Die betroffenen Stellen in `src/core/NodeManager.ts` wurden wie folgt geaendert:

```typescript
// Position mapped override (fallback to entity.position)
const x = visual.positionX !== undefined ? visual.positionX : (entity.position?.x !== undefined ? entity.position.x : 0);
const y = visual.positionY !== undefined ? visual.positionY : (entity.position?.y !== undefined ? entity.position.y : 0);
const z = visual.positionZ !== undefined ? visual.positionZ : (entity.position?.z !== undefined ? entity.position.z : 0);
```

Dies wurde sowohl fuer den Instanced-Rendering-Pfad (`THREE.InstancedMesh`) als auch fuer den Standard-Mesh-Pfad (`THREE.Mesh`) umgesetzt.

## Ergebnis

- Die Knoten werden nun beim Laden von `gg.json` sofort an ihren korrekten Koordinaten gezeichnet und sind an den Schnittpunkten der Verbindungen sichtbar.
- Nach dem Laden und der Uebernahme des Mappings aus der Vorlage werden die Knoten gemaess ihrem Status eingefaerbt (gruen fuer `active`, rot fuer `inactive`, gelb fuer `maintenance`) und entsprechend der Last (`load`) skaliert.
