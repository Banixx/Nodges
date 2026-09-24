import { test, expect } from '@playwright/test';

test.describe('03 - Graph Daten-Lifecycle & State-Synchronisation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => (window as any).app !== undefined, { timeout: 15000 });
  });

  test('sollte Graphdaten ueber loadGraphData laden, StateManager befuellen und UI-Zaehler aktualisieren', async ({ page }) => {
    // 1. Initialzustand pruefen
    const nodeCountEl = page.locator('#fileNodeCount');
    const edgeCountEl = page.locator('#fileEdgeCount');
    await expect(nodeCountEl).toBeVisible();

    // 2. Synthetischen Graphen ueber die laufende App-Instanz einspeisen
    await page.evaluate(async () => {
      const testGraph = {
        schemaVersion: '5.0',
        data: {
          entities: [
            { id: 'n1', label: 'Knoten 1 (E2E)', type: 'concept', position: { x: -5, y: 0, z: 0 } },
            { id: 'n2', label: 'Knoten 2 (E2E)', type: 'concept', position: { x: 5, y: 0, z: 0 } },
            { id: 'n3', label: 'Knoten 3 (E2E)', type: 'topic', position: { x: 0, y: 5, z: 0 } },
          ],
          relationships: [
            { id: 'e1', source: 'n1', target: 'n2', relation: 'connected_to', label: 'Verbindung 1' },
            { id: 'e2', source: 'n2', target: 'n3', relation: 'leads_to', label: 'Verbindung 2' }
          ]
        }
      };
      await (window as any).app.loadGraphData(testGraph, 'e2e_spec_graph.json', false);
    });

    // 3. UI-Anzeige in der Sidebar verifizieren
    await expect(nodeCountEl).toHaveText('3', { timeout: 5000 });
    await expect(edgeCountEl).toHaveText('2', { timeout: 5000 });

    // 4. StateManager-Entitaeten im Browser-Kontext abpruefen
    const counts = await page.evaluate(() => {
      const app = (window as any).app;
      return {
        entities: app.stateManager.getEntities().length,
        relationships: app.stateManager.getRelationships().length,
        loadedFiles: app.stateManager.state.loadedFiles.length
      };
    });

    expect(counts.entities).toBe(3);
    expect(counts.relationships).toBe(2);
    expect(counts.loadedFiles).toBeGreaterThanOrEqual(1);

    // 5. Neues leeres Projekt anlegen und Reset verifizieren
    await page.evaluate(() => {
      (window as any).app.newGraph();
    });

    await expect(nodeCountEl).toHaveText('0', { timeout: 5000 });
    await expect(edgeCountEl).toHaveText('0', { timeout: 5000 });
  });
});
