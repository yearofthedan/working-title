import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { everyFile } from './every-file';

const inATempFolder = (walk: (root: string) => void): void => {
  const root = mkdtempSync(join(tmpdir(), 'every-file-'));
  try {
    walk(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

describe('every file', () => {
  it('lists the files under a folder, skipping the named ones', () => {
    inATempFolder((root) => {
      mkdirSync(join(root, 'src', 'scenarios'), { recursive: true });
      mkdirSync(join(root, 'node_modules'));
      writeFileSync(join(root, 'src', 'scenarios', 'one.approved.md'), '');
      writeFileSync(join(root, 'src', 'two.ts'), '');
      writeFileSync(join(root, 'node_modules', 'three.ts'), '');

      expect(everyFile(root, new Set(['node_modules'])).sort()).toEqual([
        'src/scenarios/one.approved.md',
        'src/two.ts',
      ]);
    });
  });

  it('does not fail over an entry gone from a folder before it is read', () => {
    inATempFolder((root) => {
      writeFileSync(join(root, 'kept.ts'), '');
      symlinkSync('nothing-here.ts', join(root, 'gone.ts'));

      expect(everyFile(root, new Set<string>()).sort()).toEqual(['gone.ts', 'kept.ts']);
    });
  });

  it('returns nothing for a folder gone before it is read', () => {
    inATempFolder((root) => {
      rmSync(root, { recursive: true, force: true });

      expect(everyFile(root, new Set<string>())).toEqual([]);
    });
  });
});
