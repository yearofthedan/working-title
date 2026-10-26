import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readScenarioFile } from '../src/test-helpers/scenario-file';
import { playScenarios, type Runner } from '../src/test-helpers/play';
import { journeySteps } from './journey.dsl';
import { test } from './writer';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const approvingPath = process.env.SCENARIO_APPROVE ?? '';

for (const name of readdirSync(here).filter((entry) => entry.endsWith('.approved.md'))) {
  const path = relative(root, join(here, name));
  if (approvingPath !== '' && approvingPath !== path) continue;

  const text = readFileSync(join(root, path), 'utf8');

  test.describe(path, () => {
    for (const { behaviour } of readScenarioFile(text).scenarios) {
      test(behaviour, async ({ writer }) => {
        const tree = async () => writer.sees.tree();
        const runner: Runner =
          approvingPath === ''
            ? { tree }
            : {
                tree,
                read: async (where) => readFileSync(join(root, where), 'utf8'),
                write: async (where, what) => {
                  writeFileSync(join(root, where), what);
                },
              };

        await playScenarios({ path, text }, runner, journeySteps(writer, writer.sees), {
          only: behaviour,
          ...(approvingPath === '' ? {} : { approve: true }),
        });
      });
    }
  });
}
