import { afterEach, describe, expect, it } from 'vite-plus/test';
import { commands } from 'vite-plus/test/browser';
import {
  bottomOf,
  boxes,
  centreOf,
  heightOf,
  inMain,
  leftOf,
  middleOf,
  offScreenFocus,
  rightOf,
  showsAllItsText,
  topOf,
  widthOf,
} from '../../test-helpers/box';
import { settled } from '../../test-helpers/driver';
import { arrivalStep, easesOut, movedBy } from '../../test-helpers/frames';
import {
  laidOut,
  moving,
  partWay,
  recorded,
  startedTransitions,
} from '../../test-helpers/graph-page';
import { expectRingDrawn } from '../../test-helpers/look';
import type { RawGlob } from '../../test-helpers/raw-glob';
import { playScenarioFiles } from '../../test-helpers/scenario-entry';
import { narrowThePane, setStyleOn, theViewport } from '../../test-helpers/staging';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { nameOf } from '../card/card.test-page';
import { type Writer } from './graph.dsl';
import { graphScenarioSteps, graphWith } from './graph.harness';
import {
  altKeySeenFor,
  buttonsFocused,
  holdsTheFocus,
  theBodyHolds,
  theGraph,
} from './graph.test-page';

const graph = theGraph();

const currentName = (): string => nameOf(graph.on('current').card.element());

const aSentence = "A widow hunts the man who sank her husband's ship";

describe('the graph page', () => {
  it("draws a card's sentence in the muted colour", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();

    await writer.types(aSentence, { piece: 'Beat 1', facet: 'One-sentence summary' });
    await writer.clicks('The story');
    const card = graph.card('card', 'Beat 1');

    expect(getComputedStyle(card.shown(aSentence).element()).color).toBe(
      getComputedStyle(card.label.element()).color,
    );
  });

  it('draws on a page holding only its main', async () => {
    const { stage } = graphWith();
    await stage.fresh();

    expect(theBodyHolds()).toEqual(['main']);
  });
});

