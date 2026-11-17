import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { domGlobals } from './dom-in-dom-files';
import { lintSamples, type SampleLint } from './sample-lint';

const usingTheDom: Record<string, string> = {
  document: "export const sample = (): unknown => document.createElement('div');\n",
  window: 'export const sample = (): unknown => window.innerHeight;\n',
  getComputedStyle:
    'export const sample = (element: HTMLElement): unknown => getComputedStyle(element).width;\n',
  requestAnimationFrame:
    'export const sample = (): unknown => requestAnimationFrame(() => undefined);\n',
  ResizeObserver: 'export const sample = (): unknown => new ResizeObserver(() => undefined);\n',
  localStorage: "export const sample = (): unknown => localStorage.getItem('key');\n",
};

let lint: SampleLint;

beforeAll(() => {
  const samples: Record<string, string> = {};
  for (const global of domGlobals) {
    const use = usingTheDom[global];
    if (use === undefined) throw new Error(`no sample uses ${global}`);
    samples[`plain-${global}.ts`] = use;
    samples[`thing-${global}.dom.ts`] = use;
    samples[`thing-${global}.test.ts`] = use;
    samples[`thing-${global}.test-page.ts`] = use;
  }
  lint = lintSamples('src/ui', samples);
});

afterAll(() => lint.dispose());

describe('the DOM in src/ui/', { timeout: 60_000 }, () => {
  it.each(domGlobals)('a plain file using %s fails lint, pointing at a *.dom.ts', (global) => {
    expect(lint.errorsIn(`plain-${global}.ts`)).toEqual([expect.stringContaining('*.dom.ts')]);
  });

  it.each(domGlobals)('a *.dom.ts using %s passes lint', (global) => {
    expect(lint.errorsIn(`thing-${global}.dom.ts`)).toEqual([]);
  });

  it.each(domGlobals)('a test file using %s passes lint', (global) => {
    expect(lint.errorsIn(`thing-${global}.test.ts`)).toEqual([]);
  });

  it.each(domGlobals)('a test page using %s passes lint', (global) => {
    expect(lint.errorsIn(`thing-${global}.test-page.ts`)).toEqual([]);
  });
});
