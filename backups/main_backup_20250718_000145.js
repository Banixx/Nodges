
// Interaktions-Events für Hover und Klick
function setupNodeEdgeInteraction() {
    if (!window.nodgesApp) return;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    window.nodgesApp.renderer.domElement.addEventListener('mousemove', (event) => {
        const rect = window.nodgesApp.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, window.nodgesApp.camera);
        const intersects = raycaster.intersectObjects(window.nodgesApp.scene.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData && (object.userData.type === 'node' || object.userData.type === 'edge')) {
                showObjectInfo(object, false);
                window.nodgesApp.renderer.domElement.style.cursor = 'pointer';
            } else {
                window.nodgesApp.renderer.domElement.style.cursor = 'default';
            }
        } else {
            window.nodgesApp.renderer.domElement.style.cursor = 'default';
        }
    });
    
    window.nodgesApp.renderer.domElement.addEventListener('click', (event) => {
        const rect = window.nodgesApp.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, window.nodgesApp.camera);
        const intersects = raycaster.intersectObjects(window.nodgesApp.scene.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData && (object.userData.type === 'node' || object.userData.type === 'edge')) {
                showObjectInfo(object, true);
            }
        }
    });
}

function showObjectInfo(object, isSelected) {
    const infoPanel = document.getElementById('fileInfoPanel');
    if (infoPanel && infoPanel.classList.contains('collapsed')) {
        infoPanel.classList.remove('collapsed');
        document.getElementById('fileInfoToggle').innerHTML = 'v';
    }
    
    if (object.userData.type === 'node') {
        const data = object.userData.data || object.metadata || {};
        document.getElementById('fileFilename').textContent = 'Type: Node ' + (isSelected ? '(Selected)' : '(Hover)');
        document.getElementById('fileNodeCount').textContent = 'Name: ' + (data.name || 'Unnamed Node');
        document.getElementById('fileEdgeCount').textContent = 'ID: ' + (data.id || 'No ID');
        document.getElementById('fileXAxis').textContent = 'Position: X:' + object.position.x.toFixed(2) + ' Y:' + object.position.y.toFixed(2) + ' Z:' + object.position.z.toFixed(2);
        document.getElementById('fileYAxis').textContent = 'Properties: ' + formatObjectProperties(data);
        document.getElementById('fileZAxis').textContent = 'Status: ' + (isSelected ? 'Selected' : 'Hovered');
    } else if (object.userData.type === 'edge') {
        const data = object.userData.data || object.metadata || {};
        document.getElementById('fileFilename').textContent = 'Type: Edge ' + (isSelected ? '(Selected)' : '(Hover)');
        document.getElementById('fileNodeCount').textContent = 'Name: ' + (data.name || 'Unnamed Edge');
        document.getElementById('fileEdgeCount').textContent = 'Connection: ' + (data.start || 'Unknown') + ' -> ' + (data.end || 'Unknown');
        document.getElementById('fileXAxis').textContent = 'Offset: ' + (data.offset || 0);
        document.getElementById('fileYAxis').textContent = 'Properties: ' + formatObjectProperties(data);
        document.getElementById('fileZAxis').textContent = 'Status: ' + (isSelected ? 'Selected' : 'Hovered');
    }
}

function formatObjectProperties(data) {
    const properties = [];
    for (const key in data) {
        if (data.hasOwnProperty(key) && key !== 'name' && key !== 'id' && key !== 'position' && key !== 'x' && key !== 'y' && key !== 'z' && key !== 'start' && key !== 'end' && key !== 'offset') {
            properties.push(key + ': ' + data[key]);
        }
    }
    return properties.join(', ') || 'None';
}

// Setup nach App-Initialisierung
setTimeout(() => {
    if (window.nodgesApp && window.nodgesApp.isInitialized) {
        setupNodeEdgeInteraction();
        console.log('Node/Edge Interaktion aktiviert');
    }
}, 2000);

