import * as browser from 'vite-plus/test/browser';
import { openProject, type OpenProject } from '../../application/project';
import { snowflakeExtended } from '../../methods/snowflake-extended';
import { wholeNameAnyCase, type Driver, type Opening } from '../../test-helpers/driver';
import { readsIn } from '../../test-helpers/graph-page';
import {
  anInMemoryProject,
  aProject,
  beat,
  inMemory,
  scene,
  story,
  type SeededProject,
} from '../../test-helpers/seed';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { graphSteps, seesOn, writerOn, type Sees, type Writer } from './graph.dsl';
import { renderGraph } from './graph.dom';
import { blurTheFocus } from './graph.test-page';

let stops: (() => void)[] = [];
let store = inMemory();
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

// shortcut: the story holds the five beats the method starts a project with, the fourth carrying the scenes, until a case needs the scenes under another beat.
const aProjectWithScenesUnderBeatFour = (scenes: number): SeededProject =>
  aProject(
    story(beat(), beat(), beat(), beat(...Array.from({ length: scenes }, () => scene())), beat()),
  );

export const mountTheGraph = async (
  stage: {
    readonly width?: number;
    readonly scenes?: number;
    readonly name?: string;
    readonly project?: SeededProject;
  } = {},
): Promise<void> => {
  const { width = 1440, scenes = 0, name, project } = stage;
  await browser.page.viewport(width, 900);
  stopTheGraphs();

  const main = document.createElement('main');
  main.style.width = `${width}px`;
  if (name !== undefined) main.setAttribute('aria-label', name);
  document.body.replaceChildren(main);

  const { store: made, project: opened } = await anInMemoryProject(
    scenes > 0 ? aProjectWithScenesUnderBeatFour(scenes) : project,
  );
  store = made;
  await drawOn(main, opened);
};

export const reopenTheGraph = async (): Promise<void> => {
  const at = drawn;
  if (at === undefined) throw new Error('the graph is drawn on no main to draw it again on');
  stopTheGraphs();
  await drawOn(at.main, at.project());
};

export const twoGraphs = async (): Promise<void> => {
  const first = theMain();
  first.setAttribute('aria-label', 'First graph');

  const page = document.createElement('div');
  const second = document.createElement('main');
  second.setAttribute('aria-label', 'Second graph');
  second.style.width = first.style.width;
  page.append(second);
  // shortcut: the second graph shares the shell's main column below the first, with no height of its own, until a case needs its cards where the writer can click them.
  page.style.gridColumn = '1';
  document.body.append(page);

  await drawOn(second, await openProject(snowflakeExtended, store));
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

export const graphOn = (
  name: string,
  opening: Opening,
): { driver: Driver; writer: Writer; sees: Sees } => {
  const driver = graphDriver(name);
  const main = browser.page.getByRole('main', { name: wholeNameAnyCase(name) });
  return {
    driver,
    writer: writerOn(driver, opening),
    sees: seesOn(
      driver,
      readsIn(() => main.element()),
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
