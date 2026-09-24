import { test, expect } from '@playwright/test';

test.describe('04 - Canvas & 3D-Kamera-Interaktion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => (window as any).app !== undefined, { timeout: 15000 });
  });

  test('sollte Maus-Drag-Interaktion auf dem Canvas verarbeiten und Orbit-Kamera drehen', async ({ page }) => {
    const canvas = page.locator('body > canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // 1. Initialen Kameraposition erfassen
    const initialCamPos = await page.evaluate(() => {
      const p = (window as any).app.camera.position;
      return { x: p.x, y: p.y, z: p.z };
    });

    // 2. Drag-Geste im Canvas ausfuehren (linke Maustaste gedrueckt halten und ziehen)
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 120, startY + 80, { steps: 10 });
    await page.mouse.up();

    // Kurzen Render-Frame abwarten
    await page.waitForTimeout(300);

    // 3. Pruefen ob sich die Kameraposition durch OrbitControls veraendert hat
    const updatedCamPos = await page.evaluate(() => {
      const p = (window as any).app.camera.position;
      return { x: p.x, y: p.y, z: p.z };
    });

    const hasMoved =
      Math.abs(updatedCamPos.x - initialCamPos.x) > 0.01 ||
      Math.abs(updatedCamPos.y - initialCamPos.y) > 0.01 ||
      Math.abs(updatedCamPos.z - initialCamPos.z) > 0.01;

    expect(hasMoved).toBe(true);
  });

  test('sollte Mausrad-Zoom auf dem Canvas ohne Fehler ausfuehren', async ({ page }) => {
    const canvas = page.locator('body > canvas');
    await expect(canvas).toBeVisible();

    const initialDistance = await page.evaluate(() => {
      const app = (window as any).app;
      return app.camera.position.distanceTo(app.controls.target);
    });

    const box = await canvas.boundingBox();
    if (!box) return;

    // Maus in die Mitte des Canvas bewegen und Scroll-Event ausloesen
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -300); // Zoom in

    await page.waitForTimeout(300);

    const zoomedDistance = await page.evaluate(() => {
      const app = (window as any).app;
      return app.camera.position.distanceTo(app.controls.target);
    });

    expect(zoomedDistance).not.toEqual(initialDistance);
  });
});
