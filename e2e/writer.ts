import AxeBuilder from '@axe-core/playwright';
import { test as base, type Locator, type Page } from '@playwright/test';
import { fieldsOn, linesOf, stepsOn, type AppScope } from '../src/test-helpers/scope';

export interface ContrastFinding {
  readonly target: string;
  readonly message: string;
}

export interface Writer {
  readonly scope: AppScope;
  opensTheApp(): Promise<void>;
  reloads(): Promise<void>;
  contrastViolations(): Promise<readonly ContrastFinding[]>;
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
    ...stepsOn(page),
    press: async (key) => {
      await page.keyboard.press(key);
    },
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

    contrastViolations: async () => {
      await page.getByRole('main').getByRole('group').first().waitFor();
      const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      return violations.flatMap((violation) =>
        violation.nodes.map((node) => ({
          target: node.target.join(' '),
          message: node.failureSummary ?? violation.help,
        })),
      );
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
