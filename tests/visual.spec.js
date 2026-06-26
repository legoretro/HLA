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
  await page.evaluate(() => {
    window.hlaQuestGame.scene.getScene('LessonScene').renderChapter(1);
  });
  await page.waitForTimeout(400);
  await page.mouse.click(1010, 245);
  await page.waitForTimeout(300);
  const modalState = await page.evaluate(() => {
    const scene = window.hlaQuestGame.scene.getScene('LessonScene');
    const portrait = scene.modalObjects[2];
    const texture = scene.textures.get('scientist-1').getSourceImage();
    return {
      canvasObjects: scene.modalObjects.length,
      mediaObjects: scene.modalDomObjects.length,
      portraitRatio: portrait.displayWidth / portrait.displayHeight,
      sourceRatio: texture.width / texture.height
    };
  });
  expect(modalState.canvasObjects).toBeGreaterThan(5);
  expect(modalState.mediaObjects).toBeGreaterThan(0);
  expect(Math.abs(modalState.portraitRatio - modalState.sourceRatio)).toBeLessThan(0.01);
  const screenshot = await page.screenshot();
  expect(screenshot.length).toBeGreaterThan(10000);
});

test('notes popup lists audio files without clipping', async ({ page }) => {
  await page.goto('./');
  await page.locator('canvas').waitFor();
  await page.waitForTimeout(500);
  await page.mouse.click(1062, 42);
  await page.waitForTimeout(300);

  const bounds = await page.evaluate(() => {
    const scene = window.hlaQuestGame.scene.getScene('LessonScene');
    const [, panel, , body, close] = scene.modalObjects;
    const plain = bounds => ({
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom
    });
    return {
      panel: plain(panel.getBounds()),
      body: plain(body.getBounds()),
      close: plain(close.getBounds())
    };
  });

  expect(bounds.body.left).toBeGreaterThan(bounds.panel.left + 20);
  expect(bounds.body.right).toBeLessThan(bounds.panel.right - 20);
  expect(bounds.body.top).toBeGreaterThan(bounds.panel.top + 50);
  expect(bounds.body.bottom).toBeLessThan(bounds.close.top - 12);
});

test('scene 2 uploaded voiceover file is available', async ({ page }) => {
  const response = await page.goto('./assets/audio/scientist-1/scene-02-general-hla.mp3');
  expect(response.status()).toBe(200);
});

test('uploaded chromosome image is available', async ({ page }) => {
  const response = await page.goto('./assets/uploads/chromosome-6-reference.png');
  expect(response.status()).toBe(200);
});

test('next button click sound is available', async ({ page }) => {
  const response = await page.goto('./assets/audio/ui/next-click.wav');
  expect(response.status()).toBe(200);
});

test('background adventure music is available', async ({ page }) => {
  const response = await page.goto('./assets/audio/ui/adventure-walk-loop.wav');
  expect(response.status()).toBe(200);
});

test('back button uses the UI click path', async ({ page }) => {
  await page.goto('./');
  await page.locator('canvas').waitFor();
  await page.evaluate(() => {
    const scene = window.hlaQuestGame.scene.getScene('LessonScene');
    scene.renderChapter(1);
    window.__hlaClickCount = 0;
    scene.playUiClick = () => {
      window.__hlaClickCount += 1;
    };
  });
  await page.waitForTimeout(300);
  await page.mouse.click(1024, 557);
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => {
    const scene = window.hlaQuestGame.scene.getScene('LessonScene');
    return {
      clicks: window.__hlaClickCount,
      currentIndex: scene.currentIndex
    };
  });
  expect(state).toEqual({ clicks: 1, currentIndex: 0 });
});
