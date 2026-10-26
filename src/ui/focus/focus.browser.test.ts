import { describe, expect, it } from 'vite-plus/test';
import { browserScope } from '../../test-helpers/browser-scope';
import type { PageScope } from '../../test-helpers/scope';
import { openTheApp, thePage } from '../../test-helpers/the-app';

const stored = 'working-title:project';

const pageWith = (scenes = 0, width = 1440): PageScope => {
  const scope = browserScope(async () => {
    localStorage.clear();
    const main = await thePage(width);
    await openTheApp(main);
    if (scenes === 0) return;
    await scope.group('Beat 4').click();
    for (let at = 0; at < scenes; at += 1) await scope.group('Beat 4').press('Add a scene');
  });
  return scope;
};

const pane = (): HTMLElement => document.querySelector('main')!;

const cards = (kind: string): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>(`main fieldset.${kind}`),
];

const nameOf = (card: HTMLElement): string => card.querySelector('h2, h3')!.textContent ?? '';

const centreOf = (card: Element): number => {
  const box = card.getBoundingClientRect();
  return box.left + box.width / 2;
};

const focused = (): HTMLElement => {
  const [card] = cards('focus');
  if (card === undefined) throw new Error('no piece is drawn as the focus');
  return card;
};

const named = (kind: string, name: string): HTMLElement => {
  const card = cards(kind).find((one) => nameOf(one) === name);
  if (card === undefined) throw new Error(`no piece named ${name} is drawn as a ${kind}`);
  return card;
};

const visible = (element: Element): boolean => {
  const { display, opacity } = getComputedStyle(element);
  return display !== 'none' && opacity !== '0' && element.getClientRects().length > 0;
};

const drawnOn = (card: Element, sentence: string): number =>
  [...card.querySelectorAll('textarea')].filter(
    (field) => field.value === sentence && visible(field),
  ).length +
  [...card.querySelectorAll('*')].filter(
    (element) =>
      visible(element) &&
      [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent === sentence,
      ),
  ).length;

const theStory = "A widow hunts the man who sank her husband's ship";

describe('the focus page', () => {
  it('tells the application about every keystroke as it is typed', async () => {
    const scope = pageWith();
    await scope.fresh();

    await scope.group('The story').field('One-sentence summary').enter('A wid');
    expect(localStorage.getItem(stored)).toContain('A wid');

    await scope.group('The story').field('One-sentence summary').enter(theStory);
    expect(localStorage.getItem(stored)).toContain(theStory);
  });

  it('draws the sentence on the focus card once', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('The story').field('One-sentence summary').enter(theStory);

    expect(drawnOn(focused(), theStory)).toBe(1);
  });

  it("draws a card's text in the colour of the field it shows", async () => {
    const scope = pageWith();
    await scope.fresh();

    const layer = document.querySelector('.card .facet .shown')!;
    const field = document.querySelector('.card .facet textarea')!;

    expect(getComputedStyle(layer).color).toBe(getComputedStyle(field).color);
  });
});

