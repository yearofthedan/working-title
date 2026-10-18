import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vite-plus/test';

// OMP omits an always-apply rule whose paragraph a context file already contains
// (context-files.md, "Sticky rules vs normal context"), so a rule left in AGENTS.md
// as well would stop being sent with every request.
const [rules, agents] = ['./RULES.md', '../AGENTS.md'].map((path) =>
  readFileSync(new URL(path, import.meta.url), 'utf8')
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean),
);

describe('RULES.md', () => {
  it('carries no rule that AGENTS.md also carries', () => {
    expect(rules.filter((rule) => agents.includes(rule))).toEqual([]);
  });
});
