import * as browser from 'vite-plus/test/browser';
import { linesOf, type PageScope } from './scope';

interface Aria {
  generateAriaTree(element: Element): unknown;
  renderAriaTree(node: unknown): string;
}

const { utils } = browser as unknown as { utils: { aria: Aria } };

const treeOf = (element: Element): readonly string[] =>
  linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(element)));

export const browserScope = (render: () => Promise<void>): PageScope => ({
  fresh: render,
  field: (label) => ({
    enter: async (text) => {
      await browser.page.getByLabelText(label).fill(text);
    },
  }),
  tree: async () => treeOf(browser.page.getByRole('main').element()),
});
