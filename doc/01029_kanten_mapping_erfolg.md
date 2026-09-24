# Dokumentation: Kanten-Mapping erfolgreich behoben

## Durchgefuehrte Aenderungen

### 1. Freigabe von `label` fuer Beziehungen (Relationships)
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/core/BuildFormatUtils.ts` wurde die Filterung von reservierten Schluesseln so angepasst, dass `label` fuer Beziehungen nicht laenger herausgefiltert wird. Dadurch steht das `label`-Attribut (z. B. `"cdn_miss_routing"`) fuer Kanten im Mapping-Panel zur Verfuegung.

**Code-Aenderung in `BuildFormatUtils.ts`**:
```typescript
const isRelationship = ('source' in entity && 'target' in entity);
const reservedKeys = isRelationship
    ? ['id', 'source', 'target', 'start', 'end', 'temporal', 'stateVector']
    : ['id', 'label', 'temporal', 'stateVector'];
```

### 2. Standard-Kanten-Presets in Auto-Suggestions integrieren
In `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/SuggestionUI.ts` wurden die automatisch generierten Vorschlaege ("Farbe nach..." und "Groesse/Farbe nach...") um das standardmaessige konstante Kanten-Mapping fuer `global_edge` erweitert, damit das Kanten-Mapping nicht leer bleibt, wenn ein Vorschlag uebernommen wird.

## Resultat und Validierung
- **Unit Tests**: Alle 16 Tests in `DataParser.test.ts` (einschliesslich des neuen Tests fuer getAvailableProperties) wurden erfolgreich ausgefuehrt.
- **UI-Test**: Nach dem Laden von `gg.json` ist das Attribut `label` unter dem Reiter **Edges** verfuegbar und kann per Drag-and-Drop erfolgreich auf die visuelle Eigenschaft **Farbe** gezogen werden. Die Kanten in der 3D-Szene werden entsprechend ihrer Labels eingefaerbt.
