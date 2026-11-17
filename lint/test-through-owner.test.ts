import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { findsByElement } from './find-elements';
import { lintSamples, type SampleLint } from './sample-lint';
import { componentTestRefusals } from './test-through-owner';

const readingACard: Record<string, string> = {
  querySelector: "export const sample = (card: HTMLElement) => card.querySelector('h2');\n",
  querySelectorAll: "export const sample = (card: HTMLElement) => card.querySelectorAll('h2');\n",
  style: 'export const sample = (card: HTMLElement) => card.style.width;\n',
  getByElement:
    "import type { Locator } from 'vite-plus/test/browser';\nexport const sample = (card: Locator) => card.getByElement('.x');\n",
};

const callingUserEvent = "export const sample = () => browser.userEvent.keyboard('a');\n";

const importingUserEvent =
  "import { userEvent } from 'vite-plus/test/browser';\nexport const sample = () => userEvent.keyboard('a');\n";

let lint: SampleLint;

beforeAll(() => {
  const samples: Record<string, string> = {
    'component-document.component.test.ts':
      'export const sample = (): number => document.body.childElementCount;\n',
    'calling-user-event/sample.component.test.ts': callingUserEvent,
    'importing-user-event/sample.component.test.ts': importingUserEvent,
    'finding-by-element.test-page.ts': readingACard[findsByElement[0] ?? ''] ?? '',
    'unlisted/other.test.ts': callingUserEvent,
  };
  for (const property of componentTestRefusals) {
    const use = readingACard[property];
    if (use === undefined) throw new Error(`no sample reads a card with ${property}`);
    samples[`component-${property}.component.test.ts`] = use;
  }
  lint = lintSamples('src/ui', samples);
});

afterAll(() => lint.dispose());

describe('a component test', { timeout: 60_000 }, () => {
  it.each(componentTestRefusals)(
    'calling card.%s fails lint, pointing at the test page and staging',
    (property) => {
      expect(lint.errorsIn(`component-${property}.component.test.ts`)).toEqual([
        expect.stringMatching(/test-page\.ts.*staging\.ts/),
      ]);
    },
  );

  it('reading document fails lint, pointing at the test page and staging', () => {
    expect(lint.errorsIn('component-document.component.test.ts')).toEqual([
      expect.stringMatching(/test-page\.ts.*staging\.ts/),
    ]);
  });

  it('finding by getByElement in a test page passes lint', () => {
    expect(lint.errorsIn('finding-by-element.test-page.ts')).toEqual([]);
  });
});

describe('a component test using the writer', { timeout: 60_000 }, () => {
  it('calling browser.userEvent fails lint, pointing at the writer', () => {
    expect(lint.errorsIn('calling-user-event/sample.component.test.ts')).toEqual([
      expect.stringMatching(/writer.*testing\.md/),
    ]);
  });

  it('importing userEvent fails lint, pointing at the writer', () => {
    expect(lint.errorsIn('importing-user-event/sample.component.test.ts')).toEqual([
      expect.stringMatching(/writer.*testing\.md/),
    ]);
  });

  it('a test that is not a component test calling browser.userEvent passes lint', () => {
    expect(lint.errorsIn('unlisted/other.test.ts')).toEqual([]);
  });
});
