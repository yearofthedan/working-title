import { describe, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import { browserScope } from './test-helpers/browser-scope';
import type { RawGlob } from './test-helpers/raw-glob';
import { readScenarioFile } from './test-helpers/scenario-file';
import { playScenarios, type Runner } from './test-helpers/play';
import { openTheApp, thePage } from './test-helpers/the-app';
import { focusPageActions } from './ui/focus/writer';

declare const __SCENARIO_APPROVE__: string;

const files = (import.meta as unknown as RawGlob).glob('/src/**/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const theStoryOnScreen = async () => {
  localStorage.clear();
  await openTheApp(await thePage(1440));
};

const runnerFor = (approving: boolean): Runner => {
  const scope = browserScope(theStoryOnScreen);
  return {
    tree: async () => scope.tree(),
    ...(approving
      ? {
          read: async (where: string) => browser.server.commands.readFile(where),
          write: async (where: string, text: string) => {
            await browser.server.commands.writeFile(where, text);
          },
        }
      : {}),
  };
};

for (const [key, text] of Object.entries(files)) {
  const path = key.replace(/^\//, '');
  const approving = __SCENARIO_APPROVE__ !== '' && __SCENARIO_APPROVE__ === path;
  if (__SCENARIO_APPROVE__ !== '' && !approving) continue;

  describe(path, () => {
    for (const { behaviour } of readScenarioFile(text).scenarios) {
      it(behaviour, async () => {
        const scope = browserScope(theStoryOnScreen);
        await playScenarios({ path, text }, runnerFor(approving), focusPageActions(scope), {
          only: behaviour,
          ...(approving ? { approve: true } : {}),
        });
      });
    }
  });
}
