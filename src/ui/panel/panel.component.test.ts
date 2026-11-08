import { describe, expect, it, vi } from 'vite-plus/test';
import type { PieceView } from '../../application/project';
import { settled } from '../../test-helpers/driver';
import { theViewport } from '../../test-helpers/staging';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { panelWriterOn } from './panel.dsl';
import {
  mountThePanel,
  focusIsPutIn,
  scrolledTo,
  scrolledToTheEnd,
  theAppClosesThePanel,
  theAppSetsAField,
  theBeat,
  theCaretIsAt,
  theCaretIsAtTheEndOf,
} from './panel.harness';
import {
  bottomOf,
  caretLineBottomOf,
  caretOf,
  displayOf,
  heightOf,
  insideTheViewport,
  keysHeardOnThePage,
  lineHeightOf,
  scrollHeightOf,
  textHeightOf,
  thePanelOn,
  topOf,
  widthOf,
  writerCanScroll,
} from './panel.test-page';

const writer = panelWriterOn(vitestBrowserDriver());

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
  it('draws the piece it was opened on, under its name', async () => {
    mountThePanel();
    const panel = thePanelOn('Beat 2');

    await expect.element(panel.name).toHaveTextContent('Beat 2');
    await expect.element(panel.field(theSentence)).toHaveValue('');
    await expect.element(panel.field(theParagraph)).toHaveValue('');
  });

  it('moves the caret inside a field with the arrow keys, and leaves the focus in it', async () => {
    mountThePanel(holding('', theText));
    const field = thePanelOn('Beat 2').field(theParagraph);

    await writer.putsTheFocusIn(theParagraph);
    theCaretIsAt(field, 6);
    await writer.presses('ArrowRight');

    expect(caretOf(field.element())).toBe(7);
    await expect.element(field).toHaveFocus();
  });

  it('tabs from the sentence to the paragraph', async () => {
    mountThePanel();
    const panel = thePanelOn('Beat 2');

    await writer.putsTheFocusIn(theSentence);
    await writer.tabsForward();

    await expect.element(panel.field(theParagraph)).toHaveFocus();
  });

  it('tabs from the paragraph to the page', async () => {
    mountThePanel();
    const panel = thePanelOn('Beat 2');

    await writer.putsTheFocusIn(theParagraph);
    await writer.tabsForward();

    await expect.element(panel.field(thePage)).toHaveFocus();
  });

  it('elaborates the facet it was typed into, with the text typed', async () => {
    const typed: string[] = [];
    mountThePanel(theBeat, {
      elaborate: (pieceId, facetId, text) => {
        typed.push(`${pieceId} ${facetId} ${text}`);
        return Promise.resolve();
      },
    });

    await writer.putsTheFocusIn(theParagraph);
    await writer.presses('m');
    await writer.presses('a');

    expect(typed).toEqual(['beat-2 paragraph m', 'beat-2 paragraph ma']);
  });

  it('grows the paragraph field as the writer types into it', async () => {
    mountThePanel();
    const field = thePanelOn('Beat 2').field(theParagraph);
    const empty = heightOf(field.element());

    await writer.putsTheFocusIn(theParagraph);
    await writer.typesKeyByKey(longParagraph);

    await expect.element(field).toHaveValue(longParagraph);
    expect(heightOf(field.element())).toBeGreaterThan(empty);
  });

  it('sets a field’s text from outside with no input fired, leaving the caret where it was', async () => {
    const typed: string[] = [];
    const panel = mountThePanel(holding('', theText), {
      elaborate: (_piece, _facet, text) => {
        typed.push(text);
        return Promise.resolve();
      },
    });
    const field = thePanelOn('Beat 2').field(theParagraph);

    await writer.putsTheFocusIn(theParagraph);
    theCaretIsAt(field, 6);

    theAppSetsAField(panel, 'paragraph', theText);

    await expect.element(field).toHaveValue(theText);
    expect(caretOf(field.element())).toBe(6);
    expect(typed).toEqual([]);

    theAppSetsAField(panel, 'paragraph', `${theText} alone`);

    await expect.element(field).toHaveValue(`${theText} alone`);
    expect(typed).toEqual([]);
  });

  it('takes the focus into the one-sentence summary while it holds no text', async () => {
    mountThePanel();

    await expect.element(thePanelOn('Beat 2').field(theSentence)).toHaveFocus();
  });

  it('takes the focus into the paragraph once the one-sentence summary holds text', async () => {
    mountThePanel(holding(theText, ''));

    await expect.element(thePanelOn('Beat 2').field(theParagraph)).toHaveFocus();
  });

  it('takes the focus into the page once the sentence and the paragraph hold text', async () => {
    const filled = holding(theText, theText);
    mountThePanel({
      ...filled,
      longFacets: [...filled.longFacets, { id: 'page', label: thePage, text: '' }],
    });

    await expect.element(thePanelOn('Beat 2').field(thePage)).toHaveFocus();
  });

  it('takes the focus into the last field when both hold text', async () => {
    mountThePanel(holding(theText, longParagraph));

    await expect.element(thePanelOn('Beat 2').field(theParagraph)).toHaveFocus();
  });

  it('stands 560 px wide open, and takes no width at all when it is closed', async () => {
    const panel = mountThePanel();
    await settled();
    const page = thePanelOn('Beat 2');

    expect(widthOf(page.panel.element())).toBe(560);

    theAppClosesThePanel(panel);
    await settled();

    expect(widthOf(page.panel.element())).toBe(0);
    expect(displayOf(page.panel.element())).toBe('none');
  });

  it('calls back to the graph when Close is pressed', async () => {
    let closed = 0;
    mountThePanel(theBeat, {
      close: () => {
        closed += 1;
      },
    });

    await writer.closesThePanel();

    expect(closed).toBe(1);
  });

  it('closes when Esc is pressed in the panel', async () => {
    const close = vi.fn();
    mountThePanel(theBeat, { close });

    await writer.putsTheFocusIn(theSentence);
    await writer.presses('Esc');

    expect(close).toHaveBeenCalledOnce();
  });

  it('stops a key pressed in the panel from reaching a listener on the document', async () => {
    mountThePanel();
    const page = keysHeardOnThePage();

    await writer.putsTheFocusIn(theSentence);
    try {
      await writer.presses('ArrowRight');
    } finally {
      page.stop();
    }

    expect(page.keys).toEqual([]);
  });

  it('keeps the name and Close in the viewport under a long paragraph and a long page', async () => {
    mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
    await settled();
    const panel = thePanelOn('Beat 2');

    expect(insideTheViewport(panel.actions.close.element())).toBe(true);
    expect(insideTheViewport(panel.name.element())).toBe(true);
  });

  it('scrolls a long page inside its own field, leaving the panel unscrolled', async () => {
    mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
    await settled();
    const panel = thePanelOn('Beat 2');

    const thePageField = panel.field(thePage);
    expect(scrollHeightOf(thePageField.element())).toBeGreaterThan(
      heightOf(thePageField.element()),
    );
    expect(scrollHeightOf(panel.panel.element())).toBeLessThanOrEqual(
      heightOf(panel.panel.element()) + 1,
    );
  });

  it('caps the paragraph field at six lines of text and scrolls it inside itself', async () => {
    mountThePanel(holdingALongPage(aParagraphOfTwelveLines, ''));
    await settled();
    const paragraph = thePanelOn('Beat 2').field(theParagraph);
    const sixLines = 6 * lineHeightOf(paragraph.element());

    expect(textHeightOf(paragraph.element())).toBeLessThanOrEqual(sixLines + 1);
    expect(textHeightOf(paragraph.element())).toBeGreaterThanOrEqual(sixLines - 1);
    expect(scrollHeightOf(paragraph.element())).toBeGreaterThan(heightOf(paragraph.element()));
  });

  it('reaches the bottom of the page in a 420 px window, with the header row still at the top', async () => {
    const { innerWidth, innerHeight } = window;
    await theViewport(innerWidth, 420);
    try {
      mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
      await settled();
      const panel = thePanelOn('Beat 2');

      expect(scrollHeightOf(panel.panel.element())).toBeGreaterThan(
        heightOf(panel.panel.element()),
      );
      expect(writerCanScroll(panel.panel.element())).toBe(true);

      scrolledToTheEnd(panel.panel);

      const thePageField = panel.field(thePage);
      expect(textHeightOf(thePageField.element())).toBeGreaterThanOrEqual(
        8 * lineHeightOf(thePageField.element()) - 1,
      );
      expect(insideTheViewport(thePageField.element())).toBe(true);
      expect(topOf(panel.header.element())).toBeCloseTo(topOf(panel.panel.element()), 0);
    } finally {
      await theViewport(innerWidth, innerHeight);
    }
  });

  it('scrolls a field the keyboard reaches out from under the header', async () => {
    const { innerWidth, innerHeight } = window;
    await theViewport(innerWidth, 420);
    try {
      mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
      await settled();
      const panel = thePanelOn('Beat 2');
      const theSummary = panel.field(theSentence);
      const theHeader = panel.header;

      focusIsPutIn(panel.field(theParagraph));
      scrolledTo(panel.panel, 100);
      expect(bottomOf(theSummary.element())).toBeLessThanOrEqual(bottomOf(theHeader.element()));

      await writer.tabsBackward();

      await expect.element(theSummary).toHaveFocus();
      expect(topOf(theSummary.element())).toBeGreaterThanOrEqual(bottomOf(theHeader.element()));
    } finally {
      await theViewport(innerWidth, innerHeight);
    }
  });

  it('keeps the caret at the end of a long page in the viewport while typing', async () => {
    mountThePanel(holdingALongPage(aParagraphOfTwelveLines, aPageOfFortySentences));
    await settled();
    const thePageField = thePanelOn('Beat 2').field(thePage);

    await writer.putsTheFocusIn(thePage);
    theCaretIsAtTheEndOf(thePageField);
    await writer.presses(' ');

    expect(insideTheViewport(thePageField.element())).toBe(true);
    expect(caretLineBottomOf(thePageField.element())).toBeLessThanOrEqual(window.innerHeight);
  });
});
