import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { lintSamples, type SampleLint } from './sample-lint';

const pollingThePage = [
  "import { expect } from 'vite-plus/test';",
  'export const sample = async (part: { element(): Element }): Promise<void> => {',
  '  await expect.poll(() => part.element()).toBeDefined();',
  '};',
  '',
].join('\n');

const waitingOnThePage = [
  "import { vi } from 'vite-plus/test';",
  'export const sample = async (driver: {',
  '  tree(): Promise<readonly string[]>;',
  '}): Promise<void> => {',
  '  await vi.waitFor(async () => driver.tree());',
  '};',
  '',
].join('\n');

const pollingAStandIn = [
  "import { expect } from 'vite-plus/test';",
  'export const sample = async (started: readonly string[]): Promise<void> => {',
  "  await expect.poll(() => started).toEqual(['']);",
  '};',
  '',
].join('\n');

let lint: SampleLint;

beforeAll(() => {
  lint = lintSamples('src/ui', {
    'component-polling-the-page.component.test.ts': pollingThePage,
    'component-waiting-on-the-page.component.test.ts': waitingOnThePage,
    'component-polling-a-stand-in.component.test.ts': pollingAStandIn,
    'polling-the-page.harness.ts': pollingThePage,
    'language-polling-the-page.dsl.ts': pollingThePage,
  });
});

afterAll(() => lint.dispose());

describe('waiting on the page', { timeout: 60_000 }, () => {
  it.each([
    ['a component test polling a page part', 'component-polling-the-page.component.test.ts'],
    [
      'a component test using vi.waitFor on a page part',
      'component-waiting-on-the-page.component.test.ts',
    ],
    ['a harness polling a page part', 'polling-the-page.harness.ts'],
    ['a language polling a page part', 'language-polling-the-page.dsl.ts'],
  ])('%s fails lint, pointing at expect.element', (_name, file) => {
    expect(lint.errorsIn(file)).toEqual([expect.stringContaining('expect.element')]);
  });

  it('polling what the page does not show, such as a stand-in’s calls, passes lint', () => {
    expect(lint.errorsIn('component-polling-a-stand-in.component.test.ts')).toEqual([]);
  });
});
