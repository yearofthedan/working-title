import type { Override } from './override';

export const findsByRoleOrLabel = ['getByRole', 'getByLabel', 'getByLabelText'];
export const documentSelectors = ['querySelector', 'querySelectorAll'];
export const findsByElement = ['getByElement'];
export const findsAnyOtherWay = [
  'getByText',
  'getByPlaceholder',
  'getByAltText',
  'getByTitle',
  'getByTestId',
  'getByRef',
  'locator',
  'frameLocator',
  '$',
  '$$',
  '$eval',
  '$$eval',
  'waitForSelector',
];
export const pageSelectorActions = [
  'check',
  'click',
  'dblclick',
  'dispatchEvent',
  'dragAndDrop',
  'fill',
  'focus',
  'getAttribute',
  'hover',
  'innerHTML',
  'innerText',
  'inputValue',
  'isChecked',
  'isDisabled',
  'isEditable',
  'isEnabled',
  'isHidden',
  'isVisible',
  'press',
  'selectOption',
  'setChecked',
  'setInputFiles',
  'tap',
  'textContent',
  'type',
  'uncheck',
];

const theLanguageCallsTheDriver = 'The language calls the driver, and finds no element itself.';
const findsElementsInADriver =
  'Find elements in a driver, src/test-helpers/drivers/driver.ts and any *.driver.ts.';
const aDriverFindsByRoleOrLabel = 'A driver finds elements by role or label, as the writer does.';

const restricted = (anyObject: string[], message: string) => [
  ...anyObject.map((property) => ({ property, message })),
  ...pageSelectorActions.map((property) => ({ object: 'page', property, message })),
];

const documentSelectorsRefused = (message: string) =>
  documentSelectors.map((property) => ({ object: 'document', property, message }));

export const findElements: Override[] = [
  {
    files: ['e2e/**'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...restricted(
          [...findsByRoleOrLabel, ...findsAnyOtherWay, ...findsByElement],
          findsElementsInADriver,
        ),
        ...documentSelectorsRefused(findsElementsInADriver),
      ],
    },
  },
  {
    files: ['src/**/*.component.test.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...restricted([...findsByRoleOrLabel, ...findsAnyOtherWay], findsElementsInADriver),
      ],
    },
  },
  {
    files: ['**/*.dsl.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...restricted(
          [...findsByRoleOrLabel, ...findsAnyOtherWay, ...findsByElement],
          theLanguageCallsTheDriver,
        ),
        ...documentSelectorsRefused(theLanguageCallsTheDriver),
      ],
    },
  },
  {
    files: ['**/*.driver.ts', '**/test-helpers/drivers/driver.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        ...restricted([...findsAnyOtherWay, ...findsByElement], aDriverFindsByRoleOrLabel),
      ],
    },
  },
];
