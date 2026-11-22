import * as browser from 'vite-plus/test/browser';
import { cardLooks } from '../../ui/project/graph/card/card';
import { drawn, settled, type AppReads, type Reads } from '../driver';

export const readsIn = (root: () => ParentNode): Reads => ({
  drawn: async () => {
    await settled();
    return drawn(cardLooks, root());
  },
});

export const appReadsIn = (root: () => ParentNode): AppReads => ({
  ...readsIn(root),
  path: async () =>
    browser.page.getByRole('navigation', { name: 'Where you are' }).element().textContent ?? '',
});
export const laidOut = (): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => resolve());
  });
  return promise;
};
