import { test, expect } from '@playwright/test';
import { signUpViaUI } from './helpers/auth';
import { completeOnboardingViaUI } from './helpers/onboarding';

test.describe('Onboarding flow (ONB-01 to ONB-06)', () => {
  test('signup redirects to /onboarding/1 for new users', async ({ page }) => {
    await signUpViaUI(page);
    await expect(page).toHaveURL(/\/onboarding\/1/, { timeout: 15_000 });
  });

  test('complete 3-step onboarding arrives at /onboarding/conclusao', async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await expect(page).toHaveURL(/\/onboarding\/conclusao/);
  });

  test('conclusao does not show empty state — has profile summary', async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await expect(page.locator('text=Seu perfil está pronto')).toBeVisible({ timeout: 10_000 });
  });

  test('conclusao shows daily routine blocks', async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    await expect(page.locator('text=Sua rotina de hoje')).toBeVisible({ timeout: 10_000 });
  });

  test('conclusao has CTA link to /home', async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);
    const cta = page.getByRole('link', { name: /Começar/i });
    await expect(cta).toBeVisible({ timeout: 10_000 });
    await expect(cta).toHaveAttribute('href', '/home');
  });

  test('step 1 form shows pre-filled values when navigating back', async ({ page }) => {
    await signUpViaUI(page);
    await page.waitForURL(/\/onboarding\/1/);

    await page.getByLabel('Idade').fill('35');
    await page.selectOption('select[name="sex"]', 'feminino');
    await page.getByLabel('Peso (kg)').fill('65');
    await page.getByLabel('Altura (cm)').fill('165');

    await Promise.all([
      page.waitForURL(/\/onboarding\/2/, { timeout: 15_000 }),
      page.getByRole('button', { name: /Continuar/i }).click(),
    ]);

    await page.goto('/onboarding/1');
    await page.waitForURL(/\/onboarding\/1/);

    await expect(page.getByLabel('Idade')).toHaveValue('35');
    await expect(page.getByLabel('Peso (kg)')).toHaveValue('65');
  });

  test('auth+no-onboarding accessing /home redirects to /onboarding/1 (middleware)', async ({ page }) => {
    await signUpViaUI(page);
    await page.waitForURL(/\/onboarding\/1/);

    await page.goto('/home');
    await expect(page).toHaveURL(/\/onboarding\/1/, { timeout: 10_000 });
  });

  test('auth+completed-onboarding accessing /onboarding/1 redirects to /home (middleware)', async ({ page }) => {
    await signUpViaUI(page);
    await completeOnboardingViaUI(page);

    await page.goto('/home');
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 });

    await page.goto('/onboarding/1');
    await expect(page).toHaveURL(/\/home/, { timeout: 10_000 });
  });

  test('step 1 validation rejects age below minimum', async ({ page }) => {
    await signUpViaUI(page);
    await page.waitForURL(/\/onboarding\/1/);
    await page.getByLabel('Idade').fill('10');
    await page.selectOption('select[name="sex"]', 'masculino');
    await page.getByLabel('Peso (kg)').fill('70');
    await page.getByLabel('Altura (cm)').fill('170');
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page).toHaveURL(/\/onboarding\/1/, { timeout: 5_000 });
  });
});
