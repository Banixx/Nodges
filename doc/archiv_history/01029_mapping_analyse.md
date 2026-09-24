# Analyse und Implementierungsplan: Mapping-Problem bei nicht-standardkonformen Preset-Keys

## Problembeschreibung
Die Mappings in den Dateien `gg.json` und `ff.json` werden im Interface und in der 3D-Szene nicht angewendet oder angezeigt, obwohl die Daten geladen wurden. 

Der Grund dafür liegt an unterschiedlichen Preset-Schlüsseln in der Graphen-JSON:
1. In den generierten JSON-Dateien (`gg.json`, `ff.json`, etc.) ist die visuelle Konfiguration unter `defaultPresets.main_view` definiert.
2. Die Applikation (Nodges Build 5) erwartet unter `defaultPresets` jedoch strikt die Schlüssel `global_node` (für Knoten-Mappings) und `global_edge` (für Kanten-Mappings).
3. Da `main_view` weder `global_node` noch `global_edge` entspricht und auch kein spezifischer Entitätstyp im Graphen ist (da die Entitäten keinen `type` besitzen), wird das Preset komplett ignoriert:
   - `VisualMappingEngine.ts` sucht nur nach `global_node`/`global_edge` und wendet daher Standardwerte an.
   - `MappingUI.ts` sucht nur nach `global_node`/`global_edge` (bzw. vorhandenen Typen) und zeichnet daher keine Verbindungen.

## Lösungsansatz
Wir normalisieren die Keys von `defaultPresets` in `DataParser.ts` während des Parsens/Normalisierens der Graphen-Daten. Wenn ein benutzerdefinierter Key wie `main_view` vorliegt, mappen wir diesen anhand seiner Attribute (z.B. `size` für Knoten, `thickness` für Kanten) oder als Fallback auf `global_node` bzw. `global_edge`.

### Änderungen in `src/core/DataParser.ts`
Wir erweitern `normalizeData` um einen Normalisierungsschritt für `visualMappings`:

```typescript
        // Normalisiere visualMappings defaultPresets Keys
        if (data.visualMappings && data.visualMappings.defaultPresets) {
            const presets = data.visualMappings.defaultPresets;
            const newPresets: any = {};
            
            const nodeProps = ['position', 'positionX', 'positionY', 'positionZ', 'size', 'color', 'geometry', 'glow', 'animation', 'attraction', 'repulsion', 'inertia'];
            const edgeProps = ['thickness', 'color', 'curvature', 'glow', 'opacity', 'animation_flow', 'animation_sequential', 'animation_pulse', 'animation_segments'];
            
            Object.entries(presets).forEach(([key, value]) => {
                if (value && typeof value === 'object') {
                    if (key === 'global_node' || key === 'global_edge') {
                        newPresets[key] = value;
                    } else {
                        const keys = Object.keys(value);
                        const isNodePreset = keys.some(k => nodeProps.includes(k) && !edgeProps.includes(k));
                        const isEdgePreset = keys.some(k => edgeProps.includes(k) && !nodeProps.includes(k));
                        
                        if (isNodePreset || (keys.includes('size') && !keys.includes('thickness'))) {
                            newPresets['global_node'] = {
                                ...(newPresets['global_node'] || {}),
                                ...value
                            };
                            console.log(`[DataParser] Custom Node-Preset "${key}" zu "global_node" normalisiert.`);
                        } else if (isEdgePreset || (keys.includes('thickness') && !keys.includes('size'))) {
                            newPresets['global_edge'] = {
                                ...(newPresets['global_edge'] || {}),
                                ...value
                            };
                            console.log(`[DataParser] Custom Edge-Preset "${key}" zu "global_edge" normalisiert.`);
                        } else if (key === 'main_view' || key === 'default') {
                            newPresets['global_node'] = {
                                ...(newPresets['global_node'] || {}),
                                ...value
                            };
                            console.log(`[DataParser] Generisches Preset "${key}" zu "global_node" normalisiert.`);
                        } else {
                            newPresets[key] = value;
                        }
                    }
                }
            });
            data.visualMappings.defaultPresets = newPresets;
        }
```

Dadurch werden alle nicht-standardkonformen Presets automatisch korrigiert. Die restliche Applikation kann ohne Änderungen und voll funktionsfähig weiterarbeiten.
