import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readScenarioFile } from '../src/test-helpers/scenario-file';
import { playScenarios, type Runner } from '../src/test-helpers/play';
import { journeyActions } from './journey';
import { test } from './writer';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
// ./do approve names the file it is approving, and only that one is read.
const approving = process.env.SCENARIO_APPROVE ?? '';

for (const name of readdirSync(here).filter((entry) => entry.endsWith('.approved.md'))) {
  const path = relative(root, join(here, name));
  if (approving !== '' && approving !== path) continue;

  const text = readFileSync(join(root, path), 'utf8');

  test.describe(path, () => {
    for (const { behaviour } of readScenarioFile(text).scenarios) {
      test(behaviour, async ({ writer }) => {
        const tree = async () => writer.scope.tree();
        const runner: Runner =
          approving === ''
            ? { tree }
            : {
                tree,
                write: async (where, what) => {
                  writeFileSync(join(root, where), what);
                },
              };
        // Approving reads the file as it stands, so a file of several scenarios is rewritten
        // a section at a time.
        const current = approving === '' ? text : readFileSync(join(root, path), 'utf8');

        await playScenarios({ path, text: current }, runner, journeyActions(writer.scope), {
          only: behaviour,
          ...(approving === '' ? {} : { approve: true }),
        });
      });
    }
  });
}
