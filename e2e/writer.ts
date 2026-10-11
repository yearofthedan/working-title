import { test as base, type Locator, type Page } from '@playwright/test';
import { linesOf, type AppScope } from '../src/test-helpers/scope';

// A closure over `page`, not a class holding `this.page`: lint restricts Page's
// selector actions by the name `page`, which `this.page` does not match.
export interface Writer {
  readonly scope: AppScope;
  opensTheApp(): Promise<void>;
  reloads(): Promise<void>;
  readonly theAppsName: Locator;
}

const writerOn = (page: Page): Writer => {
  // The parts a scenario plays reach the page through this and nothing wider: a field by the
  // label a writer reads, and the page as Playwright prints it.
  const scope: AppScope = {
    fresh: async () => {
      await page.goto('/');
    },
    reload: async () => {
      await page.reload();
    },
    field: (label) => ({
      enter: async (text) => {
        await page.getByLabel(label).fill(text);
      },
    }),
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
