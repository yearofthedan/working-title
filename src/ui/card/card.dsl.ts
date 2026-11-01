import type { Driver, Role, Within } from '../../test-helpers/driver';
import type { StepAction } from '../../test-helpers/steps';

const beat = 'Beat 2';
const theCard: Within = { role: 'group', name: beat };
const summary = 'One-sentence summary';
const action = 'Add a scene';

export interface CardWriter {
  opensTheCard(): Promise<void>;
  putsTheFocusInTheSummary(): Promise<void>;
  putsTheFocusOnTheAction(): Promise<void>;
  presses(key: string): Promise<void>;
  tabsForward(): Promise<void>;
  tabsBackward(): Promise<void>;
}

export interface CardSees {
  focusIsInTheSummary(): Promise<void>;
  focusIsOnTheAction(): Promise<void>;
  focusIsOnTheCard(): Promise<void>;
}

export const cardWriterOn = (driver: Driver, stage: () => Promise<void>): CardWriter => ({
  opensTheCard: stage,
  putsTheFocusInTheSummary: () => driver.focus('textbox', summary, theCard),
  putsTheFocusOnTheAction: () => driver.focus('button', action, theCard),
  presses: (key) => driver.press(key === 'Esc' ? 'Escape' : key),
  tabsForward: () => driver.press('Tab'),
  tabsBackward: () => driver.press('Shift+Tab'),
});

const insistTheFocusIs = async (
  driver: Driver,
  role: Role,
  name: string,
  where: string,
  within?: Within,
): Promise<void> => {
  if (!(await driver.focusIs(role, name, within))) {
    throw new Error(`the focus is not ${where}`);
  }
};

export const cardSeesOn = (driver: Driver): CardSees => ({
  focusIsInTheSummary: () =>
    insistTheFocusIs(driver, 'textbox', summary, `in ${beat}'s ${summary}`, theCard),
  focusIsOnTheAction: () =>
    insistTheFocusIs(driver, 'button', action, `on ${beat}'s "${action}"`, theCard),
  focusIsOnTheCard: () => insistTheFocusIs(driver, 'group', beat, `on ${beat}'s card`),
});

export const cardSteps = (writer: CardWriter, sees: CardSees): Record<string, StepAction> => ({
  'a beat card is current with tab focus': () => writer.opensTheCard(),
  'a beat card is current with focus in its one-sentence summary': async () => {
    await writer.opensTheCard();
    await writer.putsTheFocusInTheSummary();
  },
  'a beat card is current with focus on "Add a scene"': async () => {
    await writer.opensTheCard();
    await writer.putsTheFocusOnTheAction();
  },
  'the writer presses {key}': ({ key }) => writer.presses(key ?? ''),
  'the writer tabs forward': () => writer.tabsForward(),
  'the writer tabs backward': () => writer.tabsBackward(),
  'focus moves to the one-sentence summary': () => sees.focusIsInTheSummary(),
  'focus moves to "Add a scene"': () => sees.focusIsOnTheAction(),
  'focus moves to the card': () => sees.focusIsOnTheCard(),
});
