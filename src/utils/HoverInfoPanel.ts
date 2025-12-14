/**
 * HoverInfoPanel - Zeigt Informationen über gehoverte Objekte in der Nähe des Mauszeigers an
 */

import * as THREE from 'three';

export class HoverInfoPanel {
    private panel: HTMLElement;
    private titleElement: HTMLElement;
    private contentElement: HTMLElement;
    private currentObject: THREE.Object3D | null;
    private hideTimeout: any;
    private showDelay: number;
    private hideDelay: number;
    private offsetX: number;
    private offsetY: number;
    private camera: THREE.Camera | null;
    private scene: THREE.Scene | null;

    constructor(camera?: THREE.Camera, scene?: THREE.Scene) {
        this.currentObject = null;
        this.hideTimeout = null;
        this.showDelay = 300; // 300ms Verzögerung bevor Panel erscheint
        this.hideDelay = 100; // 100ms Verzögerung bevor Panel verschwindet
        this.offsetX = 20; // Abstand vom Mauszeiger (horizontal)
        this.offsetY = 20; // Abstand vom Mauszeiger (vertikal)
        this.camera = camera || null;
        this.scene = scene || null;

        // Panel erstellen
        this.panel = this.createPanel();
        this.titleElement = this.panel.querySelector('.hover-info-title') as HTMLElement;
        this.contentElement = this.panel.querySelector('.hover-info-content') as HTMLElement;

        // Panel zum DOM hinzufügen
        document.body.appendChild(this.panel);
    }

    /**
     * Setzt Camera und Scene für intelligente Positionierung
     */
    setSceneContext(camera: THREE.Camera, scene: THREE.Scene) {
        this.camera = camera;
        this.scene = scene;
    }

    /**
     * Erstellt das HTML-Element für das Panel
     */
    private createPanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.id = 'hoverInfoPanel';
        panel.className = 'hidden';

        panel.innerHTML = `
            <div class="hover-info-title">Info</div>
            <div class="hover-info-content"></div>
        `;

