import { readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const skip = new Set(['node_modules', '.git', 'dist', 'test-results', '.vitest']);

const everyFile = (dir: string, found: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) everyFile(path, found);
    else found.push(relative(root, path));
  }
  return found;
};

const anEntryReads = (path: string): boolean =>
  /^e2e\/[^/]+\.approved\.md$/.test(path) ||
  /^src\/(.+\/)?scenarios\/[^/]+\.approved\.md$/.test(path);

describe('every scenario file', () => {
  it('sits where an entry reads it', () => {
    const orphans = everyFile(root)
      .filter((path) => path.endsWith('.approved.md'))
      .filter((path) => !anEntryReads(path));

    expect(orphans).toEqual([]);
  });
});
