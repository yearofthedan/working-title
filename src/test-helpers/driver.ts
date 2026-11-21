import type { CardLook } from '../ui/project/graph/card/card';
import { namedOn, same, type Named, type Role } from './narrowing';

export type { Part, Role } from './narrowing';

export interface Within {
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
  readonly row: string;
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
    row: card.closest<HTMLElement>('[role="toolbar"]')?.getAttribute('aria-label') ?? '',
  }));

export const farEnoughToReachTheEnd = 1_000_000;

export interface Driver {
  reload?(): Promise<void>;
  press(key: string): Promise<void>;
  click(role: Role, name: string, within?: Within, at?: Point): Promise<void>;
  focus(role: Role, name: string, within?: Within): Promise<void>;
  hover(role: Role, name: string, within?: Within): Promise<void>;
  scrollToTheEnd(role: Role, name: string, within?: Within): Promise<void>;
  type(text: string, label: string, within?: Within): Promise<void>;
  clickAway(): Promise<void>;
  value(label: string, within: Within): Promise<string>;
  focusIs(role: Role, name: string, within?: Within): Promise<boolean>;
  tree(markFocus?: boolean): Promise<readonly string[]>;
}

export interface ReloadingDriver extends Driver {
  reload(): Promise<void>;
}

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

export interface Focus {
  readonly element: Named | undefined;
  readonly inside: Named | undefined;
}

export interface Marks {
  readonly focus?: Focus;
  readonly current?: Focus;
}

// shortcut: the roles and the name sources below are the markup the app renders today; anything else throws, so add it here then
export const focusAndCurrentIn = (root: Element = document.body): Marks => {
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

  const namedAround = (at: Element): Named | undefined => {
    for (
      let above = at.parentElement;
      above !== null && above !== root;
      above = above.parentElement
    ) {
      const inside = named(above);
      if (inside !== undefined) return inside;
    }
    return undefined;
  };

  const marksOf = (at: Element | null | undefined): Focus | undefined => {
    if (at === null || at === undefined || at === root || !root.contains(at)) return undefined;
    return { element: named(at), inside: namedAround(at) };
  };

  return {
    focus: marksOf(document.activeElement),
    current: marksOf(
      [...root.querySelectorAll('main fieldset')].find(
        (card) => card.getAttribute('aria-current') === 'location',
      ),
    ),
  };
};

const marking = (
  lines: readonly string[],
  marked: Focus | undefined,
  marker: string,
  holding: string,
): readonly string[] => {
  if (marked === undefined) return lines;
  if (marked.element === undefined) {
    throw new Error(
      `the element that holds ${holding} is one whose role or name this reader cannot read: name it in focusAndCurrentIn`,
    );
  }
  const enclosing: (Named | undefined)[] = [];
  let seen = false;
  const markedLines = lines.map((line) => {
    const level = (line.length - line.trimStart().length) / 2;
    const here = namedOn(line);
    const inside = enclosing.filter((at, depth) => depth < level && at !== undefined).at(-1);
    enclosing.length = level;
    enclosing[level] = here;
    if (seen || !same(here, marked.element) || !same(inside, marked.inside)) return line;
    seen = true;
    return line.includes(marker) ? line : line.replace(/^(\s*- [\w-]+ "[^"]*")/, `$1 ${marker}`);
  });
  if (!seen) {
    const inside =
      marked.inside === undefined ? '' : ` in ${marked.inside.role} "${marked.inside.name}"`;
    throw new Error(
      `no line reads ${marked.element.role} "${marked.element.name}"${inside}, so a tree holding ${holding} would print as one that does not`,
    );
  }
  return markedLines;
};

export const markingFocus = (
  lines: readonly string[],
  focus: Focus | undefined,
): readonly string[] => marking(lines, focus, '[active]', 'focus');

// workaround: Playwright 1.65 and Vitest 5.1 aria snapshots print no aria-current; remove when a snapshot prints it, which the "leaves a marker the renderer printed itself" case in driver.test.ts guards.
export const markingCurrent = (
  lines: readonly string[],
  current: Focus | undefined,
): readonly string[] => marking(lines, current, '[current]', 'the current piece');
