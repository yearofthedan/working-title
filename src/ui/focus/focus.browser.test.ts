import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { Driver } from '../../test-helpers/driver';
import { openTheApp, thePage } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { writerOn, type Writer } from './focus.dsl';

const stored = 'working-title:project';

const pageWith = (scenes = 0, width = 1440): { driver: Driver; writer: Writer } => {
  const driver = vitestBrowserDriver(async () => {
    localStorage.clear();
    const main = await thePage(width);
    await openTheApp(main);
    if (scenes === 0) return;
    const writer = writerOn(driver);
    for (let at = 0; at < scenes; at += 1) {
      await writer.addsASceneUnder('Beat 4');
    }
    await openTheApp(main);
  });
  return { driver, writer: writerOn(driver) };
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
    const { driver, writer } = pageWith();
    await driver.fresh();

    await writer.types('A wid', { piece: 'The story', facet: 'One-sentence summary' });
    expect(localStorage.getItem(stored)).toContain('A wid');

    await writer.types(theStory, { piece: 'The story', facet: 'One-sentence summary' });
    expect(localStorage.getItem(stored)).toContain(theStory);
  });

  it('draws the sentence on the focus card once', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.types(theStory, { piece: 'The story', facet: 'One-sentence summary' });

    expect(drawnOn(focused(), theStory)).toBe(1);
  });

  it("draws a card's sentence in the muted colour", async () => {
    const { driver } = pageWith();
    await driver.fresh();

    const layer = document.querySelector('.card .facet .shown')!;
    const label = document.querySelector('.card .facet label')!;

    expect(getComputedStyle(layer).color).toBe(getComputedStyle(label).color);
  });
});

