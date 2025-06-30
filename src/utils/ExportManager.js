/**
 * ExportManager - Handles exporting network data to various formats
 * Supports: JSON (native), CSV, GEXF, GraphML, PNG/SVG (visualization)
 */

export class ExportManager {
    constructor() {
        this.supportedFormats = ['json', 'csv', 'gexf', 'graphml', 'png', 'svg'];
    }

    /**
     * Export network data to specified format
     * @param {Object} networkData - Network data to export
     * @param {string} format - Export format
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    async exportNetwork(networkData, format, filename, options = {}) {
        if (!networkData) {
            throw new Error('No network data provided');
        }

        format = format.toLowerCase();
        if (!this.supportedFormats.includes(format)) {
            throw new Error(`Unsupported export format: ${format}. Supported formats: ${this.supportedFormats.join(', ')}`);
        }

        let content;
        let mimeType;

        switch (format) {
            case 'json':
                content = this.exportJSON(networkData, options);
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.exportCSV(networkData, options);
                mimeType = 'text/csv';
                break;
            case 'gexf':
                content = this.exportGEXF(networkData, options);
                mimeType = 'application/xml';
                break;
            case 'graphml':
                content = this.exportGraphML(networkData, options);
                mimeType = 'application/xml';
                break;
            case 'png':
                return this.exportPNG(filename, options);
            case 'svg':
                return this.exportSVG(filename, options);
            default:
                throw new Error(`Export not implemented for format: ${format}`);
        }

        this.downloadFile(content, filename, mimeType);
    }

    /**
     * Export to JSON format (native Nodges format)
     * @param {Object} networkData - Network data
     * @param {Object} options - Export options
     * @returns {string} - JSON string
     */
    exportJSON(networkData, options = {}) {
        const exportData = {
            metadata: {
                ...networkData.metadata,
                exportedAt: new Date().toISOString(),
                exportedBy: 'Nodges 0.78',
                format: 'nodges-json'
            },
            nodes: networkData.nodes || [],
            edges: networkData.edges || []
        };

        // Include visualization state if requested
        if (options.includeVisualizationState && options.visualizationState) {
            exportData.visualizationState = options.visualizationState;
        }

        return JSON.stringify(exportData, null, options.minify ? 0 : 2);
    }

    /**
     * Export to CSV format
     * @param {Object} networkData - Network data
     * @param {Object} options - Export options
     * @returns {string} - CSV string
     */
    exportCSV(networkData, options = {}) {
        const exportType = options.type || 'nodes'; // 'nodes', 'edges', or 'both'
        
        if (exportType === 'both') {
            // Export both nodes and edges as separate files
            const nodesCSV = this.exportNodesCSV(networkData.nodes || []);
            const edgesCSV = this.exportEdgesCSV(networkData.edges || []);
            
            // For 'both', we'll return nodes CSV and trigger edges download separately
            setTimeout(() => {
                this.downloadFile(edgesCSV, options.filename.replace('.csv', '_edges.csv'), 'text/csv');
            }, 100);
            
            return nodesCSV;
        } else if (exportType === 'edges') {
            return this.exportEdgesCSV(networkData.edges || []);
        } else {
            return this.exportNodesCSV(networkData.nodes || []);
        }
    }

    /**
     * Export nodes to CSV
     * @param {Array} nodes - Array of nodes
     * @returns {string} - CSV string
     */
    exportNodesCSV(nodes) {
        if (!nodes || nodes.length === 0) {
            return 'id,name,x,y,z\n';
        }

        // Collect all possible metadata keys
        const metadataKeys = new Set();
        nodes.forEach(node => {
            if (node.metadata) {
                Object.keys(node.metadata).forEach(key => metadataKeys.add(key));
            }
        });

        // Create header
        const headers = ['id', 'name', 'x', 'y', 'z', ...Array.from(metadataKeys)];
        let csv = headers.join(',') + '\n';

        // Add data rows
        nodes.forEach(node => {
            const row = [];
            
            row.push(this.escapeCSVValue(node.id || ''));
            row.push(this.escapeCSVValue(node.name || ''));
            row.push(node.position?.x || 0);
            row.push(node.position?.y || 0);
            row.push(node.position?.z || 0);
            
            // Add metadata values
            metadataKeys.forEach(key => {
                const value = node.metadata?.[key];
                row.push(this.escapeCSVValue(value !== undefined ? value : ''));
            });
            
            csv += row.join(',') + '\n';
        });

        return csv;
    }

