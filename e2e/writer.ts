import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test as base, type Locator, type Page } from '@playwright/test';
import { projectStorageKey } from '../src/adapters/local-storage-project-store';
import type { Opening } from '../src/test-helpers/drivers/driver';
import {
  openingANewProjectOn,
  playwrightDriver,
  playwrightReads,
} from '../src/test-helpers/drivers/playwright.driver';
import type { SeededProject } from '../src/test-helpers/seed/seed';
import { projectSeesOn, type ProjectSees } from '../src/ui/project/project.dsl';
import { journeyOn, type Journey } from './journey.dsl';

export interface ContrastFinding {
  readonly target: string;
  readonly message: string;
}

export interface Fixture extends Journey {
  readonly sees: ProjectSees;
  contrastViolations(): Promise<readonly ContrastFinding[]>;
  readonly theHeaderHeading: Locator;
  opensWatchingTheGraph(): Promise<readonly string[]>;
  descriptionOfTheCard(piece: string): Promise<string>;
  theKeysLine(): Promise<string>;
}

const openingOn = (page: Page): Opening => ({
  fresh: () => openingANewProjectOn(page),
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
    sees: projectSeesOn(driver, reads),

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

    theHeaderHeading: driver.theHeaderHeading,
    opensWatchingTheGraph: () => driver.opensWatchingTheGraph(),
  };
};

export const test = base.extend<{ writer: Fixture; treeRoot: 'main' | 'page' }>({
  treeRoot: ['main', { option: true }],
  page: async ({ page }, use, testInfo) => {
    const dir = process.env.COVERAGE_DIR;
    if (dir === undefined) {
      await use(page);
      return;
    }
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
    try {
      await use(page);
    } finally {
      const coverage = await page.coverage.stopJSCoverage();
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, `${testInfo.testId}.json`), JSON.stringify(coverage));
    }
  },
  writer: async ({ page, treeRoot }, use) => {
    await use(fixtureOn(page, treeRoot));
  },
});

export { expect } from '@playwright/test';
