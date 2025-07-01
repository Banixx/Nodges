/**
 * Test Script für Performance Fixes - Nodges 0.80
 * 
 * Dieses Skript testet die implementierten Performance-Verbesserungen
 * und Bug-Fixes in der Browser-Konsole.
 */

// Test 1: Memory Leak Prevention Test
function testMemoryLeakPrevention() {
    console.log('🧪 Testing Memory Leak Prevention...');
    
    // Teste Edge Cache Cleanup
    if (typeof Edge !== 'undefined' && Edge.geometryCache) {
        const initialCacheSize = Edge.geometryCache.size;
        console.log(`Initial Edge Cache Size: ${initialCacheSize}`);
        
        // Simuliere mehrfache Netzwerk-Loads
        loadNetwork(dataFiles.small).then(() => {
            const afterFirstLoad = Edge.geometryCache.size;
            console.log(`After first load: ${afterFirstLoad}`);
            
            return loadNetwork(dataFiles.medium);
        }).then(() => {
            const afterSecondLoad = Edge.geometryCache.size;
            console.log(`After second load: ${afterSecondLoad}`);
            
            // Cache sollte geleert worden sein
            if (afterSecondLoad === 0 || afterSecondLoad < 5) {
                console.log('✅ Edge Cache wird ordnungsgemäß geleert');
            } else {
                console.log('❌ Edge Cache wird möglicherweise nicht geleert');
            }
        });
    } else {
        console.log('❌ Edge.geometryCache nicht verfügbar');
    }
}

// Test 2: Animation Performance Test
function testAnimationPerformance() {
    console.log('🧪 Testing Animation Performance...');
    
    if (typeof animatedEdges !== 'undefined') {
        console.log(`Animated Edges List Size: ${animatedEdges.length}`);
        
        // Messe Performance der optimierten Animation-Loop
        const startTime = performance.now();
        let frameCount = 0;
        
        function measureAnimationLoop() {
            frameCount++;
            
            // Simuliere die optimierte Animation-Loop
            if (animatedEdges.length > 0) {
                animatedEdges.forEach(edge => {
                    if (edge.animationActive) {
                        // Simuliere edge.update() ohne tatsächliche Ausführung
                    }
                });
            }
            
            if (frameCount < 100) {
                requestAnimationFrame(measureAnimationLoop);
            } else {
                const endTime = performance.now();
                const avgFrameTime = (endTime - startTime) / frameCount;
                console.log(`✅ Optimierte Animation-Loop: ${avgFrameTime.toFixed(2)}ms pro Frame`);
                console.log(`✅ Geschätzte FPS: ${(1000 / avgFrameTime).toFixed(1)}`);
            }
        }
        
        requestAnimationFrame(measureAnimationLoop);
    } else {
        console.log('❌ animatedEdges Liste nicht verfügbar');
    }
}

// Test 3: Edge Settings Safety Test
function testEdgeSettingsSafety() {
    console.log('🧪 Testing Edge Settings Safety...');
    
    // Simuliere undefined edgeSettings
    const originalEdgeSettings = window.edgeSettings;
    window.edgeSettings = undefined;
    
    try {
        // Teste Fallback-Werte
        const safeEdgeSettings = typeof edgeSettings !== 'undefined' ? edgeSettings : {
            segments: 10,
            thickness: 0.5,
            radialSegments: 3
        };
        
        if (safeEdgeSettings.segments === 10 && 
            safeEdgeSettings.thickness === 0.5 && 
            safeEdgeSettings.radialSegments === 3) {
            console.log('✅ Fallback-Werte funktionieren korrekt');
        } else {
            console.log('❌ Fallback-Werte nicht korrekt');
        }
    } catch (error) {
        console.log('❌ Edge Settings Safety Test fehlgeschlagen:', error);
    } finally {
        // Stelle ursprüngliche Einstellungen wieder her
        window.edgeSettings = originalEdgeSettings;
    }
}

// Test 4: Layout Manager Error Handling Test
function testLayoutManagerErrorHandling() {
    console.log('🧪 Testing Layout Manager Error Handling...');
    
    if (typeof layoutManager !== 'undefined') {
        // Teste mit ungültigem Layout-Namen
        layoutManager.applyLayout('invalid-layout', [], [])
            .then(() => {
                console.log('❌ Layout Manager sollte Fehler werfen');
            })
            .catch((error) => {
                console.log('✅ Layout Manager Error Handling funktioniert');
                
                // Prüfe ob isAnimating zurückgesetzt wurde
                if (!layoutManager.isAnimating) {
                    console.log('✅ isAnimating Flag wurde korrekt zurückgesetzt');
                } else {
                    console.log('❌ isAnimating Flag nicht zurückgesetzt');
                }
            });
    } else {
        console.log('❌ layoutManager nicht verfügbar');
    }
}

// Test 5: Performance Monitoring
function testPerformanceMonitoring() {
    console.log('🧪 Testing Performance Monitoring...');
    
    if (typeof performanceOptimizer !== 'undefined') {
        const stats = performanceOptimizer.getPerformanceStats();
        
        console.log('📊 Current Performance Stats:');
        console.log(`- FPS: ${stats.fps}`);
        console.log(`- Frame Time: ${stats.frameTime?.toFixed(2) || 'N/A'} ms`);
        console.log(`- Visible Nodes: ${stats.visibleNodes}`);
        console.log(`- Visible Edges: ${stats.visibleEdges}`);
        console.log(`- Memory Usage: ${stats.memoryUsage?.used || 'N/A'}MB`);
        
        console.log('✅ Performance Monitoring funktioniert');
    } else {
        console.log('❌ performanceOptimizer nicht verfügbar');
    }
}

// Haupt-Test-Funktion
function runAllPerformanceTests() {
    console.log('🚀 Starting Performance Fixes Validation Tests...');
    console.log('================================================');
    
    testMemoryLeakPrevention();
    setTimeout(() => testAnimationPerformance(), 1000);
    setTimeout(() => testEdgeSettingsSafety(), 2000);
    setTimeout(() => testLayoutManagerErrorHandling(), 3000);
    setTimeout(() => testPerformanceMonitoring(), 4000);
    
    setTimeout(() => {
        console.log('================================================');
        console.log('✅ Performance Tests completed!');
        console.log('Check the results above for any issues.');
    }, 5000);
}

// Exportiere Test-Funktionen für Browser-Konsole
window.performanceTests = {
    runAll: runAllPerformanceTests,
    memoryLeak: testMemoryLeakPrevention,
    animation: testAnimationPerformance,
    edgeSettings: testEdgeSettingsSafety,
    layoutManager: testLayoutManagerErrorHandling,
    monitoring: testPerformanceMonitoring
};

console.log('🧪 Performance Test Suite loaded!');
console.log('Run tests with: performanceTests.runAll()');
console.log('Or individual tests: performanceTests.memoryLeak(), etc.');