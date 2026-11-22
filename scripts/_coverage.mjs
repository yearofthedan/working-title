import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { convert } from 'ast-v8-to-istanbul';
import libCoverage from 'istanbul-lib-coverage';
import libReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';
import { parse } from 'vite-plus';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vitestPath = join(root, 'coverage/raw/vitest/coverage-final.json');
const journeysPath = join(root, 'coverage/raw/journeys');
const reportPath = join(root, 'coverage');

const startOf = ({ start }) => `${start.line}:${start.column}`;

const realign = (ranges, knownRanges) => {
  const ends = new Map(knownRanges.map((range) => [startOf(range), range.end]));
  for (const range of ranges) {
    const end = ends.get(startOf(range));
    if (end !== undefined) range.end = end;
  }
};

const alignedTo = (file, known) => {
  realign(Object.values(file.statementMap), Object.values(known.statementMap));

  const knownFunctions = Object.values(known.fnMap);
  const functions = Object.values(file.fnMap);
  realign(
    functions.map((fn) => fn.decl),
    knownFunctions.map((fn) => fn.decl),
  );
  realign(
    functions.map((fn) => fn.loc),
    knownFunctions.map((fn) => fn.loc),
  );

  const knownBranches = Object.values(known.branchMap);
  const branches = Object.values(file.branchMap);
  realign(
    branches.map((branch) => branch.loc),
    knownBranches.map((branch) => branch.loc),
  );
  realign(
    branches.flatMap((branch) => branch.locations),
    knownBranches.flatMap((branch) => branch.locations),
  );
};

export const mergeCoverage = (vitestData, journeysData) => {
  const vitest = libCoverage.createCoverageMap(vitestData);
  const journeys = libCoverage.createCoverageMap(journeysData);

  for (const path of journeys.files()) {
    const known = vitest.data[path];
    if (known !== undefined) alignedTo(journeys.fileCoverageFor(path), known);
  }

  vitest.merge(journeys);
  return vitest;
};

export const journeysFrom = async (dir, dist = join(root, 'dist'), source = join(root, 'src')) => {
  const covered = libCoverage.createCoverageMap({});

  for (const file of readdirSync(dir)) {
    const entries = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    for (const entry of entries) {
      if (!entry.url.endsWith('.js') || entry.source === undefined) continue;
      const { pathname } = new URL(entry.url);
      if (pathname === '/sw.js') continue;
      const built = join(dist, pathname);
      const sourceMapPath = `${built}.map`;
      if (!existsSync(sourceMapPath)) throw new Error(`no source map at ${sourceMapPath}`);

      const ast = (await parse(built, entry.source)).program;
      const data = await convert({
        ast,
        code: entry.source,
        wrapperLength: 0,
        coverage: { url: pathToFileURL(built).href, functions: entry.functions },
        sourceMap: JSON.parse(readFileSync(sourceMapPath, 'utf8')),
      });
      for (const [path, coverage] of Object.entries(data)) {
        if (path.startsWith(source + sep)) covered.addFileCoverage(coverage);
      }
    }
  }

  return covered;
};

const main = async () => {
  const vitest = JSON.parse(readFileSync(vitestPath, 'utf8'));
  const merged = mergeCoverage(vitest, await journeysFrom(journeysPath));

  const context = libReport.createContext({
    dir: reportPath,
    coverageMap: merged,
    defaultSummarizer: 'nested',
  });
  reports.create('html').execute(context);
  reports.create('text').execute(context);
};

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