describe('the graph around the focus', () => {
  it.each([1440, 1100])('draws the focus card 560 px wide and centred at %i px', async (width) => {
    const { driver } = pageWith(0, width);
    await driver.fresh();

    expect(focused().getBoundingClientRect().width).toBe(560);
    expect(centreOf(focused())).toBeCloseTo(centreOf(pane()), 0);
  });

  it('shows the whole sentence on the focus card, and fits its height to what it holds', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.types(
      'A widowed lighthouse keeper trades her last winter of fuel for a stranger\u2019s chart, then finds the chart leads back to the harbour where her husband\u2019s boat went down.',
      { piece: 'The story', facet: 'One-sentence summary' },
    );

    const field = focused().querySelector('textarea')!;
    expect(field.clientHeight).toBeGreaterThanOrEqual(field.scrollHeight - 1);
    expect(focused().getBoundingClientRect().height).toBeGreaterThan(
      named('card', 'Beat 1').getBoundingClientRect().height,
    );
  });

  it('puts the parent straight above the focus and the children in a row under it', async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');

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
    const { driver, writer } = pageWith(8, 1440);
    await driver.fresh();
    await writer.clicks('Beat 4');

    const children = cards('card').filter((card) => card !== named('card', 'The story'));
    expect(children).toHaveLength(8);
    const bounds = pane().getBoundingClientRect();
    const left = Math.min(...children.map((card) => card.getBoundingClientRect().left));
    const right = Math.max(...children.map((card) => card.getBoundingClientRect().right));
    expect(left).toBeGreaterThanOrEqual(bounds.left);
    expect(right).toBeLessThanOrEqual(bounds.right);
  });

  it('cuts a row of eight scenes off evenly at both edges at 1100 px', async () => {
    const { driver, writer } = pageWith(8, 1100);
    await driver.fresh();
    await writer.clicks('Beat 4');

    const children = cards('card').filter((card) => card !== named('card', 'The story'));
    const bounds = pane().getBoundingClientRect();
    const left = Math.min(...children.map((card) => card.getBoundingClientRect().left));
    const right = Math.max(...children.map((card) => card.getBoundingClientRect().right));
    expect(bounds.left - left).toBeGreaterThan(0);
    expect(right - bounds.right).toBeCloseTo(bounds.left - left, 0);
  });

  it('puts the earlier siblings left of the focus and the later ones right, on its row', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

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
    const { driver, writer } = pageWith(8);
    await driver.fresh();
    await writer.clicks('The story');

    expect(cards('hidden')).toHaveLength(8);
    expect((await driver.tree()).join('\n')).not.toContain('Scene');

    for (let at = 0; at < 12; at += 1) {
      await driver.press('Tab');
      expect(document.activeElement?.closest('fieldset.hidden') ?? null).toBeNull();
    }
  });

  it("marks each piece's depth in its heading, and the focus with aria-current", async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');

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
    const { driver } = pageWith();
    await driver.fresh();

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
    const { driver, writer } = pageWith();
    await driver.fresh();
    const sentence =
      'She rows out before first light with the chart weighted under a stone, and finds a buoy ringing a bell nobody hung there, its rope still wet from a hand that had no business tying it.';

    await writer.types(sentence, { piece: 'The story', facet: 'One-sentence summary' });
    await laidOut();

    const children = cards('card');
    expect(children).toHaveLength(5);
    const rowTop = Math.min(...children.map((card) => card.getBoundingClientRect().top));
    expect(rowTop).toBeGreaterThanOrEqual(focused().getBoundingClientRect().bottom);
  });

  it.each([1440, 1100])(
    'centres the focus row on the window, with the parent inside it, at %i px',
    async (width) => {
      const { driver, writer } = pageWith(0, width);
      await driver.fresh();
      await writer.clicks('Beat 2');

      const bounds = pane().getBoundingClientRect();
      const box = focused().getBoundingClientRect();
      expect(box.top + box.height / 2).toBeCloseTo(window.innerHeight / 2, 0);

      const parent = named('card', 'The story').getBoundingClientRect();
      expect(parent.top).toBeGreaterThanOrEqual(bounds.top);
      expect(parent.bottom).toBeLessThanOrEqual(bounds.bottom);
    },
  );

  it('stops the focus row below the header when the window is too short to centre it', async () => {
    const { driver, writer } = pageWith(0, 400);
    await driver.fresh();
    await browser.page.viewport(400, 500);
    await writer.clicks('Beat 2');

    const header = document.querySelector('header')!.getBoundingClientRect();
    const parent = named('card', 'The story').getBoundingClientRect();

    expect(parent.top).toBeGreaterThanOrEqual(header.bottom);
  });

  it('shows a card’s sentence small and in the interface font', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const card = named('card', 'The story');
    const sentence = getComputedStyle(card.querySelector('.shown')!);
    const name = getComputedStyle(card.querySelector('h2, h3, h4')!);
    const focus = getComputedStyle(focused().querySelector('textarea')!);

    expect(Number.parseFloat(sentence.fontSize)).toBeLessThan(Number.parseFloat(focus.fontSize));
    expect(sentence.fontFamily).toBe(name.fontFamily);
  });

  it('draws a chip sized to its name, with the name whole inside it', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    const chip = named('chip', 'Beat 1');
    const legend = chip.querySelector('legend')!;
    const box = legend.getBoundingClientRect();
    const inside = {
      top: box.top + legend.clientTop,
      bottom: box.top + legend.clientTop + legend.clientHeight,
    };
    const name = chip.querySelector('h2, h3, h4')!.getBoundingClientRect();

    expect(name.top).toBeGreaterThanOrEqual(inside.top);
    expect(name.bottom).toBeLessThanOrEqual(inside.bottom);
    expect(box.width).toBeLessThan(180);
  });

  it('keeps the add button inside the focus card', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const card = focused();
    const body = card.querySelector('.facet')!.getBoundingClientRect();
    const button = [...card.querySelectorAll('button')]
      .find((one) => one.textContent === 'Add a scene')!
      .getBoundingClientRect();

    expect(button.top).toBeGreaterThanOrEqual(body.top);
    expect(button.bottom).toBeLessThanOrEqual(body.bottom);
  });
});