    /**
     * Export edges to CSV
     * @param {Array} edges - Array of edges
     * @returns {string} - CSV string
     */
    exportEdgesCSV(edges) {
        if (!edges || edges.length === 0) {
            return 'source,target,name,weight\n';
        }

        // Collect all possible metadata keys
        const metadataKeys = new Set();
        edges.forEach(edge => {
            if (edge.metadata) {
                Object.keys(edge.metadata).forEach(key => metadataKeys.add(key));
            }
        });

        // Create header
        const headers = ['source', 'target', 'name', 'weight', ...Array.from(metadataKeys)];
        let csv = headers.join(',') + '\n';

        // Add data rows
        edges.forEach(edge => {
            const row = [];
            
            row.push(this.escapeCSVValue(edge.source || ''));
            row.push(this.escapeCSVValue(edge.target || ''));
            row.push(this.escapeCSVValue(edge.name || ''));
            row.push(edge.weight || 1);
            
            // Add metadata values
            metadataKeys.forEach(key => {
                const value = edge.metadata?.[key];
                row.push(this.escapeCSVValue(value !== undefined ? value : ''));
            });
            
            csv += row.join(',') + '\n';
        });

        return csv;
    }

    /**
     * Export to GEXF format
     * @param {Object} networkData - Network data
     * @param {Object} options - Export options
     * @returns {string} - GEXF XML string
     */
    exportGEXF(networkData, options = {}) {
        const nodes = networkData.nodes || [];
        const edges = networkData.edges || [];
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<gexf xmlns="http://www.gexf.net/1.2draft" xmlns:viz="http://www.gexf.net/1.2draft/viz" version="1.2">\n';
        xml += '  <meta lastmodifieddate="' + new Date().toISOString() + '">\n';
        xml += '    <creator>Nodges 0.78</creator>\n';
        xml += '    <description>Network exported from Nodges</description>\n';
        xml += '  </meta>\n';
        xml += '  <graph mode="static" defaultedgetype="undirected">\n';

        // Export nodes
        xml += '    <nodes>\n';
        nodes.forEach(node => {
            xml += `      <node id="${this.escapeXML(node.id)}" label="${this.escapeXML(node.name || node.id)}">\n`;
            
            // Position
            if (node.position) {
                xml += `        <viz:position x="${node.position.x}" y="${node.position.y}" z="${node.position.z || 0}"/>\n`;
            }
            
            // Color
            if (node.metadata?.color !== undefined) {
                const color = this.hexToRGB(node.metadata.color);
                xml += `        <viz:color r="${color.r}" g="${color.g}" b="${color.b}"/>\n`;
            }
            
            // Size
            if (node.metadata?.size !== undefined) {
                xml += `        <viz:size value="${node.metadata.size}"/>\n`;
            }
            
            xml += '      </node>\n';
        });
        xml += '    </nodes>\n';

        // Export edges
        xml += '    <edges>\n';
        edges.forEach((edge, index) => {
            const edgeId = edge.id || `edge_${index}`;
            xml += `      <edge id="${this.escapeXML(edgeId)}" source="${this.escapeXML(edge.source)}" target="${this.escapeXML(edge.target)}"`;
            
            if (edge.name) {
                xml += ` label="${this.escapeXML(edge.name)}"`;
            }
            
            if (edge.weight !== undefined) {
                xml += ` weight="${edge.weight}"`;
            }
            
            xml += '>\n';
            
            // Color
            if (edge.metadata?.color !== undefined) {
                const color = this.hexToRGB(edge.metadata.color);
                xml += `        <viz:color r="${color.r}" g="${color.g}" b="${color.b}"/>\n`;
            }
            
            xml += '      </edge>\n';
        });
        xml += '    </edges>\n';

        xml += '  </graph>\n';
        xml += '</gexf>\n';

        return xml;
    }

