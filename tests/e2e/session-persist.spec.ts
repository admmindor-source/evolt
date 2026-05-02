import { test, expect } from '@playwright/test';
import { signUpViaUI } from './helpers/auth';

test.describe('Session persistence (AUTH-03)', () => {
  test('session survives page reload', async ({ page }) => {
    const { email } = await signUpViaUI(page);
    // Navigate to /home (signup may have redirected to /onboarding — for placeholder we accept either)
    await page.goto('/home');
    expect(page.url()).toMatch(/\/home/);

    await page.reload({ waitUntil: 'networkidle' });
    expect(page.url(), 'session must survive reload').toMatch(/\/home/);
    // Must NOT have been redirected back to /login
    expect(page.url()).not.toContain('/login');
  });

  test('protected route /home redirects unauthenticated user to /login?next=/home', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/home');
    expect(page.url()).toMatch(/\/login\?next=%2Fhome/);
  });
});
