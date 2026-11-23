import { type Locator, type Page } from '@playwright/test';
import { projectStorageKey } from '../../adapters/local-storage-project-store';
import { cardLooks } from '../../ui/project/graph/card/card';
import {
  clicking,
  drawn,
  farEnoughToReachTheEnd,
  focusAndCurrentIn,
  linesOf,
  markingCurrent,
  markingFocus,
  settled,
  typing,
  wholeNameAnyCase,
  type AppReads,
  type ReloadingDriver,
  type Within,
} from './driver';
import type { Role } from './narrowing';

export interface PlaywrightDriver extends ReloadingDriver {
  readonly theHeaderHeading: Locator;
  opensWatchingTheGraph(): Promise<readonly string[]>;
}

export const openingANewProjectOn = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.showDirectoryPicker = async () => {
      const root = await navigator.storage.getDirectory();
      return await root.getDirectoryHandle('Writing', { create: true });
    };
  });
  await page.goto('/');
  const project = page.getByRole('navigation', { name: 'Where you are' });
  if ((await page.evaluate((key) => localStorage.getItem(key), projectStorageKey)) !== null) {
    await project.waitFor();
    return;
  }
  await page.getByRole('button', { name: 'Choose a folder…', exact: true }).click();
  await page.getByRole('button', { name: 'Start a project', exact: true }).click();
  await page.keyboard.press('Enter');
  await project.waitFor();
};

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
  const tree = async (markFocus = false): Promise<readonly string[]> => {
    await page.evaluate(settled);
    const wholePage = reads === 'page';
    const pane = wholePage ? undefined : await page.getByRole('main').elementHandle();
    const { focus, current } = await page.evaluate(focusAndCurrentIn, pane);
    const marked = markingCurrent(
      linesOf(await (wholePage ? page : page.getByRole('main')).ariaSnapshot()),
      current,
    );
    return markFocus ? markingFocus(marked, focus) : marked;
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
    focusIs: async (role, name, within) =>
      found(role, name, within)
        .first()
        .evaluate((element) => element === document.activeElement),
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
      await page.reload();
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
    theHeaderHeading: page.getByRole('heading', { level: 1 }),
  };
};
