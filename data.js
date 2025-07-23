import * as THREE from 'three';

// Lade Netzwerkdaten aus JSON
export async function loadNetworkData(filename) {
    try {
        const response = await fetch(filename);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        return null;
    }
}

// Konvertiere JSON-Daten in Three.js Vektoren
let allNodes = []; // Definiere allNodes im globalen Scope

export const createNodes = async (filename) => {
    const data = await loadNetworkData(filename);
    if (!data) return [];

    let nodes = [];
    if (data.members) {
        nodes = data.members;
    } else if (data.nodes) {
        nodes = data.nodes;
    } else {
        console.warn('Invalid data format: nodes array is missing.');
        return [];
    }

    allNodes = nodes.map((node, index) => { // Speichere die Knoten in allNodes
        // Position extrahieren
        let x, y, z;
        if (node.position) {
            x = node.position.x;
            y = node.position.y;
            z = node.position.z;
        } else {
            x = node.x || 0;
            y = node.y || 0;
            z = node.z || 0;
        }
        
        // Erstelle Vector3 fuer die Position
        const vector = new THREE.Vector3(x, y, z);
        
        // Fuege wichtige Eigenschaften hinzu
        vector.name = node.name || `Node ${index}`;
        vector.id = node.id || index; // Sicherstellen, dass die ID auf dem Vector ist
        
        // Fuege alle anderen Eigenschaften des Knotens als Metadaten hinzu
        vector.metadata = { ...node };
        
        // Stelle sicher, dass die Position-Eigenschaft existiert (fuer Konsistenz)
        vector.position = vector;
        
        return vector;
    });
    
    console.log(`Loaded ${allNodes.length} nodes from ${filename}`);
    return allNodes;
};

// Erstelle Kantendefinitionen aus JSON-Daten
export const createEdgeDefinitions = async (filename, nodes) => {
    const data = await loadNetworkData(filename);
    if (!data || !data.edges) return [];
    
    // Erstelle eine Map fuer schnellen Zugriff auf Knoten nach ID oder Index
    const nodeMap = new Map();
    
    // Fuelle die Map mit Knoten
    nodes.forEach((node, index) => {
        // Speichere Knoten nach Index
        nodeMap.set(index, node);
        
        // Wenn der Knoten eine ID hat, speichere ihn auch nach ID
        if (node.id) {
            nodeMap.set(node.id, node);
        }
        
        // Speichere auch nach Namen, falls vorhanden
        if (node.name) {
            nodeMap.set(node.name, node);
        }
    });
    
    return data.edges.map(edge => {
        // Bestimme Start- und Endknoten basierend auf verschiedenen moeglichen Eigenschaften
        let startId = edge.start !== undefined ? edge.start : edge.source;
        let endId = edge.end !== undefined ? edge.end : edge.target;
        
        let start = nodeMap.get(startId);
        let end = nodeMap.get(endId);
        
        if (!start || !end) {
            console.warn(`Ungueltiger Knotenindex in Kantendefinition: start=${startId}, end=${endId}`);
            return null; // Ueberspringe diese Kante
        }
        
        const startNode = start;
        const endNode = end;
        const distance = startNode.position.distanceTo(endNode.position);
        const maxOffset = distance / 3;
        const offset = Math.min(edge.offset || 0, maxOffset);
        
        const edgeDefinition = {
            start: startNode,
            end: endNode,
            offset: offset,
            name: edge.type || edge.name || `Edge ${startId}-${endId}`
        };
        return edgeDefinition;
    }).filter(edge => edge !== null); // Filtere uebersprungene Kanten heraus
};

// Exportiere die Dateinamen fuer einfachen Zugriff
export const dataFiles = {
    small: 'data/examples/small.json',
    medium: 'data/examples/medium.json',
    large: 'data/examples/large.json',
    mega: 'data/examples/mega.json',
};
