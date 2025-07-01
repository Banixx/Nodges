/**
 * LayoutManager - Zentrale Verwaltung aller Layout-Algorithmen für Nodges 0.80
 * 
 * Features:
 * - Force-Directed Layouts (Fruchterman-Reingold, Spring-Embedder)
 * - Hierarchical Layouts (Tree, Hierarchie)
 * - Geometric Layouts (Circular, Grid, Random)
 * - Animation System für smooth transitions
 * - Performance-optimiert für große Netzwerke
 */

import * as THREE from 'three';
// TWEEN wird �ber das UMD-Bundle in main.js geladen

export class LayoutManager {
    constructor(scene, stateManager) {
        this.scene = scene;
        this.stateManager = stateManager;
        
        // Layout-Algorithmen
        this.algorithms = {
            'force-directed': new ForceDirectedLayout(),
            'fruchterman-reingold': new FruchtermanReingoldLayout(),
            'spring-embedder': new SpringEmbedderLayout(),
            'hierarchical': new HierarchicalLayout(),
            'tree': new TreeLayout(),
            'circular': new CircularLayout(),
            'grid': new GridLayout(),
            'random': new RandomLayout()
        };
        
        // Animation-Einstellungen
        this.animationDuration = 2000; // 2 Sekunden
        this.isAnimating = false;
        this.currentLayout = 'force-directed';
        
        // Performance-Einstellungen
        this.maxIterations = 1000;
        this.convergenceThreshold = 0.01;
        
        console.log('🎯 LayoutManager initialisiert mit', Object.keys(this.algorithms).length, 'Algorithmen');
    }
    
    /**
     * Wendet einen Layout-Algorithmus auf das Netzwerk an
     */
    async applyLayout(layoutName, nodes, edges, options = {}) {
        if (this.isAnimating) {
            console.warn('⚠️ Layout-Animation läuft bereits');
            return;
        }
        
        const algorithm = this.algorithms[layoutName];
        if (!algorithm) {
            console.error('❌ Unbekannter Layout-Algorithmus:', layoutName);
            return;
        }
        
        console.log(`🚀 Starte ${layoutName} Layout für ${nodes.length} Knoten`);
        this.isAnimating = true;
        
        try {
            // Aktuelle Positionen speichern
            const originalPositions = this.saveCurrentPositions(nodes);
            
            // Neue Positionen berechnen
            const newPositions = await algorithm.calculate(nodes, edges, {
                maxIterations: this.maxIterations,
                convergenceThreshold: this.convergenceThreshold,
                ...options
            });
            
            // Animierte Transition zu neuen Positionen
            await this.animateToPositions(nodes, newPositions, originalPositions);
            
            this.currentLayout = layoutName;
            console.log(`✅ ${layoutName} Layout erfolgreich angewendet`);
            
        } catch (error) {
            console.error('❌ Fehler beim Layout-Algorithmus:', error);
            // FIX: Re-throw error for caller handling while ensuring cleanup
            throw error;
        } finally {
            // FIX: Always reset isAnimating flag, even if error occurs
            this.isAnimating = false;
        }
    }
    
    /**
     * Speichert aktuelle Knotenpositionen
     */
    saveCurrentPositions(nodes) {
        return nodes.map(node => ({
            id: node.id,
            x: node.mesh.position.x,
            y: node.mesh.position.y,
            z: node.mesh.position.z
        }));
    }
    
    /**
     * Animiert Knoten zu neuen Positionen
     */
    animateToPositions(nodes, newPositions, originalPositions) {
        return new Promise((resolve) => {
            const tweens = [];
            
            nodes.forEach((node, index) => {
                const newPos = newPositions[index];
                const currentPos = node.mesh.position;
                
                const tween = new window.TWEEN.Tween(currentPos)
                    .to({ x: newPos.x, y: newPos.y, z: newPos.z }, this.animationDuration)
                    .easing(window.TWEEN.Easing.Cubic.InOut)
                    .onUpdate(() => {
                        // Position aktualisieren
                        node.mesh.position.set(currentPos.x, currentPos.y, currentPos.z);
                        
                        // Kanten-Positionen aktualisieren (falls vorhanden)
                        if (node.edges) {
                            node.edges.forEach(edge => {
                                edge.updateGeometry();
                            });
                        }
                    });
                
                tweens.push(tween);
            });
            
            // Alle Tweens starten
            tweens.forEach(tween => tween.start());
            
            // Warten bis alle Animationen fertig sind
            const checkComplete = () => {
                if (tweens.every(tween => !tween.isPlaying())) {
                    resolve();
                } else {
                    requestAnimationFrame(checkComplete);
                }
            };
            
            requestAnimationFrame(checkComplete);
        });
    }
    
