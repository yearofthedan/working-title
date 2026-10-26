import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
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
    for (let at = 0; at < scenes; at += 1) {
      await scope.group('Beat 4').click();
      await scope.group('Beat 4').press('Add a scene');
    }
    await openTheApp(main);
  });
  return scope;
};

const pane = (): HTMLElement => document.querySelector('main')!;

const cards = (kind: string): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>(`main fieldset.${kind}`),
];

const nameOf = (card: HTMLElement): string => card.querySelector('h2, h3, h4')!.textContent ?? '';

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

const laidOut = (): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => resolve());
  });
  return promise;
};

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

  it("marks each piece's depth in its heading, and the focus with aria-current", async () => {
    const scope = pageWith(2);
    await scope.fresh();
    await scope.group('Beat 4').click();

    const level = (name: string): string =>
      [...document.querySelectorAll<HTMLElement>('main fieldset')]
        .find((card) => nameOf(card) === name)!
        .querySelector('h2, h3, h4')!.tagName;

    expect(level('The story')).toBe('H2');
    expect(level('Beat 1')).toBe('H3');
    expect(level('Beat 4')).toBe('H3');
    expect(level('Scene 1')).toBe('H4');

    const current = [...document.querySelectorAll('main fieldset[aria-current="location"]')];
    expect(current).toEqual([focused()]);
    expect(nameOf(focused())).toBe('Beat 4');
  });

  it('keeps the focus card whole and centred when main narrows, with no move', async () => {
    const scope = pageWith();
    await scope.fresh();

    for (const width of [720, 320]) {
      pane().style.width = `${width}px`;
      await laidOut();

      const box = focused().getBoundingClientRect();
      const bounds = pane().getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(bounds.left);
      expect(box.right).toBeLessThanOrEqual(bounds.right);
      expect(centreOf(focused())).toBeCloseTo(centreOf(pane()), 0);
    }
  });

  it('keeps the children under the focus card as its sentence grows while the writer types', async () => {
    const scope = pageWith();
    await scope.fresh();
    const sentence =
      'She rows out before first light with the chart weighted under a stone, and finds a buoy ringing a bell nobody hung there, its rope still wet from a hand that had no business tying it.';

    await scope.group('The story').field('One-sentence summary').enter(sentence);
    await laidOut();

    const children = cards('card');
    expect(children).toHaveLength(5);
    const rowTop = Math.min(...children.map((card) => card.getBoundingClientRect().top));
    expect(rowTop).toBeGreaterThanOrEqual(focused().getBoundingClientRect().bottom);
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

    await scope.group('The story').click();
    expect(nameOf(focused())).toBe('The story');
    expect(document.activeElement).toBe(focused());

    await scope.group('Beat 4').click();
    expect(nameOf(focused())).toBe('Beat 4');
    expect(document.activeElement).toBe(focused());

    await scope.step('The story');
    expect(nameOf(focused())).toBe('The story');
    expect(document.activeElement).toBe(focused());
  });

  it('reaches every sibling with Tab, and Enter on one moves the focus there', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 3').click();

    for (const card of [...cards('card'), ...cards('chip')]) {
      if (card === focused()) continue;
      expect(card.querySelector('button')).not.toBeNull();
    }
    expect(focused().querySelector('legend button')).toBeNull();

    const reached: string[] = [];
    for (let at = 0; at < 20 && reached.length < 4; at += 1) {
      await scope.press('Tab');
      const chip = document.activeElement?.closest('fieldset.chip') ?? null;
      if (chip !== null) reached.push(nameOf(chip as HTMLElement));
    }
    expect([...reached].sort()).toEqual(['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5']);

    const button = named('chip', 'Beat 4').querySelector('button')!;
    button.focus();
    await scope.press('Enter');

    expect(nameOf(focused())).toBe('Beat 4');
    expect(document.activeElement).toBe(focused());
  });

  it('leaves the focus where it is when an arrow key is held with a modifier', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();

    const held: boolean[] = [];
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') held.push(event.altKey);
    });

    await browser.userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(held).toEqual([true]);
    expect(nameOf(focused())).toBe('Beat 2');
  });

  it('moves the focus to a piece whose sentence is clicked, with the cursor in it', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').field('One-sentence summary').click();

    expect(nameOf(focused())).toBe('Beat 2');
    expect(document.activeElement).toBe(focused().querySelector('textarea'));
  });

  it('never tabs into a sentence that is not the focus’s', async () => {
    const scope = pageWith();
    await scope.fresh();

    const strayed: string[] = [];
    for (let at = 0; at < 20; at += 1) {
      await scope.press('Tab');
      const card = document.activeElement?.closest('fieldset') ?? null;
      if (
        card !== null &&
        card !== focused() &&
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        strayed.push(nameOf(card as HTMLElement));
      }
    }

    expect(strayed).toEqual([]);
  });

  it('tabs into the sentence of the piece it moved to, and not the one it left', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();

    const left = named('card', 'The story').querySelector('textarea')!;
    const reached: Element[] = [];
    for (let at = 0; at < 20; at += 1) {
      await scope.press('Tab');
      reached.push(document.activeElement!);
    }

    expect(reached).toContain(focused().querySelector('textarea'));
    expect(reached).not.toContain(left);
  });

  it('never puts the cursor on the add button through the press', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();

    const held: string[] = [];
    document.addEventListener('focusin', (event) => {
      const element = event.target as HTMLElement;
      if (element.closest('button') !== null) held.push(element.textContent ?? '');
    });

    await scope.group('Beat 2').press('Add a scene');

    expect(held).toEqual([]);
  });

  it('moves the focus to the new scene, and ↑ then ↓ returns to it', async () => {
    const scope = pageWith();
    await scope.fresh();
    await scope.group('Beat 2').click();
    await scope.group('Beat 2').press('Add a scene');

    expect(nameOf(focused())).toBe('Scene 1');
    expect(document.activeElement).toBe(focused().querySelector('textarea'));

    await scope.press('Escape');
    await scope.press('ArrowUp');
    expect(nameOf(focused())).toBe('Beat 2');

    await scope.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');
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
});
