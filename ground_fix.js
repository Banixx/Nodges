// Temporaerer Untergrund-Fix
import { GroundManager } from './src/utils/GroundManager.js';

// Nach der Scene-Erstellung hinzufuegen:
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.nodgesApp && window.nodgesApp.scene) {
            const groundManager = new GroundManager(window.nodgesApp.scene);
            groundManager.createGround(-2);
        }
    }, 1000);
});
