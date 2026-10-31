import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';
import { everyFile } from './every-file';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const skip = new Set(['node_modules', '.git', 'dist', 'test-results', '.vitest']);

const anEntryReads = (path: string): boolean =>
  /^e2e\/[^/]+\.approved\.md$/.test(path) ||
  /^src\/(.+\/)?scenarios\/[^/]+\.approved\.md$/.test(path);

describe('every scenario file', () => {
  it('sits where an entry reads it', () => {
    const orphans = everyFile(root, skip)
      .filter((path) => path.endsWith('.approved.md'))
      .filter((path) => !anEntryReads(path));

    expect(orphans).toEqual([]);
  });
});
