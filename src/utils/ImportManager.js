/**
 * ImportManager - Handles importing network data from various formats
 * Supports: JSON (native), CSV, GEXF, GraphML
 */

export class ImportManager {
    constructor() {
        this.supportedFormats = ['json', 'csv', 'gexf', 'graphml'];
        this.parser = new DOMParser();
    }

    /**
     * Import network data from file
     * @param {File} file - The file to import
     * @returns {Promise<Object>} - Parsed network data in Nodges format
     */
    async importFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }

        const extension = this.getFileExtension(file.name).toLowerCase();
        
        if (!this.supportedFormats.includes(extension)) {
            throw new Error(`Unsupported file format: ${extension}. Supported formats: ${this.supportedFormats.join(', ')}`);
        }

        const content = await this.readFileContent(file);
        
        switch (extension) {
            case 'json':
                return this.parseJSON(content);
            case 'csv':
                return this.parseCSV(content);
            case 'gexf':
                return this.parseGEXF(content);
            case 'graphml':
                return this.parseGraphML(content);
            default:
                throw new Error(`Parser not implemented for format: ${extension}`);
        }
    }

    /**
     * Read file content as text
     * @param {File} file - The file to read
     * @returns {Promise<string>} - File content as string
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Get file extension from filename
     * @param {string} filename - The filename
     * @returns {string} - File extension
     */
    getFileExtension(filename) {
        return filename.split('.').pop() || '';
    }

    /**
     * Parse JSON format (native Nodges format)
     * @param {string} content - JSON content
     * @returns {Object} - Parsed network data
     */
    parseJSON(content) {
        try {
            const data = JSON.parse(content);
            return this.validateAndNormalizeData(data);
        } catch (error) {
            throw new Error(`Invalid JSON format: ${error.message}`);
        }
    }

    /**
     * Parse CSV format
     * Expected formats:
     * - Nodes: id,name,x,y,z,color,size,type,metadata...
     * - Edges: source,target,weight,color,style,name,metadata...
     * @param {string} content - CSV content
     * @returns {Object} - Parsed network data in Nodges format
     */
    parseCSV(content) {
        const lines = content.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must contain at least a header and one data row');
        }

        // Detect if this is nodes or edges CSV based on headers
        const headers = this.parseCSVLine(lines[0]);
        const isNodesFile = headers.includes('id') && (headers.includes('x') || headers.includes('y'));
        const isEdgesFile = headers.includes('source') && headers.includes('target');

        if (isNodesFile) {
            return this.parseNodesCSV(lines);
        } else if (isEdgesFile) {
            return this.parseEdgesCSV(lines);
        } else {
            throw new Error('CSV format not recognized. Expected nodes (id,x,y,z...) or edges (source,target...) format');
        }
    }

    /**
     * Parse nodes CSV
     * @param {string[]} lines - CSV lines
     * @returns {Object} - Network data with nodes
     */
    parseNodesCSV(lines) {
        const headers = this.parseCSVLine(lines[0]);
        const nodes = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) continue;

            const node = {};
            const metadata = {};

            headers.forEach((header, index) => {
                const value = values[index];
                
                switch (header.toLowerCase()) {
                    case 'id':
                        node.id = value;
                        break;
                    case 'name':
                        node.name = value;
                        break;
                    case 'x':
                        node.x = parseFloat(value) || 0;
                        break;
                    case 'y':
                        node.y = parseFloat(value) || 0;
                        break;
                    case 'z':
                        node.z = parseFloat(value) || 0;
                        break;
                    case 'color':
                        metadata.color = this.parseColor(value);
                        break;
                    case 'size':
                        metadata.size = parseFloat(value) || 1;
                        break;
                    case 'type':
                        metadata.type = value;
                        break;
                    default:
                        // Store other properties as metadata
                        metadata[header] = this.parseValue(value);
                        break;
                }
            });

            node.position = { x: node.x || 0, y: node.y || 0, z: node.z || 0 };
            node.metadata = metadata;
            nodes.push(node);
        }

        return {
            metadata: {
                type: 'imported_csv',
                source: 'CSV Import',
                nodeCount: nodes.length,
                edgeCount: 0
            },
            nodes: nodes,
            edges: []
        };
    }

    /**
     * Parse edges CSV
     * @param {string[]} lines - CSV lines
     * @returns {Object} - Network data with edges
     */
    parseEdgesCSV(lines) {
        const headers = this.parseCSVLine(lines[0]);
        const edges = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) continue;

            const edge = {};
            const metadata = {};

            headers.forEach((header, index) => {
                const value = values[index];
                
                switch (header.toLowerCase()) {
                    case 'source':
                    case 'from':
                        edge.source = value;
                        break;
                    case 'target':
                    case 'to':
                        edge.target = value;
                        break;
                    case 'weight':
                        edge.weight = parseFloat(value) || 1;
                        break;
                    case 'color':
                        metadata.color = this.parseColor(value);
                        break;
                    case 'style':
                        metadata.style = value;
                        break;
                    case 'name':
                    case 'label':
                        edge.name = value;
                        break;
                    default:
                        metadata[header] = this.parseValue(value);
                        break;
                }
            });

            edge.metadata = metadata;
            edges.push(edge);
        }

        return {
            metadata: {
                type: 'imported_csv_edges',
                source: 'CSV Import',
                nodeCount: 0,
                edgeCount: edges.length
            },
            nodes: [],
            edges: edges
        };
    }

    /**
     * Parse GEXF format
     * @param {string} content - GEXF XML content
     * @returns {Object} - Parsed network data in Nodges format
     */
    parseGEXF(content) {
        try {
            const xmlDoc = this.parser.parseFromString(content, 'text/xml');
            const gexf = xmlDoc.getElementsByTagName('gexf')[0];
            
            if (!gexf) {
                throw new Error('Invalid GEXF format: missing gexf root element');
            }

            const graph = gexf.getElementsByTagName('graph')[0];
            if (!graph) {
                throw new Error('Invalid GEXF format: missing graph element');
            }

            const nodes = this.parseGEXFNodes(graph);
            const edges = this.parseGEXFEdges(graph);

            return {
                metadata: {
                    type: 'imported_gexf',
                    source: 'GEXF Import',
                    nodeCount: nodes.length,
                    edgeCount: edges.length
                },
                nodes: nodes,
                edges: edges
            };
        } catch (error) {
            throw new Error(`Failed to parse GEXF: ${error.message}`);
        }
    }

    /**
     * Parse nodes from GEXF
     * @param {Element} graph - Graph XML element
     * @returns {Array} - Array of nodes
     */
    parseGEXFNodes(graph) {
        const nodes = [];
        const nodeElements = graph.getElementsByTagName('node');

        for (let i = 0; i < nodeElements.length; i++) {
            const nodeEl = nodeElements[i];
            const node = {
                id: nodeEl.getAttribute('id'),
                name: nodeEl.getAttribute('label') || nodeEl.getAttribute('id'),
                position: { x: 0, y: 0, z: 0 },
                metadata: {}
            };

            // Parse position from viz:position
            const positionEl = nodeEl.getElementsByTagName('viz:position')[0];
            if (positionEl) {
                node.position.x = parseFloat(positionEl.getAttribute('x')) || 0;
                node.position.y = parseFloat(positionEl.getAttribute('y')) || 0;
                node.position.z = parseFloat(positionEl.getAttribute('z')) || 0;
            }

            // Parse color from viz:color
            const colorEl = nodeEl.getElementsByTagName('viz:color')[0];
            if (colorEl) {
                const r = parseInt(colorEl.getAttribute('r')) || 0;
                const g = parseInt(colorEl.getAttribute('g')) || 0;
                const b = parseInt(colorEl.getAttribute('b')) || 0;
                node.metadata.color = (r << 16) | (g << 8) | b;
            }

            // Parse size from viz:size
            const sizeEl = nodeEl.getElementsByTagName('viz:size')[0];
            if (sizeEl) {
                node.metadata.size = parseFloat(sizeEl.getAttribute('value')) || 1;
            }

            // Parse attributes
            const attvalues = nodeEl.getElementsByTagName('attvalue');
            for (let j = 0; j < attvalues.length; j++) {
                const attEl = attvalues[j];
                const key = attEl.getAttribute('for') || attEl.getAttribute('id');
                const value = attEl.getAttribute('value');
                if (key && value) {
                    node.metadata[key] = this.parseValue(value);
                }
            }

            nodes.push(node);
        }

        return nodes;
    }

    /**
     * Parse edges from GEXF
     * @param {Element} graph - Graph XML element
     * @returns {Array} - Array of edges
     */
    parseGEXFEdges(graph) {
        const edges = [];
        const edgeElements = graph.getElementsByTagName('edge');

        for (let i = 0; i < edgeElements.length; i++) {
            const edgeEl = edgeElements[i];
            const edge = {
                source: edgeEl.getAttribute('source'),
                target: edgeEl.getAttribute('target'),
                name: edgeEl.getAttribute('label') || `Edge ${i}`,
                weight: parseFloat(edgeEl.getAttribute('weight')) || 1,
                metadata: {}
            };

            // Parse color from viz:color
            const colorEl = edgeEl.getElementsByTagName('viz:color')[0];
            if (colorEl) {
                const r = parseInt(colorEl.getAttribute('r')) || 0;
                const g = parseInt(colorEl.getAttribute('g')) || 0;
                const b = parseInt(colorEl.getAttribute('b')) || 0;
                edge.metadata.color = (r << 16) | (g << 8) | b;
            }

            // Parse attributes
            const attvalues = edgeEl.getElementsByTagName('attvalue');
            for (let j = 0; j < attvalues.length; j++) {
                const attEl = attvalues[j];
                const key = attEl.getAttribute('for') || attEl.getAttribute('id');
                const value = attEl.getAttribute('value');
                if (key && value) {
                    edge.metadata[key] = this.parseValue(value);
                }
            }

            edges.push(edge);
        }

        return edges;
    }

    /**
     * Parse GraphML format
     * @param {string} content - GraphML XML content
     * @returns {Object} - Parsed network data in Nodges format
     */
    parseGraphML(content) {
        try {
            const xmlDoc = this.parser.parseFromString(content, 'text/xml');
            const graphml = xmlDoc.getElementsByTagName('graphml')[0];
            
            if (!graphml) {
                throw new Error('Invalid GraphML format: missing graphml root element');
            }

            const graph = graphml.getElementsByTagName('graph')[0];
            if (!graph) {
                throw new Error('Invalid GraphML format: missing graph element');
            }

            // Parse key definitions
            const keys = this.parseGraphMLKeys(graphml);
            const nodes = this.parseGraphMLNodes(graph, keys);
            const edges = this.parseGraphMLEdges(graph, keys);

            return {
                metadata: {
                    type: 'imported_graphml',
                    source: 'GraphML Import',
                    nodeCount: nodes.length,
                    edgeCount: edges.length
                },
                nodes: nodes,
                edges: edges
            };
        } catch (error) {
            throw new Error(`Failed to parse GraphML: ${error.message}`);
        }
    }

    /**
     * Parse GraphML key definitions
     * @param {Element} graphml - GraphML root element
     * @returns {Object} - Key definitions
     */
    parseGraphMLKeys(graphml) {
        const keys = {};
        const keyElements = graphml.getElementsByTagName('key');

        for (let i = 0; i < keyElements.length; i++) {
            const keyEl = keyElements[i];
            const id = keyEl.getAttribute('id');
            const attrName = keyEl.getAttribute('attr.name');
            const attrType = keyEl.getAttribute('attr.type') || 'string';
            const forElement = keyEl.getAttribute('for') || 'all';

            if (id && attrName) {
                keys[id] = {
                    name: attrName,
                    type: attrType,
                    for: forElement
                };
            }
        }

        return keys;
    }

    /**
     * Parse nodes from GraphML
     * @param {Element} graph - Graph XML element
     * @param {Object} keys - Key definitions
     * @returns {Array} - Array of nodes
     */
    parseGraphMLNodes(graph, keys) {
        const nodes = [];
        const nodeElements = graph.getElementsByTagName('node');

        for (let i = 0; i < nodeElements.length; i++) {
            const nodeEl = nodeElements[i];
            const node = {
                id: nodeEl.getAttribute('id'),
                name: nodeEl.getAttribute('id'), // Default name to id
                position: { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10, z: Math.random() * 20 - 10 },
                metadata: {}
            };

            // Parse data elements
            const dataElements = nodeEl.getElementsByTagName('data');
            for (let j = 0; j < dataElements.length; j++) {
                const dataEl = dataElements[j];
                const key = dataEl.getAttribute('key');
                const value = dataEl.textContent;

                if (key && keys[key]) {
                    const keyDef = keys[key];
                    const parsedValue = this.parseValueByType(value, keyDef.type);

                    // Handle special attributes
                    switch (keyDef.name.toLowerCase()) {
                        case 'name':
                        case 'label':
                            node.name = parsedValue;
                            break;
                        case 'x':
                            node.position.x = parsedValue;
                            break;
                        case 'y':
                            node.position.y = parsedValue;
                            break;
                        case 'z':
                            node.position.z = parsedValue;
                            break;
                        case 'color':
                            node.metadata.color = this.parseColor(parsedValue);
                            break;
                        case 'size':
                            node.metadata.size = parsedValue;
                            break;
                        default:
                            node.metadata[keyDef.name] = parsedValue;
                            break;
                    }
                }
            }

            nodes.push(node);
        }

        return nodes;
    }

    /**
     * Parse edges from GraphML
     * @param {Element} graph - Graph XML element
     * @param {Object} keys - Key definitions
     * @returns {Array} - Array of edges
     */
    parseGraphMLEdges(graph, keys) {
        const edges = [];
        const edgeElements = graph.getElementsByTagName('edge');

        for (let i = 0; i < edgeElements.length; i++) {
            const edgeEl = edgeElements[i];
            const edge = {
                source: edgeEl.getAttribute('source'),
                target: edgeEl.getAttribute('target'),
                name: `Edge ${i}`,
                weight: 1,
                metadata: {}
            };

            // Parse data elements
            const dataElements = edgeEl.getElementsByTagName('data');
            for (let j = 0; j < dataElements.length; j++) {
                const dataEl = dataElements[j];
                const key = dataEl.getAttribute('key');
                const value = dataEl.textContent;

                if (key && keys[key]) {
                    const keyDef = keys[key];
                    const parsedValue = this.parseValueByType(value, keyDef.type);

                    // Handle special attributes
                    switch (keyDef.name.toLowerCase()) {
                        case 'name':
                        case 'label':
                            edge.name = parsedValue;
                            break;
                        case 'weight':
                            edge.weight = parsedValue;
                            break;
                        case 'color':
                            edge.metadata.color = this.parseColor(parsedValue);
                            break;
                        default:
                            edge.metadata[keyDef.name] = parsedValue;
                            break;
                    }
                }
            }

            edges.push(edge);
        }

        return edges;
    }

    /**
     * Parse CSV line handling quoted values
     * @param {string} line - CSV line
     * @returns {Array} - Array of values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Parse color value
     * @param {string} value - Color value (hex, rgb, name)
     * @returns {number} - Color as hex number
     */
    parseColor(value) {
        if (!value) return 0xff4500; // Default orange

        // Remove whitespace
        value = value.trim();

        // Hex color
        if (value.startsWith('#')) {
            return parseInt(value.substring(1), 16);
        }

        // RGB color
        if (value.startsWith('rgb(')) {
            const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                const r = parseInt(match[1]);
                const g = parseInt(match[2]);
                const b = parseInt(match[3]);
                return (r << 16) | (g << 8) | b;
            }
        }

        // Named colors (basic set)
        const namedColors = {
            'red': 0xff0000,
            'green': 0x00ff00,
            'blue': 0x0000ff,
            'yellow': 0xffff00,
            'orange': 0xffa500,
            'purple': 0x800080,
            'pink': 0xffc0cb,
            'brown': 0xa52a2a,
            'black': 0x000000,
            'white': 0xffffff,
            'gray': 0x808080,
            'grey': 0x808080
        };

        return namedColors[value.toLowerCase()] || 0xff4500;
    }

    /**
     * Parse value with automatic type detection
     * @param {string} value - String value
     * @returns {*} - Parsed value
     */
    parseValue(value) {
        if (!value || value === '') return '';

        // Try number
        const num = parseFloat(value);
        if (!isNaN(num) && isFinite(num)) {
            return num;
        }

        // Try boolean
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;

        // Return as string
        return value;
    }

    /**
     * Parse value by specified type
     * @param {string} value - String value
     * @param {string} type - Expected type
     * @returns {*} - Parsed value
     */
    parseValueByType(value, type) {
        switch (type) {
            case 'int':
                return parseInt(value) || 0;
            case 'long':
                return parseInt(value) || 0;
            case 'float':
            case 'double':
                return parseFloat(value) || 0;
            case 'boolean':
                return value.toLowerCase() === 'true';
            case 'string':
            default:
                return value;
        }
    }

    /**
     * Validate and normalize imported data to Nodges format
     * @param {Object} data - Imported data
     * @returns {Object} - Validated and normalized data
     */
    validateAndNormalizeData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format: expected object');
        }

        // Ensure required structure
        const normalized = {
            metadata: data.metadata || {
                type: 'imported',
                source: 'Unknown',
                nodeCount: 0,
                edgeCount: 0
            },
            nodes: data.nodes || [],
            edges: data.edges || []
        };

        // Validate nodes
        normalized.nodes = normalized.nodes.map((node, index) => {
            if (!node.id) {
                node.id = `node_${index}`;
            }
            if (!node.name) {
                node.name = node.id;
            }
            if (!node.position) {
                node.position = { x: 0, y: 0, z: 0 };
            }
            if (!node.metadata) {
                node.metadata = {};
            }
            return node;
        });

        // Validate edges
        normalized.edges = normalized.edges.map((edge, index) => {
            if (!edge.source || !edge.target) {
                throw new Error(`Edge ${index} missing source or target`);
            }
            if (!edge.name) {
                edge.name = `Edge ${index}`;
            }
            if (!edge.metadata) {
                edge.metadata = {};
            }
            return edge;
        });

        // Update counts
        normalized.metadata.nodeCount = normalized.nodes.length;
        normalized.metadata.edgeCount = normalized.edges.length;

        return normalized;
    }
}