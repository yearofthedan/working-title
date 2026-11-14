import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { playScenarios, type Runner } from '../src/test-helpers/play';
import { readScenarioFile } from '../src/test-helpers/scenario-file';
import type { AppSees } from '../src/ui/app/app.dsl';
import { journeySteps } from './journey.dsl';
import { newVersionSteps } from './new-version.dsl';
import { privateBuildOn, test as privateBuildTest } from './private-build';
import { test as writerTest } from './writer';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const approvingPath = process.env.SCENARIO_APPROVE ?? '';

const runnerFor = (sees: Pick<AppSees, 'tree'>): Runner =>
  approvingPath === ''
    ? { tree: () => sees.tree() }
    : {
        tree: () => sees.tree(),
        read: async (where) => readFileSync(join(root, where), 'utf8'),
        write: async (where, what) => {
          writeFileSync(join(root, where), what);
        },
      };

const playing = (behaviour: string) => ({
  only: behaviour,
  ...(approvingPath === '' ? {} : { approve: true }),
});

for (const name of readdirSync(here).filter((entry) => entry.endsWith('.approved.md'))) {
  const path = relative(root, join(here, name));
  if (approvingPath !== '' && approvingPath !== path) continue;

  const text = readFileSync(join(root, path), 'utf8');
  const file = readScenarioFile(text);
  const treeRoot = file.sees === 'the app' ? 'page' : 'main';

  if (file.serves === 'a private build') {
    privateBuildTest.describe(path, () => {
      privateBuildTest.use({ treeRoot });
      for (const { behaviour } of file.scenarios) {
        privateBuildTest(behaviour, async ({ writer, page, build }) => {
          await playScenarios(
            { path, text },
            runnerFor(writer.sees),
            {
              ...journeySteps(writer, writer.sees),
              ...newVersionSteps(privateBuildOn(page, build)),
            },
            playing(behaviour),
          );
        });
      }
    });
    continue;
  }

  writerTest.describe(path, () => {
    writerTest.use({ treeRoot });
    for (const { behaviour } of file.scenarios) {
      writerTest(behaviour, async ({ writer }) => {
        await playScenarios(
          { path, text },
          runnerFor(writer.sees),
          journeySteps(writer, writer.sees),
          playing(behaviour),
        );
      });
    }
  });
}
