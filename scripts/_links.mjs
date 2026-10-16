// Every link this repository writes, read the way its reader would: a path has to be there, the
// heading an anchor names has to be in the file it names, and a site has to answer. The sites are
// asked only under --external, so ./do check can run the half that reads the repository alone.
// Usage: _links.mjs <root> [--external]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

const [root = '.', ...flags] = process.argv.slice(2);
const external = flags.includes('--external');
const inCi = process.env.CI === 'true';

const refusals = [];
const warnings = [];
const seen = new Map();

// A markdown file is read as prose, without the code in it; any other file is read as comments
// alone, since a code block is not prose and a suite's fixture is not a link.
const read = (file) => {
  const text = readFileSync(join(root, file), 'utf8');
  if (file.endsWith('.md')) {
    return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  }
  return text
    .split('\n')
    .filter((line) => /^\s*(#|\/\/|\/\*|\*|<!--)/.test(line))
    .join('\n');
};

const slug = (heading) =>
  heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const headings = (file) =>
  [...readFileSync(join(root, file), 'utf8').matchAll(/^#+ +(.+?)\s*$/gm)].map(([, text]) =>
    slug(text),
  );

const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((file) => /\.(md|ts|mjs|sh|ya?ml|json)$/.test(file));

for (const file of files) {
  for (const [, target] of read(file).matchAll(/\]\(([^)\s]+)\)/g)) {
    if (target.startsWith('#')) continue;
    if (/^[a-z]+:/i.test(target)) {
      if (target.startsWith('https://')) seen.set(target, seen.get(target) ?? file);
      continue;
    }
    const [path, anchor] = target.split('#');
    const held = resolve(root, dirname(file), path);
    if (!existsSync(held)) {
      refusals.push(`${file}: ${target} is not in the repository`);
    } else if (anchor && held.endsWith('.md') && !headings(relative(root, held)).includes(anchor)) {
      refusals.push(`${file}: ${target} names a heading ${relative(root, held)} does not hold`);
    }
  }
}

if (external) {
  const work = mkdtempSync(join(tmpdir(), 'links-'));
  try {
    let asked = 0;
    for (const [url, file] of seen) {
      asked += 1;
      const [page, anchor] = url.split('#');
      const saved = join(work, `${asked}.html`);
      let status = 0;
      let answered = true;
      try {
        status =
          Number(
            execFileSync(
              'curl',
              ['-sSL', '--max-time', '20', '-o', saved, '-w', '%{http_code}', page],
              { encoding: 'utf8' },
            ).trim(),
          ) || 0;
      } catch (error) {
        const code = Number(String(error.stdout ?? '').trim());
        // A site that answers with an error still answered; one that answers nothing says nothing.
        answered = Number.isInteger(code) && code >= 100;
        status = answered ? code : 0;
      }
      if (!answered) {
        const line = `${file}: ${url} could not be reached, so nothing was checked`;
        if (inCi) refusals.push(line);
        else warnings.push(line);
        continue;
      }
      if (status >= 400) {
        refusals.push(`${file}: ${url} answers ${status}`);
        continue;
      }
      let pageText = '';
      try {
        pageText = readFileSync(saved, 'utf8');
      } catch {
        pageText = '';
      }
      // A heading can be on a page without being in the HTML the server sends — this repository
      // links to two such pages — so a missing one is a hint to look, not a refusal.
      if (anchor && !pageText.includes(`id="${anchor}"`)) {
        warnings.push(
          `${file}: ${url} names a heading that is not in the page as it was sent, so it is worth a look`,
        );
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

for (const line of warnings) console.error(`warning: ${line}`);
for (const line of refusals) console.error(`error: ${line}`);

if (refusals.length > 0) process.exit(1);
console.log(
  `every link the ${files.length} files of ${root} name resolves${external ? '' : ' in the repository'}`,
);