describe('the graph around the current piece', () => {
  it.each([1440, 1100])(
    "draws the current piece's card 560 px wide and centred at %i px",
    async (width) => {
      const { stage } = graphWith(0, width);
      await stage.fresh();

      expect(widthOf(graph.on('current').card.element())).toBe(560);
      expect(centreOf(graph.on('current').card)).toBeCloseTo(centreOf(graph.pane), 0);
    },
  );

  it("shows the whole sentence on the current piece's card, and fits its height to what it holds", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.types(
      'A widowed lighthouse keeper trades her last winter of fuel for a stranger\u2019s chart, then finds the chart leads back to the harbour where her husband\u2019s boat went down.',
      { piece: 'The story', facet: 'One-sentence summary' },
    );
    await laidOut();

    const field = graph.on('current').sentence.element();
    expect(showsAllItsText(field)).toBe(true);
    expect(heightOf(graph.on('current').card.element())).toBeGreaterThan(
      heightOf(graph.card('card', 'Beat 1').card.element()),
    );
  });

  it('puts the pieces hidden under a hidden story where the story is', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await writer.clicks('Scene 1');
    await settled();

    const story = graph.card('hidden', 'The story').card.element();
    const beat = graph.card('hidden', 'Beat 1').card.element();
    expect([leftOf(beat), topOf(beat)]).toEqual([leftOf(story), topOf(story)]);
  });

  it('draws a piece hidden under a chip at the chip’s width', async () => {
    const { stage, writer } = graphWith(1);
    await stage.fresh();
    await writer.clicks('Beat 2');
    await settled();

    expect(widthOf(graph.card('hidden', 'Scene 1').card.element())).toBe(
      widthOf(graph.card('chip', 'Beat 4').card.element()),
    );
  });

  it('draws a story card, a beat card and a scene card the same width', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();

    expect(widthOf(graph.card('card', 'The story').card.element())).toBe(240);
    expect(widthOf(graph.card('card', 'Scene 1').card.element())).toBe(240);

    await writer.clicks('Scene 1');
    await settled();

    expect(widthOf(graph.card('card', 'Beat 4').card.element())).toBe(240);
  });

  it('takes every card’s width from the token on main, so redefining it changes them', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();

    setStyleOn(graph.pane, '--card-width-short-facet', '20rem');
    await writer.clicks('Beat 4');
    await settled();

    expect(widthOf(graph.card('card', 'The story').card.element())).toBe(320);
    expect(widthOf(graph.card('card', 'Scene 1').card.element())).toBe(320);
    expect(widthOf(graph.card('card', 'Scene 2').card.element())).toBe(320);
  });

  it('keeps a piece off the graph out of the tree and out of the tab order', async () => {
    const { stage, sees, writer } = graphWith(8);
    await stage.fresh();
    await writer.clicks('The story');

    expect(graph.look('hidden').elements()).toHaveLength(8);
    expect((await sees.tree()).join('\n')).not.toContain('Scene');

    for (let at = 0; at < 12; at += 1) {
      await writer.presses('Tab');
      expect(holdsTheFocus(graph.look('hidden'))).toBe(false);
    }
  });

  it("marks each piece's depth in its heading, and the current piece with aria-current", async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');

    await expect
      .element(graph.card('card', 'The story').headingAt(2))
      .toHaveTextContent('The story');
    await expect.element(graph.card('chip', 'Beat 1').headingAt(3)).toHaveTextContent('Beat 1');
    await expect.element(graph.card('current', 'Beat 4').headingAt(3)).toHaveTextContent('Beat 4');
    await expect.element(graph.card('card', 'Scene 1').headingAt(4)).toHaveTextContent('Scene 1');

    await expect.element(graph.on('current').card).toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveAccessibleName('Beat 4');
  });

  it("keeps the current piece's card whole and centred when main narrows, with no move", async () => {
    const { stage } = graphWith();
    await stage.fresh();

    for (const width of [720, 320]) {
      narrowThePane(width);
      await laidOut();

      const box = graph.on('current').card.element();
      const bounds = graph.pane.element();
      expect(leftOf(box)).toBeGreaterThanOrEqual(leftOf(bounds));
      expect(rightOf(box)).toBeLessThanOrEqual(rightOf(bounds));
      expect(centreOf(graph.on('current').card)).toBeCloseTo(centreOf(graph.pane), 0);
    }
  });

  it("keeps the children under the current piece's card as its sentence grows while the writer types", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    const sentence =
      'She rows out before first light with the chart weighted under a stone, and finds a buoy ringing a bell nobody hung there, its rope still wet from a hand that had no business tying it.';

    await writer.types(sentence, { piece: 'The story', facet: 'One-sentence summary' });
    await laidOut();

    const children = graph.look('card').elements();
    expect(children).toHaveLength(5);
    const rowTop = Math.min(...children.map((card) => topOf(card)));
    expect(rowTop).toBeGreaterThanOrEqual(bottomOf(graph.on('current').card.element()));
  });

  it.each([1440, 1100])(
    "centres the current piece's row on the window, with the parent inside it, at %i px",
    async (width) => {
      const { stage, writer } = graphWith(0, width);
      await stage.fresh();
      await writer.clicks('Beat 2');
      await settled();

      const bounds = graph.pane.element();
      expect(middleOf(graph.on('current').card.element())).toBeCloseTo(window.innerHeight / 2, 0);

      const parent = graph.card('card', 'The story').card.element();
      expect(topOf(parent)).toBeGreaterThanOrEqual(topOf(bounds));
      expect(bottomOf(parent)).toBeLessThanOrEqual(bottomOf(bounds));
    },
  );

  it("stops the current piece's row below the top of main when the window is too short to centre it", async () => {
    const { stage, writer } = graphWith(0, 400);
    await stage.fresh();
    await theViewport(400, 500);
    await writer.clicks('Beat 2');
    await settled();

    const main = graph.pane.element();
    const parent = graph.card('card', 'The story').card.element();

    expect(topOf(parent)).toBeGreaterThanOrEqual(topOf(main));
  });

  it('shows a card’s sentence small and in the interface font', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.types(aSentence, { piece: 'The story', facet: 'One-sentence summary' });
    await writer.clicks('Beat 2');

    const card = graph.card('card', 'The story');
    const sentence = getComputedStyle(card.shown(aSentence).element());
    const name = getComputedStyle(card.heading.element());
    const typed = getComputedStyle(graph.on('current').sentence.element());

    expect(Number.parseFloat(sentence.fontSize)).toBeLessThan(Number.parseFloat(typed.fontSize));
    expect(sentence.fontFamily).toBe(name.fontFamily);
  });

  it('draws a chip sized to its name, with the name whole inside it', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 3');
    await settled();

    const chip = graph.card('chip', 'Beat 1');
    const box = chip.card.element();
    const name = chip.heading.element();

    expect(topOf(name)).toBeGreaterThanOrEqual(topOf(box));
    expect(bottomOf(name)).toBeLessThanOrEqual(bottomOf(box));
    expect(widthOf(box)).toBeLessThan(240);
  });

  it("keeps the add button inside the current piece's card", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await settled();

    const body = graph.on('current').facet.element();
    const button = graph.on('current').actions.addAScene;

    expect(topOf(button.element())).toBeGreaterThanOrEqual(topOf(body));
    expect(bottomOf(button.element())).toBeLessThanOrEqual(bottomOf(body));
  });
});

