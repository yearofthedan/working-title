import { type Frame } from '../../test-helpers/frames';
import { laidOut } from '../../../../test-helpers/staging/graph-page';
import { nameOf } from '../card/card.test-page';
import { everyCard } from '../graph.test-page';
import { moving } from '../../test-helpers/staging';

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

export const frameNow = (): Frame => ({
  at: performance.now(),
  running: moving().length,
  boxes: new Map(everyCard().map((card) => [nameOf(card), card.getBoundingClientRect()])),
});

export const recorded = async (play: () => Promise<void>): Promise<readonly Frame[]> => {
  const frames: Frame[] = [];
  const { promise, resolve } = Promise.withResolvers<void>();
  let sampling = true;
  const tick = (): void => {
    frames.push(frameNow());
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

export const holdMoves = (): void => {
  for (const move of moving()) move.pause();
};

export const holdNewMovesAtTheirStart = (): void => {
  for (const move of moving().filter(({ playState }) => playState === 'running')) {
    move.pause();
    move.currentTime = 0;
  }
};

export const finishMoves = (): void => {
  for (const move of moving()) move.finish();
};
