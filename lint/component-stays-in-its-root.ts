import type { Override } from './override';

export const createsInTheDocument = [
  'createElement',
  'createElementNS',
  'createTextNode',
  'createDocumentFragment',
];
export const readsFromTheDocument = ['fonts', 'activeElement'];
export const readsTheViewport = 'innerHeight';
export const walksFromAnElement = [
  'closest',
  'parentElement',
  'parentNode',
  'getRootNode',
  'ownerDocument',
];

const looksOutsideItsRoot =
  'A component looks up and listens on nothing outside its root; it may create elements and read focus, fonts and the viewport height (docs/adr/0010).';
const allowedInTheDocument = [...createsInTheDocument, ...readsFromTheDocument].join('|');
const outsideLookups = [
  `MemberExpression[object.name='document']:not([property.name=/^(${allowedInTheDocument})$/])`,
  `MemberExpression[object.name='window']:not([property.name='${readsTheViewport}'])`,
  `MemberExpression[property.name=/^(${walksFromAnElement.join('|')})$/]`,
].map((selector) => ({ selector, message: looksOutsideItsRoot }));

export const componentStaysInItsRoot: Override[] = [
  {
    files: ['src/ui/**/*.dom.ts'],
    rules: { 'eslint-js/no-restricted-syntax': ['error', ...outsideLookups] },
  },
];
