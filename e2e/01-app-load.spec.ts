import { test, expect } from '@playwright/test';

test.describe('01 - App Initialisierung & Basis-Render', () => {
  test('sollte die App laden, Three.js-Canvas initialisieren und window.app bereitstellen', async ({ page }) => {
    const severeErrors: string[] = [];

    page.on('console', (msg) => {
      // Ignoriere erwartete Offline-Meldungen fuer LightRAG wenn Backend nicht laeuft
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('503') && !text.includes('lightrag') && !text.includes('Failed to load resource')) {
          severeErrors.push(text);
        }
      }
    });

    await page.goto('/');

    // 1. Pruefen ob der Haupt-Canvas von Three.js in den DOM gehaengt wurde
    const canvas = page.locator('body > canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // 2. Pruefen ob die Sidebar existiert und sichtbar ist
    const sidebar = page.locator('#mainSidebar');
    await expect(sidebar).toBeVisible();

    // 3. Pruefen ob window.app im globalen Scope existiert und initialisiert ist
    const isAppReady = await page.waitForFunction(() => {
      const app = (window as any).app;
      return app !== undefined && app.stateManager !== undefined && app.scene !== undefined;
    }, { timeout: 15000 });

    expect(isAppReady).toBeTruthy();

    // 4. Keine kritischen Console-Errors aufgetreten
    expect(severeErrors).toHaveLength(0);
  });
});
