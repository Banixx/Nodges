import { DataModel, PropertySchema, EntityData } from '../types';

/**
 * BuildFormatUtils
 * 
 * Provides utility functions to handle the JSON build format (Build 3)
 * and abstract attribute access.
 */

/**
 * Retrieves the PropertySchema for a given attribute.
 */
export function getPropertySchema(dm: DataModel | undefined, _entityType: string, propName: string): PropertySchema | undefined {
    if (!dm) return undefined;
    return dm.properties?.[propName];
}

export function collectPaths(obj: any, prefix = ''): string[] {
    const paths: string[] = [];
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        if ('value' in obj && Object.keys(obj).length === 1) {
            paths.push(prefix);
            return paths;
        }
        Object.entries(obj).forEach(([key, val]) => {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                paths.push(...collectPaths(val, newPrefix));
            } else {
                paths.push(newPrefix);
            }
        });
    }
    return paths;
}

/**
 * Returns a list of all available property names for an entity type.
 */
export function getAvailableProperties(dm: DataModel | undefined, _entityType: string, entity?: EntityData): string[] {
    const props = new Set<string>();

    if (dm && dm.properties) {
        Object.keys(dm.properties).forEach(k => props.add(k));
    }

    // Fallback/Erweiterung: Wenn eine Entity übergeben wurde, auch deren dynamische Keys scannen
    if (entity) {
        // In Build 3 liegen veränderliche Attribute im stateVector
        if (entity.stateVector && typeof entity.stateVector === 'object') {
            Object.keys(entity.stateVector).forEach(k => props.add(k));
        }
    }

    return Array.from(props);
}

/**
 * Retrieves an attribute value from an entity, abstracting stateVector access.
 */
export function getEntityAttributeValue(entity: EntityData, attrName: string): any {
    if (!entity.stateVector || typeof entity.stateVector !== 'object') return undefined;

    let normalizedPath = attrName;
    if (attrName.startsWith('stateVector.')) {
        normalizedPath = attrName.substring('stateVector.'.length);
    }

    // Handle dot notation
    const parts = normalizedPath.split('.');
    let current: any = entity.stateVector;

    for (const part of parts) {
        if (current === null || typeof current !== 'object') return undefined;
        current = current[part];
    }

    // Für komplexe Vektoren, wenn val.value existiert
    if (current !== null && typeof current === 'object' && 'value' in current) {
        return current.value;
    }

    return current;
}

/**
 * Sets an attribute value on an entity, abstracting stateVector access.
 */
export function setEntityAttributeValue(entity: EntityData, attrName: string, value: any): void {
    if (!entity.stateVector || typeof entity.stateVector !== 'object') {
        entity.stateVector = {};
    }

    let normalizedPath = attrName;
    if (attrName.startsWith('stateVector.')) {
        normalizedPath = attrName.substring('stateVector.'.length);
    }

    const parts = normalizedPath.split('.');
    let current: any = entity.stateVector;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (current[part] === undefined || current[part] === null || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    const currentVal = current[lastPart];

    if (currentVal !== null && typeof currentVal === 'object' && 'value' in currentVal) {
        currentVal.value = value;
    } else {
        current[lastPart] = value;
    }
}
