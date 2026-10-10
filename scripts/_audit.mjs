// Compare two `pnpm audit --json` reports: what this change brings in, and what
// the base already carried. Usage: _audit.mjs <base.json> <head.json> [base name]

import { readFileSync } from 'node:fs';

const [, , baseJsonPath, headJsonPath, baseName = 'the base'] = process.argv;

const collect = (jsonPath) => {
  const { advisories = {} } = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const findings = new Map();
  for (const advisory of Object.values(advisories)) {
    for (const finding of advisory.findings ?? []) {
      const dev = finding.dev ? 'dev' : 'prod';
      const key = [advisory.github_advisory_id, advisory.module_name, finding.version, dev].join(
        '|',
      );
      const seen = findings.get(key) ?? {
        advisory,
        version: finding.version,
        dev,
        paths: new Set(),
      };
      for (const path of finding.paths ?? []) seen.paths.add(path);
      findings.set(key, seen);
    }
  }
  return findings;
};

const base = collect(baseJsonPath);
const head = collect(headJsonPath);
const added = [...head].filter(([key]) => !base.has(key));
const existing = [...head].filter(([key]) => base.has(key));
const describe = ([, { advisory, version, dev, paths }]) =>
  `${advisory.module_name}@${version}  ${dev}  ${advisory.severity}  ${advisory.title}  via ${advisory.github_advisory_id}  at ${[...paths].join(', ')}  ${advisory.url}`;

for (const finding of existing) {
  console.log(`warning: ${describe(finding)} — already in ${baseName}`);
}

if (added.length === 0) {
  console.log(
    `No advisory is added by this change against ${baseName}${existing.length ? `, which already carries ${existing.length} of them` : ''}.`,
  );
  process.exit(0);
}

for (const finding of added) {
  console.error(`error: ${describe(finding)} — added by this change`);
}
process.exit(1);
