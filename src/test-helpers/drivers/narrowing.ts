export type Role =
  | 'alert'
  | 'group'
  | 'button'
  | 'heading'
  | 'main'
  | 'navigation'
  | 'paragraph'
  | 'textbox'
  | 'toolbar'
  | 'status'
  | 'complementary';

export interface Named {
  readonly role: string;
  readonly name: string;
}

export interface Part {
  readonly role: Role | 'folder' | 'file';
  readonly name?: string;
  readonly within?: Named;
}

export const keyOfPart = (part: Part): string =>
  [part.role, part.name ?? '', part.within?.role ?? '', part.within?.name ?? '']
    .join(' ')
    .toLowerCase();

export const refuseThePartsNotRead = (parts: readonly Part[], read: ReadonlySet<string>): void => {
  const missing = parts.filter((part) => !read.has(keyOfPart(part)));
  if (missing.length === 0) return;
  const reads = missing
    .map((part) => {
      const within =
        part.within === undefined ? '' : ` inside ${part.within.role} "${part.within.name}"`;
      return `${part.role}${part.name === undefined ? '' : ` "${part.name}"`}${within}`;
    })
    .join(' or ');
  throw new Error(`no line reads ${reads}, so a scenario cannot record what it checked`);
};

export const namedOn = (line: string): Named | undefined => {
  const found = /^\s*- ([\w-]+) "([^"]*)"/.exec(line);
  return found === null ? undefined : { role: found[1], name: found[2] };
};

export const same = (found: Named | undefined, wanted: Named | undefined): boolean =>
  found === undefined || wanted === undefined
    ? found === undefined && wanted === undefined
    : found.role === wanted.role && found.name === wanted.name;

const roleOn = (line: string): string | undefined => /^\s*- ([\w-]+)/.exec(line)?.[1];

const isNamed = (found: Named | undefined, wanted: Named): boolean =>
  found !== undefined &&
  found.role === wanted.role &&
  found.name.toLowerCase() === wanted.name.toLowerCase();

export const narrowing = (lines: readonly string[], parts: readonly Part[]): readonly string[] => {
  if (parts.length === 0) return lines;
  const read = new Set<string>();
  const kept = new Set<number>();
  const open: { readonly at: number; readonly indent: number; readonly named?: Named }[] = [];
  let under = -1;
  for (const [at, line] of lines.entries()) {
    const indent = line.length - line.trimStart().length;
    while ((open.at(-1)?.indent ?? -1) >= indent) open.pop();
    if (under >= 0 && indent <= under) under = -1;
    const role = roleOn(line);
    const here = namedOn(line);
    const inside = open.findLast((entry) => entry.named !== undefined)?.named;
    const found = parts.filter(
      (part) =>
        part.role === role &&
        (part.name === undefined ||
          (here !== undefined && part.name.toLowerCase() === here.name.toLowerCase())) &&
        (part.within === undefined || isNamed(inside, part.within)),
    );
    for (const part of found) read.add(keyOfPart(part));
    if (under < 0 && found.length > 0) {
      for (const ancestor of open) kept.add(ancestor.at);
      under = indent;
    }
    if (under >= 0) kept.add(at);
    open.push({ at, indent, named: here });
  }
  refuseThePartsNotRead(parts, read);
  return lines.filter((_, at) => kept.has(at));
};
