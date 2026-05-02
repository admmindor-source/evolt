import { test, expect } from '@playwright/test';
import { signUpViaUI, loginViaUI, generateTestEmail } from './helpers/auth';

test.describe('Login flow (AUTH-02)', () => {
  test('valid credentials log in and redirect to /home', async ({ page }) => {
    const { email, password } = await signUpViaUI(page);
    // Logout (defensive — signup may already redirect to /onboarding)
    await page.goto('/');
    await page.context().clearCookies();
    await loginViaUI(page, email, password, /\/(home|onboarding)/);
    expect(page.url()).toMatch(/\/(home|onboarding)/);
  });

  test('invalid credentials show generic error (no user enumeration)', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(generateTestEmail());
    await page.getByLabel('Senha').fill('WrongPass123');
    await page.getByRole('button', { name: /Entrar/i }).click();
    await expect(page.getByText(/E-mail ou senha incorretos/i)).toBeVisible({ timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('login with safe ?next=/onboarding redirects there', async ({ page }) => {
    const { email, password } = await signUpViaUI(page);
    await page.context().clearCookies();
    await page.goto('/login?next=/onboarding');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha').fill(password);
    await Promise.all([
      page.waitForURL(/\/onboarding/, { timeout: 15_000 }),
      page.getByRole('button', { name: /Entrar/i }).click(),
    ]);
    expect(page.url()).toMatch(/\/onboarding$/);
  });

  test('login with malicious ?next=//evil.com falls back to /home', async ({ page }) => {
    const { email, password } = await signUpViaUI(page);
    await page.context().clearCookies();
    await page.goto('/login?next=//evil.com/x');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha').fill(password);
    await Promise.all([
      page.waitForURL(/\/home/, { timeout: 15_000 }),
      page.getByRole('button', { name: /Entrar/i }).click(),
    ]);
    expect(page.url()).toMatch(/\/home$/);
    expect(page.url()).not.toContain('evil.com');
  });
});
