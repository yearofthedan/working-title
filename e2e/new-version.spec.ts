import type { Page } from '@playwright/test';
import { expect } from './writer';
import { test } from './private-build';

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
  await waitForTheFirstVersionToControl(page);
  expect((await registrationOf(page)).waiting).toBeNull();

  await build.publishNewVersion();
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });

  await waitForWaiting(page);
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
