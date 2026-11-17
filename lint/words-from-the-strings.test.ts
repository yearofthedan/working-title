import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { lintSamples, type SampleLint } from './sample-lint';
import {
  readsThePage,
  showsAChild,
  showsAnAttribute,
  showsAProperty,
} from './words-from-the-strings';

const theStringsFile = "The app's words come from the strings file";

const inADomFile = (...lines: string[]) =>
  [
    'declare const strings: Record<string, string>;',
    'declare const paragraph: (sentence: string) => void;',
    'export const sample = (el: HTMLElement, id: string): void => {',
    ...lines.map((line) => `  ${line}`),
    '};',
    '',
  ].join('\n');

const samples: Record<string, string> = {};
const refusalRows: [string, string][] = [];
const passRows: [string, string][] = [];

const refused = (what: string, file: string, ...lines: string[]) => {
  samples[file] = inADomFile(...lines);
  refusalRows.push([what, file]);
};

const allowed = (what: string, file: string, ...lines: string[]) => {
  samples[file] = inADomFile(...lines);
  passRows.push([what, file]);
};

for (const name of showsAProperty) {
  refused(`a literal in ${name}`, `literal-in-${name}.dom.ts`, `el.${name} = 'Close';`);
  allowed(
    `${name} holding nothing, a space or the strings file value`,
    `words-in-${name}.dom.ts`,
    `el.${name} = '';`,
    `el.${name} = ' ';`,
    `el.${name} = strings.close;`,
  );
}

for (const name of showsAChild) {
  refused(`a literal given to ${name}`, `literal-given-to-${name}.dom.ts`, `el.${name}('Close');`);
  allowed(
    `${name} given nothing, a space or the strings file value`,
    `words-given-to-${name}.dom.ts`,
    `el.${name}('');`,
    `el.${name}(' ');`,
    `el.${name}(strings.close);`,
  );
}

for (const name of showsAnAttribute) {
  refused(
    `a literal given to setAttribute for ${name}`,
    `literal-in-setAttribute-${name}.dom.ts`,
    `el.setAttribute('${name}', 'Close');`,
  );
  allowed(
    `setAttribute for ${name} given nothing, a space or the strings file value`,
    `words-in-setAttribute-${name}.dom.ts`,
    `el.setAttribute('${name}', '');`,
    `el.setAttribute('${name}', ' ');`,
    `el.setAttribute('${name}', strings.close);`,
  );
}

refused(
  'a template literal in textContent',
  'template-in-textContent.dom.ts',
  'el.textContent = `Add a ${id}`;',
);
refused(
  'a literal in one branch of a conditional assigned to textContent',
  'literal-in-a-conditional.dom.ts',
  "el.textContent = id === '' ? 'Close' : strings.close;",
);
refused(
  'a literal added to a value assigned to textContent',
  'literal-added-in-textContent.dom.ts',
  "el.textContent = 'Add ' + id;",
);
refused(
  'a template literal given to setAttribute',
  'template-in-setAttribute.dom.ts',
  "el.setAttribute('aria-label', `Close ${id}`);",
);
refused(
  'a template literal given to append',
  'template-given-to-append.dom.ts',
  'el.append(`Add a ${id}`);',
);
refused(
  'a literal made into a text node',
  'literal-in-a-text-node.dom.ts',
  "el.replaceChildren(document.createTextNode('Close'));",
);
refused(
  'a sentence handed to a helper',
  'sentence-in-a-helper-call.dom.ts',
  "paragraph('two words here');",
);
refused(
  'a literal in a sample named project.dom.ts',
  'project.dom.ts',
  "el.textContent = 'Close';",
);

allowed(
  'a conditional choosing between two strings file values',
  'strings-in-a-conditional.dom.ts',
  "el.textContent = id === '' ? strings.close : strings.open;",
  'el.textContent = strings.close + id;',
);

allowed(
  'a role given to setAttribute',
  'role-in-setAttribute.dom.ts',
  "el.setAttribute('role', 'alert');",
);

for (const name of readsThePage)
  allowed(
    `a selector of two words in ${name}`,
    `two-words-in-${name}.dom.ts`,
    `el.${name}('legend button');`,
  );

const inAnotherFile: [string, string][] = [
  ['a plain .ts file', 'a-literal-in-a-plain-file.ts'],
  ['a test page', 'a-literal-in-a-test-page.test-page.ts'],
  ['a harness', 'a-literal-in-a-harness.harness.ts'],
];

for (const [, file] of inAnotherFile) samples[file] = inADomFile("el.textContent = 'Close';");

let lint: SampleLint;

beforeAll(() => {
  lint = lintSamples('src/ui', samples);
});

afterAll(() => lint.dispose());

describe('the words a *.dom.ts shows', { timeout: 60_000 }, () => {
  it.each(refusalRows)('%s fails lint, pointing at the strings file', (_what, file) => {
    expect(lint.errorsIn(file)).toEqual([expect.stringContaining(theStringsFile)]);
  });

  it.each(passRows)('%s passes lint', (_what, file) => {
    expect(lint.errorsIn(file)).toEqual([]);
  });

  it.each(inAnotherFile)('the same literal in %s passes lint', (_what, file) => {
    expect(lint.errorsIn(file)).toEqual([]);
  });
});
