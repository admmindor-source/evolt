import { test, expect } from '@playwright/test';
import { signUpViaUI } from './helpers/auth';
import { completeOnboardingViaUI } from './helpers/onboarding';

test.describe('Profile screen (PROF-01 to PROF-03)', () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await page.goto('/perfil');
    await expect(page).toHaveURL(/\/perfil/, { timeout: 10_000 });
  });

  test('PROF-01: /perfil shows user name, email, and goal', async ({ page }) => {
    await expect(page.getByText('Test User')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/@/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Objetivo:/i)).toBeVisible({ timeout: 10_000 });
  });

  test('PROF-01: /perfil shows progress placeholder', async ({ page }) => {
    await expect(page.getByText(/Progresso/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/em breve/i)).toBeVisible({ timeout: 10_000 });
  });

  test('PROF-02: edit weight and save redirects back to /perfil', async ({ page }) => {
    await page.getByLabel('Peso atual (kg)').fill('82');
    await Promise.all([
      page.waitForURL(/\/perfil/, { timeout: 15_000 }),
      page.getByRole('button', { name: /Salvar alterações/i }).click(),
    ]);
    await expect(page).toHaveURL(/\/perfil/);
    await expect(page.getByLabel('Peso atual (kg)')).toHaveValue('82');
  });

  test('PROF-02: edit goal and save redirects back to /perfil', async ({ page }) => {
    await page.selectOption('select[name="goal"]', 'emagrecimento');
    await Promise.all([
      page.waitForURL(/\/perfil/, { timeout: 15_000 }),
      page.getByRole('button', { name: /Salvar alterações/i }).click(),
    ]);
    await expect(page).toHaveURL(/\/perfil/);
  });

  test('PROF-03: logout button clears session and redirects', async ({ page }) => {
    await Promise.all([
      page.waitForURL((url) => url.pathname === '/' || url.pathname === '/login', { timeout: 10_000 }),
      page.getByRole('button', { name: /Sair da conta/i }).click(),
    ]);
    await page.goto('/perfil');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('PROF-03: /perfil has help and about links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Ajuda/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('link', { name: /Sobre o app/i })).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user accessing /perfil redirects to /login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/perfil');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
