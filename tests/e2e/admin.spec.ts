import { test, expect } from '@playwright/test';
import { signUpViaUI, generateTestEmail } from './helpers/auth';
import { completeOnboardingViaUI } from './helpers/onboarding';
import { makeAdminByEmail } from './helpers/admin';

test.describe('Admin panel (ADM-01 to ADM-05)', () => {
  test('ADM-01: unauthenticated user accessing /admin redirects to /login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('ADM-01: non-admin user accessing /admin sees restricted message', async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await page.goto('/admin');
    await expect(page.getByText(/Acesso restrito/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/exclusiva para administradores/i)).toBeVisible();
  });

  test('ADM-01: restricted page has link back to app', async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await page.goto('/admin');
    await expect(page.getByRole('link', { name: /Voltar ao app/i })).toBeVisible({ timeout: 10_000 });
  });

  test.describe('Admin user', () => {
    let adminEmail: string;

    test.beforeEach(async ({ page }) => {
      adminEmail = generateTestEmail();
      await signUpViaUI(page, { email: adminEmail });
      await completeOnboardingViaUI(page);
      await makeAdminByEmail(adminEmail);
      // Reload to pick up admin status
      await page.goto('/admin');
      await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 });
    });

    test('ADM-02: admin sees users list page with header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Usuários/i })).toBeVisible({ timeout: 10_000 });
      // Should see at least the admin user themselves
      await expect(page.getByText(/usuário.*encontrado/i).first()).toBeVisible();
    });

    test('ADM-02: users page has filter controls (SKU, goal, date)', async ({ page }) => {
      await expect(page.getByRole('combobox').first()).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole('button', { name: /Filtrar/i })).toBeVisible();
    });

    test('ADM-03: funil page shows conversion steps', async ({ page }) => {
      await page.goto('/admin/funil');
      await expect(page.getByRole('heading', { name: /Funil de conversão/i })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Total de usuários/i)).toBeVisible();
      await expect(page.getByText(/Onboarding completo/i)).toBeVisible();
      await expect(page.getByText(/QR codes escaneados/i)).toBeVisible();
    });

    test('ADM-04: skus page shows onboarding rate and SKU chart', async ({ page }) => {
      await page.goto('/admin/skus');
      await expect(page.getByRole('heading', { name: /Ativações por SKU/i })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Taxa de onboarding/i)).toBeVisible();
    });

    test('ADM-05: recomendacoes page shows CTR data', async ({ page }) => {
      await page.goto('/admin/recomendacoes');
      await expect(page.getByRole('heading', { name: /Recomendações/i })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/CTR global/i)).toBeVisible();
    });

    test('ADM-01: admin nav has all section links', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Usuários' })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole('link', { name: 'Funil' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'SKUs' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Recs' })).toBeVisible();
      await expect(page.getByRole('link', { name: /← App/i })).toBeVisible();
    });
  });
});
