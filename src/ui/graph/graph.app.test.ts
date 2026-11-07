import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import { settled, type Opening } from '../../test-helpers/driver';
import { laidOut } from '../../test-helpers/graph-page';
import type { RawGlob } from '../../test-helpers/raw-glob';
import { playScenarioFiles } from '../../test-helpers/scenario-entry';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { narrowThePane, theViewport } from '../../test-helpers/staging';
import { type AppSees, type AppWriter } from '../app/app.dsl';
import { twoGraphs } from '../app/app.harness';
import { graphOn, graphScenarioSteps, pageWith } from './graph.harness';
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
} from '../card/card.test-page';
import {
  altKeySeenFor,
  atFocus,
  blurTheFocus,
  buttonsFocused,
  cardAtFocus,
  cards,
  focusIn,
  currentCards,
  current,
  named,
  pane,
} from './graph.test-page';

const centreOf = (card: Element): number => {
  const box = card.getBoundingClientRect();
  return box.left + box.width / 2;
};

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

const offScreenFocus = (): string[] => {
  const card = cardAtFocus();
  if (card === null || inMain(card)) return [];
  return [nameOf(card)];
};

const shiftTab = (): Promise<void> => browser.userEvent.keyboard('{Shift>}{Tab}{/Shift}');

describe('the graph page', () => {
  it("draws a card's sentence in the muted colour", async () => {
    const { stage } = pageWith();
    await stage.fresh();

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
      const { stage } = pageWith(0, width);
      await stage.fresh();

      expect(current().getBoundingClientRect().width).toBe(560);
      expect(centreOf(current())).toBeCloseTo(centreOf(pane()), 0);
    },
  );

  it("shows the whole sentence on the current piece's card, and fits its height to what it holds", async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
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
    const { stage, writer } = pageWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await writer.clicks('Scene 1');
    await settled();

    const story = positionOf(named('hidden', 'The story'));
    const beat = positionOf(named('hidden', 'Beat 1'));
    expect([beat.left, beat.top]).toEqual([story.left, story.top]);
  });

  it('draws a piece hidden under a chip at the chip’s width', async () => {
    const { stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.clicks('Beat 2');
    await settled();

    expect(positionOf(named('hidden', 'Scene 1')).width).toBe(
      positionOf(named('chip', 'Beat 4')).width,
    );
  });

  it('keeps a piece off the graph out of the tree and out of the tab order', async () => {
    const { driver, stage, writer } = pageWith(8);
    await stage.fresh();
    await writer.clicks('The story');

    expect(cards('hidden')).toHaveLength(8);
    expect((await driver.tree()).join('\n')).not.toContain('Scene');

    for (let at = 0; at < 12; at += 1) {
      await driver.press('Tab');
      expect(focusIn('hidden')).toBeNull();
    }
  });

  it("marks each piece's depth in its heading, and the current piece with aria-current", async () => {
    const { stage, writer } = pageWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');

    expect(headingOf(named('card', 'The story')).tagName).toBe('H2');
    expect(headingOf(named('chip', 'Beat 1')).tagName).toBe('H3');
    expect(headingOf(named('current', 'Beat 4')).tagName).toBe('H3');
    expect(headingOf(named('card', 'Scene 1')).tagName).toBe('H4');

    expect(currentCards()).toEqual([current()]);
    expect(nameOf(current())).toBe('Beat 4');
  });

  it("keeps the current piece's card whole and centred when main narrows, with no move", async () => {
    const { stage } = pageWith();
    await stage.fresh();

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
    const { stage, writer } = pageWith();
    await stage.fresh();
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
      const { stage, writer } = pageWith(0, width);
      await stage.fresh();
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

  it("stops the current piece's row below the top of main when the window is too short to centre it", async () => {
    const { stage, writer } = pageWith(0, 400);
    await stage.fresh();
    await theViewport(400, 500);
    await writer.clicks('Beat 2');
    await settled();

    const main = pane().getBoundingClientRect();
    const parent = named('card', 'The story').getBoundingClientRect();

    expect(parent.top).toBeGreaterThanOrEqual(main.top);
  });

  it('shows a card’s sentence small and in the interface font', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    const card = named('card', 'The story');
    const sentence = getComputedStyle(shownSentenceOf(card));
    const name = getComputedStyle(headingOf(card));
    const typed = getComputedStyle(sentenceFieldOf(current()));

    expect(Number.parseFloat(sentence.fontSize)).toBeLessThan(Number.parseFloat(typed.fontSize));
    expect(sentence.fontFamily).toBe(name.fontFamily);
  });

  it('draws a chip sized to its name, with the name whole inside it', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
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
    const { stage, writer } = pageWith();
    await stage.fresh();
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
    const { driver, stage, writer } = pageWith(8, 1100);
    await stage.fresh();
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

    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 1')));
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
    const { driver, stage, writer } = pageWith(8);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();

    nameButtonOf(named('card', 'Scene 5')).focus();
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 5')));
    expect(nameOf(current())).toBe('Beat 4');

    current().focus();
    await driver.press('Tab');
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 1')));
    expect(nameOf(current())).toBe('Beat 4');
  });

  it('gives a row back its place when the cursor leaves it', async () => {
    const { driver, stage, writer } = pageWith(8, 1100);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();
    const atRest = centreOf(named('card', 'Scene 1'));

    await driver.press('Tab');
    await settled();
    expect(inMain(named('card', 'Scene 1'))).toBe(true);
    expect(centreOf(named('card', 'Scene 1'))).not.toBeCloseTo(atRest, 0);

    blurTheFocus();
    await laidOut();
    await settled();

    expect(pane().contains(atFocus())).toBe(false);
    expect(centreOf(named('card', 'Scene 1'))).toBeCloseTo(atRest, 0);
  });

  it('never puts the cursor on a piece outside main, with eight scenes under the current piece at 1100 px', async () => {
    const { driver, stage, writer } = pageWith(8, 1100);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();

    expect(inMain(named('card', 'Scene 1'))).toBe(false);
    expect(inMain(named('card', 'Scene 8'))).toBe(false);

    const offScreen: string[] = [];
    const check = async (): Promise<void> => {
      await settled();
      offScreen.push(...offScreenFocus());
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
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 1')));

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
    const { driver, stage } = pageWith(0, 770);
    await stage.fresh();
    await settled();

    expect(inMain(named('card', 'Beat 1'))).toBe(false);
    expect(inMain(named('card', 'Beat 5'))).toBe(false);

    const offScreen: string[] = [];
    const check = async (): Promise<void> => {
      await settled();
      offScreen.push(...offScreenFocus());
    };
    const reached = new Set<string>();

    await check();
    current().focus();
    await driver.press('Tab');
    await check();
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Beat 1')));
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
    const { driver, stage, writer } = pageWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');
    expect(atFocus()).toBe(current());

    await driver.press('Tab');
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 1')));

    await driver.press('Tab');
    expect(pane().contains(atFocus())).toBe(false);

    await shiftTab();
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 1')));

    await shiftTab();
    expect(atFocus()).toBe(current());

    await shiftTab();
    expect(atFocus()).toBe(nameButtonOf(named('card', 'The story')));

    await shiftTab();
    expect(pane().contains(atFocus())).toBe(false);
  });

  it('makes the next and previous piece in a row the current piece with ← →', async () => {
    const { driver, stage, writer } = pageWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');

    await driver.press('Tab');
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 1')));
    expect(nameOf(current())).toBe('Beat 4');

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Scene 2');
    expect(atFocus()).toBe(current());

    await driver.press('ArrowLeft');
    expect(nameOf(current())).toBe('Scene 1');
    expect(atFocus()).toBe(current());

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Scene 2');

    await driver.press('ArrowUp');
    expect(nameOf(current())).toBe('Beat 4');
    expect(atFocus()).toBe(current());
  });

  it("leaves the cursor on a row's stop when Esc is pressed there", async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.putsTheFocusOnNameButtonOf('Beat 1');

    await driver.press('Escape');

    expect(atFocus()).toBe(nameButtonOf(named('chip', 'Beat 1')));
  });

  it("takes the current piece's card's field and its add button out of reach once Esc returns to it", async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await driver.press('Enter');
    const field = sentenceFieldOf(current());
    expect(atFocus()).toBe(field);

    await driver.press('Escape');

    expect(atFocus()).toBe(current());
    expect(field.tabIndex).toBe(-1);
    expect(addButtonOf(current()).tabIndex).toBe(-1);
  });

  it('gives a row back its stop once a piece of it is on screen again', async () => {
    const { driver, stage, writer } = pageWith(8, 1100);
    await stage.fresh();
    await writer.clicks('Beat 4');

    narrowThePane(100);
    await laidOut();
    await settled();

    await driver.press('Tab');
    expect(pane().contains(atFocus())).toBe(false);

    current().focus();
    narrowThePane(1440);
    await laidOut();
    await settled();

    await driver.press('Tab');
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Scene 1')));
  });
});

