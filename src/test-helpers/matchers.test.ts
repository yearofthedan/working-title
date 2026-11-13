import { describe, expect, it } from 'vite-plus/test';
import { isCurrent } from './matchers';

describe('isCurrent', () => {
  it('reads location as the current piece', () => {
    expect(isCurrent('location')).toBe(true);
  });

  it.each([null, '', 'page', 'step'])('reads %s as not the current piece', (ariaCurrent) => {
    expect(isCurrent(ariaCurrent)).toBe(false);
  });
});
