/**
 * HoverHandler - Verwaltet Hover-Interaktionen und Tooltips
 * Extrahiert aus InteractionManager (Phase 3)
 */
import * as THREE from 'three';
import { IStateManager, IEventManager } from '../interfaces';
import { HighlightManager } from '../../effects/HighlightManager';
import type { HoverStartEventData, HoverEndEventData } from '../events/EventTypes';

export class HoverHandler {
    private stateManager: IStateManager;
    private highlightManager: HighlightManager;

    constructor(
        stateManager: IStateManager,
        highlightManager: HighlightManager
    ) {
        this.stateManager = stateManager;
        this.highlightManager = highlightManager;
    }

    /**
     * Registriert Hover-Events beim EventManager
     */
    registerEvents(eventManager: IEventManager) {
        eventManager.subscribe('hover_start', this.handleHoverStart.bind(this));
        eventManager.subscribe('hover_end', this.handleHoverEnd.bind(this));
    }

    /**
     * Handler fuer Hover Start
     */
    handleHoverStart(data: HoverStartEventData) {
        const { object } = data;

        if (object) {
            // Highlight anwenden
            this.highlightManager.highlightHoveredObject(object);

            // Tooltip anzeigen
            this.showTooltip(object);
        }
    }

    /**
     * Handler fuer Hover End
     */
    handleHoverEnd(data: HoverEndEventData) {
        const { object } = data;

        if (object) {
            // Das Entfernen des Highlights wird nun vollständig vom HighlightManager
            // über State-Updates (mit einer leichten Verzögerung) gesteuert.
            
            // Tooltip verstecken
            this.hideTooltip();
        }
    }

    /**
     * Zeigt Tooltip an
     */
    showTooltip(object: THREE.Object3D) {
        if (!object || !object.userData) return;

        const content = this.generateTooltipContent(object);
        this.stateManager.showTooltip(content, { x: 0, y: 0 }); // Placeholder pos
    }

    /**
     * Versteckt Tooltip
     */
    hideTooltip() {
        this.stateManager.hideTooltip();
    }

    /**
     * Generiert Tooltip-Inhalt
     */
    generateTooltipContent(object: THREE.Object3D): string {
        if (object.userData.type === 'node') {
            return object.userData.nodeData?.name || object.name || 'Unbenannter Knoten';
        } else if (object.userData.type === 'edge') {
            return object.userData.edge?.options?.name || object.name || 'Unbenannte Kante';
        }
        return 'Unbekanntes Objekt';
    }
}
