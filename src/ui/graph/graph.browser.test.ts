import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import { settled } from '../../test-helpers/driver';
import { laidOut, pageWith } from '../../test-helpers/graph-page';
import { openTheApp } from '../../test-helpers/the-app';
import {
  anExtraHeaderAbove,
  narrowThePane,
  theViewport,
  twoGraphs,
} from '../../test-helpers/staging';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { seesOn, writerOn, type Sees, type Writer } from './graph.dsl';
import {
  addButtonIsFirst,
  addButtonOf,
  facetOf,
  firstFieldOf,
  headingOf,
  labelOf,
  legendOf,
  nameButtonOf,
  nameOf,
  positionOf,
  sentenceFieldOf,
  shownSentenceOf,
  timesDrawn,
} from '../card/card.test-page';
import {
  altKeySeenFor,
  atCursor,
  blurTheCursor,
  buttonsFocused,
  cardAtCursor,
  cards,
  cursorIn,
  cursorIsInThePane,
  currentCards,
  current,
  named,
  navigationIn,
  pane,
} from './graph.test-page';

const stored = 'working-title:project';

const centreOf = (card: Element): number => {
  const box = card.getBoundingClientRect();
  return box.left + box.width / 2;
};

const theStory = "A widow hunts the man who sank her husband's ship";

const inMain = (element: Element): boolean => {
  const box = element.getBoundingClientRect();
  const bounds = pane().getBoundingClientRect();
  return (
    box.left >= bounds.left &&
    box.right <= bounds.right &&
    box.top >= bounds.top &&
    box.bottom <= bounds.bottom
  );
};

const offScreenCursor = (): string[] => {
  const card = cardAtCursor();
  if (card === null || inMain(card)) return [];
  return [nameOf(card)];
};

const shiftTab = (): Promise<void> => browser.userEvent.keyboard('{Shift>}{Tab}{/Shift}');

describe('the graph page', () => {
  it('tells the application about every keystroke as it is typed', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();

    await writer.types('A wid', { piece: 'The story', facet: 'One-sentence summary' });
    expect(localStorage.getItem(stored)).toContain('A wid');

    await writer.types(theStory, { piece: 'The story', facet: 'One-sentence summary' });
    expect(localStorage.getItem(stored)).toContain(theStory);
  });

  it("draws the sentence on the current piece's card once", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.types(theStory, { piece: 'The story', facet: 'One-sentence summary' });

    expect(timesDrawn(current(), theStory)).toBe(1);
  });

  it("draws a card's sentence in the muted colour", async () => {
    const { driver } = pageWith();
    await driver.fresh();

    const card = named('card', 'Beat 1');
    const layer = shownSentenceOf(card);
    const label = labelOf(card);

    expect(getComputedStyle(layer).color).toBe(getComputedStyle(label).color);
  });
});

