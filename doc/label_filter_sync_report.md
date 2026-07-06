# Synchronisation des Label-Filters und der temporalen Wiedergabe

Dieses Dokument beschreibt die Ursachen und Behebungen für das Problem bei der Datei `109c_stress_test.json`, bei der der Label-Filter keinen Einfluss auf die Szene hatte und die Labels/Kanten während der temporalen Wiedergabe nicht korrekt folgten bzw. aktualisiert wurden.

## Ursachenanalyse

1. **Fehlende Kantenbeziehungen (source/target vs. start/end):**
   * Die Stress-Test-Dateien (z. B. `109c_stress_test.json`) verwenden in ihren Beziehungen die Schlüssel `start` und `end` anstelle von `source` und `target`.
   * Der Code im Visualisierungssystem (z. B. in `LayoutManager.ts`) filterte Beziehungen jedoch streng nach `source` und `target`.
   * Da diese für die Kanten in `109c_stress_test.json` nicht definiert waren, wurden Beziehungen für das Layout mit 0 Elementen verarbeitet.
   * Dadurch wurde die Grad-Metrik (`degree`) für alle Knoten zur Laufzeit als `0` berechnet.
   * Da der minimale und maximale Grad jeweils `0` betrug, blieb der Schwellenwert des Filters wirkungslos (die Formel ergab stets `0`), weshalb keine Labels ausgeblendet werden konnten.

2. **Fehlende Aktualisierung der Node-Positionen bei zeitlicher Interpolation:**
   * In `NodeManager.ts` wurden bei der temporalen Wiedergabe die Keyframes interpoliert und direkt auf die Instanzen (bzw. Meshes) angewendet, um die 3D-Objekte zu bewegen.
   * Das übergeordnete `entity.position`-Objekt wurde dabei jedoch nicht aktualisiert.
   * Da Kanten (`EdgeObjectsManager.ts`) und Labels (`NodeLabelManager.ts`) ihre Berechnungen auf `entity.position` stützen, blieben sie an ihren ursprünglichen Koordinaten stehen.

3. **Fehlendes Homing/Culling für Labels:**
   * Text-Labels und Verbindungslinien wurden nicht ausgeblendet, wenn der dazugehörige Knoten (oder die Kante) zeitlich inaktiv war (`validFrom` / `validTo`).

---

## Durchgeführte Anpassungen

### 1. Daten-Normalisierung in `DataParser.ts`
Wir haben in `DataParser.normalizeData` eine automatische Synchronisation implementiert. Bevor die Zod-Validierung abläuft, werden `start`/`end` und `source`/`target` vollständig abgeglichen, falls nur einer der beiden Sätze definiert ist:

```typescript
        // Normalize relationships: sync start/end and source/target
        if (data && data.data && Array.isArray(data.data.relationships)) {
            data.data.relationships.forEach((rel: any) => {
                if (rel.start !== undefined && rel.source === undefined) {
                    rel.source = rel.start;
                }
                if (rel.source !== undefined && rel.start === undefined) {
                    rel.start = rel.source;
                }
                if (rel.end !== undefined && rel.target === undefined) {
                    rel.target = rel.end;
                }
                if (rel.target !== undefined && rel.end === undefined) {
                    rel.end = rel.target;
                }
            });
        }
```
Dies stellt sicher, dass alle Systemkomponenten (auch Third-Party-Parser oder Workers) konsistente Daten erhalten.

### 2. Aktualisierung von `entity.position` in `NodeManager.ts`
In `NodeManager.ts` wird nun bei der Interpolation der Keyframes in `updateTemporalState` das Koordinaten-Objekt des Knotens direkt aktualisiert. Dies gilt sowohl für das performante `InstancedMesh`-Rendering als auch für das klassische `Mesh`-Rendering:

```typescript
// Auszug aus NodeManager.ts (InstancedMesh-Zweig)
if (interp.position) {
    if (!entity.position) entity.position = { x: 0, y: 0, z: 0 };
    entity.position.x = interp.position.x;
    entity.position.y = interp.position.y;
    entity.position.z = interp.position.z;
    dummy.position.copy(interp.position);
    // ...
}
```

### 3. Kanten- und Label-Updates im Render-Loop (`App.ts`)
Im zentralen Render-Loop von `App.ts` wird bei aktiver Zeitachse das Update der Kantenpositionen explizit getriggert, um den animierten Knoten zu folgen:

```typescript
        if (this.edgeObjectsManager && this.stateManager.state.currentTimestamp !== null) {
            this.edgeObjectsManager.updateEdgePositions(this.stateManager.getEntities());
        }
```

### 4. Dynamische Label-Positionierung und zeitgesteuertes Culling
In `NodeLabelManager.ts` und `EdgeLabelManager.ts` wurden Anpassungen für die Positionierung und Sichtbarkeit vorgenommen:
* **Positionierung:** Die Labels verwenden nun die sich verändernden Koordinaten aus `label.entity.position`.
* **Knoten-Labels Culling:** Labels werden ausgeblendet, wenn der Knoten temporär inaktiv ist:
  ```typescript
  const currentTimestamp = state?.currentTimestamp;
  if (currentTimestamp !== undefined && currentTimestamp !== null && label.entity.temporal) {
      const validFrom = label.entity.temporal.validFrom;
      const validTo = label.entity.temporal.validTo;
      const isTempVisible = (validFrom === undefined || validFrom === null || currentTimestamp >= validFrom) &&
                            (validTo === undefined || validTo === null || currentTimestamp <= validTo);
      if (!isTempVisible) {
          label.sprite.visible = false;
          return;
      }
  }
  ```
* **Kanten-Labels Culling:** Das Label einer Kante wird ausgeblendet, wenn die Kante selbst ausgeblendet ist (`!label.edge.line.visible`).

---

## Verifikationsergebnis

Die Änderungen wurden erfolgreich im Browser mit dem Stress-Test `109c_stress_test.json` getestet:
1. **Labelfilter (Stärke):** Nach der Auswahl von `degree` im Panel reagieren die Labels präzise auf den Schieberegler im Bereich `[0, 1]`. 
   * Schwellenwert `0.25`: 478 / 500 Labels sichtbar.
   * Schwellenwert `0.68`: 291 / 500 Labels sichtbar.
   * Schwellenwert `0.86`: 32 / 500 Labels sichtbar.
   * Schwellenwert `0.99`: 5 / 500 Labels sichtbar.
2. **Temporaler Gleichlauf:** Beim Abspielen der Wiedergabe (Timeline-Play) gleiten die Labels und die Verbindungslinien synchron mit den Kugeln (Knoten) durch den Raum.
3. **Tests:** Sämtliche 189 automatisierten Unit-Tests (Vitest) laufen fehlerfrei durch.