describe('the rows of the graph', () => {
  it('tabbing to a scene off screen brings it into view', async () => {
    const { stage, writer } = graphWith(8, 1100);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();

    expect(inMain(graph.card('card', 'Scene 1').card)).toBe(false);
    const scene1 = centreOf(graph.card('card', 'Scene 1').card);
    const scene2 = centreOf(graph.card('card', 'Scene 2').card);
    const beat4 = centreOf(graph.on('current').card);
    const beat3 = centreOf(graph.card('chip', 'Beat 3').card);
    const story = centreOf(graph.card('card', 'The story').card);

    await writer.presses('Tab');
    await settled();

    await expect.element(graph.card('card', 'Scene 1').nameButton).toHaveFocus();
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');
    expect(inMain(graph.card('card', 'Scene 1').card)).toBe(true);
    expect(centreOf(graph.on('current').card)).toBeCloseTo(beat4, 0);
    expect(centreOf(graph.card('chip', 'Beat 3').card)).toBeCloseTo(beat3, 0);
    expect(centreOf(graph.card('card', 'The story').card)).toBeCloseTo(story, 0);
    expect(centreOf(graph.card('card', 'Scene 2').card)).toBeCloseTo(
      scene2 + (centreOf(graph.card('card', 'Scene 1').card) - scene1),
      0,
    );
  });

  it('lands on the first piece of a row with Tab, whatever the cursor was last on in it', async () => {
    const { stage, writer } = graphWith(8);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();

    await writer.putsTheFocusOnNameButtonOf('Scene 5');
    await expect.element(graph.card('card', 'Scene 5').nameButton).toHaveFocus();
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.putsTheFocusOnTheCardOf('Beat 4');
    await writer.presses('Tab');
    await expect.element(graph.card('card', 'Scene 1').nameButton).toHaveFocus();
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');
  });

  it('gives a row back its place when the cursor leaves it', async () => {
    const { stage, writer } = graphWith(8, 1100);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();
    const atRest = centreOf(graph.card('card', 'Scene 1').card);

    await writer.presses('Tab');
    await settled();
    expect(inMain(graph.card('card', 'Scene 1').card)).toBe(true);
    expect(centreOf(graph.card('card', 'Scene 1').card)).not.toBeCloseTo(atRest, 0);

    await writer.clicksAwayFromTheGraph();
    await laidOut();
    await settled();

    expect(holdsTheFocus(graph.pane)).toBe(false);
    expect(centreOf(graph.card('card', 'Scene 1').card)).toBeCloseTo(atRest, 0);
  });

  it('never puts the cursor on a piece outside main, with eight scenes under the current piece at 1100 px', async () => {
    const { stage, writer } = graphWith(8, 1100);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();

    expect(inMain(graph.card('card', 'Scene 1').card)).toBe(false);
    expect(inMain(graph.card('card', 'Scene 8').card)).toBe(false);

    const offScreen: string[] = [];
    const check = async (): Promise<void> => {
      await settled();
      offScreen.push(...offScreenFocus());
    };
    const reached = new Set<string>();
    const step = async (key: string): Promise<void> => {
      await writer.presses(key);
      await check();
      reached.add(currentName());
    };

    await check();
    await writer.presses('Tab');
    await check();
    await expect.element(graph.card('card', 'Scene 1').nameButton).toHaveFocus();

    for (let at = 0; at < 9; at += 1) await step('ArrowRight');
    for (let at = 0; at < 9; at += 1) await step('ArrowLeft');
    await step('ArrowUp');
    await step('ArrowDown');

    await writer.presses('Shift+Tab');
    await check();
    await writer.presses('Shift+Tab');
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

  it('never puts the cursor on a piece outside main, in a fresh graph at 770 px', async () => {
    const { stage, writer } = graphWith(0, 770);
    await stage.fresh();
    await settled();

    expect(inMain(graph.card('card', 'Beat 1').card)).toBe(false);
    expect(inMain(graph.card('card', 'Beat 5').card)).toBe(false);

    const offScreen: string[] = [];
    const check = async (): Promise<void> => {
      await settled();
      offScreen.push(...offScreenFocus());
    };
    const reached = new Set<string>();

    await check();
    await writer.putsTheFocusOnTheCardOf('The story');
    await writer.presses('Tab');
    await check();
    await expect.element(graph.card('card', 'Beat 1').nameButton).toHaveFocus();
    await expect
      .element(graph.card('current', 'The story').card)
      .toHaveAttribute('aria-current', 'location');
    expect(inMain(graph.card('card', 'Beat 1').card)).toBe(true);

    for (let at = 0; at < 6; at += 1) {
      await writer.presses('ArrowRight');
      await check();
      reached.add(currentName());
    }
    for (let at = 0; at < 6; at += 1) {
      await writer.presses('ArrowLeft');
      await check();
      reached.add(currentName());
    }

    for (const key of ['ArrowUp', 'ArrowDown', 'Enter', 'Tab']) {
      await writer.presses(key);
      await check();
    }

    expect(offScreen).toEqual([]);
    expect([...reached].sort()).toEqual(['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5']);
  });

  it('goes one stop per row with Tab, then out of the graph, and back with Shift+Tab', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.presses('Tab');
    await expect.element(graph.card('card', 'Scene 1').nameButton).toHaveFocus();

    await writer.presses('Tab');
    expect(holdsTheFocus(graph.pane)).toBe(false);

    await writer.presses('Shift+Tab');
    await expect.element(graph.card('card', 'Scene 1').nameButton).toHaveFocus();

    await writer.presses('Shift+Tab');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.presses('Shift+Tab');
    await expect.element(graph.card('card', 'The story').nameButton).toHaveFocus();

    await writer.presses('Shift+Tab');
    expect(holdsTheFocus(graph.pane)).toBe(false);
  });

  it('makes the next and previous piece in a row the current piece with ← →', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');

    await writer.presses('Tab');
    await expect.element(graph.card('card', 'Scene 1').nameButton).toHaveFocus();
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.presses('ArrowRight');
    await expect
      .element(graph.card('current', 'Scene 2').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.presses('ArrowLeft');
    await expect
      .element(graph.card('current', 'Scene 1').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.presses('ArrowRight');
    await expect
      .element(graph.card('current', 'Scene 2').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.presses('ArrowUp');
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();
  });

  it("leaves the cursor on a row's stop when Esc is pressed there", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.putsTheFocusOnNameButtonOf('Beat 1');

    await writer.presses('Escape');

    await expect.element(graph.card('chip', 'Beat 1').nameButton).toHaveFocus();
  });

  it("takes the current piece's card's field and its add button out of reach once Esc returns to it", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await writer.presses('Enter');
    const field = graph.on('current').sentence;
    await expect.element(field).toHaveFocus();

    await writer.presses('Escape');

    await expect.element(graph.on('current').card).toHaveFocus();
    await expect.element(field).toHaveAttribute('tabindex', '-1');
    await expect.element(graph.on('current').actions.addAScene).toHaveAttribute('tabindex', '-1');
  });

  it('gives a row back its stop once a piece of it is on screen again', async () => {
    const { stage, writer } = graphWith(8, 1100);
    await stage.fresh();
    await writer.clicks('Beat 4');

    narrowThePane(100);
    await laidOut();
    await settled();

    await writer.presses('Tab');
    expect(holdsTheFocus(graph.pane)).toBe(false);

    await writer.putsTheFocusOnTheCardOf('Beat 4');
    narrowThePane(1440);
    await laidOut();
    await settled();

    await writer.presses('Tab');
    await expect.element(graph.card('card', 'Scene 1').nameButton).toHaveFocus();
  });
});

describe('moving the current piece', () => {
  it('moves to the parent with ↑, and across the level with → and ←', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await writer.presses('ArrowRight');
    await expect
      .element(graph.card('current', 'Beat 3').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.presses('ArrowLeft');
    await expect
      .element(graph.card('current', 'Beat 2').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.presses('ArrowUp');
    await expect
      .element(graph.card('current', 'The story').card)
      .toHaveAttribute('aria-current', 'location');
  });

  it('moves the current piece with → from a sibling’s name button', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheFocusOnNameButtonOf('Beat 1');
    await writer.presses('ArrowRight');

    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();
  });

  it('moves the current piece with ↓ from the add button', async () => {
    const { stage, writer } = graphWith(1);
    await stage.fresh();
    await writer.clicks('Beat 4');

    expect(graph.on('current').buttons.elements()[0]).toBe(
      graph.on('current').actions.addAScene.element(),
    );
    await writer.putsTheFocusOnTheAddButtonOf('Beat 4');
    await writer.presses('ArrowDown');

    await expect
      .element(graph.card('current', 'Scene 1').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();
  });

  it('still presses a name button with Enter and with Space', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheFocusOnNameButtonOf('Beat 1');
    await writer.presses('Enter');
    await expect
      .element(graph.card('current', 'Beat 1').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.clicks('Beat 3');
    await writer.putsTheFocusOnNameButtonOf('Beat 5');
    await writer.presses('Space');
    await expect
      .element(graph.card('current', 'Beat 5').card)
      .toHaveAttribute('aria-current', 'location');
  });

  it('leaves the current piece where it is while the cursor is in a sentence', async () => {
    const { stage, sees, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.presses('Enter');
    await writer.presses('ArrowRight');

    await expect
      .element(graph.card('current', 'Beat 2').card)
      .toHaveAttribute('aria-current', 'location');
    await sees.focusIsIn('Beat 2', 'One-sentence summary');
  });

  it("puts the cursor on the current piece's card with Esc, and the arrows then move the current piece", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.presses('Enter');
    await writer.presses('Escape');

    await expect.element(graph.on('current').card).toHaveFocus();
    await expect
      .element(graph.card('current', 'Beat 2').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.presses('ArrowRight');
    await expect
      .element(graph.card('current', 'Beat 3').card)
      .toHaveAttribute('aria-current', 'location');
  });

  it("puts the cursor in the current piece's sentence with Enter", async () => {
    const { stage, sees, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.presses('Enter');

    await sees.focusIsIn('Beat 2', 'One-sentence summary');
  });

  it("leaves the cursor on the new current piece's card after a key, a chip, a card and a story card", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();

    await writer.presses('ArrowDown');
    await expect
      .element(graph.card('current', 'Beat 1').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.clicks('Beat 3');
    await expect
      .element(graph.card('current', 'Beat 3').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.clicks('The story');
    await expect
      .element(graph.card('current', 'The story').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.clicks('Beat 4');
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();
  });

  it('leaves the siblings beside the current piece out of the tab order, and moves the current piece along them with the arrows', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 3');

    const siblings = graph.look('chip');
    expect(siblings.elements()).toHaveLength(4);
    for (const name of ['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5']) {
      await expect.element(graph.card('chip', name).card).toHaveAttribute('tabindex', '-1');
      await expect.element(graph.card('chip', name).nameButton).toHaveAttribute('tabindex', '-1');
    }
    await expect.element(graph.on('current').card).toHaveFocus();

    const reached: string[] = [];
    for (let at = 0; at < 10; at += 1) {
      await writer.presses('Tab');
      const chip = ['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5'].find((name) =>
        holdsTheFocus(graph.card('chip', name).card),
      );
      if (chip !== undefined) reached.push(chip);
    }
    expect(reached).toEqual([]);

    await writer.clicks('Beat 3');
    await writer.presses('ArrowRight');
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.presses('ArrowLeft');
    await expect
      .element(graph.card('current', 'Beat 3').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();
  });

  it('moves the current piece to a piece another row stops on with Enter', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await writer.clicks('Scene 1');

    await writer.presses('Shift+Tab');
    await expect.element(graph.card('card', 'Beat 4').nameButton).toHaveFocus();

    await writer.presses('Enter');
    await expect
      .element(graph.card('current', 'Beat 4').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();
  });

  it('leaves the current piece where it is when an arrow key is held with a modifier', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    const held = await altKeySeenFor('ArrowRight', () => writer.presses('Alt+ArrowRight'));

    expect(held).toEqual([true]);
    await expect
      .element(graph.card('current', 'Beat 2').card)
      .toHaveAttribute('aria-current', 'location');
  });

  it('moves the current piece to a piece whose sentence is clicked, with the cursor in it', async () => {
    const { stage, sees, writer } = graphWith();
    await stage.fresh();
    await writer.clicksTheSentenceOf('Beat 2');

    await expect
      .element(graph.card('current', 'Beat 2').card)
      .toHaveAttribute('aria-current', 'location');
    await sees.focusIsIn('Beat 2', 'One-sentence summary');
  });

  it("never tabs into a sentence that is not the current piece's", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();

    const strayed: string[] = [];
    for (let at = 0; at < 20; at += 1) {
      await writer.presses('Tab');
      for (const look of ['card', 'chip'] as const) {
        for (const card of graph.look(look).elements()) {
          const piece = nameOf(card);
          if (holdsTheFocus(graph.card(look, piece).sentence)) strayed.push(piece);
        }
      }
    }

    expect(strayed).toEqual([]);
  });

  it('reaches the sentence of the piece it moved to with Enter, and not through the press', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await expect
      .element(graph.card('card', 'The story').sentence)
      .toHaveAttribute('tabindex', '-1');

    const reached: string[] = [];
    for (let at = 0; at < 10; at += 1) {
      await writer.presses('Tab');
      for (const piece of ['Beat 2', 'The story']) {
        if (holdsTheFocus(graph.piece(piece).sentence)) reached.push(piece);
      }
    }

    expect(reached).toEqual([]);

    await writer.clicks('Beat 2');
    await writer.presses('Enter');

    await expect.element(graph.on('current').sentence).toHaveFocus();
  });

  it('never puts the cursor on the add button through the press', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    const held = await buttonsFocused(() => writer.addsASceneUnder('Beat 2'));

    expect(held).toEqual([]);
  });

  it('moves the current piece to the new scene, and ↑ then ↓ returns to it', async () => {
    const { stage, sees, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.addsASceneUnder('Beat 2');

    await expect
      .element(graph.card('current', 'Scene 1').card)
      .toHaveAttribute('aria-current', 'location');
    await sees.focusIsIn('Scene 1', 'List line');

    await writer.presses('Escape');
    await writer.presses('ArrowUp');
    await expect
      .element(graph.card('current', 'Beat 2').card)
      .toHaveAttribute('aria-current', 'location');

    await writer.presses('ArrowDown');
    await expect
      .element(graph.card('current', 'Scene 1').card)
      .toHaveAttribute('aria-current', 'location');
  });

  it('leaves the fields of the card it leaves out of the tab order, after adding a scene', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await writer.presses('Enter');
    await writer.presses('Tab');
    await writer.presses('Enter');

    await expect
      .element(graph.card('current', 'Scene 1').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').fields.first()).toHaveFocus();

    await expect.element(graph.card('card', 'Beat 2').sentence).toHaveAttribute('tabindex', '-1');

    await writer.presses('Shift+Tab');
    expect(holdsTheFocus(graph.card('card', 'Beat 2').card)).toBe(false);
  });

  it("takes the fields of the current piece's card out of the tab order when the cursor leaves with no focusin", async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.presses('Enter');
    await expect.element(graph.on('current').sentence).toHaveAttribute('tabindex', '0');

    await writer.clicksAwayFromTheGraph();

    await expect.element(graph.on('current').sentence).toHaveAttribute('tabindex', '-1');
  });

  it('puts the cursor on the card the writer clicks, the current one or another', async () => {
    const { stage, writer } = graphWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.presses('Enter');
    await expect.element(graph.on('current').sentence).toHaveFocus();

    await writer.clicksTheNameOf('Beat 2');
    await expect.element(graph.on('current').card).toHaveFocus();

    await writer.clicksTheNameOf('The story');
    await expect
      .element(graph.card('current', 'The story').card)
      .toHaveAttribute('aria-current', 'location');
    await expect.element(graph.on('current').card).toHaveFocus();
  });

  it('draws the ring on the card whose name the writer clicks', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicksTheNameOf('Beat 2');

    await expectRingDrawn(graph.on('current').card);
  });

  it('draws the ring on the card the writer clicks at its border', async () => {
    const { stage, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicksTheBorderOf('Beat 2');

    await expectRingDrawn(graph.on('current').card);
  });
});

describe('what a tree says about focus', () => {
  it('marks the name button and the field that hold focus, and nothing once the focus leaves the graph', async () => {
    const { stage, sees, writer } = graphWith(2);
    await stage.fresh();
    await writer.clicks('Beat 4');

    const marked = async (): Promise<readonly string[]> => {
      const lines = await sees.tree();
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

    await writer.putsTheFocusOnNameButtonOf('Scene 2');
    expect(await marked()).toEqual([]);

    await sees.focusIsOnTheName('Scene 2');
    expect(await marked()).toEqual(['- group "Scene 2":', '- button "Scene 2" [active]']);

    await writer.putsTheFocusInTheFacetOf('Scene 1', 'List line');
    await sees.focusIsIn('Scene 1', 'List line');
    expect(await marked()).toEqual(['- group "Scene 1":', '- textbox "List line" [active]']);

    await writer.clicksAwayFromTheGraph();
    expect(await marked()).toEqual([]);
  });
});

const moves: ReadonlyArray<{
  readonly what: string;
  readonly play: (writer: Writer) => Promise<void>;
}> = [
  {
    what: 'a click on a card',
    play: async (writer) => {
      await writer.clicks('Beat 2');
    },
  },
  {
    what: 'a click on a chip',
    play: async (writer) => {
      await writer.clicks('Beat 2');
      await settled();
      await writer.clicks('Beat 5');
    },
  },
  {
    what: 'an arrow key',
    play: async (writer) => {
      await writer.clicks('Beat 2');
      await settled();
      await writer.presses('ArrowRight');
    },
  },
];

describe('the motion of a move', () => {
  it.each(moves)('keeps every animation of $what within 400 ms, easing out', async ({ play }) => {
    const { stage, writer } = graphWith(1);
    await stage.fresh();

    await play(writer);
    const animations = moving();

    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      const timing = animation.effect!.getComputedTiming();
      expect(timing.endTime).toBeLessThanOrEqual(400);
      expect(easesOut(timing.easing)).toBe(true);
    }
  });

  it('draws the page without moving anything', async () => {
    const { stage } = graphWith(1);
    await stage.fresh();

    expect(moving()).toEqual([]);
  });

  it('changes a card’s look without starting a transition of its own, ending at a fresh draw’s size', async () => {
    const atRest = graphWith(1);
    await atRest.stage.fresh();
    await atRest.writer.addsASceneUnder('Beat 4');
    await settled();
    const rest = boxes();

    const moved = graphWith(1);
    await moved.stage.fresh();
    await moved.writer.addsASceneUnder('Beat 4');
    const started = startedTransitions();
    await settled();
    await laidOut();
    await settled();

    expect(started.filter(({ easing }) => !easesOut(easing))).toEqual([]);
    expect(boxes()).toEqual(rest);
  });

  it('keeps a piece leaving the graph out of reach while it fades', async () => {
    const { stage, writer } = graphWith(1);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await settled();

    await writer.clicks('The story');

    for (let at = 0; at < 12; at += 1) {
      await writer.presses('Tab');
      expect(holdsTheFocus(graph.card('hidden', 'Scene 1').card)).toBe(false);
    }

    await expect.element(graph.card('hidden', 'Scene 1').card).toHaveAttribute('inert');
  });

  it('resizes part-way through a move without cutting it short, ending where a resize at rest does', async () => {
    const atRest = graphWith(1);
    await atRest.stage.fresh();
    await atRest.writer.clicks('Beat 2');
    await settled();
    narrowThePane(720);
    await laidOut();
    await settled();
    const rest = boxes();

    const resized = graphWith(1);
    await resized.stage.fresh();
    await resized.writer.clicks('Beat 2');
    narrowThePane(720);
    await laidOut();
    expect(moving().length).toBeGreaterThan(0);
    await settled();
    await laidOut();
    await settled();

    expect(boxes()).toEqual(rest);
  });

  it('keeps a move made during a move running, and comes to rest without a jump', async () => {
    const { stage, writer } = graphWith(1);
    await stage.fresh();

    const frames = await recorded(async () => {
      await writer.clicks('Beat 2');
      await partWay();
      await writer.presses('ArrowRight');
      await settled();
    });

    const first = frames.find((frame) => frame.running > 0)!;
    expect(frames.some((frame) => frame.at > first.at + 270 && frame.running > 0)).toBe(true);
    expect(arrivalStep(frames)).toBeLessThan(10);
  });

  it('starts a second move part-way through the first without jumping a card', async () => {
    const { stage, writer } = graphWith(1);
    await stage.fresh();

    let pressed = 0;
    const frames = await recorded(async () => {
      await writer.clicks('Beat 2');
      await laidOut();
      pressed = performance.now();
      await writer.presses('ArrowRight');
      await settled();
    });

    const story = nameOf(graph.card('card', 'The story').card.element());
    const before = frames.findLast((frame) => frame.at <= pressed)!;
    const after = frames.find((frame) => frame.at > pressed)!;
    const landing = frames.at(-1)!;

    const step = movedBy(before, after, story);
    const stillToGo = movedBy(before, landing, story);

    expect(step).toBeLessThan(stillToGo / 2);
  });

  it('takes quick arrow presses while a move runs, landing on the piece the last one aims at and running to its end', async () => {
    const { stage, writer } = graphWith(1);
    await stage.fresh();
    await writer.clicks('Beat 5');
    await settled();

    let pressed = 0;
    const frames = await recorded(async () => {
      await writer.presses('ArrowLeft');
      expect(moving().length).toBeGreaterThan(0);
      await writer.presses('ArrowLeft');
      pressed = performance.now();
      await writer.presses('ArrowLeft');
      await settled();
    });

    await expect
      .element(graph.card('current', 'Beat 2').card)
      .toHaveAttribute('aria-current', 'location');
    const after = frames.filter((frame) => frame.at > pressed && frame.running > 0);
    expect((after.at(-1)?.at ?? pressed) - pressed).toBeGreaterThan(160);
  });

  describe('under reduced motion', () => {
    afterEach(async () => {
      await commands.emulateReducedMotion('no-preference');
    });

    it.each(moves)('moves nothing for $what', async ({ play }) => {
      const { stage, writer } = graphWith(1);
      await commands.emulateReducedMotion('reduce');
      await stage.fresh();

      await play(writer);

      expect(moving()).toEqual([]);
    });
  });
});

const files = (import.meta as unknown as RawGlob).glob('/src/ui/graph/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

playScenarioFiles(files, () => vitestBrowserDriver(), graphScenarioSteps);
