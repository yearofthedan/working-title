export interface Box {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface Frame {
  readonly at: number;
  readonly running: number;
  readonly boxes: ReadonlyMap<string, Box>;
}

export const stepInto = (before: Frame, now: Frame): number =>
  Math.max(
    0,
    ...[...new Set([...before.boxes.keys(), ...now.boxes.keys()])].map((what) => {
      const was = before.boxes.get(what);
      const is = now.boxes.get(what);
      if (was === undefined || is === undefined) return 0;
      return Math.max(
        Math.abs(is.left - was.left),
        Math.abs(is.top - was.top),
        Math.abs(is.width - was.width),
        Math.abs(is.height - was.height),
      );
    }),
  );

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
export const easesOut = (easing = ''): boolean => {
  if (easing === 'ease-out') return true;
  const curve = /^cubic-bezier\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/.exec(easing);
  if (curve === null) return false;
  const [, x1, y1, x2, y2] = curve.map(Number) as [number, number, number, number, number];
  return y1 >= x1 && y2 >= x2 && (y1 > x1 || y2 > x2);
};
