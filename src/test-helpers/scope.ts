export interface Field {
  enter(text: string): Promise<void>;
}

export interface PageScope {
  fresh(): Promise<void>;
  field(label: string): Field;
  tree(): Promise<readonly string[]>;
}

export interface AppScope extends PageScope {
  reload(): Promise<void>;
}

export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');
