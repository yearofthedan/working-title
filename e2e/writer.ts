import { test as base, type Locator, type Page } from '@playwright/test';
import { fieldsOn, linesOf, type AppScope } from '../src/test-helpers/scope';

export interface Writer {
  readonly scope: AppScope;
  opensTheApp(): Promise<void>;
  reloads(): Promise<void>;
  readonly theAppsName: Locator;
}

const writerOn = (page: Page): Writer => {
  const scope: AppScope = {
    fresh: async () => {
      await page.goto('/');
    },
    reload: async () => {
      await page.reload();
    },
    ...fieldsOn(page),
    tree: async () => linesOf(await page.getByRole('main').ariaSnapshot()),
  };

  return {
    scope,

    opensTheApp: async () => {
      await page.goto('/');
    },

    reloads: async () => {
      await page.reload();
    },

    theAppsName: page.getByRole('heading', { name: 'working-title' }),
  };
};

export const test = base.extend<{ writer: Writer }>({
  writer: async ({ page }, use) => {
    await use(writerOn(page));
  },
});

export { expect } from '@playwright/test';
