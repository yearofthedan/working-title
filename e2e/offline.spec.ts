import type { BrowserContext, Page, Response } from '@playwright/test';
import { expect, test, type Writer } from './writer';

async function loadOnceThenGoOffline(writer: Writer, page: Page, context: BrowserContext) {
  await writer.opensTheApp();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  // Without this, a setOffline that stopped cutting the network would let both tests pass online.
  const reachable = await page.evaluate(() =>
    fetch('/not-precached').then(
      () => true,
      () => false,
    ),
  );
  expect(reachable, 'the network is cut').toBe(false);
}

test('the shell opens offline', async ({ writer, page, context }) => {
  await loadOnceThenGoOffline(writer, page, context);
  await writer.reloads();
  await expect(writer.theAppsName).toBeVisible();
});

test('the fonts render offline, because they are precached', async ({ writer, page, context }) => {
  await loadOnceThenGoOffline(writer, page, context);
  const fonts: Response[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.woff2')) fonts.push(response);
  });
  await writer.reloads();
  const statuses = await page.evaluate(async () =>
    Promise.all(
      ['Literata Variable', 'Inter Variable'].map(async (family) =>
        (await document.fonts.load(`1em "${family}"`)).map((face) => face.status),
      ),
    ),
  );
  expect(statuses).toEqual([['loaded'], ['loaded']]);
  expect(fonts.map((font) => font.fromServiceWorker())).toEqual([true, true]);
});
