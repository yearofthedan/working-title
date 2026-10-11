import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { snowflakeExtended } from '../src/methods/snowflake-extended';
import { readScenarioFile } from '../src/test-helpers/scenario-file';
import { playScenarios } from '../src/test-helpers/play';
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
    if (approving !== '') {
      test('records what the page shows', async ({ writer }) => {
        await playScenarios(
          { path, text },
          {
            tree: async () => writer.scope.tree(),
            write: async (where, what) => {
              writeFileSync(join(root, where), what);
            },
          },
          journeyActions(writer.scope, snowflakeExtended),
          { approve: true },
        );
      });
      return;
    }

    for (const { behaviour } of readScenarioFile(text).scenarios) {
      test(behaviour, async ({ writer }) => {
        await playScenarios(
          { path, text },
          { tree: async () => writer.scope.tree() },
          journeyActions(writer.scope, snowflakeExtended),
          { only: behaviour },
        );
      });
    }
  });
}
