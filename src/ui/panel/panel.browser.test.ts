import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { PieceView } from '../../application/project';
import { settled } from '../../test-helpers/driver';
import {
  caretIn,
  closeButtonOf,
  displayOf,
  fieldFor,
  holdsTheFocus,
  heightOf,
  nameOn,
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
});
