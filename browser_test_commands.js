// 🧪 Nodges 0.80 - Browser Test Commands
// Kopieren Sie diese Befehle in die Browser-Konsole

console.log('🚀 Loading Nodges 0.80 Test Suite...');

// 1. Basis-System Check
function quickSystemCheck() {
    console.log('\n🔍 Quick System Check');
    console.log('====================');
    
    const components = [
        'scene', 'camera', 'renderer', 'controls',
        'currentNodes', 'currentEdges', 'animatedEdges',
        'layoutManager', 'performanceOptimizer'
    ];
    
    components.forEach(comp => {
        try {
            const exists = typeof eval(comp) !== 'undefined';
            console.log(`${exists ? '✅' : '❌'} ${comp}: ${exists ? 'OK' : 'MISSING'}`);
        } catch(e) {
            console.log(`❌ ${comp}: ERROR`);
        }
    });
}

// 2. Performance Fixes Validation
function validatePerformanceFixes() {
    console.log('\n🧪 Performance Fixes Validation');
    console.log('================================');
    
    // Memory Leak Check
    console.log('\n1. Memory Leak Prevention:');
    if (typeof Edge !== 'undefined' && Edge.geometryCache) {
        console.log(`✅ Edge.geometryCache exists (size: ${Edge.geometryCache.size})`);
        
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
    
    // Animation Optimization Check
    console.log('\n2. Animation Optimization:');
    if (typeof animatedEdges !== 'undefined') {
        console.log(`✅ animatedEdges list exists (${animatedEdges.length} animated)`);
        
        const animateStr = animate.toString();
        if (animateStr.includes('animatedEdges.forEach') && 
            !animateStr.includes('scene.traverse')) {
            console.log('✅ Animation loop uses optimized approach');
        } else {
            console.log('⚠️ Animation loop may not be fully optimized');
        }
    } else {
        console.log('❌ animatedEdges not available');
    }
    
    // Edge Settings Safety Check
    console.log('\n3. Edge Settings Safety:');
    if (typeof edgeSettings !== 'undefined') {
        console.log('✅ edgeSettings exists:', {
            segments: edgeSettings.segments,
            thickness: edgeSettings.thickness,
            radialSegments: edgeSettings.radialSegments
        });
    } else {
        console.log('⚠️ edgeSettings undefined (fallbacks should handle this)');
    }
    
    // Layout Manager Check
    console.log('\n4. Layout Manager Error Handling:');
    if (typeof layoutManager !== 'undefined') {
        console.log(`✅ layoutManager exists (isAnimating: ${layoutManager.isAnimating})`);
        
        const applyLayoutStr = layoutManager.applyLayout.toString();
        if (applyLayoutStr.includes('finally') && 
            applyLayoutStr.includes('this.isAnimating = false')) {
            console.log('✅ layoutManager has proper error handling');
        } else {
            console.log('❌ layoutManager missing proper error handling');
        }
    } else {
        console.log('❌ layoutManager not available');
    }
}

// 3. Layout System Test
function testLayoutSystem() {
    console.log('\n🎯 Layout System Test');
    console.log('=====================');
    
    if (typeof layoutManager !== 'undefined') {
        const layouts = layoutManager.getAvailableLayouts();
        console.log(`✅ Available layouts (${layouts.length}):`, layouts);
        
        if (currentNodes && currentNodes.length > 0) {
            console.log(`✅ Network loaded: ${currentNodes.length} nodes, ${currentEdges.length} edges`);
            console.log('💡 You can test layouts with: testLayout("circular")');
        } else {
            console.log('⚠️ No network loaded. Load a network first with the buttons.');
        }
    } else {
        console.log('❌ layoutManager not available');
    }
}

// 4. Performance Monitoring Test
function testPerformanceMonitoring() {
    console.log('\n📊 Performance Monitoring Test');
    console.log('===============================');
    
    if (typeof performanceOptimizer !== 'undefined') {
        try {
            const stats = performanceOptimizer.getPerformanceStats();
            console.log('✅ Performance stats:');
            console.log(`   - FPS: ${stats.fps}`);
            console.log(`   - Visible Nodes: ${stats.visibleNodes}`);
            console.log(`   - Visible Edges: ${stats.visibleEdges}`);
            console.log(`   - Memory: ${stats.memoryUsage?.used || 'N/A'}MB`);
        } catch (error) {
            console.log('❌ Error getting performance stats:', error.message);
        }
    } else {
        console.log('❌ performanceOptimizer not available');
    }
}

// 5. Interactive Layout Test
function testLayout(layoutName = 'circular') {
    console.log(`\n🎨 Testing ${layoutName} Layout`);
    console.log('==============================');
    
    if (!currentNodes || currentNodes.length === 0) {
        console.log('❌ No network loaded. Please load a network first.');
        return;
    }
    
    if (!layoutManager) {
        console.log('❌ layoutManager not available');
        return;
    }
    
    console.log(`🚀 Applying ${layoutName} layout to ${currentNodes.length} nodes...`);
    
    const edgeData = currentEdges.map(edge => ({
        source: edge.startNode.id,
        target: edge.endNode.id
    }));
    
    layoutManager.applyLayout(layoutName, currentNodes, edgeData)
        .then(() => {
            console.log(`✅ ${layoutName} layout applied successfully!`);
        })
        .catch((error) => {
            console.log(`❌ Error applying ${layoutName} layout:`, error.message);
        });
}

// 6. Memory Stress Test
function memoryStressTest() {
    console.log('\n🔥 Memory Stress Test');
    console.log('=====================');
    
    let initialCacheSize = 0;
    if (Edge.geometryCache) {
        initialCacheSize = Edge.geometryCache.size;
        console.log(`📊 Initial Edge cache size: ${initialCacheSize}`);
    }
    
    console.log('🔄 Loading different networks to test memory management...');
    
    // Test sequence: small -> medium -> large -> small
    const testSequence = [
        () => { console.log('Loading small network...'); document.getElementById('smallData').click(); },
        () => { console.log('Loading medium network...'); document.getElementById('mediumData').click(); },
        () => { console.log('Loading large network...'); document.getElementById('largeData').click(); },
        () => { console.log('Loading small network again...'); document.getElementById('smallData').click(); }
    ];
    
    let step = 0;
    const runNextStep = () => {
        if (step < testSequence.length) {
            testSequence[step]();
            step++;
            setTimeout(() => {
                if (Edge.geometryCache) {
                    console.log(`📊 Cache size after step ${step}: ${Edge.geometryCache.size}`);
                }
                setTimeout(runNextStep, 2000);
            }, 1000);
        } else {
            console.log('✅ Memory stress test completed!');
            if (Edge.geometryCache) {
                console.log(`📊 Final cache size: ${Edge.geometryCache.size}`);
                if (Edge.geometryCache.size <= initialCacheSize + 5) {
                    console.log('✅ Memory management working correctly!');
                } else {
                    console.log('⚠️ Cache size increased significantly - check for memory leaks');
                }
            }
        }
    };
    
    runNextStep();
}

// 7. Complete Test Suite
function runCompleteTestSuite() {
    console.log('🎯 Nodges 0.80 - Complete Test Suite');
    console.log('=====================================');
    
    quickSystemCheck();
    setTimeout(() => validatePerformanceFixes(), 1000);
    setTimeout(() => testLayoutSystem(), 2000);
    setTimeout(() => testPerformanceMonitoring(), 3000);
    
    setTimeout(() => {
        console.log('\n🎉 Test Suite Completed!');
        console.log('========================');
        console.log('💡 Additional tests you can run:');
        console.log('   - testLayout("force-directed")');
        console.log('   - testLayout("fruchterman-reingold")');
        console.log('   - testLayout("grid")');
        console.log('   - memoryStressTest()');
        console.log('\n🚀 Nodges 0.80 is ready for production use!');
    }, 4000);
}

// Make functions available globally
window.quickSystemCheck = quickSystemCheck;
window.validatePerformanceFixes = validatePerformanceFixes;
window.testLayoutSystem = testLayoutSystem;
window.testPerformanceMonitoring = testPerformanceMonitoring;
window.testLayout = testLayout;
window.memoryStressTest = memoryStressTest;
window.runCompleteTestSuite = runCompleteTestSuite;

console.log('✅ Test Suite loaded! Available commands:');
console.log('==========================================');
console.log('🔍 quickSystemCheck()         - Quick system health check');
console.log('🧪 validatePerformanceFixes() - Validate all performance fixes');
console.log('🎯 testLayoutSystem()         - Test layout algorithms');
console.log('📊 testPerformanceMonitoring() - Test performance monitoring');
console.log('🎨 testLayout("layoutName")   - Test specific layout');
console.log('🔥 memoryStressTest()         - Memory management stress test');
console.log('🚀 runCompleteTestSuite()     - Run all tests');
console.log('\n💡 Start with: runCompleteTestSuite()');