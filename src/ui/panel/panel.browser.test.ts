import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { PieceView } from '../../application/project';
import { settled } from '../../test-helpers/driver';
import {
  bottomOf,
  caretIn,
  caretLineBottomOf,
  closeButtonOf,
  displayOf,
  fieldFor,
  headingOf,
  holdsTheFocus,
  heightOf,
  insideTheViewport,
  lineHeightOf,
  nameElementOf,
  nameOn,
  scrollHeightOf,
  scrollToTheEndOf,
  theBodyFillsTheWindow,
  theBodyIs,
  topOf,
  widthOf,
} from './panel.test-page';
import { mountThePanel, theBeat } from './panel.harness';

const theSentence = 'One-sentence summary';
const theParagraph = 'Paragraph';
const thePage = 'Page';
const theText = 'Maren rows out before first light';

const holding = (sentence: string, paragraph: string): PieceView => ({
  ...theBeat,
  facets: [{ id: 'one-sentence-summary', label: theSentence, text: sentence }],
  longFacets: [{ id: 'paragraph', label: theParagraph, text: paragraph }],
});

const longParagraph =
  'Maren finds the ship\u2019s log in the harbourmaster\u2019s office, its pages for the night of the sinking torn out, and the harbourmaster lies about who took them until she sees the sinking was no accident at all.';

const aParagraphOfTwelveLines = `Maren rows out before first light.
The chart is weighted under a stone.
The bell rings, and no hand is near.
She counts the marks on the chart.
One mark is not on the old chart.
The log is torn where the night was.
The harbourmaster looks at the door.
Her husband\u2019s boat went down in calm.
She writes it down under her coat.
By noon the wind turns and the lamp dies.
A stranger waits with a crate of pages.
He says the sinking was no accident.`;

const aPageOfFortySentences = `The lamp on the point went dark before the bell rang.
A stranger leaves a crate on the quay at the turn of the tide.
Maren sets the crate on her table and lifts the lid.
Inside lies a log with four pages torn from its back.
She reads the first page twice and finds her own name.
The harbourmaster\u2019s chair is empty and the fire is out.
She walks the length of the quay and counts the boats.
One berth is empty, and its rope is still wet.
She takes the rope and smells tar, salt and lamp oil.
A gull drops a fish on the stones and does not come back.
By the third bell the wind has turned to the north.
She writes the berth\u2019s number on the palm of her hand.
The customs house keeps a list of every boat that left.
The list for that night is written in another hand.
She copies the names and folds the page into her coat.
On the way home she passes the door of the sailmaker.
The sailmaker is mending a net and will not look up.
He says the log was found and thrown back into the water.
Maren asks who found it, and he says he does not know.
She leaves him the fish and walks back to the harbour.
The crate in the water was tied with a knot she knows.
Her husband tied that knot the winter they were married.
She takes the crate home and opens the hidden drawer.
Inside are the four pages, folded small and dry.
Each page carries a course and a time, and one name.
The name is the harbourmaster\u2019s, written in his hand.
The course runs past the point and into the shallows.
No boat draws that little water this side of the harbour.
She reads the last line twice and then reads it again.
The last line says the lamps were moved that night.
She takes the pages to the light and reads them again.
The tide that night ran against the wind and the moon.
Any boat on that course would have struck the rocks.
Her husband\u2019s boat was the only one out of the harbour.
The harbourmaster kept the lights, and he moved them.
Maren folds the pages into her coat and takes the lamp.
She rows out before first light with the chart under a stone.
The bell buoy rings, and there is no hand on the rope.
She ties the knot her husband taught her and lets it down.
The water takes the crate, and the harbour keeps its dead.`;

const holdingALongPage = (paragraph: string, page: string): PieceView => ({
  ...holding(theText, paragraph),
  longFacets: [
    { id: 'paragraph', label: theParagraph, text: paragraph },
    { id: 'page', label: thePage, text: page },
  ],
});

