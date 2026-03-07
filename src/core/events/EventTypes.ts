/**
 * Typisierte Event-Map fuer das CentralEventManager Event-System
 * Ersetzt string-basierte Events durch typsichere Definitionen.
 *
 * Phase 5: Event-System typisieren
 */
import * as THREE from 'three';
import { EntityData, RelationshipData } from '../../types';

// ============================================================================
// Event-Payload-Interfaces
// ============================================================================

/** Maus-Event mit optionalem Raycast-Ergebnis */
export interface MouseMoveEventData {
    event: MouseEvent;
    hoveredObject: THREE.Object3D | null;
    mousePosition: { x: number; y: number };
}

/** Maus-Down-Event mit Raycast und Button */
export interface MouseDownEventData {
    event: MouseEvent;
    clickedObject: THREE.Object3D | null;
    button: number;
}

/** Maus-Up-Event */
export interface MouseUpEventData {
    event: MouseEvent;
    wasMouseDown: boolean;
    downDuration: number;
    button: number;
}

/** Click-Event mit Raycast */
export interface ClickEventData {
    event: MouseEvent;
    clickedObject: THREE.Object3D | null;
    button: number;
}

/** Double-Click-Event */
export interface DoubleClickEventData {
    event: MouseEvent;
    clickedObject: THREE.Object3D | null;
}

/** Context-Menu-Event */
export interface ContextMenuEventData {
    event: MouseEvent;
    clickedObject: THREE.Object3D | null;
}

/** Resize-Event */
export interface ResizeEventData {
    event: UIEvent;
}

/** Keyboard-Event */
export interface KeyDownEventData {
    event: KeyboardEvent;
}

export interface KeyUpEventData {
    event: KeyboardEvent;
}

/** Hover-Start/End-Events */
export interface HoverStartEventData {
    object: THREE.Object3D;
}

export interface HoverEndEventData {
    object: THREE.Object3D;
}

/** Selection-Start/End-Events */
export interface SelectionStartEventData {
    object: THREE.Object3D;
}

export interface SelectionEndEventData {
    object: THREE.Object3D;
}

/** Mode-Changed-Event */
export interface ModeChangedEventData {
    mode: string;
}

/** Node/Edge-Created-Events */
export interface NodeCreatedEventData {
    node: EntityData;
}

export interface EdgeCreatedEventData {
    edge: RelationshipData;
}

// ============================================================================
// Event-Map: Typ-Zuordnung Event-Name → Payload
// ============================================================================

/**
 * Typisierte Event-Map.
 * Jeder Key ist ein Event-Typ, der Wert ist der Typ des Payloads.
 *
 * Verwendung mit generischem subscribe/publish:
 *   subscribe<K extends keyof EventMap>(type: K, cb: (data: EventMap[K]) => void)
 *   publish<K extends keyof EventMap>(type: K, data: EventMap[K])
 */
export interface EventMap {
    // Maus-Events
    mousemove: MouseMoveEventData;
    mousedown: MouseDownEventData;
    mouseup: MouseUpEventData;
    click: ClickEventData;
    doubleclick: DoubleClickEventData;
    contextmenu: ContextMenuEventData;

    // Keyboard-Events
    keydown: KeyDownEventData;
    keyup: KeyUpEventData;

    // Window-Events
    resize: ResizeEventData;

    // Hover-Events
    hover_start: HoverStartEventData;
    hover_end: HoverEndEventData;

    // Selection-Events
    selection_start: SelectionStartEventData;
    selection_end: SelectionEndEventData;

    // Custom-Events
    mode_changed: ModeChangedEventData;
    node_created: NodeCreatedEventData;
    edge_created: EdgeCreatedEventData;
}

/** Alle gueltigen Event-Typen */
export type EventType = keyof EventMap;
