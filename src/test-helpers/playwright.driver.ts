import { type Locator, type Page } from '@playwright/test';
import { clicking, linesOf, typing, type Drawn, type ReloadingDriver } from './driver';

export interface PlaywrightDriver extends ReloadingDriver {
  readonly theAppsName: Locator;
}

/* shortcut: the graph is read in one evaluate, so each box is copied into numbers, since a DOMRect
   crosses the wire as an empty object; read the pieces through locators once one evaluate is not
   enough. */
const drawn = (): readonly Drawn[] =>
  [...document.querySelectorAll<HTMLElement>('main fieldset')].map((card) => {
    const box = card.getBoundingClientRect();
    return {
      name: card.querySelector('h2, h3, h4')?.textContent ?? '',
      kind:
        ['focus', 'card', 'chip', 'hidden'].find((kind) => card.classList.contains(kind)) ??
        'hidden',
      current: card.getAttribute('aria-current') === 'location',
      box: {
        top: box.top,
        left: box.left,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      },
    };
  });

export const playwrightDriver = (page: Page): PlaywrightDriver => ({
  fresh: async () => {
    await page.goto('/');
  },
  reopen: async () => {
    await page.goto('/');
  },
  reload: async () => {
    await page.reload();
  },
  press: async (key) => {
    await page.keyboard.press(key);
  },
  click: clicking(page),
  type: typing(page),
  drawn: async () => {
    await page.getByRole('main').getByRole('group').first().waitFor();
    return page.evaluate(drawn);
  },
  tree: async () => linesOf(await page.getByRole('main').ariaSnapshot()),
  theAppsName: page.getByRole('heading', { name: 'working-title' }),
});