        return panel;
    }

    /**
     * Zeigt das Panel für ein gehovertes Objekt an
     */
    show(object: THREE.Object3D, mouseX: number, mouseY: number) {
        // Timeout für Verstecken abbrechen
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        // Wenn es das gleiche Objekt ist, nur Position aktualisieren
        if (this.currentObject === object) {
            this.updatePosition(mouseX, mouseY);
            return;
        }

        this.currentObject = object;

        // Verzögerung bevor Panel erscheint
        setTimeout(() => {
            if (this.currentObject === object) {
                this.updateContent(object);
                this.updatePosition(mouseX, mouseY);
                this.panel.classList.remove('hidden');
                this.panel.classList.add('visible');
            }
        }, this.showDelay);
    }

    /**
     * Versteckt das Panel
     */
    hide() {
        this.hideTimeout = setTimeout(() => {
            this.panel.classList.remove('visible');
            this.panel.classList.add('hidden');
            this.currentObject = null;
            this.hideTimeout = null;
        }, this.hideDelay);
    }

    /**
     * Aktualisiert die Position des Panels basierend auf der Mausposition
     * Versucht, Nodes und Edges nicht zu überdecken
     */
    updatePosition(mouseX: number, mouseY: number) {
        const panelWidth = this.panel.offsetWidth;
        const panelHeight = this.panel.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Mögliche Positionen (in Prioritätsreihenfolge)
        const positions = [
            { x: mouseX + this.offsetX, y: mouseY + this.offsetY, name: 'bottom-right' },
            { x: mouseX - panelWidth - this.offsetX, y: mouseY + this.offsetY, name: 'bottom-left' },
            { x: mouseX + this.offsetX, y: mouseY - panelHeight - this.offsetY, name: 'top-right' },
            { x: mouseX - panelWidth - this.offsetX, y: mouseY - panelHeight - this.offsetY, name: 'top-left' },
        ];

        let bestPosition = positions[0];
        let bestScore = -Infinity;

        // Wenn Camera und Scene verfügbar sind, nutze intelligente Positionierung
        if (this.camera && this.scene) {
            for (const pos of positions) {
                // Überprüfe, ob Position im Viewport ist
                if (pos.x < 10 || pos.x + panelWidth > windowWidth - 10 ||
                    pos.y < 10 || pos.y + panelHeight > windowHeight - 10) {
                    continue; // Position außerhalb des Viewports
                }

                // Berechne Score basierend auf Überlappung mit Objekten
                const score = this.calculatePositionScore(pos.x, pos.y, panelWidth, panelHeight);

                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = pos;
                }
            }
        }

        // Fallback: Einfache Positionierung wenn keine Scene/Camera oder alle Positionen ungültig
        let x = bestPosition.x;
        let y = bestPosition.y;

        // Verhindere, dass das Panel über den Bildschirmrand hinausgeht
        if (x + panelWidth > windowWidth) {
            x = mouseX - panelWidth - this.offsetX;
        }

        if (y + panelHeight > windowHeight) {
            y = mouseY - panelHeight - this.offsetY;
        }

        // Stelle sicher, dass das Panel nicht außerhalb des Viewports ist
        x = Math.max(10, Math.min(x, windowWidth - panelWidth - 10));
        y = Math.max(10, Math.min(y, windowHeight - panelHeight - 10));

        this.panel.style.left = `${x}px`;
        this.panel.style.top = `${y}px`;
    }

    /**
     * Berechnet einen Score für eine Panel-Position
     * Höherer Score = weniger Überlappung mit Objekten
     */
    private calculatePositionScore(x: number, y: number, width: number, height: number): number {
        if (!this.camera || !this.scene) return 0;

        let score = 100; // Basis-Score
        const panelRect = {
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };

        // Sammle alle sichtbaren Objekte
        const objects: THREE.Object3D[] = [];
        this.scene.traverse((obj) => {
            if (obj.userData && (obj.userData.type === 'node' || obj.userData.type === 'edge')) {
                objects.push(obj);
            }
        });

        // Überprüfe Überlappung mit jedem Objekt
        for (const obj of objects) {
            // Überspringe das aktuell gehoverte Objekt
            if (obj === this.currentObject) continue;

            const screenPos = this.worldToScreen(obj.position);
            if (!screenPos) continue;

            // Definiere einen Bereich um das Objekt (größer für Nodes, kleiner für Edges)
            const radius = obj.userData.type === 'node' ? 30 : 15;
            const objRect = {
                left: screenPos.x - radius,
                right: screenPos.x + radius,
                top: screenPos.y - radius,
                bottom: screenPos.y + radius
            };

            // Berechne Überlappung
            if (this.rectanglesOverlap(panelRect, objRect)) {
                // Reduziere Score basierend auf Überlappungsfläche
                const overlapArea = this.calculateOverlapArea(panelRect, objRect);
                score -= overlapArea / 100; // Normalisiere den Abzug
            }
        }

        return score;
    }

    /**
     * Konvertiert 3D-Weltkoordinaten zu 2D-Bildschirmkoordinaten
     */
    private worldToScreen(position: THREE.Vector3): { x: number, y: number } | null {
        if (!this.camera) return null;

        const vector = position.clone();
        vector.project(this.camera);

        // Konvertiere von NDC (-1 bis 1) zu Pixel-Koordinaten
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

        // Überprüfe, ob das Objekt vor der Kamera ist
        if (vector.z > 1) return null;

        return { x, y };
    }

    /**
     * Überprüft, ob zwei Rechtecke sich überlappen
     */
    private rectanglesOverlap(rect1: any, rect2: any): boolean {
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
    }

    /**
     * Berechnet die Überlappungsfläche zweier Rechtecke
     */
    private calculateOverlapArea(rect1: any, rect2: any): number {
        const overlapWidth = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
        const overlapHeight = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
        return overlapWidth * overlapHeight;
    }

    /**
     * Aktualisiert den Inhalt des Panels basierend auf dem Objekt-Typ
     */
    private updateContent(object: THREE.Object3D) {
        if (!object || !object.userData) {
            this.contentElement.innerHTML = '<div class="hover-info-row">Keine Daten verfügbar</div>';
            return;
        }

        const type = object.userData.type;

        if (type === 'node') {
            this.updateNodeContent(object);
        } else if (type === 'edge') {
            this.updateEdgeContent(object);
        } else {
            this.contentElement.innerHTML = '<div class="hover-info-row">Unbekannter Typ</div>';
        }
    }

    /**
     * Aktualisiert den Inhalt für einen Node
     */
    private updateNodeContent(object: THREE.Object3D) {
        const nodeData = object.userData.nodeData;

        if (!nodeData) {
            this.contentElement.innerHTML = '<div class="hover-info-row">Keine Node-Daten</div>';
            return;
        }

        this.titleElement.textContent = 'Node';

        const rows: string[] = [];

        // ID
        if (nodeData.id !== undefined) {
            rows.push(this.createInfoRow('ID', nodeData.id));
        }

        // Name
        if (nodeData.name) {
            rows.push(this.createInfoRow('Name', nodeData.name));
        }

        // Label
        if (nodeData.label) {
            rows.push(this.createInfoRow('Label', nodeData.label));
        }

        // Value
        if (nodeData.val !== undefined) {
            rows.push(this.createInfoRow('Value', nodeData.val.toFixed(2)));
        }

        // Group
        if (nodeData.group !== undefined) {
            rows.push(this.createInfoRow('Group', nodeData.group));
        }

        // Position
        if (object.position) {
            const pos = `(${object.position.x.toFixed(1)}, ${object.position.y.toFixed(1)}, ${object.position.z.toFixed(1)})`;
            rows.push(this.createInfoRow('Position', pos));
        }

        this.contentElement.innerHTML = rows.join('');
    }

    /**
     * Aktualisiert den Inhalt für eine Edge
     */
    private updateEdgeContent(object: THREE.Object3D) {
        const edgeData = object.userData.edge;

        if (!edgeData) {
            this.contentElement.innerHTML = '<div class="hover-info-row">Keine Edge-Daten</div>';
            return;
        }

        this.titleElement.textContent = 'Edge';

        const rows: string[] = [];

        // Source
        if (edgeData.source !== undefined) {
            rows.push(this.createInfoRow('Source', edgeData.source));
        }

        // Target
        if (edgeData.target !== undefined) {
            rows.push(this.createInfoRow('Target', edgeData.target));
        }

        // Value
        if (edgeData.value !== undefined) {
            rows.push(this.createInfoRow('Value', edgeData.value.toFixed(2)));
        }

        // Label
        if (edgeData.label) {
            rows.push(this.createInfoRow('Label', edgeData.label));
        }

        // Type
        if (edgeData.type) {
            rows.push(this.createInfoRow('Type', edgeData.type));
        }

        this.contentElement.innerHTML = rows.join('');
    }

    /**
     * Erstellt eine Info-Zeile (Label-Value-Paar)
     */
    private createInfoRow(label: string, value: any): string {
        return `
            <div class="hover-info-row">
                <span class="hover-info-label">${label}:</span>
                <span class="hover-info-value">${value}</span>
            </div>
        `;
    }

    /**
     * Gibt an, ob das Panel gerade sichtbar ist
     */
    isVisible(): boolean {
        return this.panel.classList.contains('visible');
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        if (this.panel.parentElement) {
            this.panel.parentElement.removeChild(this.panel);
        }
    }
}
