import { beforeEach, describe, expect, it } from 'vite-plus/test';
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

const field = (): HTMLTextAreaElement => {
  const found = document.querySelector(`textarea[id="facet-${facet.id}"]`);
  if (!(found instanceof HTMLTextAreaElement)) throw new Error('the field is not on the page');
  return found;
};

const type = (text: string) => {
  const input = field();
  input.value = text;
  input.dispatchEvent(new Event('input'));
};

describe('the focus page', () => {
  beforeEach(() => {
    typed.length = 0;
    document.body.replaceChildren();
    const main = document.createElement('main');
    document.body.append(main);
    renderFocus(main, focusOn());
  });

  it('tells the application about every keystroke as it is typed', () => {
    type('A wid');
    type("A widow hunts the man's ship");

    expect(typed).toEqual(['A wid', "A widow hunts the man's ship"]);
  });

  it('labels the field with the facet it holds', () => {
    expect(document.querySelector(`textarea[id="facet-${facet.id}"]`)).not.toBeNull();
    expect(document.body.textContent).toContain(facet.label);
  });
});
