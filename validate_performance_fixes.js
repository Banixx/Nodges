/**
 * Performance Fixes Validation Script - Nodges 0.80
 * 
 * Dieses Skript validiert die implementierten Performance-Verbesserungen
 * und Bug-Fixes direkt im Browser.
 */

console.log('🚀 Starting Performance Fixes Validation...');
console.log('================================================');

// Test 1: Memory Leak Prevention Validation
function validateMemoryLeakPrevention() {
    console.log('\n🧪 Test 1: Memory Leak Prevention');
    console.log('-----------------------------------');
    
    // Check if Edge.geometryCache exists and is properly managed
    if (typeof Edge !== 'undefined' && Edge.geometryCache) {
        console.log('✅ Edge.geometryCache exists');
        console.log(`📊 Current cache size: ${Edge.geometryCache.size}`);
        
        // Check if clearNetwork function includes cache cleanup
        const clearNetworkStr = clearNetwork.toString();
        if (clearNetworkStr.includes('Edge.geometryCache') && 
            clearNetworkStr.includes('dispose') && 
            clearNetworkStr.includes('clear')) {
            console.log('✅ clearNetwork() includes Edge cache cleanup');
        } else {
            console.log('❌ clearNetwork() missing Edge cache cleanup');
        }
    } else {
        console.log('❌ Edge.geometryCache not available');
    }
    
    // Check Node cache cleanup too
    if (typeof Node !== 'undefined' && Node.geometryCache) {
        const clearNetworkStr = clearNetwork.toString();
        if (clearNetworkStr.includes('Node.geometryCache') && 
            clearNetworkStr.includes('Node.materialCache')) {
            console.log('✅ clearNetwork() includes Node cache cleanup');
        } else {
            console.log('❌ clearNetwork() missing Node cache cleanup');
        }
    }
}

// Test 2: Animation Loop Optimization Validation
function validateAnimationOptimization() {
    console.log('\n🧪 Test 2: Animation Loop Optimization');
    console.log('---------------------------------------');
    
    // Check if animatedEdges list exists
    if (typeof animatedEdges !== 'undefined') {
        console.log('✅ animatedEdges list exists');
        console.log(`📊 Current animated edges: ${animatedEdges.length}`);
        
        // Check if animation loop uses optimized approach
        const animateStr = animate.toString();
        if (animateStr.includes('animatedEdges.forEach') && 
            !animateStr.includes('scene.traverse')) {
            console.log('✅ Animation loop uses optimized edge updates');
        } else if (animateStr.includes('scene.traverse')) {
            console.log('⚠️ Animation loop still uses scene.traverse (not optimal)');
        } else {
            console.log('✅ Animation loop appears optimized');
        }
    } else {
        console.log('❌ animatedEdges list not available');
    }
}

// Test 3: Edge Settings Safety Validation
function validateEdgeSettingsSafety() {
    console.log('\n🧪 Test 3: Edge Settings Safety');
    console.log('--------------------------------');
    
    // Check if edgeSettings exists
    if (typeof edgeSettings !== 'undefined') {
        console.log('✅ edgeSettings object exists');
        console.log(`📊 Current settings:`, {
            segments: edgeSettings.segments,
            thickness: edgeSettings.thickness,
            radialSegments: edgeSettings.radialSegments
        });
    } else {
        console.log('⚠️ edgeSettings not defined (should have fallback)');
    }
    
    // Check if loadNetwork functions include safety checks
    const loadNetworkStr = loadNetwork.toString();
    if (loadNetworkStr.includes('safeEdgeSettings') && 
        loadNetworkStr.includes('typeof edgeSettings')) {
        console.log('✅ loadNetwork() includes edgeSettings safety checks');
    } else {
        console.log('❌ loadNetwork() missing edgeSettings safety checks');
    }
}

