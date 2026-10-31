import type { Drawn } from '../ui/graph/graph';

export const pane = (): HTMLElement => document.querySelector('main')!;

export const cursorIsInThePane = (): boolean => pane().contains(document.activeElement);

export const cursor = (): Element | null => document.activeElement;

export const cursorIn = (kind: Drawn): HTMLElement | null =>
  document.activeElement?.closest<HTMLElement>(`fieldset.${kind}`) ?? null;

export const cardAtCursor = (): HTMLElement | null =>
  document.activeElement?.closest<HTMLElement>('fieldset') ?? null;

export const sentenceCardAtCursor = (): HTMLElement | null =>
  document.activeElement instanceof HTMLTextAreaElement
    ? document.activeElement.closest<HTMLElement>('fieldset')
    : null;

export const cards = (kind: Drawn): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>(`main fieldset.${kind}`),
];

export const everyCard = (): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>('main fieldset'),
];

export const currentCard = (): HTMLElement =>
  document.querySelector<HTMLElement>('main fieldset[aria-current="location"]')!;

export const headingOf = (card: HTMLElement): HTMLElement =>
  card.querySelector<HTMLElement>('h2, h3, h4')!;

export const nameOf = (card: HTMLElement): string => headingOf(card).textContent ?? '';

export const legendOf = (card: HTMLElement): HTMLElement => card.querySelector('legend')!;

export const nameButtonOf = (card: HTMLElement): HTMLElement | null =>
  card.querySelector<HTMLElement>('legend button');

export const facetOf = (card: HTMLElement): HTMLElement =>
  card.querySelector<HTMLElement>('.facet')!;

export const labelOf = (card: HTMLElement): HTMLElement =>
  card.querySelector<HTMLElement>('.facet label')!;

export const shownSentenceOf = (card: HTMLElement): HTMLElement =>
  card.querySelector<HTMLElement>('.shown')!;

export const sentenceFieldOf = (card: HTMLElement): HTMLTextAreaElement =>
  card.querySelector('textarea')!;

export const addButtonOf = (card: HTMLElement): HTMLElement =>
  [...card.querySelectorAll<HTMLElement>('button')].find(
    (button) => button.textContent === 'Add a scene',
  )!;

export const styleOf = (card: HTMLElement): CSSStyleDeclaration => card.style;

export const navIn = (header: HTMLElement): HTMLElement | null =>
  header.querySelector<HTMLElement>('nav');

export const pathIn = (header: HTMLElement): string =>
  header.querySelector('nav [aria-current="location"]')?.textContent ?? '';

const visible = (element: Element): boolean => {
  const { display, opacity } = getComputedStyle(element);
  return display !== 'none' && opacity !== '0' && element.getClientRects().length > 0;
};

export const timesDrawn = (card: HTMLElement, sentence: string): number =>
  [...card.querySelectorAll('textarea')].filter(
    (field) => field.value === sentence && visible(field),
  ).length +
  [...card.querySelectorAll('*')].filter(
    (element) =>
      visible(element) &&
      [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent === sentence,
      ),
  ).length;

export const focused = (): HTMLElement => {
  const [card] = cards('focus');
  if (card === undefined) throw new Error('no piece is drawn as the focus');
  return card;
};

export const named = (kind: Drawn, name: string): HTMLElement => {
  const card = cards(kind).find((one) => nameOf(one) === name);
  if (card === undefined) throw new Error(`no piece named ${name} is drawn as a ${kind}`);
  return card;
};