describe('moving the focus', () => {
  it('leaves the focus on the story when ↑ has nowhere to go', async () => {
    const { driver } = pageWith();
    await driver.fresh();
    await driver.press('ArrowUp');

    expect(nameOf(focused())).toBe('The story');
  });

  it('leaves the focus where it is when ↓ has no child to go to', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await driver.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');

    await driver.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');
  });

  it('leaves the focus on the first sibling when ← has nowhere to go', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 1');
    await driver.press('ArrowLeft');

    expect(nameOf(focused())).toBe('Beat 1');
  });

  it('leaves the focus on the last sibling when → has nowhere to go', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 5');
    await driver.press('ArrowRight');

    expect(nameOf(focused())).toBe('Beat 5');
  });

  it('moves to the parent with ↑, and across the level with → and ←', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    await driver.press('ArrowRight');
    expect(nameOf(focused())).toBe('Beat 3');

    await driver.press('ArrowLeft');
    expect(nameOf(focused())).toBe('Beat 2');

    await driver.press('ArrowUp');
    expect(nameOf(focused())).toBe('The story');
  });

  it('moves down to the first child, and then to the child last visited', async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');

    await driver.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');

    await driver.press('ArrowRight');
    expect(nameOf(focused())).toBe('Scene 2');

    await driver.press('ArrowUp');
    expect(nameOf(focused())).toBe('Beat 4');

    await driver.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 2');
  });

  it('moves the focus with → from a sibling’s name button', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    named('chip', 'Beat 1').querySelector('button')!.focus();
    await driver.press('ArrowRight');

    expect(nameOf(focused())).toBe('Beat 4');
    expect(document.activeElement).toBe(focused());
  });

  it('moves the focus with ↓ from the add button', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();
    await writer.clicks('Beat 4');

    const add = focused().querySelector('button')!;
    expect(add.textContent).toBe('Add a scene');
    add.focus();
    await driver.press('ArrowDown');

    expect(nameOf(focused())).toBe('Scene 1');
    expect(document.activeElement).toBe(focused());
  });

  it('still presses a name button with Enter and with Space', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    named('chip', 'Beat 1').querySelector('button')!.focus();
    await driver.press('Enter');
    expect(nameOf(focused())).toBe('Beat 1');

    await writer.clicks('Beat 3');
    named('chip', 'Beat 5').querySelector('button')!.focus();
    await driver.press('Space');
    expect(nameOf(focused())).toBe('Beat 5');
  });

  it('leaves the focus where it is while the cursor is in a sentence', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('ArrowRight');

    expect(nameOf(focused())).toBe('Beat 2');
    expect(document.activeElement).toBe(focused().querySelector('textarea'));
  });

  it('puts the cursor on the focus card with Esc, and the arrows then move the focus', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('Escape');

    expect(document.activeElement).toBe(focused());
    expect(nameOf(focused())).toBe('Beat 2');

    await driver.press('ArrowRight');
    expect(nameOf(focused())).toBe('Beat 3');
  });

  it("puts the cursor in the focus card's sentence with Enter", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');

    expect(document.activeElement).toBe(focused().querySelector('textarea'));
  });

  it('leaves the cursor on the new focus card after a key, a chip, a card and a path', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();

    await driver.press('ArrowDown');
    expect(nameOf(focused())).toBe('Beat 1');
    expect(document.activeElement).toBe(focused());

    await writer.clicks('Beat 3');
    expect(nameOf(focused())).toBe('Beat 3');
    expect(document.activeElement).toBe(focused());

    await writer.clicks('The story');
    expect(nameOf(focused())).toBe('The story');
    expect(document.activeElement).toBe(focused());

    await writer.clicks('Beat 4');
    expect(nameOf(focused())).toBe('Beat 4');
    expect(document.activeElement).toBe(focused());

    await driver.click('button', 'The story', {
      role: 'navigation',
      name: 'Where you are',
    });
    expect(nameOf(focused())).toBe('The story');
    expect(document.activeElement).toBe(focused());
  });

  it('reaches every sibling with Tab, and Enter on one moves the focus there', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    for (const card of [...cards('card'), ...cards('chip')]) {
      if (card === focused()) continue;
      expect(card.querySelector('button')).not.toBeNull();
    }
    expect(focused().querySelector('legend button')).toBeNull();

    const reached: string[] = [];
    for (let at = 0; at < 20 && reached.length < 4; at += 1) {
      await driver.press('Tab');
      const chip = document.activeElement?.closest('fieldset.chip') ?? null;
      if (chip !== null) reached.push(nameOf(chip as HTMLElement));
    }
    expect([...reached].sort()).toEqual(['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5']);

    const button = named('chip', 'Beat 4').querySelector('button')!;
    button.focus();
    await driver.press('Enter');

    expect(nameOf(focused())).toBe('Beat 4');
    expect(document.activeElement).toBe(focused());
  });

  it('leaves the focus where it is when an arrow key is held with a modifier', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const held: boolean[] = [];
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') held.push(event.altKey);
    });

    await browser.userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(held).toEqual([true]);
    expect(nameOf(focused())).toBe('Beat 2');
  });

  it('moves the focus to a piece whose sentence is clicked, with the cursor in it', async () => {
    const { driver } = pageWith();
    await driver.fresh();
    await driver.click('textbox', 'One-sentence summary', {
      role: 'group',
      name: 'Beat 2',
    });

    expect(nameOf(focused())).toBe('Beat 2');
    expect(document.activeElement).toBe(focused().querySelector('textarea'));
  });

  it('never tabs into a sentence that is not the focus’s', async () => {
    const { driver } = pageWith();
    await driver.fresh();

    const strayed: string[] = [];
    for (let at = 0; at < 20; at += 1) {
      await driver.press('Tab');
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
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const left = named('card', 'The story').querySelector('textarea')!;
    const reached: Element[] = [];
    for (let at = 0; at < 20; at += 1) {
      await driver.press('Tab');
      reached.push(document.activeElement!);
    }

    expect(reached).toContain(focused().querySelector('textarea'));
    expect(reached).not.toContain(left);
  });

  it('never puts the cursor on the add button through the press', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const held: string[] = [];
    document.addEventListener('focusin', (event) => {
      const element = event.target as HTMLElement;
      if (element.closest('button') !== null) held.push(element.textContent ?? '');
    });

    await driver.click('button', 'Add a scene', { role: 'group', name: 'Beat 2' });

    expect(held).toEqual([]);
  });

  it('moves the focus to the new scene, and ↑ then ↓ returns to it', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.click('button', 'Add a scene', { role: 'group', name: 'Beat 2' });

    expect(nameOf(focused())).toBe('Scene 1');
    expect(document.activeElement).toBe(focused().querySelector('textarea'));

    await driver.press('Escape');
    await driver.press('ArrowUp');
    expect(nameOf(focused())).toBe('Beat 2');

    await driver.press('ArrowDown');
    expect(nameOf(focused())).toBe('Scene 1');
  });
});

describe('what a move leaves alone', () => {
  it('writes nothing to storage', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.types("Maren finds the ship's log", {
      piece: 'Beat 2',
      facet: 'One-sentence summary',
    });
    const before = localStorage.getItem(stored);
    expect(before).not.toBeNull();

    await driver.press('ArrowRight');
    await driver.press('ArrowUp');
    await writer.clicks('Beat 1');

    expect(localStorage.getItem(stored)).toBe(before);
  });

  it('opens on the story when the page is drawn again', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    expect(nameOf(focused())).toBe('Beat 2');

    await openTheApp(pane());

    expect(nameOf(focused())).toBe('The story');
  });

  it('saves a sentence typed into a card after clicking it, read back by a fresh page', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    const sentence = "Maren finds the ship's log";
    await writer.types(sentence, { piece: 'Beat 4', facet: 'One-sentence summary' });

    await openTheApp(pane());
    await writer.clicks('Beat 4');

    expect(focused().querySelector('textarea')?.value).toBe(sentence);
  });
});
