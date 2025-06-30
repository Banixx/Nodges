// Validation script for the new Nodges 0.77 features
// This script checks if all modules are properly structured

console.log('🧪 Starting Nodges 0.77 Implementation Validation...\n');

// Check if files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'src/utils/NetworkAnalyzer.js',
    'src/utils/PathFinder.js',
    'src/utils/PerformanceOptimizer.js',
    'main.js',
    'index.html'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} - EXISTS`);
        } else {
            console.log(`❌ ${file} - MISSING`);
        }
    } catch (error) {
        console.log(`❌ ${file} - ERROR: ${error.message}`);
    }
});

// Check main.js for proper imports
console.log('\n📦 Checking main.js imports...');
try {
    const mainContent = fs.readFileSync('main.js', 'utf8');
    
    const requiredImports = [
        'NetworkAnalyzer',
        'PathFinder', 
        'PerformanceOptimizer'
    ];
    
    requiredImports.forEach(importName => {
        if (mainContent.includes(importName)) {
            console.log(`✅ ${importName} - IMPORTED`);
        } else {
            console.log(`❌ ${importName} - NOT IMPORTED`);
        }
    });
    
    // Check for GUI integration
    const guiElements = [
        'networkAnalysisSettings',
        'pathFindingSettings',
        'performanceSettings'
    ];
    
    console.log('\n🎛️ Checking GUI integration...');
    guiElements.forEach(element => {
        if (mainContent.includes(element)) {
            console.log(`✅ ${element} - INTEGRATED`);
        } else {
            console.log(`❌ ${element} - NOT INTEGRATED`);
        }
    });
    
} catch (error) {
    console.log(`❌ Error reading main.js: ${error.message}`);
}

// Check NetworkAnalyzer structure
console.log('\n🔍 Checking NetworkAnalyzer structure...');
try {
    const analyzerContent = fs.readFileSync('src/utils/NetworkAnalyzer.js', 'utf8');
    
    const requiredMethods = [
        'initialize',
        'calculateAllMetrics',
        'findShortestPath',
        'getNetworkStatistics',
        'detectCommunities'
    ];
    
    requiredMethods.forEach(method => {
        if (analyzerContent.includes(method)) {
            console.log(`✅ ${method} - IMPLEMENTED`);
        } else {
            console.log(`❌ ${method} - MISSING`);
        }
    });
} catch (error) {
    console.log(`❌ Error checking NetworkAnalyzer: ${error.message}`);
}

// Check PathFinder structure
console.log('\n🛣️ Checking PathFinder structure...');
try {
    const pathFinderContent = fs.readFileSync('src/utils/PathFinder.js', 'utf8');
    
    const requiredMethods = [
        'findShortestPath',
        'findAStarPath',
        'setStartNode',
        'setEndNode',
        'createPathVisualization'
    ];
    
    requiredMethods.forEach(method => {
        if (pathFinderContent.includes(method)) {
            console.log(`✅ ${method} - IMPLEMENTED`);
        } else {
            console.log(`❌ ${method} - MISSING`);
        }
    });
} catch (error) {
    console.log(`❌ Error checking PathFinder: ${error.message}`);
}

// Check PerformanceOptimizer structure
console.log('\n⚡ Checking PerformanceOptimizer structure...');
try {
    const optimizerContent = fs.readFileSync('src/utils/PerformanceOptimizer.js', 'utf8');
    
    const requiredMethods = [
        'optimizeNodes',
        'optimizeEdges',
        'applyNodeLOD',
        'getPerformanceStats',
        'autoOptimize'
    ];
    
    requiredMethods.forEach(method => {
        if (optimizerContent.includes(method)) {
            console.log(`✅ ${method} - IMPLEMENTED`);
        } else {
            console.log(`❌ ${method} - MISSING`);
        }
    });
} catch (error) {
    console.log(`❌ Error checking PerformanceOptimizer: ${error.message}`);
}

console.log('\n🎉 Validation complete!');
console.log('\n📋 Next steps:');
console.log('1. Open http://localhost:8080/test_features.html for interactive testing');
console.log('2. Open http://localhost:8080 for the main application');
console.log('3. Follow the test instructions in the test page');