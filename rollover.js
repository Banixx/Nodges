import * as THREE from 'three';
import { RaycastManager } from './src/utils/RaycastManager.js';

export class Rollover {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.raycastManager = new RaycastManager(camera, scene);
        this.hoveredObject = null;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.lastTime = performance.now();
        this.currentOpenObject = null;
        this.selectedObject = null;
        this.hoverTimeout = null;
        this.panelCloseTimeout = null;
        this.rafId = null; // Für requestAnimationFrame

        // Konfiguration
        this.hoverDelay = 50; // Verzögerung in ms bevor das Panel angezeigt wird
        this.panelCloseDelay = 200; // Verzögerung in ms bevor das Panel geschlossen wird
        this.hoverAreaSize = 5; // Größe der Hover-Area um das Objekt

        // Event-Listener
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.renderer.domElement.addEventListener('click', this.onSceneClick.bind(this), false);

        // Animation starten
        this.animate();

        // Event-Listener für das Info-Panel
        const infoPanel = document.getElementById('infoPanel');
        infoPanel.addEventListener('click', this.onInfoPanelClick.bind(this));
        infoPanel.addEventListener('mouseenter', () => {
            // Wenn die Maus über dem Panel ist, verhindern, dass es geschlossen wird
            if (this.panelCloseTimeout) {
                clearTimeout(this.panelCloseTimeout);
                this.panelCloseTimeout = null;
            }
            // Panel erweitern
            infoPanel.classList.add('expanded');
        });
        infoPanel.addEventListener('mouseleave', () => {
            // Wenn die Maus das Panel verlässt, Panel mit Verzögerung schließen
            this.panelCloseTimeout = setTimeout(() => {
                this.hideInfoPanel();
            }, this.panelCloseDelay);
            // Panel schrumpfen
            infoPanel.classList.remove('expanded');
        });
    }

    onInfoPanelClick(event) {
        const infoPanel = document.getElementById('infoPanel');
        // Toggle expanded class on click if not already expanded by hover
        if (!infoPanel.classList.contains('expanded')) {
            infoPanel.classList.add('expanded');
        } else {
            infoPanel.classList.remove('expanded');
        }
    }

	onSceneClick(event) {
        this.raycastManager.updateMousePosition(event);
        const intersectedObject = this.raycastManager.findIntersectedObject();

        if (intersectedObject) {
			this.applyHighlight(intersectedObject);
			this.showInfoPanel(intersectedObject, event);
        }
    }

    onMouseMove(event) {
        // Aktualisiere die Mausposition im RaycastManager
        this.raycastManager.updateMousePosition(event);
        
        // Finde das Objekt unter dem Mauszeiger
        const intersectedObject = this.raycastManager.findIntersectedObject();

        // Prüfe, ob das Info-Panel die Maus enthält
        const infoPanel = document.getElementById('infoPanel');
        const rect = infoPanel.getBoundingClientRect();
        const isMouseOverPanel = (
            event.clientX >= rect.left && 
            event.clientX <= rect.right && 
            event.clientY >= rect.top && 
            event.clientY <= rect.bottom &&
            infoPanel.style.display !== 'none'
        );
        
        // Wenn die Maus über dem Panel ist, oder wenn kein Objekt gefunden wurde und das Panel bereits angezeigt wird,
        // aber die Maus das Panel nicht verlassen hat, dann nichts tun.
        if (isMouseOverPanel) {
            // Wenn die Maus über dem Panel ist, lösche den panelCloseTimeout
            if (this.panelCloseTimeout) {
                clearTimeout(this.panelCloseTimeout);
                this.panelCloseTimeout = null;
            }
            return;
        }

        // Wenn ein Objekt gefunden wurde
        if (intersectedObject) {
            // Wenn die Maus von einem anderen Objekt auf dieses Objekt gewechselt ist
            if (this.hoveredObject !== intersectedObject) {
                // Lösche alle ausstehenden Timeouts
                if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
                if (this.panelCloseTimeout) clearTimeout(this.panelCloseTimeout);

                // Setze das Highlight für das vorherige Objekt zurück
                if (this.hoveredObject) {
                    this.resetHighlight(this.hoveredObject);
                }

                // Setze das neue Objekt als gehovert
                this.hoveredObject = intersectedObject;

                // Wende das Highlight auf das neue Objekt an
                this.applyHighlight(intersectedObject);

                // Zeige das Info-Panel mit Verzögerung
                this.hoverTimeout = setTimeout(() => {
                    this.showInfoPanel(intersectedObject, event);
                }, this.hoverDelay);
            } else {
                // Wenn es das gleiche Objekt ist, aktualisiere nur die Position des Panels, falls es sichtbar ist
                const infoPanel = document.getElementById('infoPanel');
                if (infoPanel.style.display === 'block') {
                    // Statt direkter Zuweisung, requestAnimationFrame nutzen
                    if (this.rafId) {
                        cancelAnimationFrame(this.rafId);
                    }
                    this.rafId = requestAnimationFrame(() => {
                        infoPanel.style.left = (event.clientX) + 20 + 'px';
                        infoPanel.style.top = (event.clientY) + 20 + 'px';
                        this.rafId = null;
                    });
                }
            }
        } else {
            // Wenn kein Objekt gefunden wurde
            if (this.hoveredObject) {
                // Lösche den hoverTimeout, falls vorhanden
                if (this.hoverTimeout) {
                    clearTimeout(this.hoverTimeout);
                    this.hoverTimeout = null;
                }
                // Lösche auch den requestAnimationFrame, falls aktiv
                if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                    this.rafId = null;
                }

                // Setze das Highlight für das vorherige Objekt zurück
                this.resetHighlight(this.hoveredObject);
                this.hoveredObject = null;

                // Schließe das Panel mit Verzögerung, wenn die Maus das Objekt verlässt
                if (this.panelCloseTimeout) {
                    clearTimeout(this.panelCloseTimeout);
                }
                this.panelCloseTimeout = setTimeout(() => {
                    this.hideInfoPanel();
                }, this.panelCloseDelay);
            } else {
                // Wenn kein Objekt gehovert wird und die Maus nicht über dem Panel ist,
                // und das Panel noch sichtbar ist, schließe es sofort.
                const infoPanel = document.getElementById('infoPanel');
                if (infoPanel.style.display === 'block' && !isMouseOverPanel) {
                    this.hideInfoPanel();
                }
            }
        }
    }

   applyHighlight(object) {
        if (object.userData.type === 'node') {
            object.material.emissiveIntensity = 0.8;
            object.material.emissive.setHex(0xffa500);
        } else if (object.userData.type === 'edge') {
            // Direkte Manipulation des Materials des spezifischen Objekts
            object.material.color.setHex(0xffa500);
            object.material.emissiveIntensity = 0.3;
            object.material.emissive.setHex(0xffa500);
            
            // Debug-Ausgabe
            console.log(`Highlighting edge: ${object.name}`);
        }
    }

    resetHighlight(object) {
        if (object.userData.type === 'node') {
            // Verwende die resetHighlight Methode der Node-Klasse für korrekte Wiederherstellung
            const node = object.userData.node;
            if (node && typeof node.resetHighlight === 'function') {
                node.resetHighlight();
            } else {
                // Fallback: Direkte Manipulation des Materials
                const originalColor = object.material.userData?.originalColor || 0xff4500;
                object.material.color.setHex(originalColor);
                object.material.emissiveIntensity = 0;
                object.material.emissive.setHex(0x000000);
            }
            
            // Debug-Ausgabe
            console.log(`Resetting highlight for node: ${object.name}`);
        } else if (object.userData.type === 'edge') {
            // Verwende die resetHighlight Methode der Edge-Klasse für korrekte Wiederherstellung
            const edge = object.userData.edge;
            if (edge && typeof edge.resetHighlight === 'function') {
                edge.resetHighlight();
            } else {
                // Fallback: Direkte Manipulation des Materials
                const originalColor = object.material.userData?.originalColor || 0x0000ff;
                object.material.color.setHex(originalColor);
            }
            
            // Emissive-Eigenschaften zurücksetzen
            object.material.emissiveIntensity = 0;
            object.material.emissive.setHex(0x000000);
            
            // Debug-Ausgabe
            console.log(`Resetting highlight for edge: ${object.name}`);
        }
    }

    showInfoPanel(object, event) {
        const infoPanel = document.getElementById('infoPanel');
        const infoPanelTitle = document.getElementById('infoPanelTitle');
        const infoPanelContent = document.getElementById('infoPanelContent');

        try {
            if (object.userData.type === 'node') {
                // Für Knoten
                const nodeName = object.name || 'Unbenannter Knoten';
                infoPanelTitle.textContent = nodeName;
                
                // Sammle alle verfügbaren Metadaten
                let metadataHtml = '';
                
                // Geometrie-Typ
                if (object.geometry && object.geometry.type) {
                    metadataHtml += `<strong>Geometrie:</strong> ${object.geometry.type}<br>`;
                }
                
                // Position
                if (object.position) {
                    const x = object.position.x.toFixed(2);
                    const y = object.position.y.toFixed(2);
                    const z = object.position.z.toFixed(2);
                    metadataHtml += `<strong>Position:</strong> (${x}, ${y}, ${z})<br>`;
                }
                
                // Zusätzliche Metadaten aus dem ursprünglichen Knoten
                if (object.metadata) {
                    const excludeKeys = ['name', 'position', 'x', 'y', 'z'];
                    Object.entries(object.metadata).forEach(([key, value]) => {
                        if (!excludeKeys.includes(key) && value !== undefined && value !== null) {
                            // Formatiere Arrays und Objekte
                            let displayValue = value;
                            if (typeof value === 'object') {
                                displayValue = JSON.stringify(value);
                            }
                            metadataHtml += `<strong>${key}:</strong> ${displayValue}<br>`;
                        }
                    });
                }
                
                infoPanelContent.innerHTML = metadataHtml || 'Keine weiteren Informationen verfügbar';
                
            } else if (object.userData.type === 'edge') {
                // Für Kanten
                const edgeName = object.name || 'Unbenannte Kante';
                infoPanelTitle.textContent = edgeName;
                
                let edgeHtml = '';
                
                // Versuche, Start- und Endknoten zu ermitteln
                if (object.userData.edge) {
                    const edge = object.userData.edge;
                    
                    // Start-Knoten
                    if (edge.startNode && edge.startNode.mesh) {
                        const startName = edge.startNode.mesh.name || 'Unbenannter Startknoten';
                        edgeHtml += `<strong>Start:</strong> ${startName}<br>`;
                    }
                    
                    // End-Knoten
                    if (edge.endNode && edge.endNode.mesh) {
                        const endName = edge.endNode.mesh.name || 'Unbenannter Endknoten';
                        edgeHtml += `<strong>End:</strong> ${endName}<br>`;
                    }
                    
                    // Kantentyp
                    if (edge.options && edge.options.style) {
                        edgeHtml += `<strong>Stil:</strong> ${edge.options.style}<br>`;
                    }
                    
                    // Offset
                    if (edge.options && edge.options.offset !== undefined) {
                        edgeHtml += `<strong>Offset:</strong> ${edge.options.offset}<br>`;
                    }
                }
                
                infoPanelContent.innerHTML = edgeHtml || 'Keine weiteren Informationen verfügbar';
            }

            // Positioniere das Panel neben dem Mauszeiger
            infoPanel.style.left = (event.clientX) + 20 + 'px';
            infoPanel.style.top = (event.clientY) + 20 + 'px';
            infoPanel.style.display = 'block';
            
        } catch (error) {
            console.error('Fehler beim Anzeigen des Info-Panels:', error);
            
            // Zeige eine Fehlermeldung im Panel an
            infoPanelTitle.textContent = 'Fehler';
            infoPanelContent.innerHTML = `
                <strong>Fehler beim Anzeigen der Informationen:</strong><br>
                ${error.message}
            `;
            
            infoPanel.style.left = (event.clientX) + 20 + 'px';
            infoPanel.style.top = (event.clientY) + 20 + 'px';
            infoPanel.style.display = 'block';
        }
    }

    hideInfoPanel() {
        const infoPanel = document.getElementById('infoPanel');
        infoPanel.style.display = 'none';
        infoPanel.classList.remove('expanded'); // Sicherstellen, dass die Klasse entfernt wird
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        // Animation und Rendering-Logik hier, falls benötigt
    }


    hideRollover() {
        if (this.currentOpenObject) {
            this.resetHighlight(this.currentOpenObject);
            this.currentOpenObject = null;
        }
        if (this.hoveredObject) {
            this.resetHighlight(this.hoveredObject);
            this.hoveredObject = null;
        }
    }
}
