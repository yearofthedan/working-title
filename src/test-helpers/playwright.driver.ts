import { type Locator, type Page } from '@playwright/test';
import { drawnKinds } from '../ui/graph/graph';
import {
  clicking,
  drawn,
  linesOf,
  settled,
  typing,
  wholeNameAnyCase,
  type ReloadingDriver,
} from './driver';

export interface PlaywrightDriver extends ReloadingDriver {
  readonly theAppsName: Locator;
  opensWatchingTheGraph(): Promise<readonly string[]>;
}

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
  focus: async (role, name, within) => {
    const root =
      within === undefined
        ? page
        : page.getByRole(within.role, { name: wholeNameAnyCase(within.name) });
    await root.getByRole(role, { name: wholeNameAnyCase(name) }).focus();
  },
  type: typing(page),
  drawn: async () => {
    await page.getByRole('main').getByRole('group').first().waitFor();
    await page.evaluate(settled);
    return page.evaluate(drawn, drawnKinds);
  },
  tree: async () => {
    await page.evaluate(settled);
    return linesOf(await page.getByRole('main').ariaSnapshot());
  },
  path: async () =>
    (await page.getByRole('navigation', { name: 'Where you are' }).textContent()) ?? '',
  opensWatchingTheGraph: async () => {
    await page.addInitScript(() => {
      const frames: string[] = [];
      const sample = (): void => {
        const cards = [...document.querySelectorAll<HTMLElement>('main fieldset')];
        if (cards.length > 0) {
          frames.push(
            cards
              .map((card) => {
                const box = card.getBoundingClientRect();
                return `${card.querySelector('h2, h3, h4')?.textContent ?? ''} ${box.left} ${box.top} ${box.width} ${box.height}`;
              })
              .join(' | '),
          );
          document.documentElement.dataset.graphFrames = frames.join('\n');
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto('/');
    return page.evaluate(async () => {
      await document.fonts.ready;
      const { promise, resolve } = Promise.withResolvers<void>();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      await promise;
      return (document.documentElement.dataset.graphFrames ?? '')
        .split('\n')
        .filter((frame) => frame !== '');
    });
  },
  theAppsName: page.getByRole('heading', { name: 'working-title' }),
});
