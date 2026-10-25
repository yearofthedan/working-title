export interface Field {
  enter(text: string): Promise<void>;
}

export interface Group {
  field(label: string): Field;
  group(name: string): Group;
  press(name: string): Promise<void>;
}

export interface PageScope {
  fresh(): Promise<void>;
  field(label: string): Field;
  group(name: string): Group;
  tree(): Promise<readonly string[]>;
}

export interface AppScope extends PageScope {
  reload(): Promise<void>;
}

const wholeNameAnyCase = (name: string): RegExp =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

interface Finds {
  getByLabel(text: RegExp): { first(): { fill(text: string): Promise<void> } };
  getByRole(
    role: 'group' | 'button',
    options: { name: RegExp },
  ): Finds & { click(): Promise<void> };
}

const fieldIn = (within: Finds, label: string): Field => ({
  enter: async (text) => {
    // shortcut: a piece's own facets come before its children's in its group, until a facet's field can be told from a child piece's by name.
    await within.getByLabel(wholeNameAnyCase(label)).first().fill(text);
  },
});

const groupIn = (within: Finds): Group => ({
  field: (label) => fieldIn(within, label),
  group: (name) => groupIn(within.getByRole('group', { name: wholeNameAnyCase(name) })),
  press: async (name) => {
    await within.getByRole('button', { name: wholeNameAnyCase(name) }).click();
  },
});

export const fieldsOn = (page: Finds): Pick<PageScope, 'field' | 'group'> => ({
  field: (label) => fieldIn(page, label),
  group: (name) => groupIn(page.getByRole('group', { name: wholeNameAnyCase(name) })),
});

export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');
