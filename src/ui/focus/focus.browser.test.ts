import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import type { Focus } from '../../application/project';
import { renderFocus } from './focus';

const facet = { id: 'note', label: 'Note' };
const typed: string[] = [];

const focusOn = (): Focus => ({
  facets: [{ ...facet, text: '' }],
  elaborate: async (_id, text) => {
    typed.push(text);
  },
});

describe('the focus page', () => {
  beforeEach(() => {
    typed.length = 0;
    document.body.replaceChildren();
    const main = document.createElement('main');
    document.body.append(main);
    renderFocus(main, focusOn());
  });

  it('tells the application about every keystroke as it is typed', async () => {
    const field = page.getByLabelText(facet.label);

    await field.fill('A wid');
    await field.fill("A widow hunts the man's ship");

    expect(typed).toEqual(['A wid', "A widow hunts the man's ship"]);
  });
});
