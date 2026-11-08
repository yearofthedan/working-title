import { describe, expect, it } from 'vite-plus/test';
import type { PieceView } from '../../application/project';
import { bottomOf, topOf } from '../../test-helpers/box';
import type { RawGlob } from '../../test-helpers/raw-glob';
import { playScenarioFiles } from '../../test-helpers/scenario-entry';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { cardLooks } from './card';
import { theCard, timesDrawn } from './card.test-page';
import {
  mountTheCard,
  stageTheCard,
  stageTheCardUnfocused,
  theBeat,
  theCardSettles,
} from './card.harness';
import { cardSeesOn, cardSteps, cardWriterOn } from './card.dsl';

const theSentence = "A widow hunts the man who sank her husband's ship";

const writer = cardWriterOn(vitestBrowserDriver(), stageTheCard, stageTheCardUnfocused);

const beatWith = (text: string): PieceView => ({
  ...theBeat,
  facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text }],
});

describe('the card mounted alone', () => {
  it.each(cardLooks)('is drawn in the %s look without the graph', async (as) => {
    mountTheCard(as);

    await expect.element(theCard(theBeat.name).card).toHaveClass(as, { exact: true });
  });

  it('makes a hidden card inert', async () => {
    mountTheCard('hidden');

    await expect.element(theCard(theBeat.name).card).toHaveAttribute('inert');
  });

  it.each(cardLooks.filter((look) => look !== 'hidden'))(
    'leaves a %s card reachable',
    async (as) => {
      mountTheCard(as);

      await expect.element(theCard(theBeat.name).card).not.toHaveAttribute('inert');
    },
  );

  it('marks the current card as where the writer is', async () => {
    mountTheCard('current');

    await expect.element(theCard(theBeat.name).card).toHaveAttribute('aria-current', 'location');
  });

  it.each(cardLooks.filter((look) => look !== 'current'))(
    'marks no %s card as where the writer is',
    async (as) => {
      mountTheCard(as);

      await expect.element(theCard(theBeat.name).card).not.toHaveAttribute('aria-current');
    },
  );

  it("draws the sentence on the current piece's card once", () => {
    const card = mountTheCard('current', { piece: beatWith(theSentence) });

    expect(timesDrawn(card.element, theSentence)).toBe(1);
  });

  it("draws a card's sentence in the muted colour", () => {
    mountTheCard('card', { piece: beatWith(theSentence) });

    const { shown, label } = theCard(theBeat.name);

    expect(getComputedStyle(shown.element()).color).toBe(getComputedStyle(label.element()).color);
  });

  it('shows a card’s sentence small and in the interface font', () => {
    mountTheCard('card', { piece: beatWith(theSentence) });

    const { shown, heading, sentence } = theCard(theBeat.name);
    const shownStyle = getComputedStyle(shown.element());
    const typed = getComputedStyle(sentence.element());

    expect(Number.parseFloat(shownStyle.fontSize)).toBeLessThan(Number.parseFloat(typed.fontSize));
    expect(shownStyle.fontFamily).toBe(getComputedStyle(heading.element()).fontFamily);
  });

  it("keeps the add button inside the current piece's card", () => {
    mountTheCard('current');

    const { facet, actions } = theCard(theBeat.name);

    expect(topOf(actions.addAScene.element())).toBeGreaterThanOrEqual(topOf(facet.element()));
    expect(bottomOf(actions.addAScene.element())).toBeLessThanOrEqual(bottomOf(facet.element()));
  });

  it('shows the keys without resizing the card', async () => {
    const mounted = mountTheCard('current');
    await theCardSettles();
    const unfocused = mounted.size();
    const { card, keys } = theCard(theBeat.name);

    await writer.tabsForward();

    await expect.element(card).toHaveFocus();
    await expect.element(keys).toBeVisible();
    expect(mounted.size()).toEqual(unfocused);
  });

  it('elaborates the field with its text on each keystroke', async () => {
    const typed: string[] = [];
    mountTheCard('current', {
      elaborate: (_piece, _facet, text) => {
        typed.push(text);
        return Promise.resolve();
      },
    });

    await writer.putsTheFocusInTheSummary();
    await writer.presses('m');
    await writer.presses('a');

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
