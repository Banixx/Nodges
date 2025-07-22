/**
 * LayoutManager - Zentrale Verwaltung aller Layout-Algorithmen fuer Nodges 0.87
 */

export class LayoutManager {
    constructor() {
        this.layouts = new Map();
        this.currentLayout = null;
        this.isAnimating = false;
        this.animationSpeed = 1.0;
        
        // Registriere Standard-Layouts
        this.registerDefaultLayouts();
    }

    registerDefaultLayouts() {
        // Force-Directed Layout
        this.registerLayout('force', {
            name: 'Force-Directed',
            apply: (nodes, edges) => this.applyForceLayout(nodes, edges),
            options: {
                iterations: 100,
                repulsion: 50,
                attraction: 0.1,
                damping: 0.9
            }
        });

        // Circular Layout
        this.registerLayout('circular', {
            name: 'Circular',
            apply: (nodes, edges) => this.applyCircularLayout(nodes, edges),
            options: {
                radius: 10
            }
        });

        // Grid Layout
        this.registerLayout('grid', {
            name: 'Grid',
            apply: (nodes, edges) => this.applyGridLayout(nodes, edges),
            options: {
                spacing: 5
            }
        });

        // Random Layout
        this.registerLayout('random', {
            name: 'Random',
            apply: (nodes, edges) => this.applyRandomLayout(nodes, edges),
            options: {
                range: 20
            }
        });
    }

    registerLayout(id, layout) {
        this.layouts.set(id, layout);
    }

    applyLayout(layoutId, nodes, edges, options = {}) {
        const layout = this.layouts.get(layoutId);
        if (!layout) {
            console.warn(`Layout ${layoutId} nicht gefunden`);
            return false;
        }

        this.currentLayout = layoutId;
        const mergedOptions = { ...layout.options, ...options };
        
        try {
            layout.apply(nodes, edges, mergedOptions);
            console.log(`Layout ${layout.name} angewendet auf ${nodes.length} Knoten`);
            return true;
        } catch (error) {
            console.error(`Fehler beim Anwenden des Layouts ${layout.name}:`, error);
            return false;
        }
    }

    applyForceLayout(nodes, edges, options) {
        const { iterations, repulsion, attraction, damping } = options;
        
        for (let i = 0; i < iterations; i++) {
            // Repulsion zwischen allen Knoten
            for (let j = 0; j < nodes.length; j++) {
                for (let k = j + 1; k < nodes.length; k++) {
                    const node1 = nodes[j];
                    const node2 = nodes[k];
                    
                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const dz = node2.z - node1.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
                    
                    const force = repulsion / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;
                    
                    node1.x -= fx * damping;
                    node1.y -= fy * damping;
                    node1.z -= fz * damping;
                    node2.x += fx * damping;
                    node2.y += fy * damping;
                    node2.z += fz * damping;
                }
            }
            
            // Attraction entlang Kanten
            edges.forEach(edge => {
                const node1 = edge.start;
                const node2 = edge.end;
                
                const dx = node2.x - node1.x;
                const dy = node2.y - node1.y;
                const dz = node2.z - node1.z;
                
                const fx = dx * attraction;
                const fy = dy * attraction;
                const fz = dz * attraction;
                
                node1.x += fx;
                node1.y += fy;
                node1.z += fz;
                node2.x -= fx;
                node2.y -= fy;
                node2.z -= fz;
            });
        }
    }

    applyCircularLayout(nodes, edges, options) {
        const { radius } = options;
        const angleStep = (2 * Math.PI) / nodes.length;
        
        nodes.forEach((node, index) => {
            const angle = index * angleStep;
            node.x = Math.cos(angle) * radius;
            node.y = 0;
            node.z = Math.sin(angle) * radius;
        });
    }

    applyGridLayout(nodes, edges, options) {
        const { spacing } = options;
        const gridSize = Math.ceil(Math.sqrt(nodes.length));
        
        nodes.forEach((node, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            
            node.x = (col - gridSize / 2) * spacing;
            node.y = 0;
            node.z = (row - gridSize / 2) * spacing;
        });
    }

    applyRandomLayout(nodes, edges, options) {
        const { range } = options;
        
        nodes.forEach(node => {
            node.x = (Math.random() - 0.5) * range;
            node.y = Math.random() * range * 0.5;
            node.z = (Math.random() - 0.5) * range;
        });
    }

    getAvailableLayouts() {
        return Array.from(this.layouts.entries()).map(([id, layout]) => ({
            id,
            name: layout.name,
            options: layout.options
        }));
    }

    getCurrentLayout() {
        return this.currentLayout;
    }
}