    /**
     * Stoppt aktuelle Animation
     */
    stopAnimation() {
        if (window.TWEEN) {
            window.TWEEN.removeAll();
        }
        this.isAnimating = false;
    }
    
    /**
     * Gibt verfügbare Layout-Algorithmen zurück
     */
    getAvailableLayouts() {
        return Object.keys(this.algorithms);
    }
    
    /**
     * Gibt aktuellen Layout-Namen zurück
     */
    getCurrentLayout() {
        return this.currentLayout;
    }
    
    /**
     * Setzt Animation-Geschwindigkeit
     */
    setAnimationDuration(duration) {
        this.animationDuration = Math.max(500, Math.min(5000, duration));
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.stopAnimation();
        Object.values(this.algorithms).forEach(algorithm => {
            if (algorithm.destroy) {
                algorithm.destroy();
            }
        });
    }
}

/**
 * Basis-Klasse für Layout-Algorithmen
 */
class LayoutAlgorithm {
    constructor() {
        this.name = 'base';
    }
    
    async calculate(nodes, edges, options = {}) {
        throw new Error('calculate() muss in Unterklasse implementiert werden');
    }
    
    // Hilfsmethoden für alle Algorithmen
    getNodeById(nodes, id) {
        return nodes.find(node => node.id === id);
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    normalizePositions(positions, bounds = { min: -10, max: 10 }) {
        if (positions.length === 0) return positions;
        
        // Min/Max finden
        const minX = Math.min(...positions.map(p => p.x));
        const maxX = Math.max(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxY = Math.max(...positions.map(p => p.y));
        const minZ = Math.min(...positions.map(p => p.z));
        const maxZ = Math.max(...positions.map(p => p.z));
        
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;
        const rangeZ = maxZ - minZ || 1;
        const targetRange = bounds.max - bounds.min;
        
        return positions.map(pos => ({
            x: bounds.min + ((pos.x - minX) / rangeX) * targetRange,
            y: bounds.min + ((pos.y - minY) / rangeY) * targetRange,
            z: bounds.min + ((pos.z - minZ) / rangeZ) * targetRange
        }));
    }
}

/**
 * Force-Directed Layout (Standard)
 */
class ForceDirectedLayout extends LayoutAlgorithm {
    constructor() {
        super();
        this.name = 'force-directed';
    }
    
    async calculate(nodes, edges, options = {}) {
        const {
            maxIterations = 500,
            convergenceThreshold = 0.01,
            repulsionStrength = 1000,
            attractionStrength = 0.1,
            damping = 0.9
        } = options;
        
        // Initiale zufällige Positionen
        const positions = nodes.map(() => ({
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20
        }));
        
        const velocities = nodes.map(() => ({ x: 0, y: 0, z: 0 }));
        
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const forces = positions.map(() => ({ x: 0, y: 0, z: 0 }));
            
            // Repulsive Kräfte zwischen allen Knoten
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = positions[i].x - positions[j].x;
                    const dy = positions[i].y - positions[j].y;
                    const dz = positions[i].z - positions[j].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
                    
                    const force = repulsionStrength / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;
                    
                    forces[i].x += fx;
                    forces[i].y += fy;
                    forces[i].z += fz;
                    forces[j].x -= fx;
                    forces[j].y -= fy;
                    forces[j].z -= fz;
                }
            }
            
            // Attractive Kräfte entlang der Kanten
            edges.forEach(edge => {
                const sourceIndex = nodes.findIndex(n => n.id === edge.source);
                const targetIndex = nodes.findIndex(n => n.id === edge.target);
                
                if (sourceIndex !== -1 && targetIndex !== -1) {
                    const dx = positions[targetIndex].x - positions[sourceIndex].x;
                    const dy = positions[targetIndex].y - positions[sourceIndex].y;
                    const dz = positions[targetIndex].z - positions[sourceIndex].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
                    
                    const force = attractionStrength * distance;
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;
                    
                    forces[sourceIndex].x += fx;
                    forces[sourceIndex].y += fy;
                    forces[sourceIndex].z += fz;
                    forces[targetIndex].x -= fx;
                    forces[targetIndex].y -= fy;
                    forces[targetIndex].z -= fz;
                }
            });
            
            // Geschwindigkeiten und Positionen aktualisieren
            let maxMovement = 0;
            for (let i = 0; i < nodes.length; i++) {
                velocities[i].x = (velocities[i].x + forces[i].x) * damping;
                velocities[i].y = (velocities[i].y + forces[i].y) * damping;
                velocities[i].z = (velocities[i].z + forces[i].z) * damping;
                
                positions[i].x += velocities[i].x;
                positions[i].y += velocities[i].y;
                positions[i].z += velocities[i].z;
                
                const movement = Math.sqrt(
                    velocities[i].x * velocities[i].x +
                    velocities[i].y * velocities[i].y +
                    velocities[i].z * velocities[i].z
                );
                maxMovement = Math.max(maxMovement, movement);
            }
            
            // Konvergenz prüfen
            if (maxMovement < convergenceThreshold) {
                console.log(`🎯 Force-Directed Layout konvergiert nach ${iteration} Iterationen`);
                break;
            }
        }
        
