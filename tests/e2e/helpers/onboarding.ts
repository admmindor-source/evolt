import { type Page, expect } from '@playwright/test';

/**
 * Completes the full 3-step onboarding via UI.
 * Assumes user is already authenticated and on /onboarding/1.
 * Reusable by Phase 3 and Phase 4 E2E tests.
 */
export async function completeOnboardingViaUI(page: Page): Promise<void> {
  await page.waitForURL(/\/onboarding\/1/, { timeout: 15_000 });

  // Step 1: physical data
  await page.getByLabel('Idade').fill('28');
  await page.selectOption('select[name="sex"]', 'masculino');
  await page.getByLabel('Peso (kg)').fill('80');
  await page.getByLabel('Altura (cm)').fill('178');

  await Promise.all([
    page.waitForURL(/\/onboarding\/2/, { timeout: 15_000 }),
    page.getByRole('button', { name: /Continuar/i }).click(),
  ]);

  // Step 2: training context
  await page.selectOption('select[name="goal"]', 'hipertrofia');
  await page.selectOption('select[name="training_level"]', 'intermediario');
  await page.getByLabel('Dias de treino por semana').fill('4');
  await page.getByLabel('Minutos por sessão').fill('60');

  await Promise.all([
    page.waitForURL(/\/onboarding\/3/, { timeout: 15_000 }),
    page.getByRole('button', { name: /Continuar/i }).click(),
  ]);

  // Step 3: supplements (none selected — just submit)
  await Promise.all([
    page.waitForURL(/\/onboarding\/conclusao/, { timeout: 15_000 }),
    page.getByRole('button', { name: /Concluir/i }).click(),
  ]);

  await expect(page).toHaveURL(/\/onboarding\/conclusao/);
}
