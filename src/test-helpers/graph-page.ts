import { type Driver } from './driver';
import { type Frame } from './frames';
import { nameOf } from './measuring';
import { thePage } from './staging';
import { openTheApp } from './the-app';
import { vitestBrowserDriver } from './vitest-browser.driver';
import { writerOn, type Writer } from '../ui/graph/graph.dsl';

export const pageWith = (scenes = 0, width = 1440): { driver: Driver; writer: Writer } => {
  const driver = vitestBrowserDriver(async () => {
    localStorage.clear();
    await thePage(width);
    await openTheApp();
    if (scenes === 0) return;
    const writer = writerOn(driver);
    for (let at = 0; at < scenes; at += 1) {
      await writer.addsASceneUnder('Beat 4');
    }
    await openTheApp();
  });
  return { driver, writer: writerOn(driver) };
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

export const recorded = async (play: () => Promise<void>): Promise<readonly Frame[]> => {
  const frames: Frame[] = [];
  const { promise, resolve } = Promise.withResolvers<void>();
  let sampling = true;
  const tick = (): void => {
    frames.push({
      at: performance.now(),
      running: moving().length,
      boxes: new Map(
        [...document.querySelectorAll<HTMLElement>('main fieldset')].map((card) => [
          nameOf(card),
          card.getBoundingClientRect(),
        ]),
      ),
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
