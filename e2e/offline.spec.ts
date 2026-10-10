import { expect, test, type BrowserContext, type Page, type Response } from '@playwright/test';

// Given the app was loaded once while online, the writer goes offline.
async function loadOnceThenGoOffline(page: Page, context: BrowserContext) {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  const reachable = await page.evaluate(() =>
    fetch('/not-precached').then(
      () => true,
      () => false,
    ),
  );
  expect(reachable, 'the network is cut').toBe(false);
}

test('the shell opens offline', async ({ page, context }) => {
  await loadOnceThenGoOffline(page, context);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'working-title' })).toBeVisible();
});

test('the fonts render offline, because they are precached', async ({ page, context }) => {
  await loadOnceThenGoOffline(page, context);
  const fonts: Response[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.woff2')) fonts.push(response);
  });
  await page.reload();
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
