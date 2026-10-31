import type { Drawn } from '../ui/graph/graph';

export const pane = (): HTMLElement => document.querySelector('main')!;

export const cursorIsInThePane = (): boolean => pane().contains(document.activeElement);

export const cards = (kind: Drawn): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>(`main fieldset.${kind}`),
];

export const nameOf = (card: HTMLElement): string =>
  card.querySelector('h2, h3, h4')!.textContent ?? '';

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