describe('the graph around the current piece', () => {
  it.each([1440, 1100])(
    "draws the current piece's card 560 px wide and centred at %i px",
    async (width) => {
      const { driver } = pageWith(0, width);
      await driver.fresh();

      expect(current().getBoundingClientRect().width).toBe(560);
      expect(centreOf(current())).toBeCloseTo(centreOf(pane()), 0);
    },
  );

  it("shows the whole sentence on the current piece's card, and fits its height to what it holds", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.types(
      'A widowed lighthouse keeper trades her last winter of fuel for a stranger\u2019s chart, then finds the chart leads back to the harbour where her husband\u2019s boat went down.',
      { piece: 'The story', facet: 'One-sentence summary' },
    );
    await laidOut();

    const field = sentenceFieldOf(current());
    expect(field.clientHeight).toBeGreaterThanOrEqual(field.scrollHeight - 1);
    expect(current().getBoundingClientRect().height).toBeGreaterThan(
      named('card', 'Beat 1').getBoundingClientRect().height,
    );
  });

  it('puts the pieces hidden under a hidden story where the story is', async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await writer.clicks('Scene 1');
    await settled();

    const story = positionOf(named('hidden', 'The story'));
    const beat = positionOf(named('hidden', 'Beat 1'));
    expect([beat.left, beat.top]).toEqual([story.left, story.top]);
  });

  it('draws a piece hidden under a chip at the chip’s width', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();
    await writer.clicks('Beat 2');
    await settled();

    expect(positionOf(named('hidden', 'Scene 1')).width).toBe(
      positionOf(named('chip', 'Beat 4')).width,
    );
  });

  it('keeps a piece off the graph out of the tree and out of the tab order', async () => {
    const { driver, writer } = pageWith(8);
    await driver.fresh();
    await writer.clicks('The story');

    expect(cards('hidden')).toHaveLength(8);
    expect((await driver.tree()).join('\n')).not.toContain('Scene');

    for (let at = 0; at < 12; at += 1) {
      await driver.press('Tab');
      expect(cursorIn('hidden')).toBeNull();
    }
  });

  it("marks each piece's depth in its heading, and the current piece with aria-current", async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');

    expect(headingOf(named('card', 'The story')).tagName).toBe('H2');
    expect(headingOf(named('chip', 'Beat 1')).tagName).toBe('H3');
    expect(headingOf(named('current', 'Beat 4')).tagName).toBe('H3');
    expect(headingOf(named('card', 'Scene 1')).tagName).toBe('H4');

    expect(currentCards()).toEqual([current()]);
    expect(nameOf(current())).toBe('Beat 4');
  });

  it("keeps the current piece's card whole and centred when main narrows, with no move", async () => {
    const { driver } = pageWith();
    await driver.fresh();

    for (const width of [720, 320]) {
      narrowThePane(width);
      await laidOut();

      const box = current().getBoundingClientRect();
      const bounds = pane().getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(bounds.left);
      expect(box.right).toBeLessThanOrEqual(bounds.right);
      expect(centreOf(current())).toBeCloseTo(centreOf(pane()), 0);
    }
  });

  it("keeps the children under the current piece's card as its sentence grows while the writer types", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    const sentence =
      'She rows out before first light with the chart weighted under a stone, and finds a buoy ringing a bell nobody hung there, its rope still wet from a hand that had no business tying it.';

    await writer.types(sentence, { piece: 'The story', facet: 'One-sentence summary' });
    await laidOut();

    const children = cards('card');
    expect(children).toHaveLength(5);
    const rowTop = Math.min(...children.map((card) => card.getBoundingClientRect().top));
    expect(rowTop).toBeGreaterThanOrEqual(current().getBoundingClientRect().bottom);
  });

  it.each([1440, 1100])(
    "centres the current piece's row on the window, with the parent inside it, at %i px",
    async (width) => {
      const { driver, writer } = pageWith(0, width);
      await driver.fresh();
      await writer.clicks('Beat 2');
      await settled();

      const bounds = pane().getBoundingClientRect();
      const box = current().getBoundingClientRect();
      expect(box.top + box.height / 2).toBeCloseTo(window.innerHeight / 2, 0);

      const parent = named('card', 'The story').getBoundingClientRect();
      expect(parent.top).toBeGreaterThanOrEqual(bounds.top);
      expect(parent.bottom).toBeLessThanOrEqual(bounds.bottom);
    },
  );

  it("stops the current piece's row below the header it was given when the window is too short to centre it", async () => {
    const { driver, writer } = pageWith(0, 400);
    await driver.fresh();
    await theViewport(400, 500);
    const { given } = anExtraHeaderAbove();
    await writer.clicks('Beat 2');
    await settled();

    const header = given.getBoundingClientRect();
    const parent = named('card', 'The story').getBoundingClientRect();

    expect(parent.top).toBeGreaterThanOrEqual(header.bottom);
  });

  it('shows a card’s sentence small and in the interface font', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const card = named('card', 'The story');
    const sentence = getComputedStyle(shownSentenceOf(card));
    const name = getComputedStyle(headingOf(card));
    const typed = getComputedStyle(sentenceFieldOf(current()));

    expect(Number.parseFloat(sentence.fontSize)).toBeLessThan(Number.parseFloat(typed.fontSize));
    expect(sentence.fontFamily).toBe(name.fontFamily);
  });

  it('draws a chip sized to its name, with the name whole inside it', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');
    await settled();

    const chip = named('chip', 'Beat 1');
    const legend = legendOf(chip);
    const box = legend.getBoundingClientRect();
    const inside = {
      top: box.top + legend.clientTop,
      bottom: box.top + legend.clientTop + legend.clientHeight,
    };
    const name = headingOf(chip).getBoundingClientRect();

    expect(name.top).toBeGreaterThanOrEqual(inside.top);
    expect(name.bottom).toBeLessThanOrEqual(inside.bottom);
    expect(box.width).toBeLessThan(180);
  });

  it("keeps the add button inside the current piece's card", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await settled();

    const card = current();
    const body = facetOf(card).getBoundingClientRect();
    const button = addButtonOf(card).getBoundingClientRect();

    expect(button.top).toBeGreaterThanOrEqual(body.top);
    expect(button.bottom).toBeLessThanOrEqual(body.bottom);
  });
});

