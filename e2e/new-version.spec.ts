import type { Page } from '@playwright/test';
import { expect } from './writer';
import { test } from './private-build';

const summary = "A widow hunts the man who sank her husband's ship";
const oldTitle = 'working-title';
const newTitle = 'working-title (new version)';

const registrationOf = (page: Page) =>
  page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      active: registration?.active?.scriptURL ?? null,
      waiting: registration?.waiting?.scriptURL ?? null,
      controller: navigator.serviceWorker.controller?.scriptURL ?? null,
    };
  });

const waitForTheFirstVersionToControl = async (page: Page): Promise<void> => {
  await expect
    .poll(async () => {
      const { active, controller } = await registrationOf(page);
      return active !== null && controller === active;
    })
    .toBe(true);
};

const waitForWaiting = async (page: Page): Promise<void> => {
  await expect.poll(async () => (await registrationOf(page)).waiting).not.toBeNull();
};

test('a new version waits while the tab is open', async ({ writer, page, build }) => {
  await writer.opensANewProject();
  await writer.types(summary, { piece: 'The story', facet: 'One-sentence summary' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await writer.reloads();
  await waitForTheFirstVersionToControl(page);

  const before = await registrationOf(page);
  expect(before.waiting).toBeNull();

  await build.publishNewVersion();
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });
  await waitForWaiting(page);

  const after = await registrationOf(page);
  expect(after.waiting).not.toBeNull();
  expect(after.active).toBe(before.active);
  expect(await page.title()).toBe(oldTitle);
  await writer.sees.readsOnTheCard('The story', 'One-sentence summary', summary);
});

test('a tab opened at first install moves to a new version when told to', async ({
  writer,
  page,
  build,
}) => {
  await writer.opensANewProject();
  await waitForTheFirstVersionToControl(page);

  await build.publishNewVersion();
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });
  await waitForWaiting(page);

  const changed = page.evaluate(() => {
    const { promise, resolve } = Promise.withResolvers<void>();
    navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
    return promise;
  });
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });
  await changed;
  await writer.reloads();

  expect(await page.title()).toBe(newTitle);
});
