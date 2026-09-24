# Analyse und Implementierungsplan: Kanten-Mapping und fehlende Attribute

## Problembeschreibung
Beim Laden von Graphendaten (wie `gg.json`) werden fuer Kanten (Edges) im Mapping-Panel keine Mappings angezeigt. Dies hat mehrere Gruende:

1. **Fehlende Kanten-Mappings in den Dateien**: In den geladenen JSON-Dateien sind keine VisualMappings fuer Kanten definiert (weder unter `global_edge` noch unter typisierten Presets).
2. **Fehlende kategoriale Attribute fuer Kanten**:
   - Die geladenen Beziehungen besitzen das Attribut `label` (z. B. `"cdn_miss_routing"`).
   - Dieses Attribut wird jedoch nicht im linken Bereich "ATTRIBUTE (DATEN)" des Edges-Tabs angezeigt, da `label` in `reservedKeys` innerhalb von `BuildFormatUtils.ts:getAvailableProperties()` aufgeführt ist und daher fuer alle Entitaeten gefiltert wird.
   - Da andere Attribute wie `status` und `load` fuer Kanten den Wert `0-0 Werte` aufweisen (weil sie nur fuer Knoten existieren), stehen dem Benutzer keine nutzbaren Kanten-Attribute zur Verfuegung.
3. **Wegfall von Kanten-Voreinstellungen bei Auto-Suggestions**:
   - Die in `SuggestionUI.ts` generierten Vorschlaege (z. B. "Farbe nach status") definieren ausschliesslich Mappings fuer `global_node`.
   - Bei der Auswahl dieser Vorschlaege wird das Mapping fuer `global_edge` komplett geloescht bzw. bleibt leer, weshalb im Edges-Tab keine Standard-Verbindungslinien oder Werte angezeigt werden.

## Loesungsansatz

### 1. Freigabe von `label` fuer Beziehungen (Relationships)
Wir passen `getAvailableProperties` in `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/BuildFormatUtils.ts` so an, dass `label` nur fuer Knoten (Entities) ein reserviertes Wort ist, nicht jedoch fuer Kanten (Relationships).

```typescript
// In Build 5 koennen Eigenschaften auch direkt auf der Entity liegen (ausser den reservierten Keys)
const isRelationship = entity && ('source' in entity && 'target' in entity);
const reservedKeys = isRelationship 
    ? ['id', 'source', 'target', 'start', 'end', 'temporal', 'stateVector'] 
    : ['id', 'label', 'temporal', 'stateVector'];
```

### 2. Standard-Kanten-Presets in Auto-Suggestions integrieren
Wir erweitern die in `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/SuggestionUI.ts` generierten Vorschlaege ("Farbe nach..." und "Groesse/Farbe nach..."), sodass sie immer ein standardmaessiges konstantes Kanten-Mapping fuer `global_edge` mitsenden. Dadurch wird verhindert, dass das Kanten-Mapping im UI komplett leer und ohne Bezugspunkte bleibt.
