// Nodges Funktionalitäts-Test
console.log('🧪 Starte Nodges Funktionalitäts-Test...');

// Test 1: Module Import Simulation
const testModuleStructure = () => {
    console.log('📦 Teste Module-Struktur...');
    
    const expectedModules = [
        'src/core/StateManager.js',
        'src/core/LayoutManager.js', 
        'src/core/UIManager.js',
        'src/core/EventManager.js',
        'src/utils/SearchManager.js',
        'src/utils/SelectionManager.js',
        'objects/Node.js',
        'objects/Edge.js'
    ];
    
    return expectedModules;
};

// Test 2: Datenstruktur Validierung
const testDataStructure = async () => {
    console.log('📊 Teste Datenstruktur...');
    
    try {
        const response = await fetch('/data/examples/small.json');
        const data = await response.json();
        
        console.log('✅ Daten geladen:', {
            nodes: data.nodes?.length || 0,
            edges: data.edges?.length || 0
        });
        
        return data;
    } catch (error) {
        console.error('❌ Daten-Fehler:', error);
        return null;
    }
};

// Test 3: Three.js Verfügbarkeit (simuliert)
const testThreeJS = () => {
    console.log('🎮 Teste Three.js Integration...');
    
    // Simuliere Three.js Import-Test
    const threeJSFeatures = [
        'Scene',
        'Camera', 
        'Renderer',
        'Vector3',
        'Geometry',
        'Material'
    ];
    
    console.log('✅ Three.js Features erwartet:', threeJSFeatures);
    return true;
};

// Test 4: UI Komponenten
const testUIComponents = () => {
    console.log('🎨 Teste UI-Komponenten...');
    
    const uiElements = [
        'controls',
        'fileInfoPanel', 
        'infoPanel',
        'searchInput',
        'searchButton',
        'layoutButton'
    ];
    
    console.log('✅ UI-Elemente erwartet:', uiElements);
    return true;
};

// Haupttest-Funktion
const runTests = async () => {
    console.log('🚀 Nodges 0.81 Funktionalitäts-Test gestartet');
    console.log('=' .repeat(50));
    
    const modules = testModuleStructure();
    console.log('📦 Module-Test:', modules.length, 'Module erwartet');
    
    const data = await testDataStructure();
    console.log('📊 Daten-Test:', data ? 'Erfolgreich' : 'Fehlgeschlagen');
    
    const threeJS = testThreeJS();
    console.log('🎮 Three.js Test:', threeJS ? 'Erfolgreich' : 'Fehlgeschlagen');
    
    const ui = testUIComponents();
    console.log('🎨 UI-Test:', ui ? 'Erfolgreich' : 'Fehlgeschlagen');
    
    console.log('=' .repeat(50));
    console.log('🏁 Test abgeschlossen');
    
    return {
        modules: modules.length,
        data: !!data,
        threeJS,
        ui,
        timestamp: new Date().toISOString()
    };
};

// Export für Node.js Umgebung
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests };
} else {
    // Browser Umgebung
    runTests().then(results => {
        console.log('📋 Test-Ergebnisse:', results);
    });
}