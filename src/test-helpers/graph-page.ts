import * as browser from 'vite-plus/test/browser';
import { cardLooks } from '../ui/project/graph/card/card';
import { drawn, settled, type AppReads, type Reads } from './driver';

export const readsIn = (root: () => ParentNode): Reads => ({
  drawn: async () => {
    await settled();
    return drawn(cardLooks, root());
  },
});

export const appReadsIn = (root: () => ParentNode): AppReads => ({
  ...readsIn(root),
  path: async () =>
    browser.page.getByRole('navigation', { name: 'Where you are' }).element().textContent ?? '',
});

export const appReadsOnThePage = (): AppReads => appReadsIn(() => document);

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

export const fading = (): readonly Animation[] =>
  moving().filter(
    (animation) =>
      animation.playState === 'running' &&
      animation.effect instanceof KeyframeEffect &&
      animation.effect.pseudoElement !== null,
  );
