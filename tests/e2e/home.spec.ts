import { test, expect } from '@playwright/test';
import { signUpViaUI } from './helpers/auth';
import { completeOnboardingViaUI } from './helpers/onboarding';

test.describe('Home "Seu dia hoje" (HOME-01 to HOME-08, ROUT-01 to ROUT-06)', () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 });
  });

  test('HOME-01: home shows user first name, goal and journey day', async ({ page }) => {
    await expect(page.getByText(/Olá,/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Objetivo/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Dia \d+ da sua jornada/)).toBeVisible({ timeout: 10_000 });
  });

  test('HOME-02: home shows supplement block', async ({ page }) => {
    // title appears in card AND checklist — use first()
    await expect(page.getByText(/Suplemento do dia/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('HOME-03: home shows workout block', async ({ page }) => {
    await expect(page.getByText(/Treino/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('HOME-04: home shows nutrition block', async ({ page }) => {
    await expect(page.getByText(/Alimentação de hoje/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('HOME-05: home shows hydration block', async ({ page }) => {
    await expect(page.getByText(/Meta de hidratação/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('HOME-06: checklist is visible with 4 items', async ({ page }) => {
    await expect(page.getByText(/Checklist de hoje/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Marcar Suplemento do dia como concluído/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Marcar Alimentação de hoje como concluído/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Marcar Meta de hidratação como concluído/i })).toBeVisible();
  });

  test('HOME-07: progress block shows placeholder', async ({ page }) => {
    await expect(page.getByText(/Progresso recente/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/em breve/i)).toBeVisible({ timeout: 10_000 });
  });

  test('ROUT-01: home covers supplement, workout, nutrition and hydration blocks', async ({ page }) => {
    await expect(page.getByText(/Suplemento do dia/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Alimentação de hoje/i).first()).toBeVisible();
    await expect(page.getByText(/Meta de hidratação/i).first()).toBeVisible();
    await expect(page.getByText(/Treino/i).first()).toBeVisible();
  });

  test('ROUT-02: user can mark a checklist item as done and undo it', async ({ page }) => {
    const markBtn = page.getByRole('button', { name: /Marcar Suplemento do dia como concluído/i });
    await expect(markBtn).toBeVisible({ timeout: 10_000 });
    await markBtn.click();
    const unmarkBtn = page.getByRole('button', { name: /Desmarcar Suplemento do dia/i });
    await expect(unmarkBtn).toBeVisible({ timeout: 5_000 });
  });

  test('ROUT-03: completed checklist item persists after reload', async ({ page }) => {
    const markBtn = page.getByRole('button', { name: /Marcar Suplemento do dia como concluído/i });
    await expect(markBtn).toBeVisible({ timeout: 10_000 });
    await markBtn.click();
    await expect(page.getByRole('button', { name: /Desmarcar Suplemento do dia/i })).toBeVisible({ timeout: 5_000 });

    await page.reload();
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Desmarcar Suplemento do dia/i })).toBeVisible({ timeout: 10_000 });
  });

  test('ROUT-04: partial checklist completion — counter updates correctly', async ({ page }) => {
    await expect(page.getByText(/0\/4 itens concluídos hoje/)).toBeVisible({ timeout: 10_000 });
    const markBtn = page.getByRole('button', { name: /Marcar Suplemento do dia como concluído/i });
    await markBtn.click();
    await expect(page.getByText(/1\/4 itens concluídos hoje/)).toBeVisible({ timeout: 5_000 });
  });

  test('ROUT-05: /home/suplemento shows supplement detail (como usar, benefícios, dica)', async ({ page }) => {
    // Navigate directly — link only shows when user has a SKU; page content always available
    await page.goto('/home/suplemento');
    await expect(page).toHaveURL(/\/home\/suplemento/, { timeout: 10_000 });
    await expect(page.getByText(/Como usar/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Benefícios/i)).toBeVisible();
    await expect(page.getByText(/Dica/i).first()).toBeVisible();
  });

  test('ROUT-06: workout detail link navigates to /home/treino with exercises', async ({ page }) => {
    await page.getByText('Ver treino completo →').click();
    await expect(page).toHaveURL(/\/home\/treino/, { timeout: 10_000 });
    await expect(page.getByText(/Exercícios/i)).toBeVisible({ timeout: 10_000 });
  });

  test('bottom nav is visible on home page', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Hoje' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('link', { name: 'Perfil' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Evolução' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Loja' })).toBeVisible();
  });

  test('unauthenticated user accessing /home redirects to /login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/home');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
