export type CardLook = 'current' | 'card' | 'chip' | 'hidden';

export const cardLooks: readonly CardLook[] = ['current', 'card', 'chip', 'hidden'];

export type CardMove = 'enter' | 'back' | 'first' | 'last' | 'none';

export interface KeyOnTheCard {
  readonly current: boolean;
  readonly at: 'card' | 'field';
  readonly key: string;
  readonly shift: boolean;
  readonly where: number;
  readonly stops: number;
}

export const keyOnTheCard = ({ at, key, shift, where, stops, current }: KeyOnTheCard): CardMove => {
  if (!current) return 'none';
  if (at === 'card') return key === 'Enter' ? 'enter' : 'none';
  if (key === 'Escape') return 'back';
  if (key !== 'Tab' || stops === 0) return 'none';
  if (shift) return where === 0 ? 'last' : 'none';
  return where === stops - 1 ? 'first' : 'none';
};
