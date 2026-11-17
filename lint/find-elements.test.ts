import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import {
  documentSelectors,
  findsAnyOtherWay,
  findsByElement,
  findsByRoleOrLabel,
  pageSelectorActions,
} from './find-elements';
import { lintSamples, type SampleLint } from './sample-lint';

const calls = [
  ...findsByRoleOrLabel,
  ...findsAnyOtherWay,
  ...findsByElement,
  ...pageSelectorActions,
];

const callingOnPage = (call: string) =>
  `import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.${call}('x');\n`;

const readingTheDocument = (call: string) =>
  `export const sample = () => document.${call}('main');\n`;

const actingOnALocator =
  "import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.getByRole('button').click();\n";

let lint: SampleLint;

beforeAll(() => {
  const samples: Record<string, string> = {
    'sample-no-locator.ts': callingOnPage('reload'),
    'driver-acting-on-a-locator/sample.driver.ts': actingOnALocator,
    'finding/test-helpers/driver.ts': callingOnPage('getByText'),
    'acting/test-helpers/driver.ts': actingOnALocator,
  };
  for (const call of calls) {
    samples[`sample-${call}.ts`] = callingOnPage(call);
    samples[`driver-${call}/sample.driver.ts`] = callingOnPage(call);
    samples[`language-${call}.dsl.ts`] = callingOnPage(call);
  }
  for (const call of documentSelectors) {
    samples[`reading-${call}.dsl.ts`] = readingTheDocument(call);
    samples[`reading-${call}.spec.ts`] = readingTheDocument(call);
  }
  lint = lintSamples('e2e', samples);
});

afterAll(() => lint.dispose());

describe('e2e locators', { timeout: 60_000 }, () => {
  it.each(calls)('a spec calling page.%s fails lint, pointing to the driver', (call) => {
    expect(lint.errorsIn(`sample-${call}.ts`)).toEqual([
      expect.stringContaining('a driver, src/test-helpers/'),
    ]);
  });

  it('a spec with no locator passes lint', () => {
    expect(lint.errorsIn('sample-no-locator.ts')).toEqual([]);
  });

  it.each(documentSelectors)('a spec reading the document with document.%s fails lint', (call) => {
    expect(lint.errorsIn(`reading-${call}.spec.ts`)).toEqual([
      expect.stringContaining('a driver, src/test-helpers/'),
    ]);
  });

  it.each(findsByRoleOrLabel)('the driver calling page.%s passes lint', (call) => {
    expect(lint.errorsIn(`driver-${call}/sample.driver.ts`)).toEqual([]);
  });

  it('the driver acting on a locator it found passes lint', () => {
    expect(lint.errorsIn('driver-acting-on-a-locator/sample.driver.ts')).toEqual([]);
  });

  it.each([...findsAnyOtherWay, ...findsByElement, ...pageSelectorActions])(
    'the driver calling page.%s fails lint',
    (call) => {
      expect(lint.errorsIn(`driver-${call}/sample.driver.ts`)).toEqual([
        expect.stringContaining('by role or label'),
      ]);
    },
  );
});

describe('the language', { timeout: 60_000 }, () => {
  it.each(calls)('a language file calling page.%s fails lint', (call) => {
    expect(lint.errorsIn(`language-${call}.dsl.ts`)).toEqual([
      expect.stringContaining('finds no element'),
    ]);
  });

  it.each(documentSelectors)('a language file calling document.%s fails lint', (call) => {
    expect(lint.errorsIn(`reading-${call}.dsl.ts`)).toEqual([
      expect.stringContaining('finds no element'),
    ]);
  });
});

describe('the driver contract', { timeout: 60_000 }, () => {
  it('the driver contract calling page.getByText fails lint', () => {
    expect(lint.errorsIn('finding/test-helpers/driver.ts')).toEqual([
      expect.stringContaining('by role or label'),
    ]);
  });

  it('the driver contract finding by role passes lint', () => {
    expect(lint.errorsIn('acting/test-helpers/driver.ts')).toEqual([]);
  });
});
