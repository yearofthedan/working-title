import { expect } from './writer';
import { test, waitForTheFirstVersionToControl, waitForWaiting } from './private-build';

const summary = "A widow hunts the man who sank her husband's ship";

test('a new version waits while the tab is open', async ({ writer, page, build }) => {
  await writer.opensANewProject();
  await writer.types(summary, { piece: 'The story', facet: 'One-sentence summary' });
  await waitForTheFirstVersionToControl(page);
  await page.evaluate(() => {
    Object.assign(window, { controllerChanges: 0 });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      Object.assign(window, {
        controllerChanges: Number(Reflect.get(window, 'controllerChanges')) + 1,
      });
    });
  });

  await build.publishNewVersion();
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });
  await waitForWaiting(page);

  expect(await page.evaluate(() => Reflect.get(window, 'controllerChanges'))).toBe(0);
  expect(await page.title()).toBe('working-title');
  await writer.sees.readsOnTheCard('The story', 'One-sentence summary', summary);
});
