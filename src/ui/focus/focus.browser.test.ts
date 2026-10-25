import { beforeEach, describe, expect, it } from 'vite-plus/test';
import type { Focus, PieceView } from '../../application/project';
import { browserScope } from '../../test-helpers/browser-scope';
import type { PageScope } from '../../test-helpers/scope';
import { renderFocus } from './focus';

const facet = { id: 'note', label: 'Note' };
const listLine = { id: 'list-line', label: 'List line' };
const typed: string[] = [];

const sceneAt = (at: number): PieceView => ({
  id: `scene-${at}`,
  name: `Scene ${at}`,
  facets: [{ ...listLine, text: '' }],
  children: [],
});

const focusOn = (under: readonly PieceView[]): Focus => {
  const beat: PieceView = {
    id: 'beat-1',
    name: 'Beat 1',
    facets: [{ ...facet, text: '' }],
    childKind: 'Scene',
    children: under,
  };

  return {
    pieces: [
      { id: 'story', name: 'The story', facets: [{ ...facet, text: '' }], children: [] },
      beat,
    ],
    elaborate: async (_pieceId, _facetId, text) => {
      typed.push(text);
    },
    branch: async () => {
      const at = under.length + 1;
      return { focus: focusOn([...under, sceneAt(at)]), added: `scene-${at}` };
    },
  };
};

const pageWith = (under: readonly PieceView[]): PageScope =>
  browserScope(async () => {
    document.body.replaceChildren();
    const main = document.createElement('main');
    main.style.width = '20rem';
    document.body.append(main);
    renderFocus(main, focusOn(under));
  });

const pane = (): HTMLElement => document.querySelector('main')!;

const sceneCard = (name: string): HTMLElement | undefined =>
  [...document.querySelectorAll('fieldset')].find(
    (card) => card.querySelector('h4')?.textContent === name,
  );

const withinThePane = (element: Element): boolean => {
  const box = element.getBoundingClientRect();
  const beyond = pane().getBoundingClientRect();
  const slack = 0.5;
  return (
    box.left >= beyond.left - slack &&
    box.right <= beyond.right + slack &&
    box.top >= beyond.top - slack &&
    box.bottom <= beyond.bottom + slack
  );
};

const until = async (what: () => boolean): Promise<void> => {
  for (let frame = 0; frame < 120 && !what(); frame += 1) {
    const { promise, resolve } = Promise.withResolvers<void>();
    requestAnimationFrame(() => resolve());
    await promise;
  }
};

describe('the focus page', () => {
  let scope: PageScope;

  beforeEach(() => {
    typed.length = 0;
    scope = pageWith([]);
  });

  it('tells the application about every keystroke as it is typed', async () => {
    await scope.fresh();
    const field = scope.field(facet.label);

    await field.enter('A wid');
    await field.enter("A widow hunts the man's ship");

    expect(typed).toEqual(['A wid', "A widow hunts the man's ship"]);
  });
});

describe('adding a scene', () => {
  it('brings the new scene into view and puts the cursor in its list line', async () => {
    const scope = pageWith([sceneAt(1), sceneAt(2), sceneAt(3)]);
    await scope.fresh();

    expect(withinThePane(sceneCard('Scene 3')!)).toBe(false);

    await scope.group('Beat 1').press('Add a scene');
    await until(() => {
      const card = sceneCard('Scene 4');
      return card !== undefined && withinThePane(card);
    });

    const scene = sceneCard('Scene 4')!;
    expect(withinThePane(scene)).toBe(true);
    expect(document.activeElement).toBe(scene.querySelector('textarea'));
  });
});
