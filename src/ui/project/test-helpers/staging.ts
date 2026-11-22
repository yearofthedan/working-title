import * as browser from 'vite-plus/test/browser';
import type { AppReads } from '../../../test-helpers/drivers/driver';
import { appReadsIn } from '../../../test-helpers/staging/graph-page';

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
