import { expect, test } from '@playwright/test';
test.describe('theme behavior',()=>{
  test.use({colorScheme:'light'});
  test('uses the OS preference first and persists an explicit choice',async({page,context})=>{await context.clearCookies();await page.goto('/en');await expect(page.locator('html')).toHaveAttribute('data-theme','light');await page.getByRole('button',{name:/dark mode/i}).first().click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.goto('/ar-sa');await expect(page.locator('html')).toHaveAttribute('data-theme','dark')});
  test('has the critical accessibility landmarks',async({page})=>{await page.goto('/en');await expect(page.locator('main')).toHaveCount(1);await expect(page.getByRole('navigation').first()).toBeVisible();await expect(page.getByRole('link',{name:/skip to content/i})).toHaveAttribute('href','#main')});
});
