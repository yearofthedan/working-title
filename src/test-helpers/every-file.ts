import { readdirSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { join, relative } from 'node:path';

// shortcut: on a filesystem that reports no entry types, readdirSync lstats each entry itself, so a sibling gone mid-walk empties its folder; walk entry by entry if one is ever used
const entriesIn = (dir: string): Dirent[] => {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};

export const everyFile = (root: string, skip: ReadonlySet<string>): string[] => {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of entriesIn(dir)) {
      if (skip.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else found.push(relative(root, path));
    }
  };
  walk(root);
  return found;
};
