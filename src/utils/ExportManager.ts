
/**
 * ExportManager - Handles exporting network data to various formats
 * Supports: JSON (native), CSV, GEXF, GraphML, PNG/SVG (visualization)
 */

export class ExportManager {
    public supportedFormats: string[];

    constructor() {
        this.supportedFormats = ['json', 'csv', 'gexf', 'graphml', 'png', 'svg'];
    }

    /**
     * Export network data to specified format
     */
    async exportNetwork(networkData: any, format: string, filename: string, options: any = {}): Promise<void> {
        if (!networkData) {
            throw new Error('No network data provided');
        }

        format = format.toLowerCase();
        if (!this.supportedFormats.includes(format)) {
            throw new Error(`Unsupported export format: ${format}. Supported formats: ${this.supportedFormats.join(', ')}`);
        }

        let content: string | undefined;
        let mimeType: string | undefined;

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
                await this.exportPNG(filename, options);
                return;
            case 'svg':
                await this.exportSVG(filename, options);
                return;
            default:
                throw new Error(`Export not implemented for format: ${format}`);
        }

        if (content && mimeType) {
            this.downloadFile(content, filename, mimeType);
        }
    }

    exportJSON(networkData: any, options: any = {}): string {
        const exportData: any = {
            metadata: {
                ...networkData.metadata,
                exportedAt: new Date().toISOString(),
                exportedBy: 'Nodges 0.88',
                format: 'nodges-json'
            },
            nodes: networkData.nodes || [],
            edges: networkData.edges || []
        };

        if (options.includeVisualizationState && options.visualizationState) {
            exportData.visualizationState = options.visualizationState;
        }

        return JSON.stringify(exportData, null, options.minify ? 0 : 2);
    }

    exportCSV(networkData: any, options: any = {}): string {
        const exportType = options.type || 'nodes'; // 'nodes', 'edges', or 'both'

        if (exportType === 'both') {
            const nodesCSV = this.exportNodesCSV(networkData.nodes || []);
            const edgesCSV = this.exportEdgesCSV(networkData.edges || []);

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

    exportNodesCSV(nodes: any[]): string {
        if (!nodes || nodes.length === 0) {
            return 'id,name,x,y,z\n';
        }

        const metadataKeys = new Set<string>();
        nodes.forEach(node => {
            if (node.metadata) {
                Object.keys(node.metadata).forEach(key => metadataKeys.add(key));
            }
        });

        const headers = ['id', 'name', 'x', 'y', 'z', ...Array.from(metadataKeys)];
        let csv = headers.join(',') + '\n';

        nodes.forEach(node => {
            const row: any[] = [];

            row.push(this.escapeCSVValue(node.id || ''));
            row.push(this.escapeCSVValue(node.name || ''));
            row.push(node.position?.x || 0);
            row.push(node.position?.y || 0);
            row.push(node.position?.z || 0);

            metadataKeys.forEach(key => {
                const value = node.metadata?.[key];
                row.push(this.escapeCSVValue(value !== undefined ? value : ''));
            });

            csv += row.join(',') + '\n';
        });

        return csv;
    }

    exportEdgesCSV(edges: any[]): string {
        if (!edges || edges.length === 0) {
            return 'source,target,name,weight\n';
        }

        const metadataKeys = new Set<string>();
        edges.forEach(edge => {
            if (edge.metadata) {
                Object.keys(edge.metadata).forEach(key => metadataKeys.add(key));
            }
        });

        const headers = ['source', 'target', 'name', 'weight', ...Array.from(metadataKeys)];
        let csv = headers.join(',') + '\n';

        edges.forEach(edge => {
            const row: any[] = [];

            row.push(this.escapeCSVValue(edge.source || ''));
            row.push(this.escapeCSVValue(edge.target || ''));
            row.push(this.escapeCSVValue(edge.name || ''));
            row.push(edge.weight || 1);

            metadataKeys.forEach(key => {
                const value = edge.metadata?.[key];
                row.push(this.escapeCSVValue(value !== undefined ? value : ''));
            });

            csv += row.join(',') + '\n';
        });

        return csv;
    }

    exportGEXF(networkData: any, _options: any = {}): string {
        const nodes = networkData.nodes || [];
        const edges = networkData.edges || [];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<gexf xmlns="http://www.gexf.net/1.2draft" xmlns:viz="http://www.gexf.net/1.2draft/viz" version="1.2">\n';
        xml += '  <meta lastmodifieddate="' + new Date().toISOString() + '">\n';
        xml += '    <creator>Nodges 0.88</creator>\n';
        xml += '    <description>Network exported from Nodges</description>\n';
        xml += '  </meta>\n';
        xml += '  <graph mode="static" defaultedgetype="undirected">\n';

        xml += '    <nodes>\n';
        nodes.forEach((node: any) => {
            xml += `      <node id="${this.escapeXML(node.id)}" label="${this.escapeXML(node.name || node.id)}">\n`;

            if (node.position) {
                xml += `        <viz:position x="${node.position.x}" y="${node.position.y}" z="${node.position.z || 0}"/>\n`;
            }

            if (node.metadata?.color !== undefined) {
                const color = this.hexToRGB(node.metadata.color);
                xml += `        <viz:color r="${color.r}" g="${color.g}" b="${color.b}"/>\n`;
            }

            if (node.metadata?.size !== undefined) {
                xml += `        <viz:size value="${node.metadata.size}"/>\n`;
            }

            xml += '      </node>\n';
        });
        xml += '    </nodes>\n';

        xml += '    <edges>\n';
        edges.forEach((edge: any, index: number) => {
            const edgeId = edge.id || `edge_${index}`;
            xml += `      <edge id="${this.escapeXML(edgeId)}" source="${this.escapeXML(edge.source)}" target="${this.escapeXML(edge.target)}"`;

            if (edge.name) {
                xml += ` label="${this.escapeXML(edge.name)}"`;
            }

            if (edge.weight !== undefined) {
                xml += ` weight="${edge.weight}"`;
            }

            xml += '>\n';

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

    exportGraphML(networkData: any, _options: any = {}): string {
        const nodes = networkData.nodes || [];
        const edges = networkData.edges || [];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';

        xml += '  <key id="name" for="node" attr.name="name" attr.type="string"/>\n';
        xml += '  <key id="x" for="node" attr.name="x" attr.type="double"/>\n';
        xml += '  <key id="y" for="node" attr.name="y" attr.type="double"/>\n';
        xml += '  <key id="z" for="node" attr.name="z" attr.type="double"/>\n';
        xml += '  <key id="color" for="node" attr.name="color" attr.type="string"/>\n';
        xml += '  <key id="size" for="node" attr.name="size" attr.type="double"/>\n';
        xml += '  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>\n';
        xml += '  <key id="edge_color" for="edge" attr.name="color" attr.type="string"/>\n';

        xml += '  <graph id="G" edgedefault="undirected">\n';

        nodes.forEach((node: any) => {
            xml += `    <node id="${this.escapeXML(node.id)}">\n`;
            xml += `      <data key="name">${this.escapeXML(node.name || node.id)}</data>\n`;

            if (node.position) {
                xml += `      <data key="x">${node.position.x}</data>\n`;
                xml += `      <data key="y">${node.position.y}</data>\n`;
                xml += `      <data key="z">${node.position.z || 0}</data>\n`;
            }

            if (node.metadata?.color !== undefined) {
                xml += `      <data key="color">#${this.numberToHex(node.metadata.color)}</data>\n`;
            }

            if (node.metadata?.size !== undefined) {
                xml += `      <data key="size">${node.metadata.size}</data>\n`;
            }

            xml += '    </node>\n';
        });

        edges.forEach((edge: any, index: number) => {
            const edgeId = edge.id || `edge_${index}`;
            xml += `    <edge id="${this.escapeXML(edgeId)}" source="${this.escapeXML(edge.source)}" target="${this.escapeXML(edge.target)}">\n`;

            if (edge.weight !== undefined) {
                xml += `      <data key="weight">${edge.weight}</data>\n`;
            }

            if (edge.metadata?.color !== undefined) {
                xml += `      <data key="edge_color">#${this.numberToHex(edge.metadata.color)}</data>\n`;
            }

            xml += '    </edge>\n';
        });

        xml += '  </graph>\n';
        xml += '</graphml>\n';

        return xml;
    }

    async exportPNG(filename: string, options: any = {}): Promise<void> {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            throw new Error('No canvas found for PNG export');
        }

        const scale = options.scale || 2;
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');

        if (!ctx) throw new Error('Could not get 2D context');

        tempCanvas.width = canvas.width * scale;
        tempCanvas.height = canvas.height * scale;

        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);

        return new Promise((resolve) => {
            tempCanvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
                resolve();
            }, 'image/png');
        });
    }

    async exportSVG(_filename: string, _options: any = {}): Promise<void> {
        throw new Error('SVG export not yet implemented. Use PNG export instead.');
    }

    getCurrentNetworkData(currentNodes: any[], currentEdges: any[]): any {
        const nodes = currentNodes.map(node => ({
            id: node.id,
            name: node.mesh?.name || node.id,
            position: {
                x: node.mesh?.position?.x || 0,
                y: node.mesh?.position?.y || 0,
                z: node.mesh?.position?.z || 0
            },
            metadata: {
                ...node.metadata,
                color: node.options?.color,
                size: node.options?.size,
                type: node.options?.type
            }
        }));

        const edges = currentEdges.map((edge, index) => ({
            id: `edge_${index}`,
            source: edge.startNode?.id || '',
            target: edge.endNode?.id || '',
            name: edge.name,
            weight: 1,
            metadata: {
                ...edge.metadata,
                color: edge.options?.color,
                style: edge.options?.style
            }
        }));

        return {
            metadata: {
                type: 'nodges_export',
                source: 'Nodges 0.88',
                exportedAt: new Date().toISOString(),
                nodeCount: nodes.length,
                edgeCount: edges.length
            },
            nodes: nodes,
            edges: edges
        };
    }

    downloadFile(content: string, filename: string, mimeType: string): void {
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

    escapeCSVValue(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    escapeXML(value: string | any): string {
        if (!value) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    hexToRGB(hex: number): { r: number; g: number; b: number } {
        return {
            r: (hex >> 16) & 255,
            g: (hex >> 8) & 255,
            b: hex & 255
        };
    }

    numberToHex(num: number): string {
        return num.toString(16).padStart(6, '0');
    }
}
