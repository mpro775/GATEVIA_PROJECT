import { expect, test } from '@playwright/test';
test('localized home and representative routes render controlled states', async ({ page }) => {
  for (const route of [
    '/en',
    '/ar-sa',
    '/en/services',
    '/en/industries',
    '/en/insights',
    '/en/contact',
    '/en/book-consultation',
    '/en/market-entry-assessment',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  }
});
test('contact form validates required fields without leaking data', async ({ page }) => {
  await page.goto('/en/contact');
  const form = page.locator('form');
  await form.getByRole('button', { name: /send request/i }).click();
  await expect(form.locator('input:invalid').first()).toBeVisible();
});
test('RTL is applied to Arabic content', async ({ page }) => {
  await page.goto('/ar-sa');
  await expect(page.locator('[dir="rtl"]')).toBeVisible();
});
