// Compare two `pnpm audit --json` reports: what this change brings in, and what
// the base already carried. Usage: _audit.mjs <base.json> <head.json> [base name]

import { readFileSync } from 'node:fs';

const [, , baseJsonPath, headJsonPath, baseName = 'the base'] = process.argv;

const collect = (jsonPath) => {
  const { advisories = {} } = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const findings = new Map();
  for (const advisory of Object.values(advisories)) {
    for (const finding of advisory.findings ?? []) {
      for (const path of finding.paths ?? []) {
        findings.set(`${advisory.github_advisory_id}|${path}`, {
          version: finding.version,
          advisory,
        });
      }
    }
  }
  return findings;
};

const base = collect(baseJsonPath);
const head = collect(headJsonPath);
const added = [...head].filter(([key]) => !base.has(key));
const existing = [...head].filter(([key]) => base.has(key));
const describe = ([, { version, advisory }]) =>
  `${advisory.module_name}@${version}  ${advisory.severity}  ${advisory.title}  via ${advisory.github_advisory_id}  ${advisory.url}`;

for (const finding of existing) {
  console.log(`warning: ${describe(finding)} — already in ${baseName}`);
}

if (added.length === 0) {
  console.log(
    `No advisory is added by this change${existing.length ? `, and ${existing.length} is already in ${baseName}` : ''}.`,
  );
  process.exit(0);
}

for (const finding of added) {
  console.error(`error: ${describe(finding)} — added by this change`);
}
process.exit(1);
