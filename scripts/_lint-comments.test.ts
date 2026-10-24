import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

let samples: string;
const refused = new Map<string, number[]>();
const refusedIn = (file: string) => refused.get(join(samples, file)) ?? [];

beforeAll(() => {
  samples = mkdtempSync('lint-comments-sample-');
  const files: string[] = [];
  const write = (file: string, content: string) => {
    writeFileSync(join(samples, file), content);
    files.push(join(samples, file));
  };

  write(
    '.oxlintrc.json',
    JSON.stringify({
      jsPlugins: ['../scripts/_lint-comments.mjs'],
      rules: { 'comments/allowed-prefix': 'error' },
    }),
  );

  write('plain-comment.ts', '// Not allowed.\nexport const a = 1;\n');
  write('doc-comment.ts', '/** Not allowed. */\nexport const a = 1;\n');
  write('after-code.ts', 'export const a = 1; // Not allowed.\n');
  write('allowed-shortcut.ts', '// shortcut: a limit, until it is lifted.\nexport const a = 1;\n');
  write(
    'allowed-workaround.ts',
    '// workaround: https://github.com/yearofthedan/working-title/issues/72\nexport const a = 1;\n',
  );
  write('allowed-help.ts', '// help: what the task does.\nexport const a = 1;\n');
  write(
    'allowed-directives.ts',
    '// @ts-expect-error the platform type is wrong here\nexport const a: number = "x";\n' +
      '// oxlint-disable-next-line no-console\nconsole.log(a);\n' +
      '// @type {number}\nexport const b = 1;\n',
  );
  write(
    'two-line-shortcut.ts',
    '// shortcut: a limit,\n// until it is lifted.\nexport const a = 1;\n',
  );
  write(
    'block-shortcut.ts',
    '/* shortcut: a limit,\n   until it is lifted. */\nexport const a = 1;\n',
  );
  write(
    'doc-block-shortcut.ts',
    '/**\n * shortcut: a limit, until it is lifted.\n */\nexport const a = 1;\n',
  );
  write('workaround-without-link.ts', '// workaround: patched here.\nexport const a = 1;\n');
  write(
    'not-a-comment.ts',
    "export const a = '// not a comment';\nexport const b = /\\/\\/ not a comment/;\nexport const c = `// not a comment`;\n",
  );

  const run = spawnSync(
    'vp',
    ['lint', '-c', join(samples, '.oxlintrc.json'), '--format', 'json', ...files],
    { encoding: 'utf8' },
  );
  const { diagnostics } = JSON.parse(run.stdout) as {
    diagnostics: { code: string; filename: string; labels: { span: { line: number } }[] }[];
  };
  for (const { code, filename, labels } of diagnostics) {
    if (code === 'comments(allowed-prefix)') {
      refused.set(filename, [...(refused.get(filename) ?? []), labels[0]?.span.line ?? 0]);
    }
  }
});

afterAll(() => rmSync(samples, { recursive: true, force: true }));

describe('comments/allowed-prefix', { timeout: 60_000 }, () => {
  it('refuses a // comment', () => {
    expect(refusedIn('plain-comment.ts')).toEqual([1]);
  });

  it('refuses a doc comment', () => {
    expect(refusedIn('doc-comment.ts')).toEqual([1]);
  });

  it('refuses a comment after code on the same line', () => {
    expect(refusedIn('after-code.ts')).toEqual([1]);
  });

  it.each([
    'allowed-shortcut.ts',
    'allowed-workaround.ts',
    'allowed-help.ts',
    'allowed-directives.ts',
  ])('passes %s', (file) => {
    expect(refusedIn(file)).toEqual([]);
  });

  it('refuses the second line of a two-line // shortcut:', () => {
    expect(refusedIn('two-line-shortcut.ts')).toEqual([2]);
  });

  it('passes a /* shortcut: */ block that spans lines', () => {
    expect(refusedIn('block-shortcut.ts')).toEqual([]);
  });

  it('passes a /** block whose shortcut: starts on its second line', () => {
    expect(refusedIn('doc-block-shortcut.ts')).toEqual([]);
  });

  it('refuses a workaround: with no issue link', () => {
    expect(refusedIn('workaround-without-link.ts')).toEqual([1]);
  });

  it('counts no // inside a string, a regex or a template', () => {
    expect(refusedIn('not-a-comment.ts')).toEqual([]);
  });
});
