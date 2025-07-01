// 🔧 Debug Test Suite - Nodges 0.80
// Erweiterte Diagnose und Fehlerbehebung

console.log('🔧 Loading Debug Test Suite...');

// 1. Detaillierte System-Diagnose
function detailedSystemDiagnosis() {
    console.log('\n🔍 Detailed System Diagnosis');
    console.log('=============================');
    
    // Check if page is fully loaded
    console.log(`📄 Document ready state: ${document.readyState}`);
    console.log(`🌐 Location: ${window.location.href}`);
    
    // Check script loading
    const scripts = Array.from(document.scripts);
    console.log(`📜 Total scripts loaded: ${scripts.length}`);
    
    const mainScript = scripts.find(s => s.src.includes('main.js'));
    console.log(`📜 main.js loaded: ${mainScript ? '✅ YES' : '❌ NO'}`);
    
    // Check for Three.js
    console.log(`🎮 Three.js available: ${typeof THREE !== 'undefined' ? '✅ YES' : '❌ NO'}`);
    
    // Check for TWEEN.js
    console.log(`🎬 TWEEN.js available: ${typeof window.TWEEN !== 'undefined' ? '✅ YES' : '❌ NO'}`);
    
    // Check for lil-gui
    console.log(`🎛️ lil-gui available: ${typeof lil !== 'undefined' ? '✅ YES' : '❌ NO'}`);
    
    // Check DOM elements
    const controlsDiv = document.getElementById('controls');
    console.log(`🎮 Controls div: ${controlsDiv ? '✅ FOUND' : '❌ MISSING'}`);
    
    const layoutButton = document.getElementById('layoutButton');
    console.log(`🎯 Layout button: ${layoutButton ? '✅ FOUND' : '❌ MISSING'}`);
    
    // Check for errors in console
    console.log('\n🚨 Checking for JavaScript errors...');
    
    // Override console.error temporarily to catch errors
    const originalError = console.error;
    const errors = [];
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    setTimeout(() => {
        console.error = originalError;
        if (errors.length > 0) {
            console.log(`❌ Found ${errors.length} errors:`);
            errors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
        } else {
            console.log('✅ No JavaScript errors detected');
        }
    }, 1000);
}

// 2. Module Loading Check
function checkModuleLoading() {
    console.log('\n📦 Module Loading Check');
    console.log('=======================');
    
    // Check if modules are loaded by looking at window properties
    const expectedGlobals = [
        'scene', 'camera', 'renderer', 'controls',
        'currentNodes', 'currentEdges', 'animatedEdges',
        'layoutManager', 'performanceOptimizer',
        'searchManager', 'neighborhoodHighlighter',
        'edgeLabelManager', 'networkAnalyzer'
    ];
    
    expectedGlobals.forEach(global => {
        try {
            const exists = eval(`typeof ${global} !== 'undefined'`);
            console.log(`${exists ? '✅' : '❌'} ${global}: ${exists ? 'LOADED' : 'MISSING'}`);
            
            if (!exists) {
                // Try to find it in different scopes
                if (window[global]) {
                    console.log(`   💡 Found in window.${global}`);
                }
            }
        } catch (e) {
            console.log(`❌ ${global}: ERROR - ${e.message}`);
        }
    });
}

