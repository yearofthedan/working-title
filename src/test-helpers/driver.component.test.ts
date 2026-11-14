import { describe, expect, it } from 'vite-plus/test';
import { aPageFocusedOnSomethingUnnamed } from './staging';
import { vitestBrowserDriver } from './vitest-browser.driver';

describe('reading a tree while something unnamed holds focus', () => {
  const theDriver = () => vitestBrowserDriver(undefined, 'page');

  it('reads it unmarked, since the step asserted no focus', async () => {
    aPageFocusedOnSomethingUnnamed();

    expect(await theDriver().tree(false)).toEqual(['- paragraph']);
  });

  it('refuses it where the tree is marked', async () => {
    aPageFocusedOnSomethingUnnamed();

    await expect(theDriver().tree(true)).rejects.toThrow(
      'the element that holds focus is one whose role or name this reader cannot read: name it in focusAndCurrentIn',
    );
  });
});
