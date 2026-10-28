import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [width, file, ...options] = process.argv.slice(2);

const at = options.indexOf('--load-storage');
const entries =
  at === -1
    ? []
    : JSON.parse(readFileSync(options[at + 1], 'utf8')).origins.flatMap(
        ({ localStorage: held }) => held,
      );

const clicks = options.flatMap((option, index) =>
  option === '--click' ? [options[index + 1]] : [],
);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
});

await page.addInitScript((items) => {
  for (const { name, value } of items) localStorage.setItem(name, value);
}, entries);

await page.goto('http://localhost:4174');
await page.getByRole('group').first().waitFor();
for (const piece of clicks) {
  await page.getByRole('heading', { name: piece }).click();
}
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.allSettled(document.getAnimations().map((one) => one.finished)));
await page.mouse.move(0, 0);
await page.screenshot({ path: file, fullPage: true });
await browser.close();
