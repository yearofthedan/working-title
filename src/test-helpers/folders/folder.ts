import { keyOfPart, refuseThePartsNotRead, type Part } from '../drivers/narrowing';

export interface FolderEntry {
  readonly role: 'folder';
  readonly name: string;
  readonly entries: readonly Entry[];
}

export interface FileEntry {
  readonly role: 'file';
  readonly name: string;
  readonly text: readonly string[];
}

export type Entry = FolderEntry | FileEntry;

interface Node {
  readonly line: number;
  readonly indent: number;
  readonly role: string;
  readonly name: string;
  readonly parent: Node | undefined;
}

const anEntry = /^(\s*)- (folder|file) "([^"]*)":$/;

const linesOf = (entries: readonly Entry[], depth: number): readonly string[] => {
  const indent = '  '.repeat(depth);
  return [...entries]
    .sort((one, other) => (one.name < other.name ? -1 : one.name > other.name ? 1 : 0))
    .flatMap((entry) => {
      const head = `${indent}- ${entry.role} "${entry.name}":`;
      if (entry.role === 'folder') return [head, ...linesOf(entry.entries, depth + 1)];
      return [head, ...entry.text.map((line) => (line === '' ? '' : `${indent}  ${line}`))];
    });
};

export const printing = (entries: readonly Entry[]): readonly string[] => linesOf(entries, 0);

const matches = (node: Node | undefined, part: Part): boolean => {
  if (node === undefined || node.role !== part.role) return false;
  if (part.name !== undefined && node.name.toLowerCase() !== part.name.toLowerCase()) return false;
  if (part.within === undefined) return true;
  return (
    node.parent !== undefined &&
    node.parent.role === part.within.role &&
    node.parent.name.toLowerCase() === part.within.name.toLowerCase()
  );
};

const under = (at: Node | undefined, node: Node): boolean => {
  for (let step = at; step !== undefined; step = step.parent) {
    if (step === node) return true;
  }
  return false;
};

const thePathTo = (node: Node): readonly number[] => {
  const path: number[] = [];
  for (let step: Node | undefined = node; step !== undefined; step = step.parent) {
    path.push(step.line);
  }
  return path;
};

export const narrowing = (lines: readonly string[], parts: readonly Part[]): readonly string[] => {
  if (parts.length === 0) return lines;
  const open: Node[] = [];
  const nodes: (Node | undefined)[] = [];
  const belongs: (Node | undefined)[] = [];

  for (const [at, line] of lines.entries()) {
    const indent = line.length - line.trimStart().length;
    const deepest = open.at(-1);
    if (deepest?.role === 'file' && (line === '' || indent > deepest.indent)) {
      belongs[at] = deepest;
      continue;
    }
    while (open.length > 0 && (open.at(-1)?.indent ?? -1) >= indent) open.pop();
    const found = anEntry.exec(line);
    const parent = open.at(-1);
    const node =
      found === null
        ? undefined
        : { line: at, indent, role: found[2] ?? '', name: found[3] ?? '', parent };
    nodes[at] = node;
    belongs[at] = node ?? parent;
    if (node !== undefined) open.push(node);
  }

  const read = new Set<string>();
  const kept = new Set<number>();
  for (const part of parts) {
    const found = lines.map((_, at) => at).filter((at) => matches(nodes[at], part));
    if (found.length === 0) continue;
    read.add(keyOfPart(part));
    for (const at of found) {
      const node = nodes[at];
      if (node === undefined) continue;
      for (const line of thePathTo(node)) kept.add(line);
      for (let where = at; where < lines.length; where += 1) {
        if (under(belongs[where], node)) kept.add(where);
      }
    }
  }
  refuseThePartsNotRead(parts, read);
  return lines.filter((_, at) => kept.has(at));
};

const anId = /(?<![\da-f])[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(?![\da-f])/gi;

export const namingIds = (lines: readonly string[]): readonly string[] => {
  const names = new Map<string, string>();
  return lines.map((line) =>
    line.replace(anId, (id) => {
      const key = id.toLowerCase();
      const named = names.get(key);
      if (named !== undefined) return named;
      const name = `placeholder_id_${names.size + 1}`;
      names.set(key, name);
      return name;
    }),
  );
};
