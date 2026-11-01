import type { OpenProject, PieceView } from '../../application/project';
import type { Driver } from '../../test-helpers/driver';
import type { CardLook } from './card';
import { pieceCard, type Card } from './card.dom';
import { cardSeesOn, cardSteps, cardWriterOn } from './card.dsl';

export const theBeat: PieceView = {
  id: 'beat-2',
  name: 'Beat 2',
  facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text: '' }],
  children: [],
  childKind: 'Scene',
};

export interface CardHooks {
  readonly piece?: PieceView;
  readonly elaborate?: OpenProject['elaborate'];
  readonly addChild?: () => void;
}

export const mountTheCard = (as: CardLook, hooks: CardHooks = {}): Card => {
  const piece = hooks.piece ?? theBeat;
  document.body.replaceChildren();
  const main = document.createElement('main');
  const card = pieceCard(piece, {
    level: 1,
    current: () => true,
    elaborate: hooks.elaborate ?? (() => Promise.resolve()),
    goTo: () => undefined,
    addChild: hooks.addChild ?? (() => undefined),
  });
  card.settle(piece, as);
  card.reachCard(true);
  card.reachFields(true);
  main.append(card.element);
  document.body.append(main);
  return card;
};

export interface ScenarioTier {
  readonly stage: () => Promise<void>;
  readonly steps: (driver: Driver) => ReturnType<typeof cardSteps>;
}

const stageTheCard = async (): Promise<void> => {
  mountTheCard('current').focus();
};

export const theCardTier: ScenarioTier = {
  stage: stageTheCard,
  steps: (driver) => cardSteps(cardWriterOn(driver, stageTheCard), cardSeesOn(driver)),
};
