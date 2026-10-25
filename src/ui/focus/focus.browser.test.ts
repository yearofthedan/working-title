import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { Focus, PieceView } from '../../application/project';
import { browserScope } from '../../test-helpers/browser-scope';
import type { PageScope } from '../../test-helpers/scope';
import { renderFocus } from './focus';

const { commands } = browser as unknown as {
  commands: { emulateReducedMotion(motion: 'reduce' | 'no-preference'): Promise<void> };
};

const facet = { id: 'note', label: 'Note' };
const listLine = { id: 'list-line', label: 'List line' };
const typed: string[] = [];

const sceneAt = (at: number): PieceView => ({
  id: `scene-${at}`,
  name: `Scene ${at}`,
  facets: [{ ...listLine, text: '' }],
  children: [],
});

const sixScenes = [1, 2, 3, 4, 5, 6].map(sceneAt);

const focusOn = (under: readonly PieceView[], storyText = ''): Focus => {
  const beat: PieceView = {
    id: 'beat-1',
    name: 'Beat 1',
    facets: [{ ...facet, text: '' }],
    childKind: 'Scene',
    children: under,
  };

  return {
    pieces: [
      { id: 'story', name: 'The story', facets: [{ ...facet, text: storyText }], children: [] },
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

const pageWith = (
  under: readonly PieceView[],
  { storyText = '', pane = '20rem' }: { storyText?: string; pane?: string } = {},
): PageScope =>
  browserScope(async () => {
    await browser.page.viewport(1440, 900);
    document.body.replaceChildren();
    const main = document.createElement('main');
    main.style.width = pane;
    document.body.append(main);
    renderFocus(main, focusOn(under, storyText));
  });

const pane = (): HTMLElement => document.querySelector('main')!;

const visible = (element: Element): boolean => {
  const { display, opacity } = getComputedStyle(element);
  return display !== 'none' && opacity !== '0' && element.getClientRects().length > 0;
};

const drawnOn = (card: Element, sentence: string): number => {
  const fields = [...card.querySelectorAll('textarea')].filter(
    (field) => field.value === sentence && visible(field),
  );
  const layers = [...card.querySelectorAll('*')].filter(
    (element) =>
      visible(element) &&
      [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent === sentence,
      ),
  );
  return fields.length + layers.length;
};

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

const movesWhileAdding = async (
  scope: PageScope,
  scene: string,
): Promise<{ moves: number; ms: number }> => {
  const graph = pane();
  const where = () => `${graph.scrollLeft},${graph.scrollTop}`;
  let last = where();
  const moved: number[] = [];
  graph.addEventListener('scroll', () => {
    if (where() === last) return;
    last = where();
    moved.push(performance.now());
  });

  await scope.group('Beat 1').press('Add a scene');
  await until(() => {
    const card = sceneCard(scene);
    return card !== undefined && withinThePane(card);
  });

  const from = moved[0] ?? performance.now();
  return { moves: moved.length, ms: performance.now() - from };
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

  it("draws a card's text in the colour of the field it shows", async () => {
    const scope = pageWith([sceneAt(1)]);
    await scope.fresh();

    const layer = document.querySelector('li .facet .shown')!;
    const field = document.querySelector('li .facet textarea')!;

    expect(getComputedStyle(layer).color).toBe(getComputedStyle(field).color);
  });

  it("draws the story's sentence once", async () => {
    const sentence = "A widow hunts the man who sank her husband's ship";
    await pageWith([], { storyText: sentence }).fresh();

    expect(drawnOn(document.querySelector('main > fieldset')!, sentence)).toBe(1);
  });
});

describe('adding a scene', () => {
  afterEach(async () => {
    await commands.emulateReducedMotion('no-preference');
  });

  it('brings the new scene into view and puts the cursor in its list line', async () => {
    const scope = pageWith([sceneAt(1), sceneAt(2), sceneAt(3)]);
    await scope.fresh();

    expect(withinThePane(sceneCard('Scene 3')!)).toBe(false);

    await movesWhileAdding(scope, 'Scene 4');

    const scene = sceneCard('Scene 4')!;
    expect(withinThePane(scene)).toBe(true);
    expect(document.activeElement).toBe(scene.querySelector('textarea'));
  });

  it('pans a scene that starts off screen into view over more than one frame, inside 400 ms', async () => {
    const scope = pageWith(sixScenes, { pane: '60rem' });
    await scope.fresh();

    expect(withinThePane(sceneCard('Scene 6')!)).toBe(false);

    const { moves, ms } = await movesWhileAdding(scope, 'Scene 7');

    expect(withinThePane(sceneCard('Scene 7')!)).toBe(true);
    expect(moves).toBeGreaterThan(1);
    expect(ms).toBeLessThanOrEqual(400);
  });

  it('brings the new scene in one step while the writer asks for reduced motion', async () => {
    await commands.emulateReducedMotion('reduce');
    const scope = pageWith(sixScenes, { pane: '60rem' });
    await scope.fresh();

    const { moves } = await movesWhileAdding(scope, 'Scene 7');

    expect(withinThePane(sceneCard('Scene 7')!)).toBe(true);
    expect(moves).toBe(1);
  });

  it('grows the field being typed in in place, and its button still adds a scene', async () => {
    const scope = pageWith([]);
    await scope.fresh();
    await scope
      .group('Beat 1')
      .field(facet.label)
      .enter(
        'Maren bribes the harbourmaster, then waits for the tide to turn before she rows out past the breakwater at first light.',
      );

    const button = [...document.querySelectorAll('button')].find(
      (candidate) => candidate.textContent === 'Add a scene',
    )!;
    const box = button.getBoundingClientRect();
    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(
      button,
    );

    await scope.group('Beat 1').press('Add a scene');
    await until(() => sceneCard('Scene 1') !== undefined);

    expect(sceneCard('Scene 1')).toBeDefined();
  });
});