describe('moving the current piece', () => {
  it('moves to the parent with ↑, and across the level with → and ←', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Beat 3');

    await driver.press('ArrowLeft');
    expect(nameOf(current())).toBe('Beat 2');

    await driver.press('ArrowUp');
    expect(nameOf(current())).toBe('The story');
  });

  it('moves the current piece with → from a sibling’s name button', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheFocusOnNameButtonOf('Beat 1');
    await driver.press('ArrowRight');

    expect(nameOf(current())).toBe('Beat 4');
    expect(cardAtFocus()).toBe(current());
  });

  it('moves the current piece with ↓ from the add button', async () => {
    const { driver, stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.clicks('Beat 4');

    expect(addButtonIsFirst(current())).toBe(true);
    await driver.focus('button', 'Add a scene', { role: 'group', name: nameOf(current()) });
    await driver.press('ArrowDown');

    expect(nameOf(current())).toBe('Scene 1');
    expect(cardAtFocus()).toBe(current());
  });

  it('still presses a name button with Enter and with Space', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheFocusOnNameButtonOf('Beat 1');
    await driver.press('Enter');
    expect(nameOf(current())).toBe('Beat 1');

    await writer.clicks('Beat 3');
    await writer.putsTheFocusOnNameButtonOf('Beat 5');
    await driver.press('Space');
    expect(nameOf(current())).toBe('Beat 5');
  });

  it('leaves the current piece where it is while the cursor is in a sentence', async () => {
    const { driver, stage, sees, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('ArrowRight');

    expect(nameOf(current())).toBe('Beat 2');
    await sees.focusIsIn(nameOf(current()), 'One-sentence summary');
  });

  it("puts the cursor on the current piece's card with Esc, and the arrows then move the current piece", async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('Escape');

    expect(cardAtFocus()).toBe(current());
    expect(nameOf(current())).toBe('Beat 2');

    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Beat 3');
  });

  it("puts the cursor in the current piece's sentence with Enter", async () => {
    const { driver, stage, sees, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');

    await sees.focusIsIn(nameOf(current()), 'One-sentence summary');
  });

  it("leaves the cursor on the new current piece's card after a key, a chip, a card and a story card", async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();

    await driver.press('ArrowDown');
    expect(nameOf(current())).toBe('Beat 1');
    expect(cardAtFocus()).toBe(current());

    await writer.clicks('Beat 3');
    expect(nameOf(current())).toBe('Beat 3');
    expect(cardAtFocus()).toBe(current());

    await writer.clicks('The story');
    expect(nameOf(current())).toBe('The story');
    expect(cardAtFocus()).toBe(current());

    await writer.clicks('Beat 4');
    expect(nameOf(current())).toBe('Beat 4');
    expect(cardAtFocus()).toBe(current());
  });

  it('leaves the siblings beside the current piece out of the tab order, and moves the current piece along them with the arrows', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 3');

    const siblings = cards('chip');
    expect(siblings).toHaveLength(4);
    for (const chip of siblings) {
      expect(chip.tabIndex).toBe(-1);
      expect(nameButtonOf(chip).tabIndex).toBe(-1);
    }
    expect(atFocus()).toBe(current());

    const reached: string[] = [];
    for (let at = 0; at < 10; at += 1) {
      await driver.press('Tab');
      const chip = focusIn('chip');
      if (chip !== null) reached.push(nameOf(chip));
    }
    expect(reached).toEqual([]);

    await writer.clicks('Beat 3');
    await driver.press('ArrowRight');
    expect(nameOf(current())).toBe('Beat 4');
    expect(atFocus()).toBe(current());

    await driver.press('ArrowLeft');
    expect(nameOf(current())).toBe('Beat 3');
    expect(atFocus()).toBe(current());
  });

  it('moves the current piece to a piece another row stops on with Enter', async () => {
    const { driver, stage, writer } = pageWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await writer.clicks('Scene 1');

    await shiftTab();
    expect(atFocus()).toBe(nameButtonOf(named('card', 'Beat 4')));

    await driver.press('Enter');
    expect(nameOf(current())).toBe('Beat 4');
    expect(cardAtFocus()).toBe(current());
  });

  it('leaves the current piece where it is when an arrow key is held with a modifier', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    const held = await altKeySeenFor('ArrowRight', () =>
      browser.userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}'),
    );

    expect(held).toEqual([true]);
    expect(nameOf(current())).toBe('Beat 2');
  });

  it('moves the current piece to a piece whose sentence is clicked, with the cursor in it', async () => {
    const { driver, stage, sees } = pageWith();
    await stage.fresh();
    await driver.click('textbox', 'One-sentence summary', {
      role: 'group',
      name: 'Beat 2',
    });

    expect(nameOf(current())).toBe('Beat 2');
    await sees.focusIsIn('Beat 2', 'One-sentence summary');
  });

  it("never tabs into a sentence that is not the current piece's", async () => {
    const { driver, stage } = pageWith();
    await stage.fresh();

    const strayed: string[] = [];
    for (let at = 0; at < 20; at += 1) {
      await driver.press('Tab');
      for (const card of [...cards('card'), ...cards('chip')]) {
        const piece = nameOf(card);
        const inSentence = await driver.focusIs('textbox', 'One-sentence summary', {
          role: 'group',
          name: piece,
        });
        if (inSentence) strayed.push(piece);
      }
    }

    expect(strayed).toEqual([]);
  });

  it('reaches the sentence of the piece it moved to with Enter, and not through the press', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    const left = sentenceFieldOf(named('card', 'The story'));
    expect(left.tabIndex).toBe(-1);

    const reached: string[] = [];
    for (let at = 0; at < 10; at += 1) {
      await driver.press('Tab');
      for (const piece of ['Beat 2', 'The story']) {
        const inSentence = await driver.focusIs('textbox', 'One-sentence summary', {
          role: 'group',
          name: piece,
        });
        if (inSentence) reached.push(piece);
      }
    }

    expect(reached).toEqual([]);

    await writer.clicks('Beat 2');
    await driver.press('Enter');

    expect(atFocus()).toBe(sentenceFieldOf(current()));
  });

  it('never puts the cursor on the add button through the press', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    const held = await buttonsFocused(() =>
      driver.click('button', 'Add a scene', { role: 'group', name: 'Beat 2' }),
    );

    expect(held).toEqual([]);
  });

  it('moves the current piece to the new scene, and ↑ then ↓ returns to it', async () => {
    const { driver, stage, sees, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await driver.click('button', 'Add a scene', { role: 'group', name: 'Beat 2' });

    expect(nameOf(current())).toBe('Scene 1');
    await sees.focusIsIn(nameOf(current()), 'List line');

    await driver.press('Escape');
    await driver.press('ArrowUp');
    expect(nameOf(current())).toBe('Beat 2');

    await driver.press('ArrowDown');
    expect(nameOf(current())).toBe('Scene 1');
  });

  it('leaves the fields of the card it leaves out of the tab order, after adding a scene', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await driver.press('Enter');
    await driver.press('Tab');
    await driver.press('Enter');

    expect(nameOf(current())).toBe('Scene 1');
    expect(atFocus()).toBe(firstFieldOf(current()));

    const left = named('card', 'Beat 2');
    expect(sentenceFieldOf(left).tabIndex).toBe(-1);

    await shiftTab();
    expect(left.contains(atFocus())).toBe(false);
  });

  it("takes the fields of the current piece's card out of the tab order when the cursor leaves with no focusin", async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    expect(sentenceFieldOf(current()).tabIndex).toBe(0);

    blurTheFocus();

    expect(sentenceFieldOf(current()).tabIndex).toBe(-1);
  });

  it('puts the cursor on the card the writer clicks, the current one or another', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    expect(atFocus()).toBe(sentenceFieldOf(current()));

    await browser.userEvent.click(legendOf(current()));
    expect(atFocus()).toBe(current());

    await browser.userEvent.click(legendOf(named('card', 'The story')));
    expect(nameOf(current())).toBe('The story');
    expect(atFocus()).toBe(current());
  });
});

