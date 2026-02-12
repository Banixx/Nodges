import { LayoutManager } from './core/LayoutManager';
import { EntityData, RelationshipData } from './types';

// Mock types if needed, but we import real ones.

const logElement = document.getElementById('test-log');
const statusElement = document.getElementById('test-status');

function log(message: string, isError = false) {
    if (logElement) {
        const div = document.createElement('div');
        div.textContent = message;
        div.style.color = isError ? 'red' : 'black';
        logElement.appendChild(div);
    }
    console.log(message);
}

function setStatus(status: 'PASS' | 'FAIL') {
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.style.color = status === 'PASS' ? 'green' : 'red';
    }
}

async function runTests() {
    log('Starting Layout Tests...');

    try {
        const layoutManager = new LayoutManager();
        log('LayoutManager instantiated.');

        // 1. Create Mock Data
        const nodes: EntityData[] = [
            { id: '1', type: 'test', position: { x: 0, y: 0, z: 0 }, data: {} },
            { id: '2', type: 'test', position: { x: 0, y: 0, z: 0 }, data: {} },
            { id: '3', type: 'test', position: { x: 0, y: 0, z: 0 }, data: {} }
        ];

        const edges: RelationshipData[] = [
            { id: 'e1', source: '1', target: '2', type: 'test', data: {} },
            { id: 'e2', source: '2', target: '3', type: 'test', data: {} }
        ];

        log(`Created ${nodes.length} nodes and ${edges.length} edges.`);

        // 2. Test Random Layout
        log('Testing Random Layout...');
        await layoutManager.applyLayout('random', nodes, edges, { minBound: -100, maxBound: 100 });

        // CHeck if positions changed from 0,0,0
        let moved = nodes.some(n => n.position!.x !== 0 || n.position!.y !== 0 || n.position!.z !== 0);
        if (moved) {
            log('PASS: Random layout moved nodes.');
        } else {
            throw new Error('FAIL: Random layout did not move nodes.');
        }

        // 3. Test Force-Directed Layout (Worker)
        log('Testing Force-Directed Layout (Worker)...');
        // Reset positions
        nodes.forEach(n => n.position = { x: 0, y: 0, z: 0 });

        // Note: Worker might need time or proper environment. 
        // In a simple script, we hope the worker loads correctly via Vite.
        const success = await layoutManager.applyLayout('force-directed', nodes, edges, { maxIterations: 50 });

        if (success) {
            moved = nodes.some(n => n.position!.x !== 0 || n.position!.y !== 0 || n.position!.z !== 0);
            if (moved) {
                log('PASS: Force-Directed layout moved nodes.');
            } else {
                throw new Error('FAIL: Force-Directed layout completed but did not move nodes (positions are 0).');
            }
        } else {
            throw new Error('FAIL: Force-Directed layout returned false.');
        }


        // 4. Test Circular Layout
        log('Testing Circular Layout...');
        await layoutManager.applyLayout('circular', nodes, edges, { radius: 10 });
        moved = nodes.some(n => n.position!.x !== 0 || n.position!.z !== 0); // Circular is XZ plane usually
        if (moved) {
            log('PASS: Circular layout moved nodes.');
        } else {
            throw new Error('FAIL: Circular layout did not move nodes.');
        }

        setStatus('PASS');

    } catch (error: any) {
        log(`Test FAILED: ${error.message}`, true);
        setStatus('FAIL');
        console.error(error);
    }
}

runTests();
