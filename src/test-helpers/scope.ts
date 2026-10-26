export interface Field {
  enter(text: string): Promise<void>;
  click(): Promise<void>;
}

export interface Group {
  field(label: string): Field;
  group(name: string): Group;
  click(): Promise<void>;
  press(name: string): Promise<void>;
}

export interface PageScope {
  fresh(): Promise<void>;
  reopen(): Promise<void>;
  field(label: string): Field;
  group(name: string): Group;
  press(key: string): Promise<void>;
  step(name: string): Promise<void>;
  tree(): Promise<readonly string[]>;
}

export interface AppScope extends PageScope {
  reload(): Promise<void>;
}

const wholeNameAnyCase = (name: string): RegExp =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

interface Clickable {
  click(): Promise<void>;
}

interface Found extends Clickable {
  first(): Clickable & { fill(text: string): Promise<void> };
}

interface Finds {
  getByLabel(text: RegExp): Found;
  getByRole(
    role: 'group' | 'button' | 'heading' | 'navigation',
    options: { name: RegExp },
  ): Finds & Clickable;
}

const fieldIn = (within: Finds, label: string): Field => {
  const field = () => within.getByLabel(wholeNameAnyCase(label)).first();
  return {
    enter: async (text) => {
      await field().click();
      await field().fill(text);
    },
    click: () => field().click(),
  };
};

const groupIn = (name: string, within: Finds & Clickable): Group => ({
  field: (label) => fieldIn(within, label),
  group: (child) => groupIn(child, within.getByRole('group', { name: wholeNameAnyCase(child) })),
  click: () => within.getByRole('heading', { name: wholeNameAnyCase(name) }).click(),
  press: (button) => within.getByRole('button', { name: wholeNameAnyCase(button) }).click(),
});

export const fieldsOn = (page: Finds): Pick<PageScope, 'field' | 'group'> => ({
  field: (label) => fieldIn(page, label),
  group: (name) => groupIn(name, page.getByRole('group', { name: wholeNameAnyCase(name) })),
});

export const stepsOn = (page: Finds): Pick<PageScope, 'step'> => ({
  step: (name) =>
    page
      .getByRole('navigation', { name: wholeNameAnyCase('Where you are') })
      .getByRole('button', { name: wholeNameAnyCase(name) })
      .click(),
});

export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');