describe('the rows of the graph', () => {
  it('tabbing to a scene off screen brings it into view', async () => {
    const { driver, writer } = pageWith(8, 1100);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await settled();

    expect(inMain(named('card', 'Scene 1'))).toBe(false);
    const scene1 = centreOf(named('card', 'Scene 1'));
    const scene2 = centreOf(named('card', 'Scene 2'));
    const beat4 = centreOf(current());
    const beat3 = centreOf(named('chip', 'Beat 3'));
    const story = centreOf(named('card', 'The story'));

    await driver.press('Tab');
    await settled();

    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 1')));
    expect(nameOf(current())).toBe('Beat 4');
    expect(inMain(named('card', 'Scene 1'))).toBe(true);
    expect(centreOf(current())).toBeCloseTo(beat4, 0);
    expect(centreOf(named('chip', 'Beat 3'))).toBeCloseTo(beat3, 0);
    expect(centreOf(named('card', 'The story'))).toBeCloseTo(story, 0);
    expect(centreOf(named('card', 'Scene 2'))).toBeCloseTo(
      scene2 + (centreOf(named('card', 'Scene 1')) - scene1),
      0,
    );
  });

  it('lands on the first piece of a row with Tab, whatever the cursor was last on in it', async () => {
    const { driver, writer } = pageWith(8);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await settled();

    nameButtonOf(named('card', 'Scene 5')).focus();
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 5')));
    expect(nameOf(current())).toBe('Beat 4');

    current().focus();
    await driver.press('Tab');
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 1')));
    expect(nameOf(current())).toBe('Beat 4');
  });

  it('gives a row back its place when the cursor leaves it', async () => {
    const { driver, writer } = pageWith(8, 1100);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await settled();
    const atRest = centreOf(named('card', 'Scene 1'));

    await driver.press('Tab');
    await settled();
    expect(inMain(named('card', 'Scene 1'))).toBe(true);
    expect(centreOf(named('card', 'Scene 1'))).not.toBeCloseTo(atRest, 0);

    blurTheCursor();
    await laidOut();
    await settled();

    expect(pane().contains(atCursor())).toBe(false);
    expect(centreOf(named('card', 'Scene 1'))).toBeCloseTo(atRest, 0);
  });

  it('never puts the cursor on a piece outside main, with eight scenes under the current piece at 1100 px', async () => {
    const { driver, writer } = pageWith(8, 1100);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await settled();

    expect(inMain(named('card', 'Scene 1'))).toBe(false);
    expect(inMain(named('card', 'Scene 8'))).toBe(false);

    const offScreen: string[] = [];
    const check = async (): Promise<void> => {
      await settled();
      offScreen.push(...offScreenCursor());
    };
    const reached = new Set<string>();
    const step = async (key: string): Promise<void> => {
      await driver.press(key);
      await check();
      reached.add(nameOf(current()));
    };

    await check();
    await driver.press('Tab');
    await check();
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 1')));

    for (let at = 0; at < 9; at += 1) await step('ArrowRight');
    for (let at = 0; at < 9; at += 1) await step('ArrowLeft');
    await step('ArrowUp');
    await step('ArrowDown');

    await shiftTab();
    await check();
    await shiftTab();
    await check();

    expect(offScreen).toEqual([]);
    expect([...reached].sort()).toEqual([
      'Beat 4',
      'Scene 1',
      'Scene 2',
      'Scene 3',
      'Scene 4',
      'Scene 5',
      'Scene 6',
      'Scene 7',
      'Scene 8',
    ]);
  });

  it('never puts the cursor on a piece outside main, in a fresh app at 770 px', async () => {
    const { driver } = pageWith(0, 770);
    await driver.fresh();
    await settled();

    expect(inMain(named('card', 'Beat 1'))).toBe(false);
    expect(inMain(named('card', 'Beat 5'))).toBe(false);

    const offScreen: string[] = [];
    const check = async (): Promise<void> => {
      await settled();
      offScreen.push(...offScreenCursor());
    };
    const reached = new Set<string>();

    await check();
    current().focus();
    await driver.press('Tab');
    await check();
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Beat 1')));
    expect(nameOf(current())).toBe('The story');
    expect(inMain(named('card', 'Beat 1'))).toBe(true);

    for (let at = 0; at < 6; at += 1) {
      await driver.press('ArrowRight');
      await check();
      reached.add(nameOf(current()));
    }
    for (let at = 0; at < 6; at += 1) {
      await driver.press('ArrowLeft');
      await check();
      reached.add(nameOf(current()));
    }

    for (const key of ['ArrowUp', 'ArrowDown', 'Enter', 'Tab']) {
      await driver.press(key);
      await check();
    }

    expect(offScreen).toEqual([]);
    expect([...reached].sort()).toEqual(['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5']);
  });

  it('goes one stop per row with Tab, then out of the graph, and back with Shift+Tab', async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');
    expect(atCursor()).toBe(current());

    await driver.press('Tab');
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 1')));

    await driver.press('Tab');
    expect(pane().contains(atCursor())).toBe(false);

    await shiftTab();
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 1')));

    await shiftTab();
    expect(atCursor()).toBe(current());

    await shiftTab();
    expect(atCursor()).toBe(nameButtonOf(named('card', 'The story')));

    await shiftTab();
    expect(pane().contains(atCursor())).toBe(false);
  });

  it('makes the next and previous piece in a row the current piece with ← →', async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');

    await driver.press('Tab');
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 1')));
    expect(nameOf(current())).toBe('Beat 4');

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Scene 2');
    expect(atCursor()).toBe(current());

    await driver.press('ArrowLeft');
    expect(nameOf(current())).toBe('Scene 1');
    expect(atCursor()).toBe(current());

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Scene 2');

    await driver.press('ArrowUp');
    expect(nameOf(current())).toBe('Beat 4');
    expect(atCursor()).toBe(current());
  });

  it("goes into the current piece's card with Enter, wraps inside it with Tab, and back to the card with Esc", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    await driver.press('Enter');
    const field = sentenceFieldOf(current());
    expect(atCursor()).toBe(field);

    await driver.press('Tab');
    const add = addButtonOf(current());
    expect(atCursor()).toBe(add);

    await driver.press('Tab');
    expect(atCursor()).toBe(field);

    await shiftTab();
    expect(atCursor()).toBe(add);

    await shiftTab();
    expect(atCursor()).toBe(field);

    await driver.press('Escape');
    expect(atCursor()).toBe(current());
    expect(field.tabIndex).toBe(-1);
    expect(add.tabIndex).toBe(-1);
  });

  it('gives a row back its stop once a piece of it is on screen again', async () => {
    const { driver, writer } = pageWith(8, 1100);
    await driver.fresh();
    await writer.clicks('Beat 4');

    narrowThePane(100);
    await laidOut();
    await settled();

    await driver.press('Tab');
    expect(pane().contains(atCursor())).toBe(false);

    current().focus();
    narrowThePane(1440);
    await laidOut();
    await settled();

    await driver.press('Tab');
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Scene 1')));
  });
});

