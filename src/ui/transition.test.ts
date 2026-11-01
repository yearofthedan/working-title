import { describe, expect, it } from 'vite-plus/test';
import { whileMeasuring } from './transition';

describe('the transition a card is measured under', () => {
  it('leaves out the width and the height, and keeps visibility only when asked', () => {
    const drawn = 'left, top, width, height, opacity, visibility';

    expect(whileMeasuring(drawn, true)).toBe('left, top, opacity, visibility');
    expect(whileMeasuring(drawn, false)).toBe('left, top, opacity');
  });

  it('gives back all, the computed value under reduced motion', () => {
    expect(whileMeasuring('all', false)).toBe('all');
  });
});
