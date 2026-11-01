import * as browser from 'vite-plus/test/browser';
import { cardLooks } from '../ui/card/card';
import { type Driver, type Opening, type Reads } from './driver';
import { drawn, settled, wholeNameAnyCase } from './driver';
import { type Frame } from './frames';
import { nameOf } from '../ui/card/card.test-page';
import { everyCard } from '../ui/graph/graph.test-page';
import { thePage } from './staging';
import { openTheApp } from './the-app';
import { vitestBrowserDriver } from './vitest-browser.driver';
import { seesOn, writerOn, type Sees, type Writer } from '../ui/graph/graph.dsl';

export const readsIn = (root: () => ParentNode): Reads => ({
  drawn: async () => {
    await settled();
    return drawn(cardLooks, root());
  },
  path: async () =>
    browser.page.getByRole('navigation', { name: 'Where you are' }).element().textContent ?? '',
});

export const readsOnThePage = (): Reads => readsIn(() => document);

export const addASceneUnder = async (driver: Driver, beat: string): Promise<void> => {
  await driver.click('heading', beat, { role: 'group', name: beat });
  await driver.click('button', 'Add a scene', { role: 'group', name: beat });
};

export const pageWith = (
  scenes = 0,
  width = 1440,
): { driver: Driver; stage: Opening; writer: Writer; sees: Sees } => {
  const driver = vitestBrowserDriver();
  const stage: Opening = {
    fresh: async () => {
      localStorage.clear();
      await thePage(width);
      await openTheApp();
      for (let at = 0; at < scenes; at += 1) await addASceneUnder(driver, 'Beat 4');
      if (scenes > 0) await openTheApp();
    },
    reopen: async () => {
      await openTheApp();
    },
  };
  return {
    driver,
    stage,
    writer: writerOn(driver, stage),
    sees: seesOn(driver, readsOnThePage()),
  };
};

export const graphOn = (
  name: string,
  opening: Opening,
): { driver: Driver; writer: Writer; sees: Sees } => {
  const driver = vitestBrowserDriver(name);
  const main = browser.page.getByRole('main', { name: wholeNameAnyCase(name) });
  return {
    driver,
    writer: writerOn(driver, opening),
    sees: seesOn(
      driver,
      readsIn(() => main.element()),
    ),
  };
};
export const laidOut = (): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => resolve());
  });
  return promise;
};

export const moving = (): readonly Animation[] => {
  void document.body.offsetWidth;
  return document.getAnimations();
};

export interface StartedTransition {
  readonly property: string;
  readonly easing: string;
}

export const startedTransitions = (): readonly StartedTransition[] =>
  document
    .getAnimations()
    .filter((animation) => animation instanceof CSSTransition)
    .map((animation) => ({
      property: animation.transitionProperty,
      easing: animation.effect?.getComputedTiming().easing ?? '',
    }));

export const recorded = async (play: () => Promise<void>): Promise<readonly Frame[]> => {
  const frames: Frame[] = [];
  const { promise, resolve } = Promise.withResolvers<void>();
  let sampling = true;
  const tick = (): void => {
    frames.push({
      at: performance.now(),
      running: moving().length,
      boxes: new Map(everyCard().map((card) => [nameOf(card), card.getBoundingClientRect()])),
    });
    if (sampling) requestAnimationFrame(tick);
    else resolve();
  };
  requestAnimationFrame(tick);
  await play();
  sampling = false;
  await promise;
  return frames;
};

export const partWay = async (): Promise<void> => {
  for (let frame = 0; frame < 12; frame += 1) {
    await laidOut();
    if (moving().some((animation) => Number(animation.currentTime ?? 0) > 100)) return;
  }
};
