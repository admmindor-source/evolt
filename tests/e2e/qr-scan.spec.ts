import { test, expect } from '@playwright/test';

test.describe('QR scan flow @smoke', () => {
  test('ACT-01 + ACT-03: /p/whey-protein?c=insta-2026-05 redirects to /signup with cookie set (no auth required)', async ({ page, context }) => {
    await page.goto('/p/whey-protein?c=insta-2026-05', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/signup');
    const cookies = await context.cookies();
    const pending = cookies.find((c) => c.name === 'evolt_pending_activation');
    expect(pending, 'pending activation cookie must be set').toBeDefined();
    expect(pending!.httpOnly).toBe(true);
    expect(pending!.sameSite).toBe('Lax');
    const decoded = JSON.parse(decodeURIComponent(pending!.value));
    expect(decoded.sku).toBe('whey-protein');
    expect(decoded.campaign).toBe('insta-2026-05');
  });

  test('invalid sku redirects to /ativar?error=invalid', async ({ page }) => {
    await page.goto('/p/INVALID%20SKU%20WITH%20SPACES?c=x');
    expect(page.url()).toMatch(/\/ativar\?error=invalid/);
  });

  test('non-existent valid-format sku redirects to /ativar?error=not-found', async ({ page }) => {
    await page.goto('/p/this-sku-does-not-exist?c=x');
    expect(page.url()).toMatch(/\/ativar\?error=not-found/);
  });

  test('ACT-04: manual code entry sets cookie and redirects to /signup', async ({ page, context }) => {
    await page.goto('/ativar');
    await page.getByLabel('Codigo do produto').fill('WHEY01');
    await Promise.all([
      page.waitForURL(/\/signup/),
      page.getByRole('button', { name: /Continuar|Validando/i }).click(),
    ]);
    const cookies = await context.cookies();
    const pending = cookies.find((c) => c.name === 'evolt_pending_activation');
    expect(pending).toBeDefined();
    const decoded = JSON.parse(decodeURIComponent(pending!.value));
    expect(decoded.sku).toBe('whey-protein');
  });

  test('ACT-04: invalid manual code shows inline error', async ({ page }) => {
    await page.goto('/ativar');
    await page.getByLabel('Codigo do produto').fill('FAKE99');
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page.getByText(/Codigo nao encontrado/)).toBeVisible({ timeout: 5_000 });
  });
});
