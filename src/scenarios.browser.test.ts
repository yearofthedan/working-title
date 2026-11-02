import { describe, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { Driver } from './test-helpers/driver';
import { readsOnThePage } from './test-helpers/graph-page';
import type { RawGlob } from './test-helpers/raw-glob';
import { readScenarioFile } from './test-helpers/scenario-file';
import { playScenarios, type Runner, type ScenarioTier } from './test-helpers/play';
import { openTheApp } from './test-helpers/the-app';
import { vitestBrowserDriver } from './test-helpers/vitest-browser.driver';
import { cardSeesOn, cardSteps, cardWriterOn } from './ui/card/card.dsl';
import { stageTheCard } from './ui/card/card.harness';
import { graphSteps, seesOn, writerOn } from './ui/graph/graph.dsl';
import { stageTheGraph, stageTheSeededGraph } from './ui/graph/graph.harness';

declare const __SCENARIO_APPROVE__: string;

const files = (import.meta as unknown as RawGlob).glob('/src/**/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const cardTier: ScenarioTier = {
  steps: (driver: Driver) => cardSteps(cardWriterOn(driver, stageTheCard), cardSeesOn(driver)),
};

const graphTier: ScenarioTier = {
  steps: (driver: Driver) =>
    graphSteps(
      writerOn(driver, { fresh: stageTheGraph, reopen: openTheApp }, stageTheSeededGraph),
      seesOn(driver, readsOnThePage()),
    ),
};

const tiers: Readonly<Record<string, ScenarioTier>> = {
  'src/ui/card/': cardTier,
  'src/ui/graph/': graphTier,
};

const tierFor = (path: string): ScenarioTier => {
  const folder = path.slice(0, path.indexOf('scenarios/'));
  const tier = tiers[folder];
  if (tier === undefined) throw new Error(`no tier stages the scenarios in ${folder}`);
  return tier;
};

const besideTheGraph = 'src/ui/graph/scenarios/beside-the-graph.approved.md';

// shortcut: this one file's tree reads the whole page, because the panel it records sits outside main; every other file stays rooted at main.
const driverFor = (path: string): Driver =>
  path === besideTheGraph ? vitestBrowserDriver(undefined, 'page') : vitestBrowserDriver();

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
        const driver = driverFor(path);
        await playScenarios({ path, text }, runnerFor(driver, approving), tier.steps(driver), {
          only: behaviour,
          ...(approving ? { approve: true } : {}),
        });
      });
    }
  });
}
