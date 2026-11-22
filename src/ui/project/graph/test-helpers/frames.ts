import { stepInto, type Frame } from '../../../../test-helpers/measures/frames';

export const movedBy = (before: Frame, now: Frame, what: string): number => {
  const was = before.boxes.get(what);
  const is = now.boxes.get(what);
  if (was === undefined || is === undefined) return 0;
  return Math.max(Math.abs(is.left - was.left), Math.abs(is.top - was.top));
};

export const arrivalStep = (frames: readonly Frame[]): number => {
  let last = 1;
  for (let at = 1; at < frames.length; at += 1) {
    if (stepInto(frames[at - 1]!, frames[at]!) > 0.5) last = at;
  }
  return stepInto(frames[last - 1]!, frames[last]!);
};
