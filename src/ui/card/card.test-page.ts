import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';

export const inThePage = (elements: readonly (HTMLElement | SVGElement)[]): HTMLElement[] =>
  elements.filter((element) => element instanceof HTMLElement);
export const theCard = (name: string) => {
  const card = browser.page.getByRole('group', { name, exact: true, includeHidden: true });
  return {
    card,
    keys: card.getByRole('paragraph', { includeHidden: true }),
    field: (label: string): Locator => card.getByLabelText(label, { exact: true }),
    actions: {
      addAScene: card.getByRole('button', {
        name: 'Add a scene',
        exact: true,
        includeHidden: true,
      }),
      openBeside: card.getByRole('button', {
        name: 'Open beside',
        exact: true,
        includeHidden: true,
      }),
    },
  };
};

export const headingOf = (card: Element): HTMLElement => {
  const heading = inThePage(
    browser.page.getByRole('heading', { includeHidden: true }).elements(),
  ).find((one) => card.contains(one));
  if (heading === undefined) throw new Error('no heading is drawn on the card');
  return heading;
};

export const nameOf = (card: Element): string => headingOf(card).textContent ?? '';

export const legendOf = (card: Element): HTMLElement => card.querySelector('legend')!;

export const facetOf = (card: Element): HTMLElement => card.querySelector('.facet')!;

export const shownSentenceOf = (card: Element): HTMLElement => card.querySelector('.shown')!;

export const sentenceFieldOf = (card: Element): HTMLTextAreaElement => {
  const field = browser.page
    .getByLabelText('One-sentence summary', { exact: true })
    .elements()
    .find((element) => card.contains(element));
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error('the card has no one-sentence summary field');
  }
  return field;
};

export const labelOf = (card: Element): HTMLElement => sentenceFieldOf(card).labels![0]!;

const visible = (element: Element): boolean => {
  const { display, opacity, visibility } = getComputedStyle(element);
  return (
    display !== 'none' &&
    opacity !== '0' &&
    visibility !== 'hidden' &&
    element.getClientRects().length > 0
  );
};

export const timesDrawn = (card: Element, sentence: string): number =>
  inThePage(browser.page.getByRole('textbox', { includeHidden: true }).elements()).filter(
    (field) =>
      card.contains(field) &&
      field instanceof HTMLTextAreaElement &&
      field.value === sentence &&
      visible(field),
  ).length +
  inThePage(browser.page.getByText(sentence, { exact: true }).elements()).filter(
    (element) => card.contains(element) && visible(element),
  ).length;
