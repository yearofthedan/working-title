import type { Driver, Role, Within } from '../../test-helpers/driver';
import type { StepAction } from '../../test-helpers/steps';

const beat = 'Beat 2';
const theCard: Within = { role: 'group', name: beat };
const summary = 'One-sentence summary';
const action = 'Add a scene';

export interface CardWriter {
  opensTheCard(): Promise<void>;
  putsTheCursorInTheSummary(): Promise<void>;
  putsTheCursorOnTheAction(): Promise<void>;
}

export interface CardSees {
  cursorIsInTheSummary(): Promise<void>;
  cursorIsOnTheAction(): Promise<void>;
  cursorIsOnTheCard(): Promise<void>;
}

export const cardWriterOn = (driver: Driver): CardWriter => ({
  opensTheCard: async () => {
    await driver.fresh();
    await driver.click('heading', beat, theCard);
  },
  putsTheCursorInTheSummary: () => driver.focus('textbox', summary, theCard),
  putsTheCursorOnTheAction: () => driver.focus('button', action, theCard),
});

const insistTheCursorIs = async (
  driver: Driver,
  role: Role,
  name: string,
  where: string,
  within?: Within,
): Promise<void> => {
  if (!(await driver.cursorIs(role, name, within))) {
    throw new Error(`the cursor is not ${where}`);
  }
};

export const cardSeesOn = (driver: Driver): CardSees => ({
  cursorIsInTheSummary: () =>
    insistTheCursorIs(driver, 'textbox', summary, `in ${beat}'s ${summary}`, theCard),
  cursorIsOnTheAction: () =>
    insistTheCursorIs(driver, 'button', action, `on ${beat}'s "${action}"`, theCard),
  cursorIsOnTheCard: () => insistTheCursorIs(driver, 'group', beat, `on ${beat}'s card`),
});

export const cardSteps = (writer: CardWriter, sees: CardSees): Record<string, StepAction> => ({
  'a Beat card is current with tab focus': () => writer.opensTheCard(),
  'a Beat card is current with focus in its one-sentence summary': async () => {
    await writer.opensTheCard();
    await writer.putsTheCursorInTheSummary();
  },
  'a Beat card is current with focus on "Add a scene"': async () => {
    await writer.opensTheCard();
    await writer.putsTheCursorOnTheAction();
  },
  'focus moves to the one-sentence summary': () => sees.cursorIsInTheSummary(),
  'focus moves to "Add a scene"': () => sees.cursorIsOnTheAction(),
  'focus moves to the card': () => sees.cursorIsOnTheCard(),
});
