import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { snowflakeExtended } from '../src/methods/snowflake-extended';
import { readScenarioFile } from '../src/test-helpers/scenario-file';
import { playScenarios } from '../src/test-helpers/play';
import { journeyActions } from './journey';
import { test } from './writer';

const here = dirname(fileURLToPath(import.meta.url));

for (const name of readdirSync(here).filter((entry) => entry.endsWith('.approved.md'))) {
  const path = join(here, name);
  const text = readFileSync(path, 'utf8');

  test.describe(name, () => {
    for (const { behaviour } of readScenarioFile(text).scenarios) {
      test(behaviour, async ({ writer }) => {
        await playScenarios(
          { path, text },
          { tree: writer.scope.tree },
          journeyActions(writer.scope, snowflakeExtended),
          { only: behaviour },
        );
      });
    }
  });
}
