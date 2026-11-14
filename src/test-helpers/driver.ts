import type { CardLook } from '../ui/card/card';
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
