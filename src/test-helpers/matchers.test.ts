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

const withAriaCurrent = (value: string | null) => ({ getAttribute: () => value });

describe('toBeCurrent', () => {
  it('says the card is not the current piece, and what aria-current held', () => {
    expect(() => expect(withAriaCurrent('page')).toBeCurrent()).toThrow(
      'expected the card to be the current piece, aria-current was page',
    );
  });

  it('says the card is the current piece when it was expected not to be', () => {
    expect(() => expect(withAriaCurrent('location')).not.toBeCurrent()).toThrow(
      'expected the card not to be the current piece, aria-current was location',
    );
  });
});
