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

export const wholeNameAnyCase = (name: string): RegExp =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');