describe('moving the current piece', () => {
  it('writes the path into the header the graph was given, and no other header', async () => {
    const { driver, sees, writer } = pageWith();
    await driver.fresh();
    const { extra } = anExtraHeaderAbove();

    await writer.clicks('Beat 2');

    await sees.pathIs(['The story', 'Beat 2']);
    expect(navigationIn(extra)).toBeNull();
  });

  it('moves to the parent with ↑, and across the level with → and ←', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Beat 3');

    await driver.press('ArrowLeft');
    expect(nameOf(current())).toBe('Beat 2');

    await driver.press('ArrowUp');
    expect(nameOf(current())).toBe('The story');
  });

  it('moves the current piece with → from a sibling’s name button', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheCursorOnNameButtonOf('Beat 1');
    await driver.press('ArrowRight');

    expect(nameOf(current())).toBe('Beat 4');
    expect(cardAtCursor()).toBe(current());
  });

  it('moves the current piece with ↓ from the add button', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();
    await writer.clicks('Beat 4');

    expect(addButtonIsFirst(current())).toBe(true);
    await driver.focus('button', 'Add a scene', { role: 'group', name: nameOf(current()) });
    await driver.press('ArrowDown');

    expect(nameOf(current())).toBe('Scene 1');
    expect(cardAtCursor()).toBe(current());
  });

  it('still presses a name button with Enter and with Space', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheCursorOnNameButtonOf('Beat 1');
    await driver.press('Enter');
    expect(nameOf(current())).toBe('Beat 1');

    await writer.clicks('Beat 3');
    await writer.putsTheCursorOnNameButtonOf('Beat 5');
    await driver.press('Space');
    expect(nameOf(current())).toBe('Beat 5');
  });

  it('leaves the current piece where it is while the cursor is in a sentence', async () => {
    const { driver, sees, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('ArrowRight');

    expect(nameOf(current())).toBe('Beat 2');
    await sees.cursorIsIn(nameOf(current()), 'One-sentence summary');
  });

  it("puts the cursor on the current piece's card with Esc, and the arrows then move the current piece", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('Escape');

    expect(cardAtCursor()).toBe(current());
    expect(nameOf(current())).toBe('Beat 2');

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Beat 3');
  });

  it("puts the cursor in the current piece's sentence with Enter", async () => {
    const { driver, sees, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');

    await sees.cursorIsIn(nameOf(current()), 'One-sentence summary');
  });

  it("leaves the cursor on the new current piece's card after a key, a chip, a card and a path", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();

    await driver.press('ArrowDown');
    expect(nameOf(current())).toBe('Beat 1');
    expect(cardAtCursor()).toBe(current());

    await writer.clicks('Beat 3');
    expect(nameOf(current())).toBe('Beat 3');
    expect(cardAtCursor()).toBe(current());

    await writer.clicks('The story');
    expect(nameOf(current())).toBe('The story');
    expect(cardAtCursor()).toBe(current());

    await writer.clicks('Beat 4');
    expect(nameOf(current())).toBe('Beat 4');
    expect(cardAtCursor()).toBe(current());

    await driver.click('button', 'The story', {
      role: 'navigation',
      name: 'Where you are',
    });
    expect(nameOf(current())).toBe('The story');
    expect(cardAtCursor()).toBe(current());
  });

  it('leaves the siblings beside the current piece out of the tab order, and moves the current piece along them with the arrows', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    const siblings = cards('chip');
    expect(siblings).toHaveLength(4);
    for (const chip of siblings) {
      expect(chip.tabIndex).toBe(-1);
      expect(nameButtonOf(chip).tabIndex).toBe(-1);
    }
    expect(atCursor()).toBe(current());

    const reached: string[] = [];
    for (let at = 0; at < 10; at += 1) {
      await driver.press('Tab');
      const chip = cursorIn('chip');
      if (chip !== null) reached.push(nameOf(chip));
    }
    expect(reached).toEqual([]);

    await writer.clicks('Beat 3');
    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Beat 4');
    expect(atCursor()).toBe(current());

    await driver.press('ArrowLeft');
    expect(nameOf(current())).toBe('Beat 3');
    expect(atCursor()).toBe(current());
  });

  it('moves the current piece to a piece another row stops on with Enter', async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await writer.clicks('Scene 1');

    await shiftTab();
    expect(atCursor()).toBe(nameButtonOf(named('card', 'Beat 4')));

    await driver.press('Enter');
    expect(nameOf(current())).toBe('Beat 4');
    expect(cardAtCursor()).toBe(current());
  });

  it('leaves the current piece where it is when an arrow key is held with a modifier', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const held = await altKeySeenFor('ArrowRight', () =>
      browser.userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}'),
    );

    expect(held).toEqual([true]);
    expect(nameOf(current())).toBe('Beat 2');
  });

  it('moves the current piece to a piece whose sentence is clicked, with the cursor in it', async () => {
    const { driver, sees } = pageWith();
    await driver.fresh();
    await driver.click('textbox', 'One-sentence summary', {
      role: 'group',
      name: 'Beat 2',
    });

    expect(nameOf(current())).toBe('Beat 2');
    await sees.cursorIsIn('Beat 2', 'One-sentence summary');
  });

  it("never tabs into a sentence that is not the current piece's", async () => {
    const { driver } = pageWith();
    await driver.fresh();

    const strayed: string[] = [];
    for (let at = 0; at < 20; at += 1) {
      await driver.press('Tab');
      for (const card of [...cards('card'), ...cards('chip')]) {
        const piece = nameOf(card);
        const inSentence = await driver.cursorIs('textbox', 'One-sentence summary', {
          role: 'group',
          name: piece,
        });
        if (inSentence) strayed.push(piece);
      }
    }

    expect(strayed).toEqual([]);
  });

  it('reaches the sentence of the piece it moved to with Enter, and not through the press', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const left = sentenceFieldOf(named('card', 'The story'));
    expect(left.tabIndex).toBe(-1);

    const reached: string[] = [];
    for (let at = 0; at < 10; at += 1) {
      await driver.press('Tab');
      for (const piece of ['Beat 2', 'The story']) {
        const inSentence = await driver.cursorIs('textbox', 'One-sentence summary', {
          role: 'group',
          name: piece,
        });
        if (inSentence) reached.push(piece);
      }
    }

    expect(reached).toEqual([]);

    await writer.clicks('Beat 2');
    await driver.press('Enter');

    expect(atCursor()).toBe(sentenceFieldOf(current()));
  });

  it('never puts the cursor on the add button through the press', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const held = await buttonsFocused(() =>
      driver.click('button', 'Add a scene', { role: 'group', name: 'Beat 2' }),
    );

    expect(held).toEqual([]);
  });

  it('moves the current piece to the new scene, and ↑ then ↓ returns to it', async () => {
    const { driver, sees, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.click('button', 'Add a scene', { role: 'group', name: 'Beat 2' });

    expect(nameOf(current())).toBe('Scene 1');
    await sees.cursorIsIn(nameOf(current()), 'List line');

    await driver.press('Escape');
    await driver.press('ArrowUp');
    expect(nameOf(current())).toBe('Beat 2');

    await driver.press('ArrowDown');
    expect(nameOf(current())).toBe('Scene 1');
  });

  it('leaves the fields of the card it leaves out of the tab order, after adding a scene', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    await driver.press('Enter');
    await driver.press('Tab');
    await driver.press('Enter');

    expect(nameOf(current())).toBe('Scene 1');
    expect(atCursor()).toBe(firstFieldOf(current()));

    const left = named('card', 'Beat 2');
    expect(sentenceFieldOf(left).tabIndex).toBe(-1);

    await shiftTab();
    expect(left.contains(atCursor())).toBe(false);
  });

  it("takes the fields of the current piece's card out of the tab order when the cursor leaves with no focusin", async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    expect(sentenceFieldOf(current()).tabIndex).toBe(0);

    blurTheCursor();

    expect(sentenceFieldOf(current()).tabIndex).toBe(-1);
  });

  it('puts the cursor on the card the writer clicks, the current one or another', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    expect(atCursor()).toBe(sentenceFieldOf(current()));

    await browser.userEvent.click(legendOf(current()));
    expect(atCursor()).toBe(current());

    await browser.userEvent.click(legendOf(named('card', 'The story')));
    expect(nameOf(current())).toBe('The story');
    expect(atCursor()).toBe(current());
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
    expect(nameOf(current())).toBe('Beat 2');

    await openTheApp();

    expect(nameOf(current())).toBe('The story');
  });

  it('saves a sentence typed into a card after clicking it, read back by a fresh page', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    const sentence = "Maren finds the ship's log";
    await writer.types(sentence, { piece: 'Beat 4', facet: 'One-sentence summary' });

    await openTheApp();
    await writer.clicks('Beat 4');

    const held = await driver.value('One-sentence summary', { role: 'group', name: 'Beat 4' });
    expect(held).toBe(sentence);
  });
});