describe('the graph around the focus', () => {
  it.each([1440, 1100])('draws the focus card 560 px wide and centred at %i px', async (width) => {
    const scope = pageWith(0, width);
    await scope.fresh();

    expect(focused().getBoundingClientRect().width).toBe(560);
    expect(centreOf(focused())).toBeCloseTo(centreOf(pane()), 0);
  });

  it('shows the whole sentence on the focus card, and fits its height to what it holds', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope
      .group('The story')
      .field('One-sentence summary')
      .enter(
        'A widowed lighthouse keeper trades her last winter of fuel for a stranger\u2019s chart, then finds the chart leads back to the harbour where her husband\u2019s boat went down.',
      );

    const field = focused().querySelector('textarea')!;
    expect(field.clientHeight).toBeGreaterThanOrEqual(field.scrollHeight - 1);
    expect(focused().getBoundingClientRect().height).toBeGreaterThan(
      named('card', 'Beat 1').getBoundingClientRect().height,
    );
  });

  it('puts the parent straight above the focus and the children in a row under it', async () => {
    const scope = pageWith(2);
    await scope.fresh();
    await scope.group('Beat 4').click();

    const focus = focused();
    const parent = named('card', 'The story');
    expect(centreOf(parent)).toBeCloseTo(centreOf(focus), 0);
    expect(parent.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      focus.getBoundingClientRect().top,
    );

    const children = cards('card').filter((card) => card !== parent);
    expect(children.map(nameOf)).toEqual(['Scene 1', 'Scene 2']);
    expect(children[0]!.getBoundingClientRect().top).toBe(children[1]!.getBoundingClientRect().top);
    expect(children[0]!.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      focus.getBoundingClientRect().bottom,
    );
    const row =
      (children[0]!.getBoundingClientRect().left + children[1]!.getBoundingClientRect().right) / 2;
    expect(row).toBeCloseTo(centreOf(focus), 0);
  });

  it('centres a row of eight scenes under the focus, inside main at 1440 px', async () => {
    const scope = pageWith(8, 1440);
    await scope.fresh();
    await scope.group('Beat 4').click();

    const children = cards('card').filter((card) => card !== named('card', 'The story'));
    expect(children).toHaveLength(8);
    const bounds = pane().getBoundingClientRect();
    const left = Math.min(...children.map((card) => card.getBoundingClientRect().left));
    const right = Math.max(...children.map((card) => card.getBoundingClientRect().right));
    expect(left).toBeGreaterThanOrEqual(bounds.left);
    expect(right).toBeLessThanOrEqual(bounds.right);
  });

  it('cuts a row of eight scenes off evenly at both edges at 1100 px', async () => {
    const scope = pageWith(8, 1100);
    await scope.fresh();
    await scope.group('Beat 4').click();

    const children = cards('card').filter((card) => card !== named('card', 'The story'));
    const bounds = pane().getBoundingClientRect();
    const left = Math.min(...children.map((card) => card.getBoundingClientRect().left));
    const right = Math.max(...children.map((card) => card.getBoundingClientRect().right));
    expect(bounds.left - left).toBeGreaterThan(0);
    expect(right - bounds.right).toBeCloseTo(bounds.left - left, 0);
  });

  it('puts the earlier siblings left of the focus and the later ones right, on its row', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 3').click();

    const focus = focused();
    const box = focus.getBoundingClientRect();
    const chips = cards('chip');
    expect(chips.map(nameOf)).toEqual(['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5']);

    for (const [at, chip] of chips.entries()) {
      const chipBox = chip.getBoundingClientRect();
      expect(chipBox.top + chipBox.height / 2).toBeCloseTo(box.top + box.height / 2, 0);
      if (at < 2) expect(chipBox.right).toBeLessThanOrEqual(box.left);
      else expect(chipBox.left).toBeGreaterThanOrEqual(box.right);
    }
  });

  it('keeps a piece off the graph out of the tree and out of the tab order', async () => {
    const scope = pageWith(8);
    await scope.fresh();
    await scope.group('The story').click();

    expect(cards('hidden')).toHaveLength(8);
    expect((await scope.tree()).join('\n')).not.toContain('Scene');

    for (let at = 0; at < 12; at += 1) {
      await scope.press('Tab');
      expect(document.activeElement?.closest('fieldset.hidden') ?? null).toBeNull();
    }
  });
});

