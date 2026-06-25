import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', message => console.log(`[browser:${message.type()}] ${message.text()}`));
page.on('pageerror', error => console.log(`[pageerror] ${error.message}`));
await page.goto(process.env.HLA_QUEST_URL || 'http://127.0.0.1:4173');
await page.waitForTimeout(1600);
const status = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  return {
    title: document.title,
    bodyText: document.body?.innerText || '',
    canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
    gameReady: Boolean(window.hlaQuestGame)
  };
});
console.log(JSON.stringify(status, null, 2));
await page.screenshot({ path: 'design/current-build-1280x720.png' });
await browser.close();
console.log('Saved design/current-build-1280x720.png');
