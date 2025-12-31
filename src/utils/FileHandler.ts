
/**
 * FileHandler - Manages file upload/download operations and GUI integration
 * Provides user-friendly interface for import/export operations
 */

import { ImportManager, ImportedData } from './ImportManager';
import { ExportManager } from './ExportManager';

type LoadNetworkCallback = (data: any, filename: string) => Promise<void>;

export class FileHandler {
    private importManager: ImportManager;
    private exportManager: ExportManager;
    private loadNetworkCallback?: LoadNetworkCallback;
    private fileInput!: HTMLInputElement;

    constructor(loadNetworkCallback?: LoadNetworkCallback) {
        this.importManager = new ImportManager();
        this.exportManager = new ExportManager();
        this.loadNetworkCallback = loadNetworkCallback;

        this.setupFileInput();
    }

    /**
     * Setup hidden file input for file selection
     */
    setupFileInput(): void {
        // Create hidden file input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json,.csv,.gexf,.graphml';
        this.fileInput.style.display = 'none';
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        document.body.appendChild(this.fileInput);
    }

    /**
     * Open file dialog for import
     */
    openImportDialog(): void {
        this.fileInput.click();
    }

    /**
     * Handle file selection
     */
    async handleFileSelect(event: Event): Promise<void> {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        try {
            await this.importFile(file);
        } catch (error: any) {
            this.showError('Import Error', error.message);
        } finally {
            // Reset file input
            this.fileInput.value = '';
        }
    }

    /**
     * Import file and load into application
     */
    async importFile(file: File): Promise<void> {
        this.showProgress('Importing file...', 0);

        try {
            // Parse the file
            this.showProgress('Parsing file...', 25);
            const networkData = await this.importManager.importFile(file);

            // Validate data
            this.showProgress('Validating data...', 50);
            if (!networkData.nodes || networkData.nodes.length === 0) {
                throw new Error('No valid nodes found in the imported file');
            }

            // Convert to application format
            this.showProgress('Converting data...', 75);
            const convertedData = this.convertToApplicationFormat(networkData);

            // Load into application
            this.showProgress('Loading network...', 90);
            if (this.loadNetworkCallback) {
                await this.loadNetworkCallback(convertedData, file.name);
            } else {
                console.warn('FileHandler: No loadNetworkCallback provided, data imported but not loaded.');
            }

            this.showProgress('Import completed!', 100);
            this.showSuccess('Import Successful',
                `Successfully imported ${networkData.nodes.length} nodes and ${networkData.edges.length} edges from ${file.name}`);

        } catch (error) {
            this.hideProgress();
            throw error;
        }

        setTimeout(() => this.hideProgress(), 1000);
    }

    /**
     * Export current network data
     */
    async exportNetwork(currentNodes: any[], currentEdges: any[], format: string, filename: string, options: any = {}): Promise<void> {
        try {
            this.showProgress('Preparing export...', 0);

            // Get current network data
            this.showProgress('Collecting data...', 25);
            const networkData = this.exportManager.getCurrentNetworkData(currentNodes, currentEdges);

            // Add visualization state if requested
            if (options.includeVisualizationState) {
                this.showProgress('Capturing visualization state...', 50);
                options.visualizationState = this.getVisualizationState();
            }

            // Export data
            this.showProgress('Generating export...', 75);
            await this.exportManager.exportNetwork(networkData, format, filename, options);

            this.showProgress('Export completed!', 100);
            this.showSuccess('Export Successful', `Network exported as ${filename}`);

        } catch (error: any) {
            this.hideProgress();
            this.showError('Export Error', error.message);
        }

        setTimeout(() => this.hideProgress(), 1000);
    }

