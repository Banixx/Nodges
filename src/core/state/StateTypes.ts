/**
 * State-Typen fuer den StateManager
 * Die Sub-State-Interfaces gruppieren den monolithischen State logisch.
 * Der flache State bleibt fuer Abwaertskompatibilitaet bestehen.
 *
 * Phase 4: State-Architektur verbessern
 */
import * as THREE from 'three';
import { EntityData, RelationshipData } from '../../types';

// ============================================================================
// Sub-State Interfaces
// ============================================================================

/**
 * Graph-Daten: Entities und Relationships (Single Source of Truth)
 */
export interface GraphState {
    graphData: {
        entities: EntityData[];
        relationships: RelationshipData[];
    };
    loadedFiles: { id: string, name: string }[];
}

/**
 * Selektions-Zustand: Hover, Selektion, Box-Selektion
 */
export interface SelectionState {
    hoveredObject: THREE.Object3D | null;
    selectedObject: THREE.Object3D | null;
    selectedObjects: Set<THREE.Object3D>;
    isBoxSelecting: boolean;
}

/**
 * UI-Zustand: Tooltip, InfoPanel, Labels
 */
export interface UIState {
    tooltipVisible: boolean;
    tooltipContent: string | null;
    tooltipPosition: { x: number; y: number } | null;
    infoPanelVisible: boolean;
    infoPanelCollapsed: boolean;
    showLabelsAlways: boolean;
    showLabelsOnHover: boolean;
    labelLines: number;
    labelFilterAttribute: string;
    labelFilterMode: string;
    labelFilterThreshold: number;
    visibleLabelsCount: number;
    totalLabelsCount: number;
    visualScaleExponent: number;
    visualScaleMultiplier: number;
    autoBalanceEnabled: boolean;
    normalizeCoordinatesEnabled: boolean;
    cameraFitMargin: number;
    cameraTransitionDuration: number;
    layer1Visible: boolean;
    layer2Visible: boolean;
    layer3Visible: boolean;
    layer4Visible: boolean;
    layer1Opacity: number;
    layer2Opacity: number;
    layer3Opacity: number;
    layer4Opacity: number;
    layeringAttribute: string;
    layer1Value: string;
    layer2Value: string;
    layer3Value: string;
    layer4Value: string;
    complexityMode: 'simple' | 'expert' | 'dev';
}


/**
 * Visuelle Effekte: Glow, Highlights
 */
export interface VisualState {
    highlightedObjects: Set<THREE.Object3D>;
    highlightEffectsEnabled: boolean;
    glowIntensity: number;
    glowDirection: number;
}

/**
 * Edge-Parameter
 */
export interface EdgeVisualState {
    edgeThickness: number;
    edgeTubularSegments: number;
    edgeRadialSegments: number;
    edgeCurveFactor: number;
    edgePulseSpeed: number;
    edgeAnimationMode: string;
    highlightThickness: number;
    selectionThickness: number;
}

/**
 * Umgebung: Hintergrund, Beleuchtung, Farbschema
 */
export interface EnvironmentState {
    backgroundColor: string;
    ambientLightIntensity: number;
    directionalLightIntensity: number;
    activeColorScheme: string;
}

/**
 * System-Zustand: Tool, Layout, Interaktion
 */
export interface SystemState {
    isInteractionEnabled: boolean;
    currentTool: string;
    layoutEnabled: boolean;
    renderMode: 'auto' | 'mesh' | 'instance';
    activeRenderMode: 'mesh' | 'instance';
    currentTimestamp: number | null;
    minTimestamp: number | null;
    maxTimestamp: number | null;
    isPlaying: boolean;
    playbackSpeed: number;
    mapActive: boolean;
}

/**
 * Developer Settings: Performance Simulation / Testing
 */
export interface DevState {
    devPowerPreference: 'high-performance' | 'low-power' | 'default';
    devPixelRatio: number;
    devFpsLimit: number;
    _triggerRendererRebuild: number;
}

// ============================================================================
// Subscriber-Kategorien und Mapping
// ============================================================================

/**
 * Definiert die bekannten Subscriber-Kategorien.
 * Jede Kategorie wird nur benachrichtigt wenn sich relevante State-Felder aendern.
 */
export const STATE_CATEGORIES = {
    /** Graph-Daten: Entities/Relationships geaendert */
    DATA: 'data_changed',
    /** Selektion: selectedObject, selectedObjects, hoveredObject, isBoxSelecting */
    SELECTION: 'selection',
    /** UI: Tooltip, InfoPanel, Labels */
    UI: 'ui',
    /** Highlights und Glow */
    HIGHLIGHT: 'highlight',
    /** Umgebung: Hintergrund, Licht, Farbschema */
    ENVIRONMENT: 'environment',
    /** Visuelle Edge-Parameter */
    EDGE_VISUAL: 'edge_visual',
    /** System: Tool, Layout, Interaktion */
    SYSTEM: 'system',
    /** Dev Settings */
    DEV: 'dev',
    /** Standard-Kategorie (wird bei jeder Aenderung benachrichtigt) */
    DEFAULT: 'default',
} as const;

export type StateCategory = typeof STATE_CATEGORIES[keyof typeof STATE_CATEGORIES];

