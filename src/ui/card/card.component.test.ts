import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import type { PieceView } from '../../application/project';
import type { RawGlob } from '../../test-helpers/raw-glob';
import { playScenarioFiles } from '../../test-helpers/scenario-entry';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { cardLooks } from './card';
import {
  addButtonOf,
  facetOf,
  headingOf,
  holdsTheFocus,
  inertOf,
  labelOf,
  lookOf,
  marksCurrent,
  sentenceFieldOf,
  shownSentenceOf,
  showsTheKeys,
  timesDrawn,
} from './card.test-page';
import {
  mountTheCard,
  stageTheCard,
  stageTheCardUnfocused,
  theBeat,
  theCardSettles,
} from './card.harness';
import { cardSeesOn, cardSteps, cardWriterOn } from './card.dsl';

const theSentence = "A widow hunts the man who sank her husband's ship";

const beatWith = (text: string): PieceView => ({
  ...theBeat,
  facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text }],
});

describe('the card mounted alone', () => {
  it.each(cardLooks)('is drawn in the %s look without the graph', (as) => {
    const card = mountTheCard(as);

    expect(lookOf(card.element)).toBe(as);
    expect(inertOf(card.element)).toBe(as === 'hidden');
    expect(marksCurrent(card.element)).toBe(as === 'current');
  });

  it("draws the sentence on the current piece's card once", () => {
    const card = mountTheCard('current', { piece: beatWith(theSentence) });

    expect(timesDrawn(card.element, theSentence)).toBe(1);
  });

  it("draws a card's sentence in the muted colour", () => {
    const card = mountTheCard('card', { piece: beatWith(theSentence) });

    const sentence = getComputedStyle(shownSentenceOf(card.element));
    const label = getComputedStyle(labelOf(card.element));

    expect(sentence.color).toBe(label.color);
  });

  it('shows a card’s sentence small and in the interface font', () => {
    const card = mountTheCard('card', { piece: beatWith(theSentence) });

    const sentence = getComputedStyle(shownSentenceOf(card.element));
    const name = getComputedStyle(headingOf(card.element));
    const typed = getComputedStyle(sentenceFieldOf(card.element));

    expect(Number.parseFloat(sentence.fontSize)).toBeLessThan(Number.parseFloat(typed.fontSize));
    expect(sentence.fontFamily).toBe(name.fontFamily);
  });

  it("keeps the add button inside the current piece's card", () => {
    const card = mountTheCard('current');

    const body = facetOf(card.element).getBoundingClientRect();
    const button = addButtonOf(card.element).getBoundingClientRect();

    expect(button.top).toBeGreaterThanOrEqual(body.top);
    expect(button.bottom).toBeLessThanOrEqual(body.bottom);
  });

  it('shows the keys without resizing the card', async () => {
    const card = mountTheCard('current');
    await theCardSettles();
    const unfocused = card.size();

    await browser.userEvent.keyboard('{Tab}');

    expect(holdsTheFocus(card.element)).toBe(true);
    expect(showsTheKeys(card.element)).toBe(true);
    expect(card.size()).toEqual(unfocused);
  });

  it('elaborates the field with its text on each keystroke', async () => {
    const typed: string[] = [];
    const card = mountTheCard('current', {
      elaborate: (_piece, _facet, text) => {
        typed.push(text);
        return Promise.resolve();
      },
    });

    const field = sentenceFieldOf(card.element);
    field.focus();
    await browser.userEvent.keyboard('m');
    await browser.userEvent.keyboard('a');

    expect(typed).toEqual(['m', 'ma']);
  });
});

const files = (import.meta as unknown as RawGlob).glob('/src/ui/card/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

playScenarioFiles(
  files,
  () => vitestBrowserDriver(),
  (driver) =>
    cardSteps(cardWriterOn(driver, stageTheCard, stageTheCardUnfocused), cardSeesOn(driver)),
);