describe('two graphs on one page', () => {
  const onGraph = (name: string, stage: Opening): { writer: AppWriter; sees: AppSees } =>
    graphOn(name, stage);

  it('moves the current piece of the graph the writer clicked, and leaves the other where it is', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.addsASceneUnder('Beat 2');
    await twoGraphs();
    const first = onGraph('First graph', stage);
    const second = onGraph('Second graph', stage);

    await first.writer.clicks('Beat 2');
    await first.writer.moves('↓');

    await first.sees.currentIs('Scene 1');
    await second.sees.currentIs('The story');
  });

  it('moves every graph when the key is pressed outside them', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await twoGraphs();

    await writer.clicksAwayFromTheGraph();
    await driver.press('ArrowDown');

    await onGraph('First graph', stage).sees.currentIs('Beat 1');
    await onGraph('Second graph', stage).sees.currentIs('Beat 1');
  });
});

describe('what a tree says about focus', () => {
  it('marks the name button and the field that hold focus, and nothing once the focus leaves the graph', async () => {
    const { driver, stage, writer } = pageWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');

    const marked = async (): Promise<readonly string[]> => {
      const lines = await driver.tree();
      const at = lines.findIndex((line) => line.includes('[active]'));
      const markedLine = at < 0 ? undefined : lines[at];
      if (markedLine === undefined) return [];
      const card =
        lines
          .slice(0, at)
          .filter((line) => line.includes('group "'))
          .at(-1) ?? '';
      return [card.trim(), markedLine.trim()];
    };

    await driver.focus('button', 'Scene 2', { role: 'group', name: 'Scene 2' });
    expect(await marked()).toEqual([]);

    expect(await driver.focusIs('button', 'Scene 2', { role: 'group', name: 'Scene 2' })).toBe(
      true,
    );
    expect(await marked()).toEqual(['- group "Scene 2":', '- button "Scene 2" [active]']);

    await driver.focus('textbox', 'List line', { role: 'group', name: 'Scene 1' });
    expect(await driver.focusIs('textbox', 'List line', { role: 'group', name: 'Scene 1' })).toBe(
      true,
    );
    expect(await marked()).toEqual(['- group "Scene 1":', '- textbox "List line" [active]']);

    await driver.clickAway();
    expect(await marked()).toEqual([]);
  });
});

const files = (import.meta as unknown as RawGlob).glob('/src/ui/graph/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

playScenarioFiles(files, () => vitestBrowserDriver(), graphScenarioSteps);
