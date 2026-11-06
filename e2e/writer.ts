import AxeBuilder from '@axe-core/playwright';
import { expect, test as base, type Locator, type Page } from '@playwright/test';
import { projectStorageKey } from '../src/adapters/local-storage-project-store';
import type { Opening } from '../src/test-helpers/driver';
import { playwrightDriver, playwrightReads } from '../src/test-helpers/playwright.driver';
import type { SeededProject } from '../src/test-helpers/seed';
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
  descriptionOfTheCard(piece: string): Promise<string>;
  theKeysLine(): Promise<string>;
}

const openingOn = (page: Page): Opening => ({
  fresh: async () => {
    await page.goto('/');
  },
  reopen: async () => {
    await page.goto('/');
  },
});

const startingFrom =
  (page: Page) =>
  async (project: SeededProject): Promise<void> => {
    await page.goto('/');
    await page.evaluate((stored) => localStorage.setItem(stored.key, stored.project), {
      key: projectStorageKey,
      project: JSON.stringify(project),
    });
    await page.goto('/');
  };

const fixtureOn = (page: Page, treeRoot: 'main' | 'page'): Fixture => {
  const driver = playwrightDriver(page, treeRoot);
  const reads = playwrightReads(page);

  return {
    ...journeyOn(driver, openingOn(page), startingFrom(page)),
    sees: seesOn(driver, reads),

    contrastViolations: async () => {
      expect(await reads.drawn(), 'the graph is drawn').not.toHaveLength(0);
      const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      return violations.flatMap((violation) =>
        violation.nodes.map((node) => ({
          target: node.target.join(' '),
          message: node.failureSummary ?? violation.help,
        })),
      );
    },

    descriptionOfTheCard: async (piece) => {
      const client = await page.context().newCDPSession(page);
      const { nodes } = await client.send('Accessibility.getFullAXTree');
      await client.detach();
      const node = nodes.find((one) => one.role?.value === 'group' && one.name?.value === piece);
      if (node === undefined) throw new Error(`${piece}'s card is not in the accessibility tree`);
      return node.description?.value ?? '';
    },

    theKeysLine: async () => {
      const [card] = (await reads.drawn()).filter((piece) => piece.current);
      if (card === undefined) throw new Error('the graph draws no current piece');
      await driver.focus('group', card.name);
      const line = (await driver.tree()).find((one) => one.trim().startsWith('- paragraph:'));
      if (line === undefined) throw new Error(`${card.name}'s card prints no keys line`);
      return line.trim();
    },

    theAppsName: driver.theAppsName,
    opensWatchingTheGraph: () => driver.opensWatchingTheGraph(),
  };
};

export const test = base.extend<{ writer: Fixture; treeRoot: 'main' | 'page' }>({
  treeRoot: ['main', { option: true }],
  writer: async ({ page, treeRoot }, use) => {
    await use(fixtureOn(page, treeRoot));
  },
});

export { expect } from '@playwright/test';
