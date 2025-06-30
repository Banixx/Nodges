import * as THREE from 'three';

export class EventManager {
    constructor() {
        this.handlers = new Map();
        this.state = {
            selectedObject: null
        };
    }

    registerHandler(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(handler);
    }

    emit(eventType, data) {
        const handlers = this.handlers.get(eventType) || [];
        handlers.forEach(handler => handler(data));
    }

    init(camera, scene, renderer) {
        // Hier können Event-Listener hinzugefügt werden, z.B. für Mausbewegungen
        console.log('EventManager initialisiert');
    }
}
