import { describe, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { Driver } from './driver';
import { playScenarios, type Runner } from './play';
import { readScenarioFile } from './scenario-file';
import type { StepAction } from './steps';

declare const __SCENARIO_APPROVE__: string;

const runnerFor = (driver: Driver, approving: boolean): Runner => ({
  tree: (markFocus) => driver.tree(markFocus),
  ...(approving
    ? {
        read: async (where: string) => browser.server.commands.readFile(where),
        write: async (where: string, text: string) => {
          await browser.server.commands.writeFile(where, text);
        },
      }
    : {}),
});

export const playScenarioFiles = (
  files: Record<string, string>,
  driver: () => Driver,
  steps: (driver: Driver) => Readonly<Record<string, StepAction>>,
): void => {
  for (const [key, text] of Object.entries(files)) {
    const path = key.replace(/^\//, '');
    const approving = __SCENARIO_APPROVE__ !== '' && __SCENARIO_APPROVE__ === path;
    if (__SCENARIO_APPROVE__ !== '' && !approving) continue;

    describe(path, () => {
      for (const { behaviour } of readScenarioFile(text).scenarios) {
        it(behaviour, async () => {
          const d = driver();
          await playScenarios({ path, text }, runnerFor(d, approving), steps(d), {
            only: behaviour,
            ...(approving ? { approve: true } : {}),
          });
        });
      }
    });
  }
};
