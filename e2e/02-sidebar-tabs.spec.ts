import { test, expect } from '@playwright/test';

test.describe('02 - Sidebar Tabs & UI-Modi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => (window as any).app !== undefined, { timeout: 15000 });
  });

  test('sollte zwischen den Sidebar-Tabs wechseln koennen', async ({ page }) => {
    // 1. Initial ist Tab-System aktiv
    const tabSystemContent = page.locator('#tab-system');
    await expect(tabSystemContent).toHaveClass(/active/);

    // 2. Klick auf 'Files'-Tab
    const filesTabBtn = page.locator('.sidebar-tab[data-tab="tab-files"]');
    await filesTabBtn.click();

    const tabFilesContent = page.locator('#tab-files');
    await expect(tabFilesContent).toHaveClass(/active/);
    await expect(tabSystemContent).not.toHaveClass(/active/);

    // 3. Klick auf 'Ansicht'-Tab
    const viewTabBtn = page.locator('.sidebar-tab[data-tab="tab-view"]');
    await viewTabBtn.click();

    const tabViewContent = page.locator('#tab-view');
    await expect(tabViewContent).toHaveClass(/active/);
    await expect(tabFilesContent).not.toHaveClass(/active/);
  });

  test('sollte den UI-Modus umschalten koennen (Simple, Expert, Dev)', async ({ page }) => {
    // 1. Umschalten auf Expert
    const expertLabel = page.locator('label[for="uimode_expert"]');
    await expertLabel.click();

    const expertRadio = page.locator('#uimode_expert');
    await expect(expertRadio).toBeChecked();

    // 2. Umschalten auf Dev
    const devLabel = page.locator('label[for="uimode_dev"]');
    await devLabel.click();

    const devRadio = page.locator('#uimode_dev');
    await expect(devRadio).toBeChecked();

    // In Dev-Mode sollte der 'Dev'-Tab anwaehlbar sein
    const devTabBtn = page.locator('.sidebar-tab[data-tab="tab-dev"]');
    await devTabBtn.click();

    const tabDevContent = page.locator('#tab-dev');
    await expect(tabDevContent).toHaveClass(/active/);
  });
});
