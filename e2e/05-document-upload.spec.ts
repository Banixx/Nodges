import { test, expect } from '@playwright/test';

test.describe('05 - Dokumenten-Upload & Quellen-Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => (window as any).app !== undefined, { timeout: 15000 });
  });

  test('sollte Quellen-Dokumente im Create-Panel annehmen und Status aktualisieren', async ({ page }) => {
    // 1. Zuerst in den Dev-Modus wechseln, damit der Create-Tab sichtbar wird
    const devLabel = page.locator('label[for="uimode_dev"]');
    await devLabel.click();

    // 2. In den 'Erstellen'-Tab wechseln
    const createTabBtn = page.locator('.sidebar-tab[data-tab="tab-create"]');
    await expect(createTabBtn).toBeVisible();
    await createTabBtn.click();

    const tabCreateContent = page.locator('#tab-create');
    await expect(tabCreateContent).toHaveClass(/active/);

    // 2. Dropzone fuer Quellen-Dateien finden
    const dropZone = page.locator('div[role="button"][aria-label*="Quellen auswaehlen"]');
    await expect(dropZone).toBeVisible();

    // 3. File Input fuer Quell-Dateien lokalisieren
    const fileInput = page.locator('#createPanelContent input[type="file"][accept*=".pdf"]');
    await expect(fileInput).toHaveCount(1);

    // 4. Test-Datei bereitstellen und hochladen
    const testContent = `# Nodges Test Dokument
Nodges ist ein 3D-Wissensgraph-System.
Albert Einstein entwickelte die Relativitaetstheorie in Bern und Princeton.
Die Quantenmechanik beschreibt atomare Zustaende.`;

    await fileInput.setInputFiles({
      name: 'test_quelle.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(testContent, 'utf-8'),
    });

    // 5. Pruefen ob der Status-Bereich den erfolgreichen Upload anzeigt
    const statusText = page.locator('#createPanelContent');
    await expect(statusText).toContainText('test_quelle.txt', { timeout: 10000 });
  });

  test('sollte das kontextsensitive Kontextmenue und die Nachbarschafts-Option im Canvas bereitstellen', async ({ page }) => {
    const canvas = page.locator('body > canvas');
    await expect(canvas).toBeVisible();

    // 1. Rechtsklick auf den Canvas ausfuehren
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'right' });

    // 2. Pruefen ob das Kontextmenue sichtbar ist
    const contextMenu = page.locator('.context-menu');
    await expect(contextMenu).toBeVisible();

    // 3. Pruefen ob der Modus-Header und die Option fuer automatisches Nachladen angezeigt werden
    const headerTitle = page.locator('.context-menu-title');
    await expect(headerTitle).toBeVisible();
    await expect(headerTitle).toContainText('3D-Canvas');

    const toggleOption = page.locator('.context-menu-item:has-text("Automatisches Nachladen")');
    await expect(toggleOption).toBeVisible();

    // 4. Klick schliesst das Menue
    await page.mouse.click(box.x + 20, box.y + 20);
    await expect(contextMenu).not.toBeVisible();
  });
});
