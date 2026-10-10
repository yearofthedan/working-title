import { test as base, type Page } from '@playwright/test';

export class Writer {
  constructor(private readonly page: Page) {}

  async opensTheApp(): Promise<void> {
    await this.page.goto('/');
  }

  async reloads(): Promise<void> {
    await this.page.reload();
  }

  get theAppsName() {
    return this.page.getByRole('heading', { name: 'working-title' });
  }
}

export const test = base.extend<{ writer: Writer }>({
  writer: async ({ page }, use) => {
    await use(new Writer(page));
  },
});

export { expect } from '@playwright/test';
