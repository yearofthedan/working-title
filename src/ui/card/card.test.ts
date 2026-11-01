import { describe, expect, it } from 'vite-plus/test';
import { keyOnTheCard, type CardMove, type KeyOnTheCard } from './card';

const on = (over: Partial<KeyOnTheCard>): CardMove =>
  keyOnTheCard({ current: true, at: 'card', key: '', shift: false, where: 0, stops: 2, ...over });

describe('the keys on the current card', () => {
  it('goes into the card with Enter pressed on it', () => {
    expect(on({ at: 'card', key: 'Enter' })).toBe('enter');
  });

  it('goes back to the card with Esc pressed in one of its fields', () => {
    expect(on({ at: 'field', key: 'Escape' })).toBe('back');
  });

  it('wraps forward from the last input or action to the first', () => {
    expect(on({ at: 'field', key: 'Tab', where: 1, stops: 2 })).toBe('first');
  });

  it('wraps backward from the first input to the last', () => {
    expect(on({ at: 'field', key: 'Tab', shift: true, where: 0, stops: 2 })).toBe('last');
  });

  it('wraps nowhere from a field that is neither first nor last', () => {
    expect(on({ at: 'field', key: 'Tab', where: 0, stops: 3 })).toBe('none');
    expect(on({ at: 'field', key: 'Tab', shift: true, where: 1, stops: 3 })).toBe('none');
  });

  it('does nothing for another key', () => {
    expect(on({ at: 'field', key: 'ArrowDown' })).toBe('none');
    expect(on({ at: 'card', key: 'Tab' })).toBe('none');
  });

  it('does none of this when the card is not the current piece', () => {
    expect(on({ current: false, at: 'card', key: 'Enter' })).toBe('none');
    expect(on({ current: false, at: 'field', key: 'Escape' })).toBe('none');
    expect(on({ current: false, at: 'field', key: 'Tab', where: 1, stops: 2 })).toBe('none');
    expect(on({ current: false, at: 'field', key: 'Tab', shift: true, where: 0, stops: 2 })).toBe(
      'none',
    );
  });
});
