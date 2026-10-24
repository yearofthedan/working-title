import { beforeEach, describe, expect, it } from 'vite-plus/test';
import type { Focus } from '../../application/project';
import { browserScope } from '../../test-helpers/browser-scope';
import type { PageScope } from '../../test-helpers/scope';
import { renderFocus } from './focus';

const facet = { id: 'note', label: 'Note' };
const typed: string[] = [];

const focusOn = (): Focus => ({
  pieces: [{ id: 'story', name: 'The story', facets: [{ ...facet, text: '' }] }],
  elaborate: async (_pieceId, _facetId, text) => {
    typed.push(text);
  },
});

describe('the focus page', () => {
  let scope: PageScope;

  beforeEach(() => {
    typed.length = 0;
    scope = browserScope(async () => {
      document.body.replaceChildren();
      const main = document.createElement('main');
      document.body.append(main);
      renderFocus(main, focusOn());
    });
  });

  it('tells the application about every keystroke as it is typed', async () => {
    await scope.fresh();
    const field = scope.field(facet.label);

    await field.enter('A wid');
    await field.enter("A widow hunts the man's ship");

    expect(typed).toEqual(['A wid', "A widow hunts the man's ship"]);
  });
});