        return this.normalizePositions(positions);
    }
}

/**
 * Fruchterman-Reingold Layout
 */
class FruchtermanReingoldLayout extends LayoutAlgorithm {
    constructor() {
        super();
        this.name = 'fruchterman-reingold';
    }
    
    async calculate(nodes, edges, options = {}) {
        const {
            maxIterations = 500,
            area = 400,
            temperature = 10
        } = options;
        
        const k = Math.sqrt(area / nodes.length);
        let temp = temperature;
        
        // Initiale zufällige Positionen
        const positions = nodes.map(() => ({
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20
        }));
        
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const displacement = positions.map(() => ({ x: 0, y: 0, z: 0 }));
            
            // Repulsive Kräfte
            for (let v = 0; v < nodes.length; v++) {
                for (let u = 0; u < nodes.length; u++) {
                    if (v !== u) {
                        const dx = positions[v].x - positions[u].x;
                        const dy = positions[v].y - positions[u].y;
                        const dz = positions[v].z - positions[u].z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
                        
                        const repulsiveForce = (k * k) / distance;
                        displacement[v].x += (dx / distance) * repulsiveForce;
                        displacement[v].y += (dy / distance) * repulsiveForce;
                        displacement[v].z += (dz / distance) * repulsiveForce;
                    }
                }
            }
            
            // Attractive Kräfte
            edges.forEach(edge => {
                const vIndex = nodes.findIndex(n => n.id === edge.source);
                const uIndex = nodes.findIndex(n => n.id === edge.target);
                
                if (vIndex !== -1 && uIndex !== -1) {
                    const dx = positions[vIndex].x - positions[uIndex].x;
                    const dy = positions[vIndex].y - positions[uIndex].y;
                    const dz = positions[vIndex].z - positions[uIndex].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
                    
                    const attractiveForce = (distance * distance) / k;
                    const fx = (dx / distance) * attractiveForce;
                    const fy = (dy / distance) * attractiveForce;
                    const fz = (dz / distance) * attractiveForce;
                    
                    displacement[vIndex].x -= fx;
                    displacement[vIndex].y -= fy;
                    displacement[vIndex].z -= fz;
                    displacement[uIndex].x += fx;
                    displacement[uIndex].y += fy;
                    displacement[uIndex].z += fz;
                }
            });
            
            // Positionen aktualisieren
            for (let v = 0; v < nodes.length; v++) {
                const dispLength = Math.sqrt(
                    displacement[v].x * displacement[v].x +
                    displacement[v].y * displacement[v].y +
                    displacement[v].z * displacement[v].z
                ) || 0.1;
                
                positions[v].x += (displacement[v].x / dispLength) * Math.min(dispLength, temp);
                positions[v].y += (displacement[v].y / dispLength) * Math.min(dispLength, temp);
                positions[v].z += (displacement[v].z / dispLength) * Math.min(dispLength, temp);
            }
            
            // Temperatur reduzieren
            temp = temperature * (1 - iteration / maxIterations);
        }
        
