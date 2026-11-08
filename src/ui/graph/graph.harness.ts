import * as browser from 'vite-plus/test/browser';
import { type OpenProject } from '../../application/project';
import { type Driver, type Opening } from '../../test-helpers/driver';
import { readsIn } from '../../test-helpers/graph-page';
import {
  anInMemoryProject,
  aProjectWithScenesUnderBeatFour,
  type SeededProject,
} from '../../test-helpers/seed';
import { root } from '../../test-helpers/staging';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { graphSteps, seesOn, writerOn, type Sees, type Writer } from './graph.dsl';
import { renderGraph } from './graph.dom';
import { blurTheFocus } from './graph.test-page';

let stops: (() => void)[] = [];
let drawn: { readonly main: HTMLElement; readonly project: () => OpenProject } | undefined;

const stopTheGraphs = (): void => {
  for (const stop of stops.splice(0)) stop();
};

const drawOn = async (main: HTMLElement, project: OpenProject): Promise<void> => {
  let held = project;
  const graph = await renderGraph(main, held.root, {
    moved: () => undefined,
    elaborate: (pieceId, facetId, text) => held.elaborate(pieceId, facetId, text),
    branch: async (pieceId) => {
      const { project: next, added } = await held.branch(pieceId);
      held = next;
      return { root: next.root, added };
    },
    toggleBeside: () => undefined,
  });
  stops.push(() => graph.stop());
  drawn = { main, project: () => held };
};

export const mountTheGraph = async (
  stage: {
    readonly width?: number;
    readonly scenes?: number;
    readonly project?: SeededProject;
  } = {},
): Promise<void> => {
  const { width = 1440, scenes = 0, project } = stage;
  await browser.page.viewport(width, 900);
  stopTheGraphs();

  const main = root('main');
  main.style.width = `${width}px`;

  const { project: opened } = await anInMemoryProject(
    scenes > 0 ? aProjectWithScenesUnderBeatFour(scenes) : project,
  );
  await drawOn(main, opened);
};

export const reopenTheGraph = async (): Promise<void> => {
  const at = drawn;
  if (at === undefined) throw new Error('the graph is drawn on no main to draw it again on');
  stopTheGraphs();
  await drawOn(at.main, at.project());
};

const theMain = (): HTMLElement => {
  const main = document.querySelector<HTMLElement>('main');
  if (main === null) throw new Error('the page has no main');
  return main;
};

const graphDriver = (name?: string): Driver => ({
  ...vitestBrowserDriver(name),
  clickAway: async () => blurTheFocus(),
});

export const graphWith = (
  scenes = 0,
  width = 1440,
): { driver: Driver; stage: Opening; writer: Writer; sees: Sees } => {
  const driver = graphDriver();
  const stage: Opening = {
    fresh: async () => {
      await mountTheGraph({ width, scenes });
    },
    reopen: () => reopenTheGraph(),
  };
  return {
    driver,
    stage,
    writer: writerOn(driver, stage),
    sees: seesOn(
      driver,
      readsIn(() => theMain()),
    ),
  };
};

export const graphScenarioSteps = (driver: Driver) =>
  graphSteps(
    writerOn(
      driver,
      { fresh: () => mountTheGraph(), reopen: () => reopenTheGraph() },
      (project: SeededProject) => mountTheGraph({ project }),
    ),
    seesOn(
      driver,
      readsIn(() => theMain()),
    ),
  );