// 3. Force Module Initialization
function forceModuleInitialization() {
    console.log('\n🔄 Force Module Initialization');
    console.log('==============================');
    
    // Wait for main.js to load and initialize
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkAndWait = () => {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts} - Checking module initialization...`);
        
        if (typeof scene !== 'undefined' && typeof layoutManager !== 'undefined') {
            console.log('✅ Modules successfully initialized!');
            runBasicTests();
        } else if (attempts < maxAttempts) {
            console.log('⏳ Modules not ready yet, waiting 2 seconds...');
            setTimeout(checkAndWait, 2000);
        } else {
            console.log('❌ Modules failed to initialize after maximum attempts');
            console.log('💡 Try refreshing the page or check for JavaScript errors');
        }
    };
    
    checkAndWait();
}

// 4. Basic Tests (when modules are loaded)
function runBasicTests() {
    console.log('\n🧪 Basic Functionality Tests');
    console.log('=============================');
    
    // Test 1: Scene and Rendering
    if (typeof scene !== 'undefined' && typeof renderer !== 'undefined') {
        console.log('✅ Scene and renderer available');
        console.log(`   - Scene children: ${scene.children.length}`);
        console.log(`   - Renderer size: ${renderer.getSize(new THREE.Vector2())}`);
    } else {
        console.log('❌ Scene or renderer not available');
    }
    
    // Test 2: Network Data
    if (typeof currentNodes !== 'undefined' && typeof currentEdges !== 'undefined') {
        console.log('✅ Network data structures available');
        console.log(`   - Current nodes: ${currentNodes.length}`);
        console.log(`   - Current edges: ${currentEdges.length}`);
        console.log(`   - Animated edges: ${animatedEdges ? animatedEdges.length : 'N/A'}`);
    } else {
        console.log('❌ Network data structures not available');
    }
    
    // Test 3: Layout Manager
    if (typeof layoutManager !== 'undefined') {
        console.log('✅ Layout manager available');
        try {
            const layouts = layoutManager.getAvailableLayouts();
            console.log(`   - Available layouts: ${layouts.join(', ')}`);
            console.log(`   - Current layout: ${layoutManager.getCurrentLayout()}`);
            console.log(`   - Is animating: ${layoutManager.isAnimating}`);
        } catch (e) {
            console.log(`   ❌ Error accessing layout manager: ${e.message}`);
        }
    } else {
        console.log('❌ Layout manager not available');
    }
    
    // Test 4: Performance Optimizer
    if (typeof performanceOptimizer !== 'undefined') {
        console.log('✅ Performance optimizer available');
        try {
            const stats = performanceOptimizer.getPerformanceStats();
            console.log(`   - FPS: ${stats.fps}`);
            console.log(`   - Visible nodes: ${stats.visibleNodes}`);
            console.log(`   - Visible edges: ${stats.visibleEdges}`);
        } catch (e) {
            console.log(`   ❌ Error accessing performance stats: ${e.message}`);
        }
    } else {
        console.log('❌ Performance optimizer not available');
    }
    
    // Test 5: Load a small network
    console.log('\n🔄 Testing network loading...');
    const smallButton = document.getElementById('smallData');
    if (smallButton) {
        console.log('✅ Small data button found, attempting to load network...');
        smallButton.click();
        
        setTimeout(() => {
            if (currentNodes && currentNodes.length > 0) {
                console.log(`✅ Network loaded successfully: ${currentNodes.length} nodes`);
                testLayoutFunctionality();
            } else {
                console.log('❌ Network loading failed or no nodes loaded');
            }
        }, 3000);
    } else {
        console.log('❌ Small data button not found');
    }
}

// 5. Test Layout Functionality
function testLayoutFunctionality() {
    console.log('\n🎯 Testing Layout Functionality');
    console.log('===============================');
    
    if (!layoutManager || !currentNodes || currentNodes.length === 0) {
        console.log('❌ Prerequisites not met for layout testing');
        return;
    }
    
    console.log('🎨 Testing circular layout...');
    
    const edgeData = currentEdges.map(edge => ({
        source: edge.startNode.id,
        target: edge.endNode.id
    }));
    
    layoutManager.applyLayout('circular', currentNodes, edgeData)
        .then(() => {
            console.log('✅ Circular layout applied successfully!');
            console.log('🎉 All basic tests completed successfully!');
            console.log('\n💡 You can now run additional tests:');
            console.log('   - testAllLayouts()');
            console.log('   - testMemoryManagement()');
            console.log('   - testPerformanceOptimization()');
        })
        .catch((error) => {
            console.log(`❌ Layout test failed: ${error.message}`);
        });
}

// 6. Test All Layouts
function testAllLayouts() {
    console.log('\n🎨 Testing All Layout Algorithms');
    console.log('================================');
    
    if (!layoutManager || !currentNodes || currentNodes.length === 0) {
        console.log('❌ Prerequisites not met');
        return;
    }
    
    const layouts = layoutManager.getAvailableLayouts();
    let currentIndex = 0;
    
    const testNextLayout = () => {
        if (currentIndex >= layouts.length) {
            console.log('✅ All layouts tested successfully!');
            return;
        }
        
        const layoutName = layouts[currentIndex];
        console.log(`🎯 Testing ${layoutName} layout...`);
        
        const edgeData = currentEdges.map(edge => ({
            source: edge.startNode.id,
            target: edge.endNode.id
        }));
        
        layoutManager.applyLayout(layoutName, currentNodes, edgeData)
            .then(() => {
                console.log(`✅ ${layoutName} layout successful`);
                currentIndex++;
                setTimeout(testNextLayout, 3000); // Wait 3 seconds between layouts
            })
            .catch((error) => {
                console.log(`❌ ${layoutName} layout failed: ${error.message}`);
                currentIndex++;
                setTimeout(testNextLayout, 1000);
            });
    };
    
    testNextLayout();
}

// 7. Memory Management Test
function testMemoryManagement() {
    console.log('\n🧠 Testing Memory Management');
    console.log('============================');
    
    if (typeof Edge === 'undefined' || !Edge.geometryCache) {
        console.log('❌ Edge.geometryCache not available');
        return;
    }
    
    const initialSize = Edge.geometryCache.size;
    console.log(`📊 Initial cache size: ${initialSize}`);
    
    // Load different networks and check cache behavior
    const networks = ['smallData', 'mediumData', 'largeData'];
    let networkIndex = 0;
    
    const testNextNetwork = () => {
        if (networkIndex >= networks.length) {
            const finalSize = Edge.geometryCache.size;
            console.log(`📊 Final cache size: ${finalSize}`);
            
            if (finalSize <= initialSize + 10) {
                console.log('✅ Memory management working correctly!');
            } else {
                console.log('⚠️ Cache size increased significantly');
            }
            return;
        }
        
        const networkButton = document.getElementById(networks[networkIndex]);
        if (networkButton) {
            console.log(`🔄 Loading ${networks[networkIndex]}...`);
            networkButton.click();
            
            setTimeout(() => {
                console.log(`📊 Cache size after ${networks[networkIndex]}: ${Edge.geometryCache.size}`);
                networkIndex++;
                setTimeout(testNextNetwork, 2000);
            }, 2000);
        } else {
            console.log(`❌ Button ${networks[networkIndex]} not found`);
            networkIndex++;
            setTimeout(testNextNetwork, 500);
        }
    };
    
    testNextNetwork();
}

// Main debug function
function runDebugSuite() {
    console.log('🔧 Nodges 0.80 - Debug Test Suite');
    console.log('==================================');
    
    detailedSystemDiagnosis();
    setTimeout(() => checkModuleLoading(), 2000);
    setTimeout(() => forceModuleInitialization(), 4000);
}

// Make functions globally available
window.runDebugSuite = runDebugSuite;
window.detailedSystemDiagnosis = detailedSystemDiagnosis;
window.checkModuleLoading = checkModuleLoading;
window.forceModuleInitialization = forceModuleInitialization;
window.testAllLayouts = testAllLayouts;
window.testMemoryManagement = testMemoryManagement;

console.log('🔧 Debug Test Suite loaded!');
console.log('============================');
console.log('🚀 Run: runDebugSuite()');
console.log('🔍 Or: detailedSystemDiagnosis()');
console.log('📦 Or: checkModuleLoading()');