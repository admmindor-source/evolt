import { test, expect } from '@playwright/test';
import { signUpViaUI } from './helpers/auth';
import { completeOnboardingViaUI } from './helpers/onboarding';

test.describe('Loja / Catálogo (LOJA-01, LOJA-02)', () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await page.goto('/loja');
    await expect(page).toHaveURL(/\/loja/, { timeout: 10_000 });
  });

  test('LOJA-01: catalog shows all 6 SKUs', async ({ page }) => {
    const skus = ['WHEY01', 'CREA01', 'MULT01', 'OMEG01', 'PRET01', 'JOIN01'];
    for (const sku of skus) {
      await expect(page.getByText(sku)).toBeVisible({ timeout: 10_000 });
    }
  });

  test('LOJA-01: each product shows name, description and price', async ({ page }) => {
    await expect(page.getByText('Proteína Whey')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/A partir de R\$/i).first()).toBeVisible();
  });

  test('LOJA-02: each product has external buy link', async ({ page }) => {
    const buyLinks = page.getByRole('link', { name: /Comprar no site →/i });
    await expect(buyLinks.first()).toBeVisible({ timeout: 10_000 });
    const count = await buyLinks.count();
    expect(count).toBe(6);
  });

  test('LOJA-02: buy links open external site (have target=_blank)', async ({ page }) => {
    const firstLink = page.getByRole('link', { name: /Comprar no site →/i }).first();
    await expect(firstLink).toHaveAttribute('target', '_blank');
    await expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('bottom nav is visible on loja page', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Loja' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('link', { name: 'Hoje' })).toBeVisible();
  });

  test('unauthenticated user accessing /loja redirects to /login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/loja');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
