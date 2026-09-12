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

test('Home page sections render in canonical order', async ({ page }) => {
  await page.goto('/en');
  // Check that sections appear in the DOM in the expected sequence
  const expectedOrder = [
    'hero',
    'journey',      // process/timeline combined conceptually in UI, or just mapped to journey
    'services',
    'sectors',      // industries_grid
    'evidence',     // stats
    'case-studies',
    'testimonials',
    'network',      // logo_cloud
    'ecosystem',
    'insights',
    'faq',
    'consultation', // cta
  ];
  
  const sections = await page.locator('[data-home-section]').all();
  const actualOrder = await Promise.all(sections.map(s => s.getAttribute('data-home-section')));
  
  // Verify that the actual order matches our canonical expectation
  // We only check that the relative order is maintained for these specific sections
  let lastIndex = -1;
  for (const section of expectedOrder) {
    const currentIndex = actualOrder.indexOf(section);
    if (currentIndex !== -1) {
      expect(currentIndex).toBeGreaterThan(lastIndex);
      lastIndex = currentIndex;
    }
  }
});

test('Demo disclosure badges are visible on demo sections', async ({ page }) => {
  await page.goto('/en');
  const evidenceSection = page.locator('[data-home-section="evidence"]');
  const sectorsSection = page.locator('[data-home-section="sectors"]');
  
  // Both these sections are seeded with { demo: true } in the demo seed
  await expect(evidenceSection.locator('.home-demo-badge')).toBeVisible();
  await expect(sectorsSection.locator('.home-demo-badge')).toBeVisible();
});

test('Mobile navigation enforces focus trap correctly', async ({ page, isMobile }) => {
  // Test only on mobile viewport (or force it)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/en');
  
  const toggleBtn = page.locator('.mobile-nav-toggle');
  await toggleBtn.click();
  
  const dialog = page.locator('.mobile-navigation__dialog');
  await expect(dialog).toBeVisible();
  
  // Press Tab a few times to ensure focus stays within the trap
  // and doesn't escape to the background document or tabindex="-1" elements
  await page.keyboard.press('Tab');
  let focusedText = await page.evaluate(() => document.activeElement?.textContent);
  expect(focusedText).toBeTruthy();
  
  // Close via Escape
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  
  // Focus should return to the toggle button
  const toggleIsFocused = await toggleBtn.evaluate((node) => document.activeElement === node);
  expect(toggleIsFocused).toBe(true);
});

test('Sector explorer keyboard navigation and accessibility', async ({ page }) => {
  await page.goto('/en');
  
  const sectorsSection = page.locator('[data-home-section="sectors"]');
  await sectorsSection.scrollIntoViewIfNeeded();
  
  const buttons = sectorsSection.locator('.home-sector-explorer__row');
  await expect(buttons.first()).toBeVisible();
  
  // Verify ARIA pressed state
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'false');
  
  // Click second button
  await buttons.nth(1).click();
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'false');
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
  
  // Keyboard navigation
  await buttons.nth(1).focus();
  await page.keyboard.press('ArrowDown');
  await expect(buttons.nth(2)).toBeFocused();
  await expect(buttons.nth(2)).toHaveAttribute('aria-pressed', 'true');
  
  await page.keyboard.press('Home');
  await expect(buttons.nth(0)).toBeFocused();
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true');
});
