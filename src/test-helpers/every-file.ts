import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const everyFile = (root: string, skip: ReadonlySet<string>): string[] => {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (skip.has(name)) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else found.push(relative(root, path));
    }
  };
  walk(root);
  return found;
};
