import * as browser from 'vite-plus/test/browser';
import { exactName, linesOf, type Field, type PageScope } from './scope';

interface Aria {
  generateAriaTree(element: Element): unknown;
  renderAriaTree(node: unknown): string;
}

// The installed types for `vitest/browser` do not declare `utils.aria`, though 5.0.3 has it at
// runtime: `renderAriaTree(generateAriaTree(element))` prints the tree its own matcher compares.
const { utils } = browser as unknown as { utils: { aria: Aria } };

/** What a field is found within: the page itself, or a group's locator. */
interface Finds {
  getByLabelText(text: string | RegExp): { fill(text: string): Promise<void> };
}

const fieldIn = (within: Finds, label: string): Field => ({
  enter: async (text) => {
    await within.getByLabelText(exactName(label)).fill(text);
  },
});

const treeOf = (element: Element): readonly string[] =>
  linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(element)));

/** A page scope over Vitest's browser mode, whose every test gets its own page. */
export const browserScope = (render: () => Promise<void>): PageScope => ({
  fresh: render,
  field: (label) => fieldIn(browser.page, label),
  group: (name) => ({
    field: (label) => fieldIn(browser.page.getByRole('group', { name: exactName(name) }), label),
  }),
  // `element()` is Vitest's synchronous one, and the tree is what this awaits for.
  tree: async () => treeOf(browser.page.getByRole('main').element()),
});
