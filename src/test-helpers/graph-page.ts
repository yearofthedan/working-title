import * as browser from 'vite-plus/test/browser';
import { cardLooks } from '../ui/card/card';
import { drawn, settled, type Reads } from './driver';
import { type Frame } from './frames';
import { nameOf } from '../ui/card/card.test-page';
import { everyCard } from '../ui/graph/graph.test-page';

export const readsIn = (root: () => ParentNode): Reads => ({
  drawn: async () => {
    await settled();
    return drawn(cardLooks, root());
  },
  path: async () =>
    browser.page.getByRole('navigation', { name: 'Where you are' }).element().textContent ?? '',
});

export const readsOnThePage = (): Reads => readsIn(() => document);

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
