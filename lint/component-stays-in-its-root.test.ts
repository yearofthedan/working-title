import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import {
  createsInTheDocument,
  readsFromTheDocument,
  readsTheViewport,
  walksFromAnElement,
} from './component-stays-in-its-root';
import { lintSamples, type SampleLint } from './sample-lint';

const lookingOutsideTheRoot: Record<string, string> = {
  'document.querySelector':
    "export const sample = (): unknown => document.querySelector('main');\n",
  'document.querySelectorAll':
    "export const sample = (): unknown => document.querySelectorAll('main');\n",
  'document.getElementById':
    "export const sample = (): unknown => document.getElementById('main');\n",
  'document.addEventListener':
    "export const sample = (): void => document.addEventListener('keydown', () => undefined);\n",
  'window.addEventListener':
    "export const sample = (): void => window.addEventListener('resize', () => undefined);\n",
  'document.body': 'export const sample = (): unknown => document.body;\n',
  'document.documentElement': 'export const sample = (): unknown => document.documentElement;\n',
  'document.elementFromPoint':
    'export const sample = (): unknown => document.elementFromPoint(0, 0);\n',
  'window.scrollY': 'export const sample = (): unknown => window.scrollY;\n',
};

const walkingFromAnElement: Record<string, string> = {
  closest: "export const sample = (el: HTMLElement): unknown => el.closest('div');\n",
  parentElement: 'export const sample = (el: HTMLElement): unknown => el.parentElement;\n',
  parentNode: 'export const sample = (el: HTMLElement): unknown => el.parentNode;\n',
  getRootNode: 'export const sample = (el: HTMLElement): unknown => el.getRootNode();\n',
  ownerDocument: 'export const sample = (el: HTMLElement): unknown => el.ownerDocument;\n',
};

const drawingTheDomAsAllowed: Record<string, string> = {
  createElement: "document.createElement('div')",
  createElementNS: "document.createElementNS('http://www.w3.org/2000/svg', 'svg')",
  createTextNode: 'document.createTextNode(strings.x)',
  createDocumentFragment: 'document.createDocumentFragment()',
  fonts: 'document.fonts',
  activeElement: 'document.activeElement',
  innerHeight: 'window.innerHeight',
};

const drawingAndReadingAsAllowed = [
  'declare const strings: Record<string, string>;',
  'export const sample = (el: HTMLElement): unknown => [',
  ...[...createsInTheDocument, ...readsFromTheDocument, readsTheViewport].map((name) => {
    const call = drawingTheDomAsAllowed[name];
    if (call === undefined) throw new Error(`no sample draws the DOM with ${name}`);
    return `  ${call},`;
  }),
  "  el.querySelector('div'),",
  "  el.addEventListener('click', () => undefined),",
  '];',
  '',
].join('\n');

const outsideTheRoot = (name: string) => `outside-${name.replaceAll('.', '-')}.dom.ts`;

let lint: SampleLint;

beforeAll(() => {
  const samples: Record<string, string> = {
    'drawing-the-document.dom.ts': drawingAndReadingAsAllowed,
  };
  for (const [name, use] of Object.entries(lookingOutsideTheRoot))
    samples[outsideTheRoot(name)] = use;
  for (const name of walksFromAnElement) {
    const use = walkingFromAnElement[name];
    if (use === undefined) throw new Error(`no sample walks from an element with ${name}`);
    samples[`outside-${name}.dom.ts`] = use;
  }
  lint = lintSamples('src/ui', samples);
});

afterAll(() => lint.dispose());

describe('a component stays in its root', { timeout: 60_000 }, () => {
  it.each(Object.keys(lookingOutsideTheRoot))(
    'a *.dom.ts using %s outside its root fails lint',
    (name) => {
      expect(lint.errorsIn(outsideTheRoot(name))).toEqual([
        expect.stringContaining('outside its root'),
      ]);
    },
  );

  it.each(walksFromAnElement)('a *.dom.ts calling %s on an element fails lint', (name) => {
    expect(lint.errorsIn(`outside-${name}.dom.ts`)).toEqual([
      expect.stringContaining('outside its root'),
    ]);
  });

  it('a *.dom.ts drawing and reading the DOM as allowed passes lint', () => {
    expect(lint.errorsIn('drawing-the-document.dom.ts')).toEqual([]);
  });
});
