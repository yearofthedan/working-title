import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transformWithOxc } from 'vite-plus';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
// @ts-expect-error the helper is plain JavaScript, so it has no types
import { journeysFrom, mergeCoverage } from './_coverage.mjs';

const at = (line: number, column: number) => ({ line, column });

const fileOf = (fields: object) => ({
  path: 'src/example.ts',
  statementMap: {},
  fnMap: {},
  branchMap: {},
  s: {},
  f: {},
  b: {},
  ...fields,
});

const vitestFile = () =>
  fileOf({
    statementMap: { 0: { start: at(3, 0), end: at(3, 20) } },
    branchMap: {
      0: {
        loc: { start: at(3, 0), end: at(3, 20) },
        type: 'if',
        locations: [
          { start: at(3, 4), end: at(3, 20) },
          { start: at(5, 4), end: at(5, 10) },
        ],
        line: 3,
      },
    },
    s: { 0: 1 },
    b: { 0: [0, 0] },
  });

const described = (file: object) => ({ [vitestFile().path]: file });

describe('merging the journeys into the node and browser tests', () => {
  it('keeps the branch total when the two sides agree on the start but not the end', () => {
    const journeys = fileOf({
      branchMap: {
        0: {
          loc: { start: at(3, 0), end: at(3, 20) },
          type: 'if',
          locations: [
            { start: at(3, 4), end: at(3, 24) },
            { start: at(5, 4), end: at(5, 10) },
          ],
          line: 3,
        },
      },
      b: { 0: [3, 0] },
    });

    const merged = mergeCoverage(described(vitestFile()), described(journeys));

    expect(merged.getCoverageSummary().branches.total).toBe(2);
    expect(merged.getCoverageSummary().branches.covered).toBe(1);
  });

  it('keeps a branch only the journeys ran, with the end they reported', () => {
    const journeys = fileOf({
      branchMap: {
        0: {
          loc: { start: at(7, 0), end: at(9, 12) },
          type: 'if',
          locations: [
            { start: at(7, 4), end: at(9, 12) },
            { start: at(11, 4), end: at(11, 10) },
          ],
          line: 7,
        },
      },
      b: { 0: [1, 0] },
    });

    const merged = mergeCoverage(described(vitestFile()), described(journeys));
    const kept = Object.values<{ locations: { start: { line: number }; end: unknown }[] }>(
      merged.fileCoverageFor(vitestFile().path).branchMap,
    ).find((branch) => branch.locations[0].start.line === 7);

    expect(merged.getCoverageSummary().branches.total).toBe(4);
    expect(kept?.locations[0].end).toEqual(at(9, 12));
  });

  it('changes no total when the journeys add nothing', () => {
    const merged = mergeCoverage(described(vitestFile()), described(fileOf({})));
    const summary = merged.getCoverageSummary();

    expect(summary.statements).toMatchObject({ total: 1, covered: 1 });
    expect(summary.lines).toMatchObject({ total: 1, covered: 1 });
    expect(summary.branches).toMatchObject({ total: 2, covered: 0 });
  });
});

const builtScript = async () => {
  const root = mkdtempSync(join(tmpdir(), 'journey-coverage-'));
  const source = [
    "export const describe = (flag: boolean): string => (flag ? 'yes' : 'no');",
    "console.log(describe(process.argv[2] === 'yes'));",
    '',
  ].join('\n');
  const built = await transformWithOxc(source, join(root, 'src/example.ts'), { sourcemap: true });
  mkdirSync(join(root, 'dist/assets'), { recursive: true });
  writeFileSync(join(root, 'dist/assets/example.js'), built.code);
  writeFileSync(join(root, 'dist/assets/example.js.map'), JSON.stringify(built.map));
  writeFileSync(join(root, 'package.json'), '{"type": "module"}');
  return { root, code: built.code };
};

const recordJourney = (root: string, code: string, argument: string) => {
  const recorded = join(root, `v8-${argument}`);
  execFileSync(process.execPath, [join(root, 'dist/assets/example.js'), argument], {
    env: { ...process.env, NODE_V8_COVERAGE: recorded },
  });
  const [file] = readdirSync(recorded);
  const { result } = JSON.parse(readFileSync(join(recorded, file), 'utf8'));
  const entry = result.find((one: { url: string }) => one.url.endsWith('/assets/example.js'));
  const journeys = join(root, 'journeys');
  mkdirSync(journeys, { recursive: true });
  writeFileSync(
    join(journeys, `${argument}.json`),
    JSON.stringify([
      { url: 'http://localhost/assets/example.js', source: code, functions: entry.functions },
    ]),
  );
};

describe('reading the journeys', () => {
  let root: string;
  let code: string;

  beforeAll(async () => {
    ({ root, code } = await builtScript());
    recordJourney(root, code, 'yes');
    recordJourney(root, code, 'no');
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('holds the branches of one source file that both journeys ran', async () => {
    const covered = await journeysFrom(
      join(root, 'journeys'),
      join(root, 'dist'),
      join(root, 'src'),
    );

    expect(covered.getCoverageSummary().branches).toMatchObject({ total: 2, covered: 2 });
  });
});

describe('reading a journey of a build with no source map', () => {
  let root: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'journey-coverage-'));
    const journeys = join(root, 'journeys');
    mkdirSync(journeys, { recursive: true });
    writeFileSync(
      join(journeys, 'one.json'),
      JSON.stringify([
        { url: 'http://localhost/assets/example.js', source: 'export {};', functions: [] },
      ]),
    );
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('names the map it could not read', async () => {
    const reading = journeysFrom(join(root, 'journeys'), join(root, 'dist'), join(root, 'src'));

    await expect(reading).rejects.toThrow(join(root, 'dist/assets/example.js.map'));
  });
});
