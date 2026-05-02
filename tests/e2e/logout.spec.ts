import { test, expect } from '@playwright/test';
import { signUpViaUI } from './helpers/auth';

test.describe('Logout flow (AUTH-04)', () => {
  test('logout clears session and protects /home again', async ({ page, context }) => {
    await signUpViaUI(page);
    await page.goto('/home');
    expect(page.url()).toMatch(/\/home/);

    // Click "Sair" button (form action="/logout" method="post")
    await Promise.all([
      page.waitForURL((url) => url.pathname === '/' || url.pathname === '/login', { timeout: 10_000 }),
      page.getByRole('button', { name: /Sair/i }).click(),
    ]);

    // Try to revisit /home — must redirect to /login
    await page.goto('/home');
    expect(page.url()).toMatch(/\/login/);

    // Supabase auth cookies must be cleared
    const cookies = await context.cookies();
    const sbAuth = cookies.filter((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    expect(sbAuth.length, 'all sb-*-auth-token cookies must be cleared').toBe(0);
  });
});
