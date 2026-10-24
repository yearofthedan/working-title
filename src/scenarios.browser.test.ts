import { describe, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import { projectStore } from './adapters/local-storage-project-store';
import { openProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import { browserScope } from './test-helpers/browser-scope';
import { readScenarioFile } from './test-helpers/scenario-file';
import { playScenarios, type Runner } from './test-helpers/play';
import { renderFocus } from './ui/focus/focus';
import { focusPageActions } from './ui/focus/writer';

declare const __SCENARIO_APPROVE__: string;

interface RawGlob {
  glob(
    pattern: string,
    options: { query: string; import: string; eager: true },
  ): Record<string, string>;
}

const files = (import.meta as unknown as RawGlob).glob('/src/**/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const theStoryOnScreen = async () => {
  localStorage.clear();
  document.body.replaceChildren();
  const main = document.createElement('main');
  document.body.append(main);
  renderFocus(main, await openProject(snowflakeExtended, projectStore()));
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
