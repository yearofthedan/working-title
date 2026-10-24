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
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s/g, '-');

const headings = (file) => {
  const counted = new Map();
  return [...read(file).matchAll(/^#+ +(.+?)\s*$/gm)].map(([, text]) => {
    const base = slug(text);
    const times = counted.get(base) ?? 0;
    counted.set(base, times + 1);
    return times === 0 ? base : `${base}-${times}`;
  });
};

const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((file) => /\.(md|ts|mjs|sh|ya?ml|json)$/.test(file));

for (const file of files) {
  const text = read(file);
  for (const [url] of text.matchAll(/https?:\/\/[^\s)"'<>`\]]+/g)) {
    seen.set(url.replace(/[.,;:]+$/, ''), seen.get(url.replace(/[.,;:]+$/, '')) ?? file);
  }
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)/g)) {
    if (target.startsWith('#')) {
      const anchor = target.slice(1);
      if (!headings(file).includes(anchor)) {
        refusals.push(`${file}: ${target} names a heading this file does not hold`);
      }
      continue;
    }
    if (/^[a-z]+:/i.test(target)) continue;
    const [path, anchor] = target.split('#');
    const held = resolve(root, dirname(file), path);
    if (!existsSync(held)) {
      refusals.push(`${file}: ${target} is not in the repository`);
    } else if (anchor && held.endsWith('.md') && !headings(relative(root, held)).includes(anchor)) {
      refusals.push(`${file}: ${target} names a heading ${relative(root, held)} does not hold`);
    }
  }
}

const ask = (page, saved) => {
  try {
    const code = Number(
      execFileSync('curl', ['-sSL', '--max-time', '20', '-o', saved, '-w', '%{http_code}', page], {
        encoding: 'utf8',
      }).trim(),
    );
    return { status: code, answered: Number.isInteger(code) && code >= 100 };
  } catch (error) {
    const code = Number(String(error.stdout ?? '').trim());
    const answered = Number.isInteger(code) && code >= 100;
    return { status: answered ? code : 0, answered };
  }
};

if (external) {
  const work = mkdtempSync(join(tmpdir(), 'links-'));
  try {
    let asked = 0;
    for (const [url, file] of seen) {
      asked += 1;
      const [page, anchor] = url.split('#');
      const saved = join(work, `${asked}.html`);
      let answer = ask(page, saved);
      if (answer.status >= 500 || answer.status === 429) {
        execFileSync('sleep', ['3']);
        answer = ask(page, saved);
      }
      if (!answer.answered) {
        const line = `${file}: ${url} could not be reached, so nothing was checked`;
        if (inCi) refusals.push(line);
        else warnings.push(line);
        continue;
      }
      if (answer.status >= 500 || answer.status === 429) {
        warnings.push(
          `${file}: ${url} answered ${answer.status}, which is the site rather than the link`,
        );
        continue;
      }
      if (answer.status >= 400) {
        refusals.push(`${file}: ${url} answers ${answer.status}`);
        continue;
      }
      let pageText = '';
      try {
        pageText = readFileSync(saved, 'utf8');
      } catch {
        pageText = '';
      }
      if (anchor) {
        const named = new RegExp(
          `id=["']?(?:user-content-)?${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\\s>]`,
        );
        if (!named.test(pageText)) {
          warnings.push(
            `${file}: ${url} names a heading that is not in the page as it was sent, so it is worth a look`,
          );
        }
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

if (files.length === 0) {
  refusals.push(`${root} holds no file this check reads, so it checked nothing`);
}

for (const line of warnings) console.error(`warning: ${line}`);
for (const line of refusals) console.error(`error: ${line}`);

if (refusals.length > 0) process.exit(1);
console.log(
  `every link the ${files.length} files of ${root} name resolves${external ? `, across the ${seen.size} addresses they name` : ', and none of them leaves the repository'}`,
);
