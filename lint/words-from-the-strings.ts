import type { Override } from './override';

export const showsAProperty = [
  'textContent',
  'innerText',
  'placeholder',
  'title',
  'alt',
  'ariaLabel',
];
export const showsAChild = [
  'append',
  'prepend',
  'replaceChildren',
  'createTextNode',
  'before',
  'after',
];
export const showsAnAttribute = [
  'aria-label',
  'title',
  'placeholder',
  'alt',
  'aria-description',
  'aria-roledescription',
];
export const readsThePage = ['querySelector', 'querySelectorAll'];

const anyOf = (names: string[]) => names.join('|');

const theAppWordsComeFromTheStrings =
  "The app's words come from the strings file, src/ui/strings/, not a literal in a *.dom.ts (docs/standards/markup.md).";

// shortcut: a one-word literal handed to a helper, such as paragraph('Cancel'), passes, and the sentence selector also reads className = 'a b' as words; add a selector or a stricter rule when one slips through.
const showsItsOwnWords = [
  `AssignmentExpression[left.property.name=/^(${anyOf(showsAProperty)})$/][right.value=/\\S/]`,
  `AssignmentExpression[left.property.name=/^(${anyOf(showsAProperty)})$/][right.type='TemplateLiteral']`,
  `CallExpression[callee.property.name=/^(${anyOf(showsAChild)})$/] > Literal.arguments[value=/\\S/]`,
  `CallExpression[callee.property.name=/^(${anyOf(showsAChild)})$/] > TemplateLiteral.arguments`,
  `CallExpression[callee.property.name='setAttribute'][arguments.0.value=/^(${anyOf(showsAnAttribute)})$/] > :matches(Literal[value=/\\S/], TemplateLiteral).arguments:nth-child(2)`,
  `Literal[value=/\\p{L}\\s+\\p{L}/u]:not(CallExpression[callee.property.name=/^(${anyOf(readsThePage)})$/] > Literal)`,
].map((selector) => ({ selector, message: theAppWordsComeFromTheStrings }));

export const wordsFromTheStrings: Override[] = [
  {
    files: ['src/ui/**/*.dom.ts'],
    rules: { 'eslint-js/no-restricted-syntax': ['error', ...showsItsOwnWords] },
  },
];
