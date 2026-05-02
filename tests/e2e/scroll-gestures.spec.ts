import { test, expect } from '@playwright/test';

test.describe('Scroll gestures (MOB-05)', () => {
  test('overscroll-behavior is not "contain" on body or html', async ({ page }) => {
    await page.goto('/');
    const offenders = await page.evaluate(() => {
      const targets = [document.documentElement, document.body];
      return targets
        .map((el) => ({
          tag: el.tagName,
          ob: getComputedStyle(el).overscrollBehavior,
        }))
        .filter((x) => x.ob === 'contain' || x.ob === 'none');
    });
    expect(offenders).toEqual([]);
  });
});
