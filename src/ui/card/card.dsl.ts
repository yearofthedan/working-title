import type { Driver, Part, Role, Within } from '../../test-helpers/driver';
import type { StepAction } from '../../test-helpers/steps';

const beat = 'Beat 2';
const theCard: Within = { role: 'group', name: beat };
const summary = 'One-sentence summary';
const action = 'Add a scene';
const openBeside = 'Open beside';

export interface CardWriter {
  opensTheCard(): Promise<void>;
  showsTheCard(): Promise<void>;
  clicksTheCard(): Promise<void>;
  putsTheFocusInTheSummary(): Promise<void>;
  putsTheFocusOnTheAction(): Promise<void>;
  putsTheFocusOnOpenBeside(): Promise<void>;
  presses(key: string): Promise<void>;
  tabsForward(): Promise<void>;
  tabsBackward(): Promise<void>;
}

export interface CardSees {
  focusIsInTheSummary(): Promise<readonly Part[]>;
  focusIsOnTheAction(): Promise<readonly Part[]>;
  focusIsOnTheCard(): Promise<readonly Part[]>;
}

export const cardWriterOn = (
  driver: Driver,
  stage: () => Promise<void>,
  stageUnfocused: () => Promise<void>,
): CardWriter => ({
  opensTheCard: stage,
  showsTheCard: stageUnfocused,
  clicksTheCard: () => driver.click('heading', beat, theCard),
  putsTheFocusInTheSummary: () => driver.focus('textbox', summary, theCard),
  putsTheFocusOnTheAction: () => driver.focus('button', action, theCard),
  putsTheFocusOnOpenBeside: () => driver.focus('button', openBeside, theCard),
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
  focusIsInTheSummary: async () => {
    await insistTheFocusIs(driver, 'textbox', summary, `in ${beat}'s ${summary}`, theCard);
    return [{ role: theCard.role, name: theCard.name }];
  },
  focusIsOnTheAction: async () => {
    await insistTheFocusIs(driver, 'button', action, `on ${beat}'s "${action}"`, theCard);
    return [{ role: theCard.role, name: theCard.name }];
  },
  focusIsOnTheCard: async () => {
    await insistTheFocusIs(driver, 'group', beat, `on ${beat}'s card`);
    return [{ role: theCard.role, name: theCard.name }];
  },
});

export const cardSteps = (writer: CardWriter, sees: CardSees): Record<string, StepAction> => ({
  'a beat card is current': () => writer.showsTheCard(),
  'a beat card is current with tab focus': () => writer.opensTheCard(),
  'a beat card is current with focus in its one-sentence summary': async () => {
    await writer.opensTheCard();
    await writer.putsTheFocusInTheSummary();
  },
  'a beat card is current with focus on "Add a scene"': async () => {
    await writer.opensTheCard();
    await writer.putsTheFocusOnTheAction();
  },
  'a beat card is current with focus on "Open beside"': async () => {
    await writer.opensTheCard();
    await writer.putsTheFocusOnOpenBeside();
  },
  'the writer presses {key}': ({ key }) => writer.presses(key ?? ''),
  'the writer clicks the card': () => writer.clicksTheCard(),
  'the writer tabs forward': () => writer.tabsForward(),
  'the writer tabs backward': () => writer.tabsBackward(),
  'focus moves to the one-sentence summary': () => sees.focusIsInTheSummary(),
  'focus moves to "Add a scene"': () => sees.focusIsOnTheAction(),
  'focus moves to the card': () => sees.focusIsOnTheCard(),
});
