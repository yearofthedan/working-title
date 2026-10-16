import * as browser from 'vite-plus/test/browser';
import { linesOf, type PageScope } from './scope';

interface Aria {
  generateAriaTree(element: Element): unknown;
  renderAriaTree(node: unknown): string;
}

// The installed types for `vitest/browser` do not declare `utils.aria`, though 5.0.3 has it at
// runtime: `renderAriaTree(generateAriaTree(element))` prints the tree its own matcher compares.
const { utils } = browser as unknown as { utils: { aria: Aria } };

const treeOf = (element: Element): readonly string[] =>
  linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(element)));

/** A page scope over Vitest's browser mode, whose every test gets its own page. */
export const browserScope = (render: () => Promise<void>): PageScope => ({
  fresh: render,
  field: (label) => ({
    enter: async (text) => {
      await browser.page.getByLabelText(label).fill(text);
    },
  }),
  // `element()` is Vitest's synchronous one, and the tree is what this awaits for.
  tree: async () => treeOf(browser.page.getByRole('main').element()),
});
