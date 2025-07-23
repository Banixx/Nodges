/**
 * FPSMonitor - Real-time FPS monitoring and display
 * Shows FPS counter in top-left corner with performance warnings
 */

export class FPSMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsHistory = [];
        this.maxHistoryLength = 60; // 1 second at 60fps
        
        // Performance thresholds
        this.goodFPS = 50;
        this.warningFPS = 30;
        this.criticalFPS = 15;
        
        // DOM elements
        this.panel = null;
        this.fpsDisplay = null;
        this.avgDisplay = null;
        this.statusDisplay = null;
        
        this.createPanel();
        this.isActive = true;
    }
    
    /**
     * Create FPS display panel
     */
    createPanel() {
        // Create main panel
        this.panel = document.createElement('div');
        this.panel.id = 'fpsMonitor';
        this.panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1000;
            min-width: 120px;
            border: 1px solid #333;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        `;
        
        // FPS display
        this.fpsDisplay = document.createElement('div');
        this.fpsDisplay.style.cssText = `
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 2px;
        `;
        
        // Average FPS display
        this.avgDisplay = document.createElement('div');
        this.avgDisplay.style.cssText = `
            font-size: 10px;
            opacity: 0.8;
            margin-bottom: 2px;
        `;
        
        // Status display
        this.statusDisplay = document.createElement('div');
        this.statusDisplay.style.cssText = `
            font-size: 10px;
            font-weight: bold;
        `;
        
        // Assemble panel
        this.panel.appendChild(this.fpsDisplay);
        this.panel.appendChild(this.avgDisplay);
        this.panel.appendChild(this.statusDisplay);
        
        // Add to page
        document.body.appendChild(this.panel);
        
        // Initial display
        this.updateDisplay();
    }
    
    /**
     * Update FPS calculation
     * Call this in your animation loop
     */
    update() {
        if (!this.isActive) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        this.frameCount++;
        
        // Update FPS every 100ms for smooth display
        if (deltaTime >= 100) {
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Add to history
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > this.maxHistoryLength) {
                this.fpsHistory.shift();
            }
            
            this.updateDisplay();
        }
    }
    
    /**
     * Update visual display
     */
    updateDisplay() {
        if (!this.panel) return;
        
        // Current FPS
        this.fpsDisplay.textContent = `FPS: ${this.fps}`;
        
        // Average FPS
        const avgFPS = this.getAverageFPS();
        this.avgDisplay.textContent = `Avg: ${avgFPS}`;
        
        // Performance status
        const status = this.getPerformanceStatus();
        this.statusDisplay.textContent = status.text;
        this.statusDisplay.style.color = status.color;
        
        // Update panel color based on performance
        this.updatePanelColor(status.level);
    }
    
    /**
     * Calculate average FPS
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }
    
    /**
     * Get performance status
     */
    getPerformanceStatus() {
        const avgFPS = this.getAverageFPS();
        
        if (avgFPS >= this.goodFPS) {
            return {
                level: 'good',
                text: 'GOOD',
                color: '#00ff00'
            };
        } else if (avgFPS >= this.warningFPS) {
            return {
                level: 'warning',
                text: 'WARNING',
                color: '#ffff00'
            };
        } else if (avgFPS >= this.criticalFPS) {
            return {
                level: 'critical',
                text: 'CRITICAL',
                color: '#ff8800'
            };
        } else {
            return {
                level: 'severe',
                text: 'SEVERE',
                color: '#ff0000'
            };
        }
    }
    
    /**
     * Update panel border color based on performance
     */
    updatePanelColor(level) {
        let borderColor;
        
        switch (level) {
            case 'good':
                borderColor = '#00ff00';
                break;
            case 'warning':
                borderColor = '#ffff00';
                break;
            case 'critical':
                borderColor = '#ff8800';
                break;
            case 'severe':
                borderColor = '#ff0000';
                break;
            default:
                borderColor = '#333';
        }
        
        this.panel.style.borderColor = borderColor;
    }
    
    /**
     * Get current FPS
     */
    getCurrentFPS() {
        return this.fps;
    }
    
    /**
     * Get FPS statistics
     */
    getStats() {
        const avgFPS = this.getAverageFPS();
        const minFPS = this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0;
        const maxFPS = this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0;
        
        return {
            current: this.fps,
            average: avgFPS,
            min: minFPS,
            max: maxFPS,
            samples: this.fpsHistory.length
        };
    }
    
    /**
     * Reset FPS history
     */
    reset() {
        this.fpsHistory = [];
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.updateDisplay();
    }
    
    /**
     * Toggle FPS monitor visibility
     */
    toggle() {
        if (this.panel) {
            this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Show FPS monitor
     */
    show() {
        if (this.panel) {
            this.panel.style.display = 'block';
        }
        this.isActive = true;
    }
    
    /**
     * Hide FPS monitor
     */
    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
        this.isActive = false;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
        this.panel = null;
        this.fpsDisplay = null;
        this.avgDisplay = null;
        this.statusDisplay = null;
        this.fpsHistory = [];
        this.isActive = false;
    }
}