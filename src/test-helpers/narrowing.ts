export type Role =
  | 'group'
  | 'button'
  | 'heading'
  | 'main'
  | 'navigation'
  | 'textbox'
  | 'toolbar'
  | 'status'
  | 'complementary';

export interface Named {
  readonly role: string;
  readonly name: string;
}

export interface Part {
  readonly role: Role;
  readonly name?: string;
  readonly within?: Named;
}

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
  const key = (part: Part): string =>
    [part.role, part.name ?? '', part.within?.role ?? '', part.within?.name ?? '']
      .join(' ')
      .toLowerCase();
  const read = new Set<string>();
  const kept: string[] = [];
  const enclosing: (Named | undefined)[] = [];
  let base = -1;
  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    const role = roleOn(line);
    const here = namedOn(line);
    const inside = enclosing.filter((at, depth) => depth < indent && at !== undefined).at(-1);
    enclosing.length = indent;
    enclosing[indent] = here;
    const matching = parts.filter(
      (part) =>
        part.role === role &&
        (part.name === undefined ||
          (here !== undefined && part.name.toLowerCase() === here.name.toLowerCase())) &&
        (part.within === undefined || isNamed(inside, part.within)),
    );
    for (const part of matching) read.add(key(part));
    if (base >= 0 && indent > base) {
      kept.push(line.slice(base));
      continue;
    }
    base = -1;
    if (matching.length === 0) continue;
    base = indent;
    kept.push(line.slice(base));
  }
  const missing = parts.filter((part) => !read.has(key(part)));
  if (missing.length > 0) {
    const reads = missing
      .map((part) => {
        const within =
          part.within === undefined ? '' : ` inside ${part.within.role} "${part.within.name}"`;
        return `${part.role}${part.name === undefined ? '' : ` "${part.name}"`}${within}`;
      })
      .join(' or ');
    throw new Error(`no line reads ${reads}, so a scenario cannot record what it checked`);
  }
  return kept;
};