describe('moving the focus', () => {
  it('leaves the focus on the story when ↑ has nowhere to go', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.press('ArrowUp');

    expect(nameOf(focused())).toBe('The story');
  });

  it('leaves the focus where it is when ↓ has no child to go to', async () => {
    const scope = pageWith(1);
    await scope.fresh();
    await scope.group('Beat 4').click();
    await scope.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');

    await scope.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');
  });

  it('leaves the focus on the first sibling when ← has nowhere to go', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 1').click();
    await scope.press('ArrowLeft');

    expect(nameOf(focused())).toBe('Beat 1');
  });

  it('leaves the focus on the last sibling when → has nowhere to go', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 5').click();
    await scope.press('ArrowRight');

    expect(nameOf(focused())).toBe('Beat 5');
  });

  it('moves to the parent with ↑, and across the level with → and ←', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();

    await scope.press('ArrowRight');
    expect(nameOf(focused())).toBe('Beat 3');

    await scope.press('ArrowLeft');
    expect(nameOf(focused())).toBe('Beat 2');

    await scope.press('ArrowUp');
    expect(nameOf(focused())).toBe('The story');
  });

  it('moves down to the first child, and then to the child last visited', async () => {
    const scope = pageWith(2);
    await scope.fresh();
    await scope.group('Beat 4').click();

    await scope.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');

    await scope.press('ArrowRight');
    expect(nameOf(focused())).toBe('Scene 2');

    await scope.press('ArrowUp');
    expect(nameOf(focused())).toBe('Beat 4');

    await scope.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 2');
  });

  it('leaves the focus where it is while the cursor is in a sentence', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();
    await scope.press('Enter');
    await scope.press('ArrowRight');

    expect(nameOf(focused())).toBe('Beat 2');
    expect(document.activeElement).toBe(focused().querySelector('textarea'));
  });

  it('puts the cursor on the focus card with Esc, and the arrows then move the focus', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();
    await scope.press('Enter');
    await scope.press('Escape');

    expect(document.activeElement).toBe(focused());
    expect(nameOf(focused())).toBe('Beat 2');

    await scope.press('ArrowRight');
    expect(nameOf(focused())).toBe('Beat 3');
  });

  it("puts the cursor in the focus card's sentence with Enter", async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();
    await scope.press('Enter');

    expect(document.activeElement).toBe(focused().querySelector('textarea'));
  });

  it('leaves the cursor on the new focus card after a key, a chip, a card and a path', async () => {
    const scope = pageWith();
    await scope.fresh();

    await scope.press('ArrowDown');
    expect(nameOf(focused())).toBe('Beat 1');
    expect(document.activeElement).toBe(focused());

    await scope.group('Beat 3').click();
    expect(nameOf(focused())).toBe('Beat 3');
    expect(document.activeElement).toBe(focused());

    await scope.group('Beat 4').click();
    expect(nameOf(focused())).toBe('Beat 4');
    expect(document.activeElement).toBe(focused());

    await scope.step('The story');
    expect(nameOf(focused())).toBe('The story');
    expect(document.activeElement).toBe(focused());
  });

  it('moves the focus to a piece whose sentence is clicked, with the cursor in it', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').field('One-sentence summary').click();

    expect(nameOf(focused())).toBe('Beat 2');
    expect(document.activeElement).toBe(focused().querySelector('textarea'));
  });
});

describe('what a move leaves alone', () => {
  it('writes nothing to storage', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').field('One-sentence summary').enter("Maren finds the ship's log");
    const before = localStorage.getItem(stored);
    expect(before).not.toBeNull();

    await scope.press('ArrowRight');
    await scope.press('ArrowUp');
    await scope.group('Beat 1').click();

    expect(localStorage.getItem(stored)).toBe(before);
  });

  it('opens on the story when the page is drawn again', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();
    expect(nameOf(focused())).toBe('Beat 2');

    await openTheApp(pane());

    expect(nameOf(focused())).toBe('The story');
  });

  it('saves a sentence typed into a card after clicking it, read back by a fresh page', async () => {
    const scope = pageWith();
    await scope.fresh();
    const sentence = "Maren finds the ship's log";
    await scope.group('Beat 4').field('One-sentence summary').enter(sentence);

    await openTheApp(pane());
    await scope.group('Beat 4').click();

    expect(focused().querySelector('textarea')?.value).toBe(sentence);
  });

  it('keeps the focus on the piece, with the cursor in the new scene when one is added', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();
    await scope.group('Beat 2').press('Add a scene');

    expect(nameOf(focused())).toBe('Beat 2');
    expect(document.activeElement).toBe(named('card', 'Scene 1').querySelector('textarea'));
  });
});
