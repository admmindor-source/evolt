import { test, expect } from '@playwright/test';
import { signUpViaUI } from './helpers/auth';
import { completeOnboardingViaUI } from './helpers/onboarding';

test.describe('Evolução (PROG-01 to PROG-05)', () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await page.goto('/evolucao');
    await expect(page).toHaveURL(/\/evolucao/, { timeout: 10_000 });
  });

  test('PROG-01: /evolucao has weight log form', async ({ page }) => {
    await expect(page.getByLabel('Peso (kg)')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Registrar peso/i })).toBeVisible();
  });

  test('PROG-01: submitting weight form shows success message', async ({ page }) => {
    await page.getByLabel('Peso (kg)').fill('78.5');
    await page.getByRole('button', { name: /Registrar peso/i }).click();
    await expect(page.getByText(/Peso registrado com sucesso/i)).toBeVisible({ timeout: 10_000 });
  });

  test('PROG-03: logged weight appears in history list', async ({ page }) => {
    await page.getByLabel('Peso (kg)').fill('79.0');
    await page.getByRole('button', { name: /Registrar peso/i }).click();
    await expect(page.getByText(/Peso registrado com sucesso/i)).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByText(/79/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('PROG-03: weight history section is visible', async ({ page }) => {
    await expect(page.getByText(/Histórico de peso/i)).toBeVisible({ timeout: 10_000 });
  });

  test('PROG-02: photo upload section is visible', async ({ page }) => {
    await expect(page.getByText(/Adicionar foto de progresso/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Selecionar foto/i })).toBeVisible();
  });

  test('PROG-05: home shows weight CTA when no logs exist', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 });
    await expect(page.getByText(/Registrar →/i)).toBeVisible({ timeout: 10_000 });
  });

  test('PROG-05: home shows last weight after logging', async ({ page }) => {
    await page.getByLabel('Peso (kg)').fill('77.0');
    await page.getByRole('button', { name: /Registrar peso/i }).click();
    await expect(page.getByText(/Peso registrado com sucesso/i)).toBeVisible({ timeout: 10_000 });

    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 });
    await expect(page.getByText(/77/).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Ver histórico →/i)).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated user accessing /evolucao redirects to /login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/evolucao');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
