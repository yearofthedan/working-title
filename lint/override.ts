import type { DummyRuleMap, OxlintOverride } from 'vite-plus/lint';

export type Override = OxlintOverride;

interface Merged {
  files: OxlintOverride['files'];
  rules: DummyRuleMap;
}

export const compose = (concerns: Override[][]): Override[] => {
  const byFiles = new Map<string, Merged>();
  for (const { files, rules = {} } of concerns.flat()) {
    const key = files.join('\n');
    const merged = byFiles.get(key) ?? { files, rules: {} };
    for (const [name, setting] of Object.entries(rules)) {
      const earlier = merged.rules[name];
      merged.rules[name] =
        Array.isArray(earlier) && Array.isArray(setting)
          ? [setting[0], ...earlier.slice(1), ...setting.slice(1)]
          : setting;
    }
    byFiles.set(key, merged);
  }
  return [...byFiles.values()];
};
