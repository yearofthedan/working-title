import { test as base, type Page } from '@playwright/test';

// A closure over `page`, not a class holding `this.page`: lint restricts Page's
// selector actions by the name `page`, which `this.page` does not match.
const writerOn = (page: Page) => ({
  opensTheApp: async () => {
    await page.goto('/');
  },

  reloads: async () => {
    await page.reload();
  },

  theAppsName: page.getByRole('heading', { name: 'working-title' }),
});

export type Writer = ReturnType<typeof writerOn>;

export const test = base.extend<{ writer: Writer }>({
  writer: async ({ page }, use) => {
    await use(writerOn(page));
  },
});

export { expect } from '@playwright/test';
