import * as browser from 'vite-plus/test/browser';
import { linesOf, wholeNameAnyCase, type Field, type PageScope } from './scope';

interface Aria {
  generateAriaTree(element: Element): unknown;
  renderAriaTree(node: unknown): string;
}

const { utils } = browser as unknown as { utils: { aria: Aria } };

interface Finds {
  getByLabelText(text: string | RegExp): { fill(text: string): Promise<void> };
}

const fieldIn = (within: Finds, label: string): Field => ({
  enter: async (text) => {
    await within.getByLabelText(wholeNameAnyCase(label)).fill(text);
  },
});

const treeOf = (element: Element): readonly string[] =>
  linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(element)));

export const browserScope = (render: () => Promise<void>): PageScope => ({
  fresh: render,
  field: (label) => fieldIn(browser.page, label),
  group: (name) => ({
    field: (label) =>
      fieldIn(browser.page.getByRole('group', { name: wholeNameAnyCase(name) }), label),
  }),
  tree: async () => treeOf(browser.page.getByRole('main').element()),
});
