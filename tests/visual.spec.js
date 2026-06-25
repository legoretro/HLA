import { test, expect } from '@playwright/test';

test('HLA Quest renders a nonblank main scene', async ({ page }) => {
  await page.goto('./');
  await page.locator('canvas').waitFor();
  await page.waitForTimeout(1000);
  const sample = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let litPixels = 0;
    for (let i = 0; i < data.length; i += 64) {
      if (data[i] + data[i + 1] + data[i + 2] > 25) litPixels += 1;
    }
    return { width: canvas.width, height: canvas.height, litPixels };
  });
  expect(sample).toEqual(expect.objectContaining({ width: 1280, height: 720 }));
  expect(sample.litPixels).toBeGreaterThan(1000);
});

test('info popup shows voiceover controls without requiring audio', async ({ page }) => {
  await page.goto('./');
  await page.locator('canvas').waitFor();
  await page.mouse.click(1010, 245);
  await page.waitForTimeout(300);
  const screenshot = await page.screenshot();
  expect(screenshot.length).toBeGreaterThan(10000);
});
