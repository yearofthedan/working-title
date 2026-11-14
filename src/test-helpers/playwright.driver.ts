import { type Locator, type Page } from '@playwright/test';
import { cardLooks } from '../ui/card/card';
import {
  clicking,
  drawn,
  farEnoughToReachTheEnd,
  focusAssertions,
  focusedIn,
  markingFocusWhenAsserted,
  settled,
  typing,
  wholeNameAnyCase,
  type AppReads,
  type ReloadingDriver,
  type Role,
  type Within,
} from './driver';

export interface PlaywrightDriver extends ReloadingDriver {
  readonly theAppsName: Locator;
  opensWatchingTheGraph(): Promise<readonly string[]>;
}

export const playwrightReads = (page: Page): AppReads => ({
  drawn: async () => {
    await page.getByRole('main').getByRole('group').first().waitFor();
    await page.evaluate(settled);
    return page.evaluate(drawn, cardLooks);
  },
  path: async () =>
    (await page.getByRole('navigation', { name: 'Where you are' }).textContent()) ?? '',
});

export const playwrightDriver = (page: Page, reads: 'main' | 'page' = 'main'): PlaywrightDriver => {
  const rootIn = (within?: Within) =>
    within === undefined
      ? page
      : page.getByRole(within.role, { name: wholeNameAnyCase(within.name) });
  const found = (role: Role, name: string, within?: Within) =>
    rootIn(within).getByRole(role, { name: wholeNameAnyCase(name) });
  const assertions = focusAssertions();
  const tree = async (): Promise<readonly string[]> => {
    await page.evaluate(settled);
    const wholePage = reads === 'page';
    const pane = wholePage ? undefined : await page.getByRole('main').elementHandle();
    return markingFocusWhenAsserted(
      assertions,
      async () => (wholePage ? page : page.getByRole('main')).ariaSnapshot(),
      async () => page.evaluate(focusedIn, pane),
    );
  };
  return {
    reload: async () => {
      await page.reload();
    },
    press: async (key) => {
      await page.keyboard.press(key);
    },
    click: clicking(page),
    focus: async (role, name, within) => {
      await found(role, name, within).focus();
    },
    hover: async (role, name, within) => {
      await found(role, name, within).hover();
    },
    scrollToTheEnd: async (role, name, within) => {
      await found(role, name, within).hover();
      await page.mouse.wheel(0, farEnoughToReachTheEnd);
    },
    type: typing(page),
    clickAway: async () => {
      await page.mouse.click(0, 0);
    },
    value: async (label, within) =>
      rootIn(within).getByLabel(wholeNameAnyCase(label)).first().inputValue(),
    focusIs: async (role, name, within) => {
      assertions.note();
      return found(role, name, within)
        .first()
        .evaluate((element) => element === document.activeElement);
    },
    tree,
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
  };
};
