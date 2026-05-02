import { type Page, expect } from '@playwright/test';

export function generateTestEmail(): string {
  const ts = Date.now();
  const rnd = Math.random().toString(36).slice(2, 8);
  // Use a domain reserved for tests (NOT a real domain). Supabase email confirmations
  // should be DISABLED in local config.toml so signup completes immediately.
  return `evolt-test+${ts}-${rnd}@example.com`;
}

export async function signUpViaUI(page: Page, opts?: { email?: string; password?: string }): Promise<{ email: string; password: string }> {
  const email = opts?.email ?? generateTestEmail();
  const password = opts?.password ?? 'TestPass123';

  await page.goto('/signup');
  await page.getByLabel('Nome completo').fill('Test User');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('WhatsApp').fill('+5511999999999');
  await page.getByLabel('Senha').fill(password);

  await Promise.all([
    page.waitForURL((url) => /\/(onboarding|home|login)/.test(url.pathname), { timeout: 15_000 }),
    page.getByRole('button', { name: /Criar conta|Criando/i }).click(),
  ]);

  return { email, password };
}

export async function loginViaUI(page: Page, email: string, password: string, expectRedirect: RegExp = /\/home/): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await Promise.all([
    page.waitForURL(expectRedirect, { timeout: 15_000 }),
    page.getByRole('button', { name: /Entrar|Entrando/i }).click(),
  ]);
}
