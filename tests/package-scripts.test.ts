import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vite-plus/test';

const { scripts } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>;
};

// pnpm runs its own command over a script of the same name.
test('no script is named after a pnpm command', () => {
  expect(Object.keys(scripts)).not.toContain('setup');
});

test('every script file a package script runs exists', () => {
  const files = Object.values(scripts).flatMap(
    (command) => command.match(/scripts\/\S+\.sh/g) ?? [],
  );
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) expect(existsSync(file), file).toBe(true);
});
