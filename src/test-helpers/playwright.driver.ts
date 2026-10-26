import { type Locator, type Page } from '@playwright/test';
import { clicking, drawn, linesOf, typing, type ReloadingDriver } from './driver';

export interface PlaywrightDriver extends ReloadingDriver {
  readonly theAppsName: Locator;
}

export const playwrightDriver = (page: Page): PlaywrightDriver => ({
  fresh: async () => {
    await page.goto('/');
  },
  reopen: async () => {
    await page.goto('/');
  },
  reload: async () => {
    await page.reload();
  },
  press: async (key) => {
    await page.keyboard.press(key);
  },
  click: clicking(page),
  type: typing(page),
  drawn: async () => {
    await page.getByRole('main').getByRole('group').first().waitFor();
    return page.evaluate(drawn);
  },
  tree: async () => linesOf(await page.getByRole('main').ariaSnapshot()),
  theAppsName: page.getByRole('heading', { name: 'working-title' }),
});
