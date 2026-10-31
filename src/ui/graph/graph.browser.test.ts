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
  altKeySeenFor,
  buttonsFocused,
  cardAtCursor,
  cards,
  cursorIn,
  cursorIsInThePane,
  currentCards,
  facetOf,
  focused,
  headingOf,
  labelOf,
  legendOf,
  named,
  nameOf,
  navigationIn,
  pane,
  positionOf,
  sentenceFieldOf,
  shownSentenceOf,
  timesDrawn,
} from './graph.test-page';

const stored = 'working-title:project';

const centreOf = (card: Element): number => {
  const box = card.getBoundingClientRect();
  return box.left + box.width / 2;
};

const theStory = "A widow hunts the man who sank her husband's ship";

describe('the graph page', () => {
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

    expect(timesDrawn(focused(), theStory)).toBe(1);
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
    await laidOut();

    const field = sentenceFieldOf(focused());
    expect(field.clientHeight).toBeGreaterThanOrEqual(field.scrollHeight - 1);
    expect(focused().getBoundingClientRect().height).toBeGreaterThan(
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

  it("marks each piece's depth in its heading, and the focus with aria-current", async () => {
    const { driver, writer } = pageWith(2);
    await driver.fresh();
    await writer.clicks('Beat 4');

    expect(headingOf(named('card', 'The story')).tagName).toBe('H2');
    expect(headingOf(named('chip', 'Beat 1')).tagName).toBe('H3');
    expect(headingOf(named('focus', 'Beat 4')).tagName).toBe('H3');
    expect(headingOf(named('card', 'Scene 1')).tagName).toBe('H4');

    expect(currentCards()).toEqual([focused()]);
    expect(nameOf(focused())).toBe('Beat 4');
  });

  it('keeps the focus card whole and centred when main narrows, with no move', async () => {
    const { driver } = pageWith();
    await driver.fresh();

    for (const width of [720, 320]) {
      narrowThePane(width);
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
      await settled();

      const bounds = pane().getBoundingClientRect();
      const box = focused().getBoundingClientRect();
      expect(box.top + box.height / 2).toBeCloseTo(window.innerHeight / 2, 0);

      const parent = named('card', 'The story').getBoundingClientRect();
      expect(parent.top).toBeGreaterThanOrEqual(bounds.top);
      expect(parent.bottom).toBeLessThanOrEqual(bounds.bottom);
    },
  );

  it('stops the focus row below the header it was given when the window is too short to centre it', async () => {
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
    const focus = getComputedStyle(sentenceFieldOf(focused()));

    expect(Number.parseFloat(sentence.fontSize)).toBeLessThan(Number.parseFloat(focus.fontSize));
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

  it('keeps the add button inside the focus card', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await settled();

    const card = focused();
    const body = facetOf(card).getBoundingClientRect();
    const button = addButtonOf(card).getBoundingClientRect();

    expect(button.top).toBeGreaterThanOrEqual(body.top);
    expect(button.bottom).toBeLessThanOrEqual(body.bottom);
  });
});

describe('moving the focus', () => {
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
    expect(nameOf(focused())).toBe('Beat 3');

    await driver.press('ArrowLeft');
    expect(nameOf(focused())).toBe('Beat 2');

    await driver.press('ArrowUp');
    expect(nameOf(focused())).toBe('The story');
  });

  it('moves the focus with → from a sibling’s name button', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheCursorOnNameButtonOf('Beat 1');
    await driver.press('ArrowRight');

    expect(nameOf(focused())).toBe('Beat 4');
    expect(cardAtCursor()).toBe(focused());
  });

  it('moves the focus with ↓ from the add button', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();
    await writer.clicks('Beat 4');

    expect(addButtonIsFirst(focused())).toBe(true);
    await driver.focus('button', 'Add a scene', { role: 'group', name: nameOf(focused()) });
    await driver.press('ArrowDown');

    expect(nameOf(focused())).toBe('Scene 1');
    expect(cardAtCursor()).toBe(focused());
  });

  it('still presses a name button with Enter and with Space', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    await writer.putsTheCursorOnNameButtonOf('Beat 1');
    await driver.press('Enter');
    expect(nameOf(focused())).toBe('Beat 1');

    await writer.clicks('Beat 3');
    await writer.putsTheCursorOnNameButtonOf('Beat 5');
    await driver.press('Space');
    expect(nameOf(focused())).toBe('Beat 5');
  });

  it('leaves the focus where it is while the cursor is in a sentence', async () => {
    const { driver, sees, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('ArrowRight');

    expect(nameOf(focused())).toBe('Beat 2');
    await sees.cursorIsIn(nameOf(focused()), 'One-sentence summary');
  });

  it('puts the cursor on the focus card with Esc, and the arrows then move the focus', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');
    await driver.press('Escape');

    expect(cardAtCursor()).toBe(focused());
    expect(nameOf(focused())).toBe('Beat 2');

    await driver.press('ArrowRight');
    expect(nameOf(focused())).toBe('Beat 3');
  });

  it("puts the cursor in the focus card's sentence with Enter", async () => {
    const { driver, sees, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.press('Enter');

    await sees.cursorIsIn(nameOf(focused()), 'One-sentence summary');
  });

  it('leaves the cursor on the new focus card after a key, a chip, a card and a path', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();

    await driver.press('ArrowDown');
    expect(nameOf(focused())).toBe('Beat 1');
    expect(cardAtCursor()).toBe(focused());

    await writer.clicks('Beat 3');
    expect(nameOf(focused())).toBe('Beat 3');
    expect(cardAtCursor()).toBe(focused());

    await writer.clicks('The story');
    expect(nameOf(focused())).toBe('The story');
    expect(cardAtCursor()).toBe(focused());

    await writer.clicks('Beat 4');
    expect(nameOf(focused())).toBe('Beat 4');
    expect(cardAtCursor()).toBe(focused());

    await driver.click('button', 'The story', {
      role: 'navigation',
      name: 'Where you are',
    });
    expect(nameOf(focused())).toBe('The story');
    expect(cardAtCursor()).toBe(focused());
  });

  it('reaches every sibling with Tab, and Enter on one moves the focus there', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 3');

    for (const card of [...cards('card'), ...cards('chip')]) {
      if (card === focused()) continue;
      await writer.putsTheCursorOnNameButtonOf(nameOf(card));
    }
    await expect(writer.putsTheCursorOnNameButtonOf(nameOf(focused()))).rejects.toThrow();

    const reached: string[] = [];
    for (let at = 0; at < 20 && reached.length < 4; at += 1) {
      await driver.press('Tab');
      const chip = cursorIn('chip');
      if (chip !== null) reached.push(nameOf(chip));
    }
    expect([...reached].sort()).toEqual(['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5']);

    await writer.putsTheCursorOnNameButtonOf('Beat 4');
    await driver.press('Enter');

    expect(nameOf(focused())).toBe('Beat 4');
    expect(cardAtCursor()).toBe(focused());
  });

  it('leaves the focus where it is when an arrow key is held with a modifier', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const held = await altKeySeenFor('ArrowRight', () =>
      browser.userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}'),
    );

    expect(held).toEqual([true]);
    expect(nameOf(focused())).toBe('Beat 2');
  });

  it('moves the focus to a piece whose sentence is clicked, with the cursor in it', async () => {
    const { driver, sees } = pageWith();
    await driver.fresh();
    await driver.click('textbox', 'One-sentence summary', {
      role: 'group',
      name: 'Beat 2',
    });

    expect(nameOf(focused())).toBe('Beat 2');
    await sees.cursorIsIn('Beat 2', 'One-sentence summary');
  });

  it('never tabs into a sentence that is not the focus’s', async () => {
    const { driver } = pageWith();
    await driver.fresh();

    const strayed: string[] = [];
    for (let at = 0; at < 20; at += 1) {
      await driver.press('Tab');
      for (const card of [...cards('card'), ...cards('chip')]) {
        const piece = nameOf(card);
        const inSentence = await driver.cursorIn('One-sentence summary', {
          role: 'group',
          name: piece,
        });
        if (inSentence) strayed.push(piece);
      }
    }

    expect(strayed).toEqual([]);
  });

  it('tabs into the sentence of the piece it moved to, and not the one it left', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');

    const reached: string[] = [];
    for (let at = 0; at < 20; at += 1) {
      await driver.press('Tab');
      for (const piece of ['Beat 2', 'The story']) {
        const inSentence = await driver.cursorIn('One-sentence summary', {
          role: 'group',
          name: piece,
        });
        if (inSentence) reached.push(piece);
      }
    }

    expect(reached).toContain('Beat 2');
    expect(reached).not.toContain('The story');
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

  it('moves the focus to the new scene, and ↑ then ↓ returns to it', async () => {
    const { driver, sees, writer } = pageWith();
    await driver.fresh();
    await writer.clicks('Beat 2');
    await driver.click('button', 'Add a scene', { role: 'group', name: 'Beat 2' });

    expect(nameOf(focused())).toBe('Scene 1');
    await sees.cursorIsIn(nameOf(focused()), 'List line');

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

    await openTheApp();

    expect(nameOf(focused())).toBe('The story');
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

  it('moves the focus of the graph the writer clicked, and leaves the other where it is', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await writer.addsASceneUnder('Beat 2');
    await twoGraphs();
    const first = onGraph('First graph');
    const second = onGraph('Second graph');

    await first.writer.clicks('Beat 2');
    await first.writer.moves('↓');

    await first.sees.focusIs('Scene 1');
    await second.sees.focusIs('The story');
  });

  it('moves every graph when the key is pressed outside them', async () => {
    const { driver, writer } = pageWith();
    await driver.fresh();
    await twoGraphs();

    await writer.clicksAwayFromTheGraph();
    await driver.press('ArrowDown');

    await onGraph('First graph').sees.focusIs('Beat 1');
    await onGraph('Second graph').sees.focusIs('Beat 1');
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

    await sees.focusIs('Beat 1');
    expect(cursorIsInThePane()).toBe(true);
  });
});
