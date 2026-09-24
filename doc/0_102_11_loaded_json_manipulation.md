# Analyse der automatischen Manipulationen von geladenen JSON-Dateien

In Nodges wird eine strikte Trennung zwischen Datengenerierung/Erstellung und der visuellen Darstellung angestrebt. Automatische Veraenderungen an den geladenen Daten beim Laden oder Darstellen sind auf ein Minimum reduziert.

## Die einzige Ausnahme: Positions-Fallback
Die einzige automatische Manipulation einer geladenen JSON-Datei betrifft das Hinzufuegen von Fallback-Positionen, wenn Knoten keine Positionsdaten besitzen.

### Ort der Implementierung
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts` in der Methode `loadGraphData`:
```typescript
// Assign random positions around (0,0,3) for nodes that lack position data.
// This maintains data neutrality without forcing a specific physics layout, 
// and prevents camera bugs where zoom distances evaluate to 0.
if (graphData.data && Array.isArray(graphData.data.entities)) {
    graphData.data.entities.forEach((e: any) => {
        if (e.position === undefined) {
            e.position = {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4,
                z: 3 + (Math.random() - 0.5) * 4,
                isRandomFallback: true
            };
        }
    });
}
```

### Zweck
* **Verhinderung von Null-Kollaps**: Verhindert, dass alle Knoten ohne explizite Positionen an der Koordinate `(0,0,0)` übereinander liegen.
* **Kamera-Stablitaet**: Behebt Berechnungsfehler bei der automatischen Kameraausrichtung (Fit to Scene), die auftreten, wenn alle Distanzen 0 sind.
* **Kennzeichnung**: Die Positionen werden mit `isRandomFallback: true` markiert, um sie im weiteren Verlauf von manuell gesetzten oder explizit berechneten Positionen unterscheiden zu koennen.

---

## Geplante Massnahmen fuer das Hardening von Build 8
1. **Entfernung des Post-Processings**: Die in `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts` am Ende von `generateGraphDataBuild8` hinzugefuegte automatische Sizing-Regel wird vollstaendig entfernt.
2. **Strikte Trennung**: Regeln bezueglich Knotengroesse und Kantendicke verbleiben ausschliesslich als logische Instruktionen im System-Prompt (`build_8_mapping_prompt.md`). Das visualisierte JSON wird danach unveraendert an die Darstellungs-Engine uebergeben.
