import * as browser from 'vite-plus/test/browser';
import { drawnKinds } from '../ui/graph/graph';
import { clicking, drawn, linesOf, settled, typing, wholeNameAnyCase, type Driver } from './driver';
import { openTheApp } from './the-app';

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

export const vitestBrowserDriver = (render: () => Promise<void>, graph?: string): Driver => {
  const main =
    graph === undefined
      ? browser.page.getByRole('main')
      : browser.page.getByRole('main', { name: wholeNameAnyCase(graph) });
  const within = graph === undefined ? browser.page : main;
  return {
    fresh: render,
    reopen: async () => {
      await openTheApp();
    },
    press: async (key) => {
      await browser.userEvent.keyboard(`{${key}}`);
    },
    click: clicking(within),
    focus: async (role, name, group) => {
      const root =
        group === undefined
          ? within
          : within.getByRole(group.role, { name: wholeNameAnyCase(group.name) });
      (root.getByRole(role, { name: wholeNameAnyCase(name) }).element() as HTMLElement).focus();
    },
    type: typing(within),
    drawn: async () => {
      await settled();
      return drawn(drawnKinds, graph === undefined ? document : main.element());
    },
    tree: async () => {
      await settled();
      return linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(main.element())));
    },
    path: async () =>
      browser.page.getByRole('navigation', { name: 'Where you are' }).element().textContent ?? '',
  };
};
