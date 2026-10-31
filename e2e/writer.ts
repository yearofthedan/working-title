import AxeBuilder from '@axe-core/playwright';
import { expect, test as base, type Locator, type Page } from '@playwright/test';
import { playwrightDriver } from '../src/test-helpers/playwright.driver';
import { seesOn, type Sees } from '../src/ui/graph/graph.dsl';
import { journeyOn, type Journey } from './journey.dsl';

export interface ContrastFinding {
  readonly target: string;
  readonly message: string;
}

export interface Fixture extends Journey {
  readonly sees: Sees;
  contrastViolations(): Promise<readonly ContrastFinding[]>;
  readonly theAppsName: Locator;
  opensWatchingTheGraph(): Promise<readonly string[]>;
}

const fixtureOn = (page: Page): Fixture => {
  const driver = playwrightDriver(page);

  return {
    ...journeyOn(driver),
    sees: seesOn(driver),

    contrastViolations: async () => {
      expect(await driver.drawn(), 'the graph is drawn').not.toHaveLength(0);
      const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      return violations.flatMap((violation) =>
        violation.nodes.map((node) => ({
          target: node.target.join(' '),
          message: node.failureSummary ?? violation.help,
        })),
      );
    },

    theAppsName: driver.theAppsName,
    opensWatchingTheGraph: () => driver.opensWatchingTheGraph(),
  };
};

export const test = base.extend<{ writer: Fixture }>({
  writer: async ({ page }, use) => {
    await use(fixtureOn(page));
  },
});

export { expect } from '@playwright/test';
