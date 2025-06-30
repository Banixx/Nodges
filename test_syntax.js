// Simple syntax test for the new modules
import { NetworkAnalyzer } from './src/utils/NetworkAnalyzer.js';
import { PathFinder } from './src/utils/PathFinder.js';
import { PerformanceOptimizer } from './src/utils/PerformanceOptimizer.js';

console.log('All modules imported successfully!');

// Test basic instantiation
try {
    const analyzer = new NetworkAnalyzer();
    console.log('NetworkAnalyzer created successfully');
    
    // Mock scene, camera, renderer for testing
    const mockScene = { add: () => {}, remove: () => {}, traverse: () => {} };
    const mockCamera = { position: { x: 0, y: 0, z: 0 } };
    const mockRenderer = { info: { render: { calls: 0, triangles: 0 }, memory: { geometries: 0, textures: 0 } } };
    const mockStateManager = { state: {} };
    
    const pathFinder = new PathFinder(mockScene, mockStateManager);
    console.log('PathFinder created successfully');
    
    const optimizer = new PerformanceOptimizer(mockScene, mockCamera, mockRenderer);
    console.log('PerformanceOptimizer created successfully');
    
    console.log('All tests passed!');
} catch (error) {
    console.error('Error during testing:', error);
}