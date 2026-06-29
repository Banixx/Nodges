/**
 * Geteilte Typen fuer Worker-Kommunikation
 * Werden sowohl im Hauptthread (LayoutManager) als auch im Worker verwendet.
 *
 * Phase 6: Worker und Performance
 */
import { FieldData } from '../types';

// ============================================================================
// Gemeinsame Datenstrukturen
// ============================================================================

/** 3D-Positionsvektor */
export interface WorkerVector3 {
    x: number;
    y: number;
    z: number;
}

/** Node-Daten fuer den Worker (nur Position + Index, keine THREE.js-Objekte) */
export interface WorkerNode {
    id: string;
    x: number;
    y: number;
    z: number;
    index?: number;
    attraction?: number;
    repulsion?: number;
    inertia?: number;
    fixedX?: boolean;
    fixedY?: boolean;
    fixedZ?: boolean;
}

/** Ergebnis-Position fuer einen Node aus dem Worker */
export interface WorkerNodeResult {
    id: string;
    x: number;
    y: number;
    z: number;
}

/** Edge-Daten fuer den Worker (nur Indizes) */
export interface WorkerEdge {
    start: number;
    end: number;
}

/** Optionen fuer Force-Directed-Algorithmen */
export interface ForceDirectedOptions {
    repulsionStrength?: number;
    attractionStrength?: number;
    damping?: number;
    maxIterations?: number;
    minEnergyThreshold?: number;
}

// ============================================================================
// Request: Hauptthread → Worker
// ============================================================================

/** Nachricht vom Hauptthread an den Worker */
export interface LayoutWorkerRequest {
    /** Eindeutige ID fuer die Anfrage (fuer Zuordnung bei mehreren Anfragen) */
    requestId: string;
    /** Layout-Algorithmus */
    algorithm: string;
    /** Knoten-Daten */
    nodes: WorkerNode[];
    /** Kanten-Daten */
    edges: WorkerEdge[];
    /** Topodynamische Felder (Build 3) */
    fields?: FieldData[];
    /** Algorithmus-Optionen */
    options: ForceDirectedOptions;
}

// ============================================================================
// Response: Worker → Hauptthread
// ============================================================================

/** Erfolgreiche Antwort des Workers */
export interface LayoutWorkerSuccessResponse {
    type: 'success';
    requestId: string;
    positions: WorkerNodeResult[];
    /** Anzahl der benoetigten Iterationen */
    iterations: number;
    /** Berechnungsdauer in ms */
    duration: number;
}

/** Fortschritts-Antwort des Workers (fuer lange Berechnungen) */
export interface LayoutWorkerProgressResponse {
    type: 'progress';
    requestId: string;
    progress: number;
    currentIteration: number;
    maxIterations: number;
    positions?: WorkerNodeResult[];
}

/** Fehler-Antwort des Workers */
export interface LayoutWorkerErrorResponse {
    type: 'error';
    requestId: string;
    message: string;
}

/** Alle moeglichen Worker-Antworten (Discriminated Union) */
export type LayoutWorkerResponse =
    | LayoutWorkerSuccessResponse
    | LayoutWorkerProgressResponse
    | LayoutWorkerErrorResponse;
