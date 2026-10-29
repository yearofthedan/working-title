import { describe, expect, it } from 'vite-plus/test';
import { arrivalStep, easesOut, movedBy, stepInto, type Box, type Frame } from './frames';

const box = (left: number, top = 0, width = 10, height = 10): Box => ({ left, top, width, height });

const frame = (boxes: Record<string, Box>): Frame => ({
  at: 0,
  running: 0,
  boxes: new Map(Object.entries(boxes)),
});

describe('the step between two frames', () => {
  it.each([
    ['left', box(-7)],
    ['top', box(0, -7)],
    ['width', box(0, 0, 3)],
    ['height', box(0, 0, 10, 3)],
  ])('is the largest change over every box, counting a change in %s either way', (_, moved) => {
    const before = frame({ a: box(0), b: box(0) });
    const now = frame({ a: moved, b: box(3) });
    expect(stepInto(before, now)).toBe(7);
  });

  it('counts a box drawn in only one of the two frames as nothing', () => {
    const before = frame({ a: box(0) });
    const now = frame({ a: box(0), b: box(100, 50, 80, 40) });
    expect(stepInto(before, now)).toBe(0);
  });
});

describe('how far a box moved', () => {
  it('measures where the box is, either way, not how big it is', () => {
    const before = frame({ a: box(0) });
    expect(movedBy(before, frame({ a: box(-10, 0, 100, 50) }), 'a')).toBe(10);
    expect(movedBy(before, frame({ a: box(0, -10, 100, 50) }), 'a')).toBe(10);
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
    const frames = [0, 4, 5, 5.25].map((left) => frame({ a: box(left) }));
    expect(arrivalStep(frames)).toBe(1);
  });
});

describe('whether an easing eases out', () => {
  it('is true for ease-out, spelled as the keyword or as a curve', () => {
    expect(easesOut('ease-out')).toBe(true);
    expect(easesOut('cubic-bezier(0, 0, 0.58, 1)')).toBe(true);
  });

  it('is false for linear, ease-in, ease-in-out, a curve that ends slowing in, an empty string and a malformed curve', () => {
    expect(easesOut('cubic-bezier(0, 0, 1, 1)')).toBe(false);
    expect(easesOut('cubic-bezier(0.42, 0, 1, 1)')).toBe(false);
    expect(easesOut('cubic-bezier(0.42, 0, 0.58, 1)')).toBe(false);
    expect(easesOut('cubic-bezier(0, 0.42, 1, 0.58)')).toBe(false);
    expect(easesOut('')).toBe(false);
    expect(easesOut('cubic-bezier(0.1, 0.2, 0.3)')).toBe(false);
  });
});
