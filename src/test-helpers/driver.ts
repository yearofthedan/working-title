export type Role = 'group' | 'button' | 'heading' | 'navigation' | 'textbox';

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

export interface Drawn {
  readonly name: string;
  readonly kind: string;
  readonly current: boolean;
  readonly box: Box;
}

export interface Driver {
  fresh(): Promise<void>;
  reopen(): Promise<void>;
  reload?(): Promise<void>;
  press(key: string): Promise<void>;
  click(role: Role, name: string, within?: Within): Promise<void>;
  type(text: string, label: string, within: Within): Promise<void>;
  drawn(): Promise<readonly Drawn[]>;
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
