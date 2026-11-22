import { describe, expect, it } from 'vite-plus/test';
// @ts-expect-error the helper is plain JavaScript, so it has no types
import { mergeCoverage } from './_coverage.mjs';

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
