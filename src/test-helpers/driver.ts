import type { CardLook } from '../ui/card/card';

export type Role = 'group' | 'button' | 'heading' | 'main' | 'navigation' | 'textbox';

export interface Within {
  readonly role: Role;
  readonly name: string;
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

export interface Driver {
  reload?(): Promise<void>;
  press(key: string): Promise<void>;
  click(role: Role, name: string, within?: Within): Promise<void>;
  focus(role: Role, name: string, within?: Within): Promise<void>;
  type(text: string, label: string, within: Within): Promise<void>;
  clickAway(): Promise<void>;
  value(label: string, within: Within): Promise<string>;
  focusIs(role: Role, name: string, within?: Within): Promise<boolean>;
  tree(): Promise<readonly string[]>;
}

export interface ReloadingDriver extends Driver {
  reload(): Promise<void>;
}

interface Clickable {
  click(): Promise<void>;
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
  async (role, name, within) => {
    await rootIn(page, within)
      .getByRole(role, { name: wholeNameAnyCase(name) })
      .click();
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
