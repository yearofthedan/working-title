import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vite-plus/test';

// One rule, one home: a copy left in AGENTS.md is a second place to edit, and OMP
// carries the always-apply rule from whichever source already holds its content
// (rulebook-matching-pipeline.md, "System prompt inclusion path").
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
