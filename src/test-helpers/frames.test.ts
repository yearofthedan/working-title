import { describe, expect, it } from 'vite-plus/test';
import { arrivalStep, easesOut, movedBy, stepInto, type Box, type Frame } from './frames';

const box = (left: number, top = 0, width = 10, height = 10): Box => ({ left, top, width, height });

const frame = (boxes: Record<string, Box>): Frame => ({
  at: 0,
  running: 0,
  boxes: new Map(Object.entries(boxes)),
});

describe('the step between two frames', () => {
  it('is the largest change in left, top, width or height over every box', () => {
    const before = frame({ a: box(0, 0, 10, 10), b: box(0, 0, 10, 10) });
    const now = frame({ a: box(3, 0, 10, 10), b: box(0, 0, 17, 10) });
    expect(stepInto(before, now)).toBe(7);
  });

  it('counts a box drawn in only one of the two frames as nothing', () => {
    const before = frame({ a: box(0) });
    const now = frame({ a: box(0), b: box(100, 50, 80, 40) });
    expect(stepInto(before, now)).toBe(0);
  });
});

describe('how far a box moved', () => {
  it('measures where the box is, not how big it is', () => {
    const before = frame({ a: box(0, 0, 10, 10) });
    const now = frame({ a: box(10, 0, 100, 50) });
    expect(movedBy(before, now, 'a')).toBe(10);
  });

  it('is nothing when the box is drawn in only one of the two frames', () => {
    const before = frame({ a: box(0) });
    const now = frame({ a: box(10), b: box(100, 50, 80, 40) });
    expect(movedBy(before, now, 'b')).toBe(0);
    expect(movedBy(now, before, 'b')).toBe(0);
  });
});

describe('the step a move arrived on', () => {
  it('is the last step over half a pixel, not the largest step', () => {
    const frames = [0, 4, 4.25, 5.25].map((left) => frame({ a: box(left) }));
    expect(arrivalStep(frames)).toBe(1);
  });
});

describe('whether an easing eases out', () => {
  it('is true for ease-out, spelled as the keyword or as a curve', () => {
    expect(easesOut('ease-out')).toBe(true);
    expect(easesOut('cubic-bezier(0, 0, 0.58, 1)')).toBe(true);
  });

  it('is false for linear, an ease-in curve, an empty string and a malformed curve', () => {
    expect(easesOut('linear')).toBe(false);
    expect(easesOut('cubic-bezier(0.42, 0, 1, 1)')).toBe(false);
    expect(easesOut('')).toBe(false);
    expect(easesOut('cubic-bezier(0.1, 0.2, 0.3)')).toBe(false);
  });
});
