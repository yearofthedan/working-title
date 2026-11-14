import type { CardLook } from '../ui/card/card';

export type Role =
  | 'group'
  | 'button'
  | 'heading'
  | 'main'
  | 'navigation'
  | 'textbox'
  | 'complementary';

export interface Within {
  readonly role: Role;
  readonly name: string;
}

export interface Part {
  readonly role: Role;
  readonly name: string;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Box {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

export interface DrawnCard {
  readonly name: string;
  readonly kind: CardLook;
  readonly current: boolean;
  readonly box: Box;
}

export interface Opening {
  fresh(): Promise<void>;
  reopen(): Promise<void>;
}

export interface Reads {
  drawn(): Promise<readonly DrawnCard[]>;
}

export interface AppReads extends Reads {
  path(): Promise<string>;
}

export const settled = async (): Promise<void> => {
  void document.body.offsetWidth;
  await Promise.allSettled(document.getAnimations().map((animation) => animation.finished));
};

export const drawn = (
  kinds: readonly CardLook[],
  root: ParentNode = document,
): readonly DrawnCard[] =>
  [...root.querySelectorAll<HTMLElement>('main fieldset')].map((card) => ({
    name: card.querySelector('h2, h3, h4')?.textContent ?? '',
    kind: kinds.find((kind) => card.classList.contains(kind)) ?? 'hidden',
    current: card.getAttribute('aria-current') === 'location',
    box: card.getBoundingClientRect(),
  }));

export const farEnoughToReachTheEnd = 1_000_000;

export interface Driver {
  reload?(): Promise<void>;
  press(key: string): Promise<void>;
  click(role: Role, name: string, within?: Within, at?: Point): Promise<void>;
  focus(role: Role, name: string, within?: Within): Promise<void>;
  hover(role: Role, name: string, within?: Within): Promise<void>;
  scrollToTheEnd(role: Role, name: string, within?: Within): Promise<void>;
  type(text: string, label: string, within: Within): Promise<void>;
  clickAway(): Promise<void>;
  value(label: string, within: Within): Promise<string>;
  focusIs(role: Role, name: string, within?: Within): Promise<boolean>;
  asserts(role: Role, name: string): void;
  observed(): Promise<readonly string[]>;
  tree(): Promise<readonly string[]>;
}

export interface ReloadingDriver extends Driver {
  reload(): Promise<void>;
}

export interface Declarations {
  asserts(role: Role, name: string): void;
  parts(): readonly Part[];
}

export const declarations = (): Declarations => {
  const parts: Part[] = [];
  const named = new Set<string>();
  return {
    asserts: (role, name) => {
      const key = `${role} ${name}`.toLowerCase();
      if (named.has(key)) return;
      named.add(key);
      parts.push({ role, name });
    },
    parts: () => parts,
  };
};

interface Clickable {
  click(options?: { readonly position?: Point }): Promise<void>;
}

interface Found extends Clickable {
  first(): Clickable & { fill(text: string): Promise<void> };
}

export interface Finds {
  getByLabel(text: RegExp): Found;
  getByRole(role: Role, options: { name: RegExp }): Finds & Clickable;
}

export const wholeNameAnyCase = (name: string): RegExp =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

const rootIn = (page: Finds, within?: Within): Finds =>
  within === undefined
    ? page
    : page.getByRole(within.role, { name: wholeNameAnyCase(within.name) });

export const clicking =
  (page: Finds): Driver['click'] =>
  async (role, name, within, at) => {
    await rootIn(page, within)
      .getByRole(role, { name: wholeNameAnyCase(name) })
      .click(at === undefined ? undefined : { position: at });
  };

export const typing =
  (page: Finds): Driver['type'] =>
  async (text, label, within) => {
    const field = rootIn(page, within).getByLabel(wholeNameAnyCase(label)).first();
    await field.click();
    await field.fill(text);
  };

export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');

export interface Named {
  readonly role: string;
  readonly name: string;
}

export interface Focus {
  readonly element: Named;
  readonly inside: Named | undefined;
}

export const focusedIn = (root: Element = document.body): Focus | undefined => {
  // shortcut: the roles and the name sources below are the markup the app renders today; anything else throws, so add it here then
  const roles: Readonly<Record<string, string>> = {
    ASIDE: 'complementary',
    BUTTON: 'button',
    FIELDSET: 'group',
    H1: 'heading',
    H2: 'heading',
    H3: 'heading',
    H4: 'heading',
    H5: 'heading',
    H6: 'heading',
    MAIN: 'main',
    NAV: 'navigation',
    TEXTAREA: 'textbox',
  };

  const named = (element: Element): Named | undefined => {
    const role = element.getAttribute('role') ?? roles[element.tagName];
    if (role === undefined) return undefined;
    const label = element.getAttribute('aria-label');
    const labelledby = element.getAttribute('aria-labelledby');
    const namedBy = labelledby === null ? null : element.ownerDocument.getElementById(labelledby);
    const legend = [...element.children].find((child) => child.tagName === 'LEGEND');
    const labels =
      element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement
        ? element.labels
        : null;
    const name = (
      label ??
      namedBy?.textContent ??
      legend?.textContent ??
      labels?.[0]?.textContent ??
      element.textContent ??
      ''
    ).trim();
    return name === '' ? undefined : { role, name };
  };

  const at = document.activeElement;
  if (at === null || at === root || !root.contains(at)) return undefined;
  const element = named(at);
  if (element === undefined) {
    throw new Error(
      `the focus is on <${at.tagName.toLowerCase()}> inside main, whose role or name this reader cannot read: name it in focusedIn`,
    );
  }
  for (
    let above = at.parentElement;
    above !== null && above !== root;
    above = above.parentElement
  ) {
    const inside = named(above);
    if (inside !== undefined) return { element, inside };
  }
  return { element, inside: undefined };
};

const namedOn = (line: string): Named | undefined => {
  const found = /^\s*- ([\w-]+) "([^"]*)"/.exec(line);
  return found === null ? undefined : { role: found[1], name: found[2] };
};