/**
 * Mapping: State-Key → relevante Subscriber-Kategorien
 * Wenn sich ein Key aendert, werden nur die zugeordneten Kategorien benachrichtigt.
 * 'default' wird immer zusaetzlich benachrichtigt.
 */
export const STATE_KEY_TO_CATEGORIES: Record<string, StateCategory[]> = {
    // GraphState
    graphData: [STATE_CATEGORIES.DATA],
    loadedFiles: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],

    // SelectionState
    hoveredObject: [STATE_CATEGORIES.SELECTION, STATE_CATEGORIES.HIGHLIGHT, STATE_CATEGORIES.UI],
    selectedObject: [STATE_CATEGORIES.SELECTION, STATE_CATEGORIES.HIGHLIGHT, STATE_CATEGORIES.UI],
    selectedObjects: [STATE_CATEGORIES.SELECTION, STATE_CATEGORIES.HIGHLIGHT, STATE_CATEGORIES.UI],
    isBoxSelecting: [STATE_CATEGORIES.SELECTION],

    // UIState
    tooltipVisible: [STATE_CATEGORIES.UI],
    tooltipContent: [STATE_CATEGORIES.UI],
    tooltipPosition: [STATE_CATEGORIES.UI],
    infoPanelVisible: [STATE_CATEGORIES.UI],
    infoPanelCollapsed: [STATE_CATEGORIES.UI],
    showLabelsAlways: [STATE_CATEGORIES.UI],
    showLabelsOnHover: [STATE_CATEGORIES.UI],
    labelLines: [STATE_CATEGORIES.UI],
    labelFilterAttribute: [STATE_CATEGORIES.UI],
    labelFilterMode: [STATE_CATEGORIES.UI],
    labelFilterThreshold: [STATE_CATEGORIES.UI],
    visibleLabelsCount: [STATE_CATEGORIES.UI],
    totalLabelsCount: [STATE_CATEGORIES.UI],
    visualScaleExponent: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    visualScaleMultiplier: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    autoBalanceEnabled: [STATE_CATEGORIES.UI],
    normalizeCoordinatesEnabled: [STATE_CATEGORIES.UI],
    cameraFitMargin: [STATE_CATEGORIES.UI],
    cameraTransitionDuration: [STATE_CATEGORIES.UI],
    layer1Visible: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer2Visible: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer3Visible: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer4Visible: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer1Opacity: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer2Opacity: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer3Opacity: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer4Opacity: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layeringAttribute: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer1Value: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer2Value: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer3Value: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    layer4Value: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.UI],
    complexityMode: [STATE_CATEGORIES.UI],


    // VisualState
    highlightedObjects: [STATE_CATEGORIES.HIGHLIGHT],
    highlightEffectsEnabled: [STATE_CATEGORIES.HIGHLIGHT],
    glowIntensity: [STATE_CATEGORIES.HIGHLIGHT],
    glowDirection: [STATE_CATEGORIES.HIGHLIGHT],

    // EdgeVisualState
    edgeThickness: [STATE_CATEGORIES.EDGE_VISUAL],
    edgeTubularSegments: [STATE_CATEGORIES.EDGE_VISUAL],
    edgeRadialSegments: [STATE_CATEGORIES.EDGE_VISUAL],
    edgeCurveFactor: [STATE_CATEGORIES.EDGE_VISUAL],
    edgePulseSpeed: [STATE_CATEGORIES.EDGE_VISUAL],
    edgeAnimationMode: [STATE_CATEGORIES.EDGE_VISUAL],
    highlightThickness: [STATE_CATEGORIES.EDGE_VISUAL],
    selectionThickness: [STATE_CATEGORIES.EDGE_VISUAL],

    // EnvironmentState
    backgroundColor: [STATE_CATEGORIES.ENVIRONMENT],
    ambientLightIntensity: [STATE_CATEGORIES.ENVIRONMENT],
    directionalLightIntensity: [STATE_CATEGORIES.ENVIRONMENT],
    activeColorScheme: [STATE_CATEGORIES.ENVIRONMENT],

    // SystemState
    isInteractionEnabled: [STATE_CATEGORIES.SYSTEM],
    currentTool: [STATE_CATEGORIES.SYSTEM, STATE_CATEGORIES.SELECTION],
    layoutEnabled: [STATE_CATEGORIES.SYSTEM],
    renderMode: [STATE_CATEGORIES.SYSTEM],
    activeRenderMode: [STATE_CATEGORIES.DATA, STATE_CATEGORIES.SYSTEM],
    currentTimestamp: [STATE_CATEGORIES.SYSTEM],
    minTimestamp: [STATE_CATEGORIES.SYSTEM],
    maxTimestamp: [STATE_CATEGORIES.SYSTEM],
    isPlaying: [STATE_CATEGORIES.SYSTEM],
    playbackSpeed: [STATE_CATEGORIES.SYSTEM],
    mapActive: [STATE_CATEGORIES.SYSTEM],

    // DevState
    devPowerPreference: [STATE_CATEGORIES.DEV],
    devPixelRatio: [STATE_CATEGORIES.DEV],
    devFpsLimit: [STATE_CATEGORIES.DEV],
    _triggerRendererRebuild: [STATE_CATEGORIES.DEV]
};
