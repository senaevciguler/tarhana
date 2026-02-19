import { test, expect } from '@playwright/test';

test('language switcher should switch languages and persist choice', async ({ page }) => {
  await page.goto('http://localhost:4200');

  // Wait for content to load
  await page.waitForSelector('h1');

  // Check default (SV)
  await expect(page.locator('h1')).toContainText('Traditionell Tarhana — Nu skapad i Sverige');

  // Switch to EN
  await page.click('button:has-text("EN")');
  await expect(page.locator('h1')).toContainText('Traditional Tarhana — Now Crafted in Sweden');

  // Reload and check persistence
  await page.reload();
  await expect(page.locator('h1')).toContainText('Traditional Tarhana — Now Crafted in Sweden');

  // Switch back to SV
  await page.click('button:has-text("SV")');
  await expect(page.locator('h1')).toContainText('Traditionell Tarhana — Nu skapad i Sverige');
});
