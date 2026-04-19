const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:4200');
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: 'verification/hero_desktop.png' });

  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4200');
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: 'verification/hero_mobile.png' });

  await browser.close();
})();
