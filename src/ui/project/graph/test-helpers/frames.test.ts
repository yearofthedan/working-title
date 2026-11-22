import { describe, expect, it } from 'vite-plus/test';
import type { Box, Frame } from '../../test-helpers/frames';
import { arrivalStep, movedBy } from './frames';

const box = (left: number, top = 0, width = 10, height = 10): Box => ({ left, top, width, height });

const frame = (boxes: Record<string, Box>): Frame => ({
  at: 0,
  running: 0,
  boxes: new Map(Object.entries(boxes)),
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
