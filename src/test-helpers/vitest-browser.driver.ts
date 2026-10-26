import * as browser from 'vite-plus/test/browser';
import { clicking, linesOf, typing, type Drawn, type Driver } from './driver';
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

const kinds = ['focus', 'card', 'chip', 'hidden'] as const;

const drawn = (): readonly Drawn[] =>
  [...document.querySelectorAll<HTMLElement>('main fieldset')].map((card) => ({
    name: card.querySelector('h2, h3, h4')?.textContent ?? '',
    kind: kinds.find((kind) => card.classList.contains(kind)) ?? 'hidden',
    current: card.getAttribute('aria-current') === 'location',
    box: card.getBoundingClientRect(),
  }));

export const vitestBrowserDriver = (render: () => Promise<void>): Driver => ({
  fresh: render,
  reopen: async () => {
    const main = document.querySelector('main');
    if (main !== null) await openTheApp(main);
  },
  press: async (key) => {
    await browser.userEvent.keyboard(`{${key}}`);
  },
  click: clicking(browser.page),
  type: typing(browser.page),
  drawn: async () => drawn(),
  tree: async () => {
    const main = browser.page.getByRole('main').element();
    return linesOf(utils.aria.renderAriaTree(utils.aria.generateAriaTree(main)));
  },
});
