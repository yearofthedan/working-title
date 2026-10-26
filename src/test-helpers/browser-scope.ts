import * as browser from 'vite-plus/test/browser';
import { fieldsOn, linesOf, stepsOn, type PageScope } from './scope';

declare module 'vite-plus/test/browser' {
  interface LocatorSelectors {
    getByLabel(text: string | RegExp): browser.Locator;
  }
}

browser.locators.extend({
  getByLabel(text) {
    return this.getByLabelText(text);
  },
});

interface Aria {
  generateAriaTree(element: Element): unknown;
  renderAriaTree(node: unknown): string;
}

const { utils } = browser as unknown as { utils: { aria: Aria } };

const treeOf = (element: Element): readonly string[] =>
  linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(element)));

export const browserScope = (render: () => Promise<void>): PageScope => ({
  fresh: render,
  ...fieldsOn(browser.page),
  ...stepsOn(browser.page),
  press: async (key) => {
    await browser.userEvent.keyboard(`{${key}}`);
  },
  tree: async () => treeOf(browser.page.getByRole('main').element()),
});
