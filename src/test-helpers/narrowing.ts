export type Role =
  | 'group'
  | 'button'
  | 'heading'
  | 'main'
  | 'navigation'
  | 'textbox'
  | 'complementary';

export interface Named {
  readonly role: string;
  readonly name: string;
}

export interface Part {
  readonly role: Role;
  readonly name: string;
}

export const namedOn = (line: string): Named | undefined => {
  const found = /^\s*- ([\w-]+) "([^"]*)"/.exec(line);
  return found === null ? undefined : { role: found[1], name: found[2] };
};

export const same = (found: Named | undefined, wanted: Named | undefined): boolean =>
  found === undefined || wanted === undefined
    ? found === undefined && wanted === undefined
    : found.role === wanted.role && found.name === wanted.name;

export const narrowing = (lines: readonly string[], parts: readonly Part[]): readonly string[] => {
  if (parts.length === 0) return lines;
  const key = (part: Part): string => `${part.role} ${part.name}`.toLowerCase();
  const read = new Set<string>();
  const kept: string[] = [];
  let base = -1;
  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    const here = namedOn(line);
    const matching =
      here === undefined
        ? []
        : parts.filter(
            (part) =>
              part.role === here.role && part.name.toLowerCase() === here.name.toLowerCase(),
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
    const reads = missing.map((part) => `${part.role} "${part.name}"`).join(' or ');
    throw new Error(`no line reads ${reads}, so a scenario cannot record what it checked`);
  }
  return kept;
};
