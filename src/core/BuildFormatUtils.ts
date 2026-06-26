import { DataModel, PropertySchema, EntityData } from '../types';

/**
 * BuildFormatUtils
 * 
 * Provides utility functions to handle different JSON build formats (Build 1, Build 2, Build 3+)
 * without converting them. It abstracts the structural differences (e.g. dataModel.entities vs dataModel.properties,
 * flat attributes vs stateVector).
 */

/**
 * Checks if the DataModel is in the Build 1 format (has entities/relationships).
 */
export function isBuild1DataModel(dm: DataModel): dm is { entities: Record<string, any>; relationships: Record<string, any> } {
    return 'entities' in dm || 'relationships' in dm;
}

/**
 * Checks if the DataModel is in the Build 2/3 format (has global properties).
 */
export function isBuild2DataModel(dm: DataModel): dm is { properties: Record<string, PropertySchema> } {
    return 'properties' in dm;
}

/**
 * Retrieves the PropertySchema for a given attribute, abstracting away the format differences.
 */
export function getPropertySchema(dm: DataModel | undefined, entityType: string, propName: string): PropertySchema | undefined {
    if (!dm) return undefined;

    if (isBuild1DataModel(dm)) {
        return dm.entities?.[entityType]?.properties?.[propName] || 
               dm.relationships?.[entityType]?.properties?.[propName];
    } else if (isBuild2DataModel(dm)) {
        return dm.properties?.[propName];
    }
    return undefined;
}

/**
 * Returns a list of all available property names for an entity type, abstracting away the format differences.
 */
export function getAvailableProperties(dm: DataModel | undefined, entityType: string, entity?: EntityData): string[] {
    const props = new Set<string>();

    if (dm) {
        if (isBuild1DataModel(dm)) {
            const entityProps = dm.entities?.[entityType]?.properties;
            if (entityProps) {
                Object.keys(entityProps).forEach(k => props.add(k));
            }
        } else if (isBuild2DataModel(dm)) {
            const globalProps = dm.properties;
            if (globalProps) {
                Object.keys(globalProps).forEach(k => props.add(k));
            }
        }
    }

    // Fallback/Erweiterung: Wenn eine Entity übergeben wurde, auch deren dynamische Keys scannen
    if (entity) {
        // Build 1 (flache Attribute)
        Object.keys(entity).forEach(key => {
            if (!['id', 'type', 'label', 'position', 'stateVector', 'degree', 'inDegree', 'outDegree'].includes(key)) {
                props.add(key);
            }
        });

        // Build 2/3 (stateVector)
        if (entity.stateVector && typeof entity.stateVector === 'object') {
            Object.keys(entity.stateVector).forEach(key => props.add(key));
        }
    }

    return Array.from(props);
}

/**
 * Retrieves an attribute value from an entity, abstracting away flat properties (Build 1) vs stateVector (Build 2/3).
 */
export function getEntityAttributeValue(entity: EntityData, attrName: string): any {
    // 1. Zuerst im stateVector suchen (Build 2/3)
    if (entity.stateVector && typeof entity.stateVector === 'object' && attrName in entity.stateVector) {
        const val = entity.stateVector[attrName];
        // Für komplexe Vektoren in Build 2/3, wenn val.value existiert
        if (val !== null && typeof val === 'object' && 'value' in val) {
            return val.value;
        }
        return val;
    }

    // 2. Fallback auf flache Attribute (Build 1)
    if (attrName in entity) {
        return (entity as any)[attrName];
    }

    return undefined;
}

/**
 * Sets an attribute value on an entity, abstracting away flat properties (Build 1) vs stateVector (Build 2/3).
 */
export function setEntityAttributeValue(entity: EntityData, attrName: string, value: any): void {
    // Wenn ein stateVector existiert (Build 2/3 Format), dort speichern
    if (entity.stateVector && typeof entity.stateVector === 'object') {
        const currentVal = entity.stateVector[attrName];
        // Wenn es ein verschachteltes Objekt mit .value ist (z.B. Vektor-Definition in Build 2)
        if (currentVal !== null && typeof currentVal === 'object' && 'value' in currentVal) {
            currentVal.value = value;
        } else {
            entity.stateVector[attrName] = value;
        }
        return;
    }

    // Ansonsten flach auf der Entity speichern (Build 1)
    (entity as any)[attrName] = value;
}
