import type { OpenProject, PieceView } from '../../application/project';
import { root } from '../../test-helpers/staging';
import type { CardLook } from './card';
import { pieceCard, type Card } from './card.dom';

export const theBeat: PieceView = {
  id: 'beat-2',
  name: 'Beat 2',
  facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text: '' }],
  longFacets: [{ id: 'paragraph', label: 'Paragraph', text: '' }],
  children: [],
  childKind: 'Scene',
};

export interface CardHooks {
  readonly piece?: PieceView;
  readonly elaborate?: OpenProject['elaborate'];
  readonly addChild?: () => void;
  readonly openBeside?: () => void;
}

export const mountTheCard = (as: CardLook, hooks: CardHooks = {}): Card => {
  const piece = hooks.piece ?? theBeat;
  const main = root('main');
  const card = pieceCard(piece, {
    level: 1,
    current: () => true,
    elaborate: hooks.elaborate ?? (() => Promise.resolve()),
    goTo: () => undefined,
    addChild: hooks.addChild ?? (() => undefined),
    openBeside: hooks.openBeside ?? (() => undefined),
  });
  card.settle(piece, as);
  card.reachCard(true);
  card.reachFields(true);
  main.append(card.element);
  return card;
};

export const theCardSettles = async (): Promise<void> => {
  await document.fonts.ready;
};

export const stageTheCard = async (): Promise<void> => {
  mountTheCard('current').focus();
};

export const stageTheCardUnfocused = async (): Promise<void> => {
  const card = mountTheCard('current');
  const main = document.querySelector('main')!;
  card.placeAt(main.clientWidth / 2, main.clientHeight / 2);
};
