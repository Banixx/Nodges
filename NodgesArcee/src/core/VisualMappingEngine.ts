import { VisualMapping, EntityData } from '../types';

export class VisualMappingEngine {
    private visualMappings: any = {};

    setVisualMappings(mappings: any): void {
        this.visualMappings = mappings || {};
    }

    getVisualProperties(type: string): VisualMapping {
        return this.visualMappings[type] || {};
    }
}