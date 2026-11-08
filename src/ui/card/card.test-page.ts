import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';

export const inThePage = (elements: readonly (HTMLElement | SVGElement)[]): HTMLElement[] =>
  elements.filter((element) => element instanceof HTMLElement);

export const partsOf = (card: Locator) => ({
  card,
  legend: card.getByElement('legend'),
  facet: card.getByElement('.facet'),
  shown: card.getByElement('.shown'),
  label: card.getByText('One-sentence summary', { exact: true }).first(),
  keys: card.getByRole('paragraph', { includeHidden: true }),
  field: (label: string): Locator => card.getByLabelText(label, { exact: true }),
  heading: card.getByRole('heading', { includeHidden: true }),
  headingAt: (level: number): Locator => card.getByRole('heading', { level, includeHidden: true }),
  nameButton: card.getByRole('button', { includeHidden: true }).first(),
  buttons: card.getByRole('button', { includeHidden: true }),
  sentence: card.getByLabelText('One-sentence summary', { exact: true }),
  fields: card.getByRole('textbox', { includeHidden: true }),
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
});

export const theCard = (name: string) =>
  partsOf(browser.page.getByRole('group', { name, exact: true, includeHidden: true }));

export const headingOf = (card: Element): HTMLElement => {
  const heading = inThePage(
    browser.page.getByRole('heading', { includeHidden: true }).elements(),
  ).find((one) => card.contains(one));
  if (heading === undefined) throw new Error('no heading is drawn on the card');
  return heading;
};

export const nameOf = (card: Element): string => headingOf(card).textContent ?? '';

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
