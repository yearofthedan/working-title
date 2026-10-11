/**
 * What a page's driver part reaches the page through. A part never sees `Page`: it asks for a
 * field by the label a writer would read, and for the page as the runner prints it, so finding
 * an element any other way is not something a part can express.
 */
export interface Field {
  /** What the writer types into it. */
  enter(text: string): Promise<void>;
}

export interface PageScope {
  /** A fresh world, at the start of a scenario. */
  fresh(): Promise<void>;
  /** The field a label names, as a writer finds it. */
  field(label: string): Field;
  /** What the page shows, as the runner prints it. */
  tree(): Promise<readonly string[]>;
}

/** What a journey through the whole app needs on top of a page. */
export interface AppScope extends PageScope {
  reload(): Promise<void>;
}

/** A runner's tree, as the lines a scenario file records. */
export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');