describe('two graphs on one page', () => {
  const onGraph = (name: string): { writer: Writer; sees: Sees } => {
    const driver = vitestBrowserDriver(async () => {}, name);
    return { writer: writerOn(driver), sees: seesOn(driver) };
  };

  it('moves the current piece of the graph the writer clicked, and leaves the other where it is', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.addsASceneUnder('Beat 2');
    await twoGraphs();
    const first = onGraph('First graph');
    const second = onGraph('Second graph');

    await first.writer.clicks('Beat 2');
    await first.writer.moves('↓');

    await first.sees.currentIs('Scene 1');
    await second.sees.currentIs('The story');
  });

  it('moves every graph when the key is pressed outside them', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await twoGraphs();

    await writer.clicksAwayFromTheGraph();
    await driver.press('ArrowDown');

    await onGraph('First graph').sees.currentIs('Beat 1');
    await onGraph('Second graph').sees.currentIs('Beat 1');
  });

  it('lets a graph drawn over stop answering keys', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    await driver.reopen();
    await writer.moves('→');

    await seesOn(driver).pathIs(['The story']);
  });

  it('keeps working when the graph is drawn again on the same main', async () => {
    const { driver, writer } = pageWith();
    const sees = seesOn(driver);
    await driver.fresh();

    await driver.reopen();
    narrowThePane(720);
    await laidOut();
    await writer.moves('↓');

    await sees.currentIs('Beat 1');
    expect(cursorIsInThePane()).toBe(true);
  });
});
