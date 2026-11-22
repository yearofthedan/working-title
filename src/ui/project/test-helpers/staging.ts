import * as browser from 'vite-plus/test/browser';
import { cardLooks } from '../graph/card/card';
import { drawn, settled, type AppReads, type Reads } from '../../../test-helpers/drivers/driver';

export const narrowThePane = (width: number): void => {
  document.querySelector('main')!.style.width = `${width}px`;
};

export const theViewport = async (width: number, height: number): Promise<void> => {
  await browser.page.viewport(width, height);
};

export const aPageWithoutAMain = (): Document => {
  document.body.replaceChildren();
  return document;
};

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