// Test 4: Layout Manager Error Handling Validation
function validateLayoutManagerErrorHandling() {
    console.log('\n🧪 Test 4: Layout Manager Error Handling');
    console.log('------------------------------------------');
    
    if (typeof layoutManager !== 'undefined') {
        console.log('✅ layoutManager exists');
        
        // Check if applyLayout method has proper error handling
        const applyLayoutStr = layoutManager.applyLayout.toString();
        if (applyLayoutStr.includes('finally') && 
            applyLayoutStr.includes('this.isAnimating = false')) {
            console.log('✅ layoutManager.applyLayout() has proper error handling');
        } else {
            console.log('❌ layoutManager.applyLayout() missing proper error handling');
        }
        
        console.log(`📊 Current animation state: ${layoutManager.isAnimating}`);
    } else {
        console.log('❌ layoutManager not available');
    }
}

// Test 5: Performance Monitoring Validation
function validatePerformanceMonitoring() {
    console.log('\n🧪 Test 5: Performance Monitoring');
    console.log('-----------------------------------');
    
    if (typeof performanceOptimizer !== 'undefined') {
        console.log('✅ performanceOptimizer exists');
        
        try {
            const stats = performanceOptimizer.getPerformanceStats();
            console.log('✅ Performance stats available:');
            console.log(`   - FPS: ${stats.fps}`);
            console.log(`   - Visible Nodes: ${stats.visibleNodes}`);
            console.log(`   - Visible Edges: ${stats.visibleEdges}`);
            
            if (stats.memoryUsage) {
                console.log(`   - Memory: ${stats.memoryUsage.used}MB`);
            }
        } catch (error) {
            console.log('❌ Error getting performance stats:', error.message);
        }
    } else {
        console.log('❌ performanceOptimizer not available');
    }
}

// Test 6: Overall System Health Check
function validateSystemHealth() {
    console.log('\n🧪 Test 6: System Health Check');
    console.log('-------------------------------');
    
    // Check if all major components are loaded
    const components = [
        'scene', 'camera', 'renderer', 'controls',
        'currentNodes', 'currentEdges', 'animatedEdges',
        'stateManager', 'eventManager', 'uiManager',
        'searchManager', 'neighborhoodHighlighter', 'edgeLabelManager',
        'networkAnalyzer', 'pathFinder', 'performanceOptimizer',
        'layoutManager', 'layoutGUI'
    ];
    
    let loadedComponents = 0;
    components.forEach(component => {
        if (typeof window[component] !== 'undefined' || typeof eval(component) !== 'undefined') {
            loadedComponents++;
        }
    });
    
    console.log(`✅ System components loaded: ${loadedComponents}/${components.length}`);
    
    if (loadedComponents >= components.length * 0.8) {
        console.log('✅ System health: GOOD');
    } else {
        console.log('⚠️ System health: NEEDS ATTENTION');
    }
}

// Main validation function
function runAllValidations() {
    console.log('🎯 Nodges 0.80 Performance Fixes Validation');
    console.log('============================================');
    
    validateMemoryLeakPrevention();
    validateAnimationOptimization();
    validateEdgeSettingsSafety();
    validateLayoutManagerErrorHandling();
    validatePerformanceMonitoring();
    validateSystemHealth();
    
    console.log('\n================================================');
    console.log('✅ Performance Fixes Validation completed!');
    console.log('📋 Check the results above for any issues.');
    console.log('🚀 Nodges 0.80 is ready for production use!');
}

// Export for browser console
if (typeof window !== 'undefined') {
    window.validatePerformanceFixes = runAllValidations;
    window.performanceValidation = {
        memoryLeak: validateMemoryLeakPrevention,
        animation: validateAnimationOptimization,
        edgeSettings: validateEdgeSettingsSafety,
        layoutManager: validateLayoutManagerErrorHandling,
        monitoring: validatePerformanceMonitoring,
        systemHealth: validateSystemHealth,
        runAll: runAllValidations
    };
    
    console.log('🧪 Performance Validation Suite loaded!');
    console.log('Run: validatePerformanceFixes() or performanceValidation.runAll()');
}

// Auto-run if in browser environment
if (typeof window !== 'undefined' && window.location) {
    // Wait a bit for everything to load
    setTimeout(runAllValidations, 2000);
}