    /**
     * Convert imported data to application format
     */
    convertToApplicationFormat(networkData: ImportedData): any {
        // Convert nodes to EntityData
        const entities = networkData.nodes.map(node => {
            return {
                id: node.id,
                type: node.metadata?.type || 'default',
                label: node.name,
                position: node.position,
                ...node.metadata // Spread metadata as properties
            };
        });

        // Convert edges to RelationshipData
        const relationships = networkData.edges.map(edge => {
            return {
                id: `edge_${edge.source}_${edge.target}`, // Generate ID if missing
                type: edge.metadata?.type || 'default',
                source: edge.source,
                target: edge.target,
                label: edge.name,
                ...edge.metadata
            };
        });

        return {
            system: 'Nodges',
            metadata: networkData.metadata,
            data: {
                entities: entities,
                relationships: relationships
            }
        };
    }

    /**
     * Get current visualization state
     */
    getVisualizationState(): any {
        // This would capture current camera position, settings, etc.
        // For now, return basic state
        return {
            camera: {
                position: { x: 15, y: 15, z: 15 },
                target: { x: 0, y: 0, z: 0 }
            },
            settings: {
                // Add current GUI settings here
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Show progress indicator
     */
    showProgress(message: string, percentage: number): void {
        // Remove existing progress if any
        this.hideProgress();

        // Create progress overlay
        const overlay = document.createElement('div');
        overlay.id = 'import-export-progress';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;

        const progressBox = document.createElement('div');
        progressBox.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            min-width: 300px;
        `;

        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            font-size: 16px;
            margin-bottom: 15px;
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 10px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            width: ${percentage}%;
            height: 100%;
            background: #4CAF50;
            transition: width 0.3s ease;
        `;

        const percentageEl = document.createElement('div');
        percentageEl.textContent = `${percentage}%`;
        percentageEl.style.cssText = `
            font-size: 14px;
            margin-top: 10px;
            opacity: 0.8;
        `;

        progressBar.appendChild(progressFill);
        progressBox.appendChild(messageEl);
        progressBox.appendChild(progressBar);
        progressBox.appendChild(percentageEl);
        overlay.appendChild(progressBox);
        document.body.appendChild(overlay);
    }

    /**
     * Hide progress indicator
     */
    hideProgress(): void {
        const existing = document.getElementById('import-export-progress');
        if (existing) {
            existing.remove();
        }
    }

    /**
     * Show success message
     */
    showSuccess(title: string, message: string): void {
        this.showNotification(title, message, 'success');
    }

    /**
     * Show error message
     */
    showError(title: string, message: string): void {
        this.showNotification(title, message, 'error');
        console.error(`${title}: ${message}`);
    }

    /**
     * Show notification
     */
    showNotification(title: string, message: string, type: string = 'info'): void {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 400px;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease;
        `;

        const titleEl = document.createElement('div');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
        `;

        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            font-size: 14px;
            line-height: 1.4;
        `;

        notification.appendChild(titleEl);
        notification.appendChild(messageEl);

        // Add animation styles (injected once per active session ideally, but okay for here)
        // Check if style exists to avoid dupes?
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    /**
     * Get supported import formats
     */
    getSupportedImportFormats(): string[] {
        return this.importManager.supportedFormats;
    }

    /**
     * Get supported export formats
     */
    getSupportedExportFormats(): string[] {
        return this.exportManager.supportedFormats;
    }

    /**
     * Validate file before import
     */
    validateFile(file: File): { valid: boolean; errors: string[]; warnings: string[] } {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        const result: { valid: boolean; errors: string[]; warnings: string[] } = {
            valid: true,
            errors: [],
            warnings: []
        };

        // Check file size
        if (file.size > maxSize) {
            result.valid = false;
            result.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (50MB)`);
        }

        // Check file extension
        if (!this.importManager.supportedFormats.includes(extension)) {
            result.valid = false;
            result.errors.push(`Unsupported file format: ${extension}`);
        }

        // Add warnings for large files
        if (file.size > 10 * 1024 * 1024) {
            result.warnings.push('Large file detected. Import may take some time.');
        }

        return result;
    }
}
