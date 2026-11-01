import * as browser from 'vite-plus/test/browser';
import {
  clicking,
  focusedIn,
  linesOf,
  markingFocus,
  settled,
  typing,
  wholeNameAnyCase,
  type Driver,
  type Within,
} from './driver';

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

export const vitestBrowserDriver = (graph?: string): Driver => {
  const main =
    graph === undefined
      ? browser.page.getByRole('main')
      : browser.page.getByRole('main', { name: wholeNameAnyCase(graph) });
  const within = graph === undefined ? browser.page : main;
  const rootIn = (group?: Within) =>
    group === undefined
      ? within
      : within.getByRole(group.role, { name: wholeNameAnyCase(group.name) });
  return {
    press: async (key) => {
      await browser.userEvent.keyboard(key === 'Shift+Tab' ? '{Shift>}{Tab}{/Shift}' : `{${key}}`);
    },
    click: clicking(within),
    focus: async (role, name, group) => {
      (
        rootIn(group)
          .getByRole(role, { name: wholeNameAnyCase(name) })
          .element() as HTMLElement
      ).focus();
    },
    type: typing(within),
    clickAway: async () => {
      await browser.userEvent.click(browser.page.getByRole('banner').first());
    },
    value: async (label, group) =>
      (rootIn(group).getByLabel(wholeNameAnyCase(label)).first().element() as HTMLTextAreaElement)
        .value,
    focusIs: async (role, name, group) =>
      rootIn(group)
        .getByRole(role, { name: wholeNameAnyCase(name) })
        .first()
        .element() === document.activeElement,
    tree: async () => {
      await settled();
      return markingFocus(
        linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(main.element()))),
        focusedIn(main.element()),
      );
    },
  };
};