    /**
     * Export to GraphML format
     * @param {Object} networkData - Network data
     * @param {Object} options - Export options
     * @returns {string} - GraphML XML string
     */
    exportGraphML(networkData, options = {}) {
        const nodes = networkData.nodes || [];
        const edges = networkData.edges || [];
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';
        
        // Define keys for attributes
        xml += '  <key id="name" for="node" attr.name="name" attr.type="string"/>\n';
        xml += '  <key id="x" for="node" attr.name="x" attr.type="double"/>\n';
        xml += '  <key id="y" for="node" attr.name="y" attr.type="double"/>\n';
        xml += '  <key id="z" for="node" attr.name="z" attr.type="double"/>\n';
        xml += '  <key id="color" for="node" attr.name="color" attr.type="string"/>\n';
        xml += '  <key id="size" for="node" attr.name="size" attr.type="double"/>\n';
        xml += '  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>\n';
        xml += '  <key id="edge_color" for="edge" attr.name="color" attr.type="string"/>\n';
        
        xml += '  <graph id="G" edgedefault="undirected">\n';

        // Export nodes
        nodes.forEach(node => {
            xml += `    <node id="${this.escapeXML(node.id)}">\n`;
            xml += `      <data key="name">${this.escapeXML(node.name || node.id)}</data>\n`;
            
            if (node.position) {
                xml += `      <data key="x">${node.position.x}</data>\n`;
                xml += `      <data key="y">${node.position.y}</data>\n`;
                xml += `      <data key="z">${node.position.z || 0}</data>\n`;
            }
            
            if (node.metadata?.color !== undefined) {
                xml += `      <data key="color">#${node.metadata.color.toString(16).padStart(6, '0')}</data>\n`;
            }
            
            if (node.metadata?.size !== undefined) {
                xml += `      <data key="size">${node.metadata.size}</data>\n`;
            }
            
            xml += '    </node>\n';
        });

        // Export edges
        edges.forEach((edge, index) => {
            const edgeId = edge.id || `edge_${index}`;
            xml += `    <edge id="${this.escapeXML(edgeId)}" source="${this.escapeXML(edge.source)}" target="${this.escapeXML(edge.target)}">\n`;
            
            if (edge.weight !== undefined) {
                xml += `      <data key="weight">${edge.weight}</data>\n`;
            }
            
            if (edge.metadata?.color !== undefined) {
                xml += `      <data key="edge_color">#${edge.metadata.color.toString(16).padStart(6, '0')}</data>\n`;
            }
            
            xml += '    </edge>\n';
        });

        xml += '  </graph>\n';
        xml += '</graphml>\n';

        return xml;
    }

    /**
     * Export visualization as PNG
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    async exportPNG(filename, options = {}) {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            throw new Error('No canvas found for PNG export');
        }

        // Create a temporary canvas with higher resolution
        const scale = options.scale || 2;
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        
        tempCanvas.width = canvas.width * scale;
        tempCanvas.height = canvas.height * scale;
        
        // Scale the context and draw the original canvas
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);
        
        // Convert to blob and download
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    /**
     * Export visualization as SVG
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    async exportSVG(filename, options = {}) {
        // Note: SVG export from WebGL is complex and would require
        // a separate SVG renderer or conversion library
        throw new Error('SVG export not yet implemented. Use PNG export instead.');
    }

    /**
     * Get current network data from the application
     * @param {Array} currentNodes - Current nodes in the scene
     * @param {Array} currentEdges - Current edges in the scene
     * @returns {Object} - Network data in export format
     */
    getCurrentNetworkData(currentNodes, currentEdges) {
        const nodes = currentNodes.map(node => ({
            id: node.id,
            name: node.mesh.name,
            position: {
                x: node.mesh.position.x,
                y: node.mesh.position.y,
                z: node.mesh.position.z
            },
            metadata: {
                ...node.metadata,
                color: node.options.color,
                size: node.options.size,
                type: node.options.type
            }
        }));

        const edges = currentEdges.map((edge, index) => ({
            id: `edge_${index}`,
            source: edge.startNode.id,
            target: edge.endNode.id,
            name: edge.name,
            weight: 1,
            metadata: {
                ...edge.metadata,
                color: edge.options.color,
                style: edge.options.style
            }
        }));

        return {
            metadata: {
                type: 'nodges_export',
                source: 'Nodges 0.78',
                exportedAt: new Date().toISOString(),
                nodeCount: nodes.length,
                edgeCount: edges.length
            },
            nodes: nodes,
            edges: edges
        };
    }

    /**
     * Download file to user's computer
     * @param {string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Escape CSV value
     * @param {*} value - Value to escape
     * @returns {string} - Escaped value
     */
    escapeCSVValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    /**
     * Escape XML value
     * @param {string} value - Value to escape
     * @returns {string} - Escaped value
     */
    escapeXML(value) {
        if (!value) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Convert hex color to RGB
     * @param {number} hex - Hex color
     * @returns {Object} - RGB object
     */
    hexToRGB(hex) {
        return {
            r: (hex >> 16) & 255,
            g: (hex >> 8) & 255,
            b: hex & 255
        };
    }
}