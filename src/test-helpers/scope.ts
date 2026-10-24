/**
 * What a page's driver part reaches the page through. A part never sees `Page`: it asks for the
 * group a name marks and the field a label names inside it, and for the page as the runner prints
 * it, so finding an element any other way is not something a part can express.
 */
export interface Field {
  /** What the writer types into it. */
  enter(text: string): Promise<void>;
}

export interface Group {
  field(label: string): Field;
}

export interface PageScope {
  /** A fresh world, at the start of a scenario. */
  fresh(): Promise<void>;
  /** The field a label names, as a writer finds it. */
  field(label: string): Field;
  group(name: string): Group;
  /** What the page shows, as the runner prints it. */
  tree(): Promise<readonly string[]>;
}

/** What a journey through the whole app needs on top of a page. */
export interface AppScope extends PageScope {
  reload(): Promise<void>;
}

/**
 * A name as a scenario writes it: the whole string, whatever its case. One pattern serves both
 * runners because a plain string does not: Playwright reads it as part of a name
 * (https://playwright.dev/docs/api/class-page#page-get-by-label-option-exact), and Vitest 5.0.3
 * as the whole name (`browser.locators.exact`, `@default true` in its installed types), so the
 * same scenario would find a different element in each.
 */
export const exactName = (name: string): RegExp =>
  new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

/** A runner's tree, as the lines a scenario file records. */
export const linesOf = (tree: string): readonly string[] =>
  tree.replace(/^\n/, '').replace(/\n$/, '').split('\n');