        return this.normalizePositions(positions);
    }
}

/**
 * Circular Layout
 */
class CircularLayout extends LayoutAlgorithm {
    constructor() {
        super();
        this.name = 'circular';
    }
    
    async calculate(nodes, edges, options = {}) {
        const { radius = 10, height = 0 } = options;
        
        const positions = nodes.map((node, index) => {
            const angle = (index / nodes.length) * 2 * Math.PI;
            return {
                x: Math.cos(angle) * radius,
                y: height,
                z: Math.sin(angle) * radius
            };
        });
        
        return positions;
    }
}

/**
 * Grid Layout
 */
class GridLayout extends LayoutAlgorithm {
    constructor() {
        super();
        this.name = 'grid';
    }
    
    async calculate(nodes, edges, options = {}) {
        const { spacing = 2 } = options;
        const gridSize = Math.ceil(Math.sqrt(nodes.length));
        
        const positions = nodes.map((node, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            
            return {
                x: (col - gridSize / 2) * spacing,
                y: 0,
                z: (row - gridSize / 2) * spacing
            };
        });
        
        return positions;
    }
}

/**
 * Random Layout
 */
class RandomLayout extends LayoutAlgorithm {
    constructor() {
        super();
        this.name = 'random';
    }
    
    async calculate(nodes, edges, options = {}) {
        const { bounds = { min: -10, max: 10 } } = options;
        const range = bounds.max - bounds.min;
        
        const positions = nodes.map(() => ({
            x: bounds.min + Math.random() * range,
            y: bounds.min + Math.random() * range,
            z: bounds.min + Math.random() * range
        }));
        
        return positions;
    }
}

/**
 * Hierarchical Layout (vereinfacht)
 */
class HierarchicalLayout extends LayoutAlgorithm {
    constructor() {
        super();
        this.name = 'hierarchical';
    }
    
    async calculate(nodes, edges, options = {}) {
        const { levelHeight = 3, nodeSpacing = 2 } = options;
        
        // Einfache Hierarchie basierend auf Konnektivität
        const levels = this.calculateLevels(nodes, edges);
        const positions = [];
        
        levels.forEach((levelNodes, level) => {
            levelNodes.forEach((nodeId, index) => {
                const nodeIndex = nodes.findIndex(n => n.id === nodeId);
                if (nodeIndex !== -1) {
                    positions[nodeIndex] = {
                        x: (index - levelNodes.length / 2) * nodeSpacing,
                        y: level * levelHeight,
                        z: 0
                    };
                }
            });
        });
        
        return positions;
    }
    
