import { describe, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { Driver } from './test-helpers/driver';
import { readsOnThePage } from './test-helpers/graph-page';
import type { RawGlob } from './test-helpers/raw-glob';
import { readScenarioFile } from './test-helpers/scenario-file';
import { playScenarios, type Runner } from './test-helpers/play';
import { thePage } from './test-helpers/staging';
import { openTheApp } from './test-helpers/the-app';
import { vitestBrowserDriver } from './test-helpers/vitest-browser.driver';
import { theCardTier, type ScenarioTier } from './ui/card/card.scenarios';
import { graphSteps, seesOn, writerOn } from './ui/graph/graph.dsl';

declare const __SCENARIO_APPROVE__: string;

const files = (import.meta as unknown as RawGlob).glob('/src/**/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const opensTheApp = async (): Promise<void> => {
  localStorage.clear();
  await thePage(1440);
  await openTheApp();
};

const graphTier: ScenarioTier = {
  stage: opensTheApp,
  steps: (driver: Driver) =>
    graphSteps(
      writerOn(driver, { fresh: opensTheApp, reopen: openTheApp }),
      seesOn(driver, readsOnThePage()),
    ),
};

const tiers: Readonly<Record<string, ScenarioTier>> = {
  'src/ui/card/': theCardTier,
  'src/ui/graph/': graphTier,
};

const tierFor = (path: string): ScenarioTier => {
  const folder = path.slice(0, path.indexOf('scenarios/'));
  const tier = tiers[folder];
  if (tier === undefined) throw new Error(`no tier stages the scenarios in ${folder}`);
  return tier;
};

const runnerFor = (driver: Driver, approving: boolean): Runner => ({
  tree: async () => driver.tree(),
  ...(approving
    ? {
        read: async (where: string) => browser.server.commands.readFile(where),
        write: async (where: string, text: string) => {
          await browser.server.commands.writeFile(where, text);
        },
      }
    : {}),
});

for (const [key, text] of Object.entries(files)) {
  const path = key.replace(/^\//, '');
  const approving = __SCENARIO_APPROVE__ !== '' && __SCENARIO_APPROVE__ === path;
  if (__SCENARIO_APPROVE__ !== '' && !approving) continue;
  const tier = tierFor(path);

  describe(path, () => {
    for (const { behaviour } of readScenarioFile(text).scenarios) {
      it(behaviour, async () => {
        const driver = vitestBrowserDriver();
        await playScenarios({ path, text }, runnerFor(driver, approving), tier.steps(driver), {
          only: behaviour,
          ...(approving ? { approve: true } : {}),
        });
      });
    }
  });
}
