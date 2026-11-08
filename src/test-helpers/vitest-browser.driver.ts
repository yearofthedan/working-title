import * as browser from 'vite-plus/test/browser';
import {
  clicking,
  farEnoughToReachTheEnd,
  focusAssertions,
  focusedIn,
  markingFocusWhenAsserted,
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

const keysFor = (key: string): string => {
  if (key === 'Shift+Tab') return '{Shift>}{Tab}{/Shift}';
  return key.length === 1 && key !== key.toLowerCase() ? `{Shift>}${key}{/Shift}` : `{${key}}`;
};

export const vitestBrowserDriver = (graph?: string, reads: 'main' | 'page' = 'main'): Driver => {
  const main =
    graph === undefined
      ? browser.page.getByRole('main')
      : browser.page.getByRole('main', { name: wholeNameAnyCase(graph) });
  const root = (): Element => (reads === 'page' ? document.body : main.element());
  const within = graph === undefined ? browser.page : main;
  const rootIn = (group?: Within) =>
    group === undefined
      ? within
      : within.getByRole(group.role, { name: wholeNameAnyCase(group.name) });
  const assertions = focusAssertions();
  return {
    press: async (key) => {
      await browser.userEvent.keyboard(keysFor(key));
    },
    click: clicking(within),
    focus: async (role, name, group) => {
      (
        rootIn(group)
          .getByRole(role, { name: wholeNameAnyCase(name) })
          .element() as HTMLElement
      ).focus();
    },
    scrollToTheEnd: async (role, name, group) => {
      await rootIn(group)
        .getByRole(role, { name: wholeNameAnyCase(name) })
        .wheel({ delta: { y: farEnoughToReachTheEnd } });
    },
    type: typing(within),
    clickAway: async () => {
      await browser.userEvent.click(browser.page.getByRole('banner').first());
    },
    value: async (label, group) =>
      (rootIn(group).getByLabel(wholeNameAnyCase(label)).first().element() as HTMLTextAreaElement)
        .value,
    focusIs: async (role, name, group) => {
      assertions.note();
      return (
        rootIn(group)
          .getByRole(role, { name: wholeNameAnyCase(name) })
          .first()
          .element() === document.activeElement
      );
    },
    tree: async () => {
      await settled();
      return markingFocusWhenAsserted(
        assertions,
        async () => utils.aria.renderAriaTree(utils.aria.generateAriaTree(root())),
        async () => focusedIn(root()),
      );
    },
  };
};
