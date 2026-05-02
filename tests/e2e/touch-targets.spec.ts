import { test, expect } from '@playwright/test';

test.describe('Touch targets (MOB-02) @smoke', () => {
  test('every button and link on home is >= 44x44 px', async ({ page }) => {
    await page.goto('/');
    const elements = await page.locator('button, a, input[type=checkbox], input[type=submit], [role=button]').all();
    for (const el of elements) {
      const box = await el.boundingBox();
      if (!box) continue; // hidden — skip
      expect(box.width, `width of ${await el.evaluate((n) => n.outerHTML.slice(0, 80))}`).toBeGreaterThanOrEqual(44);
      expect(box.height, `height of ${await el.evaluate((n) => n.outerHTML.slice(0, 80))}`).toBeGreaterThanOrEqual(44);
    }
  });
});
