export interface Field {
  enter(text: string): Promise<void>;
}

export interface Group {
  field(label: string): Field;
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
  getByRole(role: 'group', options: { name: RegExp }): Finds;
}

const fieldIn = (within: Finds, label: string): Field => ({
  enter: async (text) => {
    // shortcut: a piece's own facet is the first field named so in its group, until its fields stop coming before its children's.
    await within.getByLabel(wholeNameAnyCase(label)).first().fill(text);
  },
});

export const fieldsOn = (page: Finds): Pick<PageScope, 'field' | 'group'> => ({
  field: (label) => fieldIn(page, label),
  group: (name) => ({
    field: (label) => fieldIn(page.getByRole('group', { name: wholeNameAnyCase(name) }), label),
  }),
});

export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');
