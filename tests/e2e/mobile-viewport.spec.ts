import { test, expect } from '@playwright/test';

test.describe('Mobile viewport (MOB-01) @smoke', () => {
  test('home renders without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    expect(overflow).toBe(false);
  });

  test('manifest is served', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.display).toBe('standalone');
  });
});