    calculateLevels(nodes, edges) {
        const levels = [];
        const visited = new Set();
        const adjacencyList = new Map();
        
        // Adjacency List erstellen
        nodes.forEach(node => adjacencyList.set(node.id, []));
        edges.forEach(edge => {
            if (adjacencyList.has(edge.source)) {
                adjacencyList.get(edge.source).push(edge.target);
            }
            if (adjacencyList.has(edge.target)) {
                adjacencyList.get(edge.target).push(edge.source);
            }
        });
        
        // BFS für Level-Zuordnung
        const queue = [nodes[0].id]; // Start mit erstem Knoten
        visited.add(nodes[0].id);
        levels.push([nodes[0].id]);
        
        while (queue.length > 0) {
            const currentLevel = [];
            const levelSize = queue.length;
            
            for (let i = 0; i < levelSize; i++) {
                const nodeId = queue.shift();
                const neighbors = adjacencyList.get(nodeId) || [];
                
                neighbors.forEach(neighborId => {
                    if (!visited.has(neighborId)) {
                        visited.add(neighborId);
                        queue.push(neighborId);
                        currentLevel.push(neighborId);
                    }
                });
            }
            
            if (currentLevel.length > 0) {
                levels.push(currentLevel);
            }
        }
        
        // Unbesuchte Knoten hinzufügen
        nodes.forEach(node => {
            if (!visited.has(node.id)) {
                if (levels.length === 0) {
                    levels.push([]);
                }
                levels[levels.length - 1].push(node.id);
            }
        });
        
        return levels;
    }
}

/**
 * Tree Layout
 */
class TreeLayout extends HierarchicalLayout {
    constructor() {
        super();
        this.name = 'tree';
    }
    
    async calculate(nodes, edges, options = {}) {
        // Verwende Hierarchical Layout als Basis für Tree Layout
        return super.calculate(nodes, edges, options);
    }
}

/**
 * Spring-Embedder Layout
 */
class SpringEmbedderLayout extends LayoutAlgorithm {
    constructor() {
        super();
        this.name = 'spring-embedder';
    }
    
    async calculate(nodes, edges, options = {}) {
        const {
            maxIterations = 1000,
            springConstant = 0.1,
            repulsionConstant = 1000,
            damping = 0.95,
            naturalLength = 2
        } = options;
        
        // Initiale Positionen
        const positions = nodes.map(() => ({
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20
        }));
        
        const velocities = nodes.map(() => ({ x: 0, y: 0, z: 0 }));
        
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const forces = positions.map(() => ({ x: 0, y: 0, z: 0 }));
            
            // Spring-Kräfte entlang der Kanten
            edges.forEach(edge => {
                const sourceIndex = nodes.findIndex(n => n.id === edge.source);
                const targetIndex = nodes.findIndex(n => n.id === edge.target);
                
                if (sourceIndex !== -1 && targetIndex !== -1) {
                    const dx = positions[targetIndex].x - positions[sourceIndex].x;
                    const dy = positions[targetIndex].y - positions[sourceIndex].y;
                    const dz = positions[targetIndex].z - positions[sourceIndex].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
                    
                    const springForce = springConstant * (distance - naturalLength);
                    const fx = (dx / distance) * springForce;
                    const fy = (dy / distance) * springForce;
                    const fz = (dz / distance) * springForce;
                    
                    forces[sourceIndex].x += fx;
                    forces[sourceIndex].y += fy;
                    forces[sourceIndex].z += fz;
                    forces[targetIndex].x -= fx;
                    forces[targetIndex].y -= fy;
                    forces[targetIndex].z -= fz;
                }
            });
            
            // Repulsive Kräfte
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = positions[i].x - positions[j].x;
                    const dy = positions[i].y - positions[j].y;
                    const dz = positions[i].z - positions[j].z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
                    
                    const repulsionForce = repulsionConstant / (distance * distance);
                    const fx = (dx / distance) * repulsionForce;
                    const fy = (dy / distance) * repulsionForce;
                    const fz = (dz / distance) * repulsionForce;
                    
                    forces[i].x += fx;
                    forces[i].y += fy;
                    forces[i].z += fz;
                    forces[j].x -= fx;
                    forces[j].y -= fy;
                    forces[j].z -= fz;
                }
            }
            
            // Geschwindigkeiten und Positionen aktualisieren
            for (let i = 0; i < nodes.length; i++) {
                velocities[i].x = (velocities[i].x + forces[i].x) * damping;
                velocities[i].y = (velocities[i].y + forces[i].y) * damping;
                velocities[i].z = (velocities[i].z + forces[i].z) * damping;
                
                positions[i].x += velocities[i].x;
                positions[i].y += velocities[i].y;
                positions[i].z += velocities[i].z;
            }
        }
        
        return this.normalizePositions(positions);
    }
}