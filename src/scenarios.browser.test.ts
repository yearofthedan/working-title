import { describe, it } from 'vite-plus/test';
import { projectStore } from './adapters/local-storage-project-store';
import { openProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import { browserScope } from './test-helpers/browser-scope';
import { readScenarioFile } from './test-helpers/scenario-file';
import { playScenarios } from './test-helpers/play';
import { renderFocus } from './ui/focus/focus';
import { focusPageActions } from './ui/focus/writer';

// Vite reads each file as raw text. Its client types are not wired into this project's
// tsconfig, so the shape the glob returns is declared here.
interface RawGlob {
  glob(
    pattern: string,
    options: { query: string; import: string; eager: true },
  ): Record<string, string>;
}

const files = (import.meta as unknown as RawGlob).glob('./**/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const theStoryOnScreen = async () => {
  document.body.replaceChildren();
  const main = document.createElement('main');
  document.body.append(main);
  renderFocus(main, await openProject(snowflakeExtended, projectStore()));
};

for (const [path, text] of Object.entries(files)) {
  describe(path, () => {
    for (const { behaviour } of readScenarioFile(text).scenarios) {
      it(behaviour, async () => {
        const scope = browserScope(theStoryOnScreen);
        await playScenarios(
          { path, text },
          { tree: async () => scope.tree() },
          focusPageActions(scope),
          {
            only: behaviour,
          },
        );
      });
    }
  });
}
