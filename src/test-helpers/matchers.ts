import { expect } from 'vite-plus/test';

export const isCurrent = (ariaCurrent: string | null): boolean => ariaCurrent === 'location';

declare module 'vite-plus/test' {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toBeCurrent(): R;
  }
}

expect.extend({
  toBeCurrent(element: Element | null) {
    const ariaCurrent = element?.getAttribute('aria-current') ?? null;
    return {
      pass: isCurrent(ariaCurrent),
      message: (): string =>
        `expected the card${this.isNot ? ' not' : ''} to be the current piece, aria-current was ${ariaCurrent}`,
    };
  },
});
