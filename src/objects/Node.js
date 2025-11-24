export class Node {
    constructor(data, index) {
        this.data = data;
        this.index = index;
        
        // Standardwerte
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.z = data.z || 0;
        this.name = data.name || `Node ${index}`;
        this.color = data.color || 0x3498db;
        this.size = data.size || 1.0;
        
        // Weitere Eigenschaften aus den Daten
        this.metadata = data.metadata || {};
    }
}