describe('the panel mounted alone', () => {
  it('draws the piece it was opened on, under its name', () => {
    const panel = mountThePanel();

    expect(nameOn(panel.element)).toBe('Beat 2');
    expect(fieldFor(panel.element, theSentence).value).toBe('');
    expect(fieldFor(panel.element, theParagraph).value).toBe('');
  });

  it('moves the caret inside a field with the arrow keys, and leaves the focus in it', async () => {
    const panel = mountThePanel(holding('', theText));
    const field = fieldFor(panel.element, theParagraph);
    field.focus();
    field.setSelectionRange(6, 6);

    await browser.userEvent.keyboard('{ArrowRight}');

    expect(caretIn(field)).toBe(7);
    expect(holdsTheFocus(field)).toBe(true);
  });

  it('tabs from the sentence to the paragraph', async () => {
    const panel = mountThePanel();
    fieldFor(panel.element, theSentence).focus();

    await browser.userEvent.keyboard('{Tab}');

    expect(holdsTheFocus(fieldFor(panel.element, theParagraph))).toBe(true);
  });

  it('tabs from the paragraph to the page', async () => {
    const panel = mountThePanel();
    fieldFor(panel.element, theParagraph).focus();

    await browser.userEvent.keyboard('{Tab}');

    expect(holdsTheFocus(fieldFor(panel.element, thePage))).toBe(true);
  });

  it('elaborates the facet it was typed into, with the text typed', async () => {
    const typed: string[] = [];
    const panel = mountThePanel(theBeat, {
      elaborate: (pieceId, facetId, text) => {
        typed.push(`${pieceId} ${facetId} ${text}`);
        return Promise.resolve();
      },
    });

    const field = fieldFor(panel.element, theParagraph);
    field.focus();
    await browser.userEvent.keyboard('m');
    await browser.userEvent.keyboard('a');

    expect(typed).toEqual(['beat-2 paragraph m', 'beat-2 paragraph ma']);
  });

  it('grows the paragraph field as the writer types into it', async () => {
    const panel = mountThePanel();
    const field = fieldFor(panel.element, theParagraph);
    const empty = heightOf(field);

    field.focus();
    await browser.userEvent.keyboard(longParagraph);

    expect(field.value).toBe(longParagraph);
    expect(heightOf(field)).toBeGreaterThan(empty);
  });

  it('sets a field’s text from outside with no input fired, leaving the caret where it was', async () => {
    const typed: string[] = [];
    const panel = mountThePanel(holding('', theText), {
      elaborate: (_piece, _facet, text) => {
        typed.push(text);
        return Promise.resolve();
      },
    });
    const field = fieldFor(panel.element, theParagraph);
    field.focus();
    field.setSelectionRange(6, 6);

    panel.show('paragraph', theText);

    expect(field.value).toBe(theText);
    expect(caretIn(field)).toBe(6);
    expect(typed).toEqual([]);

    panel.show('paragraph', `${theText} alone`);

    expect(field.value).toBe(`${theText} alone`);
    expect(typed).toEqual([]);
  });

  it('takes the focus into the one-sentence summary while it holds no text', () => {
    const panel = mountThePanel();

    expect(holdsTheFocus(fieldFor(panel.element, theSentence))).toBe(true);
  });

  it('takes the focus into the paragraph once the one-sentence summary holds text', () => {
    const panel = mountThePanel(holding(theText, ''));

    expect(holdsTheFocus(fieldFor(panel.element, theParagraph))).toBe(true);
  });

  it('takes the focus into the page once the sentence and the paragraph hold text', () => {
    const filled = holding(theText, theText);
    const panel = mountThePanel({
      ...filled,
      longFacets: [...filled.longFacets, { id: 'page', label: thePage, text: '' }],
    });

    expect(holdsTheFocus(fieldFor(panel.element, thePage))).toBe(true);
  });

  it('takes the focus into the last field when both hold text', () => {
    const panel = mountThePanel(holding(theText, longParagraph));

    expect(holdsTheFocus(fieldFor(panel.element, theParagraph))).toBe(true);
  });

  it('stands 560 px wide open, and takes no width at all when it is closed', async () => {
    const panel = mountThePanel();
    await settled();

    expect(widthOf(panel.element)).toBe(560);

    panel.close();
    await settled();

    expect(widthOf(panel.element)).toBe(0);
    expect(displayOf(panel.element)).toBe('none');
  });

  it('calls back to the graph when Close is pressed', async () => {
    let closed = 0;
    const panel = mountThePanel(theBeat, {
      close: () => {
        closed += 1;
      },
    });

    await browser.userEvent.click(closeButtonOf(panel.element));

    expect(closed).toBe(1);
  });

  it('keeps the name and Close in the viewport under a long paragraph and a long page', async () => {
    const panel = mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
    await settled();

    expect(insideTheViewport(closeButtonOf(panel.element))).toBe(true);
    expect(insideTheViewport(nameElementOf(panel.element))).toBe(true);
  });

  it('scrolls a long page inside its own field, leaving the panel unscrolled', async () => {
    const panel = mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
    await settled();

    const thePageField = fieldFor(panel.element, thePage);
    expect(scrollHeightOf(thePageField)).toBeGreaterThan(heightOf(thePageField));
    expect(scrollHeightOf(panel.element)).toBeLessThanOrEqual(heightOf(panel.element) + 1);
  });

  it('caps the paragraph field at six lines and scrolls it inside itself', async () => {
    const panel = mountThePanel(holdingALongPage(aParagraphOfTwelveLines, ''));
    await settled();

    const paragraph = fieldFor(panel.element, theParagraph);
    expect(heightOf(paragraph)).toBeLessThanOrEqual(6 * lineHeightOf(paragraph) + 1);
    expect(scrollHeightOf(paragraph)).toBeGreaterThan(heightOf(paragraph));
  });

  it('reaches the bottom of the page in a 420 px body, with the header row still at the top', async () => {
    const panel = mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
    theBodyIs(420);
    try {
      await settled();

      expect(scrollHeightOf(panel.element)).toBeGreaterThan(heightOf(panel.element));

      scrollToTheEndOf(panel.element);

      const thePageField = fieldFor(panel.element, thePage);
      expect(bottomOf(thePageField)).toBeLessThanOrEqual(bottomOf(panel.element) + 1);
      expect(insideTheViewport(thePageField)).toBe(true);
      expect(topOf(headingOf(panel.element))).toBeCloseTo(topOf(panel.element), 0);
    } finally {
      theBodyFillsTheWindow();
    }
  });

  it('keeps the caret at the end of a long page in the viewport while typing', async () => {
    const panel = mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
    await settled();

    const thePageField = fieldFor(panel.element, thePage);
    thePageField.focus();
    thePageField.setSelectionRange(thePageField.value.length, thePageField.value.length);

    await browser.userEvent.keyboard(' ');

    expect(insideTheViewport(thePageField)).toBe(true);
    expect(caretLineBottomOf(thePageField)).toBeLessThanOrEqual(window.innerHeight);
  });
});