const same = (found: Named | undefined, wanted: Named | undefined): boolean =>
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

export const markingFocus = (
  lines: readonly string[],
  focus: Focus | undefined,
): readonly string[] => {
  if (focus === undefined) return lines;
  const enclosing: (Named | undefined)[] = [];
  let marked = false;
  const markedLines = lines.map((line) => {
    const level = (line.length - line.trimStart().length) / 2;
    const here = namedOn(line);
    const inside = enclosing.filter((at, depth) => depth < level && at !== undefined).at(-1);
    enclosing.length = level;
    enclosing[level] = here;
    if (marked || !same(here, focus.element) || !same(inside, focus.inside)) return line;
    marked = true;
    return line.replace(/^(\s*- [\w-]+ "[^"]*")/, '$1 [active]');
  });
  if (!marked) {
    const inside =
      focus.inside === undefined ? '' : ` in ${focus.inside.role} "${focus.inside.name}"`;
    throw new Error(
      `no line reads ${focus.element.role} "${focus.element.name}"${inside}, so a tree holding focus would print as one that does not`,
    );
  }
  return markedLines;
};

export interface FocusAssertions {
  noted(): boolean;
  note(): void;
}

export const focusAssertions = (): FocusAssertions => {
  let noted = false;
  return {
    noted: () => noted,
    note: () => {
      noted = true;
    },
  };
};

export const markingFocusWhenAsserted = async (
  assertions: FocusAssertions,
  printed: () => Promise<string>,
  focused: () => Promise<Focus | undefined>,
): Promise<readonly string[]> => {
  const lines = linesOf(await printed());
  return assertions.noted() ? markingFocus(lines, await focused()) : lines;
};
