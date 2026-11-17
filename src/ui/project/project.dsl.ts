import type { AppReads, Driver, Opening } from '../../test-helpers/driver';
import type { SeededProject } from '../../test-helpers/seed';
import {
  reporting,
  reportingFocus,
  wholeTree,
  type Evidence,
  type StepAction,
} from '../../test-helpers/steps';
import {
  besideTheGraph,
  clicking,
  graphSteps,
  pieceNamed,
  seesOn,
  shows,
  underABeat,
  writerOn,
  type Sees,
  type Writer,
} from '../graph/graph.dsl';
import { panelWriterOn, type PanelWriter } from '../panel/panel.dsl';
import {
  yourProjectsSeesOn,
  yourProjectsSteps,
  yourProjectsWriterOn,
  type YourProjectsSees,
  type YourProjectsWriter,
} from '../your-projects/your-projects.dsl';

export interface ProjectWriter extends Writer, PanelWriter, YourProjectsWriter {
  makesCurrent(piece: string): Promise<void>;
  addsASceneUnder(beat: string): Promise<void>;
  opensBeside(piece: string): Promise<void>;
  clicksThePathTo(piece: string): Promise<void>;
  hovers(piece: string): Promise<void>;
  clicksOpenBesideOn(piece: string): Promise<void>;
  types(text: string, at: { readonly piece: string; readonly facet: string }): Promise<void>;
  typesBeside(text: string, at: { readonly piece: string; readonly facet: string }): Promise<void>;
}

export interface Staged {
  hasNotChosenWhereToKeepProjects(): Promise<void>;
  anEmptyFolderNamed(name: string): Promise<void>;
  keepsProjectsInAFolderHolding(titles: readonly string[]): Promise<void>;
  choosesTheFolderNamed(name: string): Promise<void>;
  choosesTheProjectFolder(title: string): Promise<void>;
}

const refuses = (): never => {
  throw new Error(
    'Only the page tier stages the writer’s machine, and these steps were given no stage.',
  );
};

const nothingStaged: Staged = {
  hasNotChosenWhereToKeepProjects: refuses,
  anEmptyFolderNamed: refuses,
  keepsProjectsInAFolderHolding: refuses,
  choosesTheFolderNamed: refuses,
  choosesTheProjectFolder: refuses,
};

export interface ProjectSees extends Sees, YourProjectsSees {
  pathIs(pieces: readonly string[]): Promise<void>;
  panelIsOpenOn(piece: string): Promise<Evidence>;
  noPanelIsOpen(): Promise<Evidence>;
  readsBeside(piece: string, facet: string, text: string): Promise<Evidence>;
  focusIsInTheParagraph(): Promise<void>;
  yourProjectsIn(folder: string): Promise<Evidence>;
  namesTheProject(title: string): Promise<Evidence>;
  focusIsInTheSummary(): Promise<Evidence>;
  filesInTheFolder(name: string): Promise<Evidence>;
}

const clickingThePathTo = (driver: Driver, piece: string): Promise<void> =>
  driver.click('button', piece, { role: 'navigation', name: 'Where you are' });

const reaching = async (driver: Driver, piece: string): Promise<void> => {
  if (!shows(await driver.tree(), pieceNamed(piece))) {
    await clickingThePathTo(driver, 'The story');
  }
  await clicking(driver, piece);
};

const openingBeside = async (driver: Driver, piece: string): Promise<void> => {
  const named = pieceNamed(piece);
  await reaching(driver, piece);
  await driver.click('button', 'Open beside', { role: 'group', name: named });
};

export const projectWriterOn = (
  driver: Driver,
  opening: Opening,
  startFrom?: (project: SeededProject) => Promise<void>,
): ProjectWriter => ({
  ...writerOn(driver, opening, startFrom),
  ...yourProjectsWriterOn(driver),
  makesCurrent: (piece) => reaching(driver, piece),
  addsASceneUnder: async (beat) => {
    const named = pieceNamed(beat);
    await reaching(driver, beat);
    await driver.click('button', 'Add a scene', { role: 'group', name: named });
  },
  opensBeside: (piece) => openingBeside(driver, piece),
  clicksThePathTo: (piece) => clickingThePathTo(driver, piece),
  hovers: (piece) => driver.hover('group', pieceNamed(piece)),
  clicksOpenBesideOn: async (piece) => {
    const named = pieceNamed(piece);
    await driver.hover('group', named);
    await driver.click('button', 'Open beside', { role: 'group', name: named });
  },
  ...panelWriterOn(driver),
  // shortcut: a facet written "{facet} under {beat}" makes that beat current first, until the table can name a piece and its beat apart.
  types: async (text, at) => {
    const under = underABeat.exec(at.facet)?.groups;
    const beat = under?.['beat'];
    const facet = under?.['facet'] ?? at.facet;
    if (beat !== undefined) await reaching(driver, beat);
    await driver.type(text, facet, { role: 'group', name: at.piece });
  },
  typesBeside: (text, at) =>
    driver.type(text, at.facet, { role: 'complementary', name: pieceNamed(at.piece) }),
});

export const projectSeesOn = (driver: Driver, reads: AppReads): ProjectSees => ({
  ...yourProjectsSeesOn(driver),
  ...seesOn(driver, reads),
  pathIs: async (pieces) => {
    const path = await reads.path();
    if (path !== pieces.join('')) {
      throw new Error(`the path reads ${path || 'nothing'}, not ${pieces.join(' › ')}`);
    }
  },
  panelIsOpenOn: async (piece) => {
    const open = (await driver.tree()).some((line) =>
      line.toLowerCase().includes(`- complementary "${pieceNamed(piece).toLowerCase()}"`),
    );
    if (!open) throw new Error(`${piece} is not open beside the graph`);
    return reporting({ role: 'complementary', name: pieceNamed(piece) });
  },
  noPanelIsOpen: async () => {
    if ((await driver.tree()).some((line) => line.includes('- complementary'))) {
      throw new Error('something is open beside the graph');
    }
    return wholeTree();
  },
  readsBeside: async (piece, facet, text) => {
    const held = await driver.value(facet, { role: 'complementary', name: pieceNamed(piece) });
    if (held !== text) {
      throw new Error(
        `${piece}'s ${facet} beside the graph reads ${JSON.stringify(held)}, not ${JSON.stringify(text)}`,
      );
    }
    return reporting({
      role: 'textbox',
      name: facet,
      within: { role: 'complementary', name: pieceNamed(piece) },
    });
  },
  focusIsInTheParagraph: async () => {
    if (!(await driver.focusIs('textbox', 'Paragraph'))) {
      throw new Error('the focus is not in the paragraph beside the graph');
    }
  },
  yourProjectsIn: async (folder) =>
    reporting(
      { role: 'heading', name: 'Your projects' },
      { role: 'heading', name: `In ${folder}` },
      { role: 'paragraph' },
    ),
  namesTheProject: async (title) => reporting({ role: 'heading', name: title }),
  focusIsInTheSummary: async () => {
    const summary = { role: 'textbox', name: 'One-sentence summary' } as const;
    const story = { role: 'group', name: 'The story' } as const;
    if (!(await driver.focusIs('textbox', summary.name, story))) {
      throw new Error("the focus is not in the story's one-sentence summary");
    }
    return reportingFocus({ ...summary, within: story });
  },
  filesInTheFolder: async (name) => reporting({ role: 'folder', name }),
});

export const projectSteps = (
  writer: ProjectWriter,
  sees: ProjectSees,
  staged: Staged = nothingStaged,
): Record<string, StepAction> => ({
  ...graphSteps(writer, sees),
  ...yourProjectsSteps(writer),
  // shortcut: beat 2 is named here, until the phrase table can tell a piece's name from a facet's in "beat 4's paragraph is open beside the graph".
  'beat 2 is open beside the graph': async () => {
    await writer.opensANewProject();
    await writer.opensBeside('beat 2');
  },
  '{piece} is still open beside the graph': ({ piece }) => sees.panelIsOpenOn(piece),
  '{scene} under {beat} is open beside the graph, with its narrative and then its prose': ({
    scene,
  }) => sees.panelIsOpenOn(scene),
  "{piece}'s paragraph is open beside the graph": ({ piece }) => sees.panelIsOpenOn(piece),
  '{piece} is open beside the graph, with its paragraph and then its page': ({ piece }) =>
    sees.panelIsOpenOn(piece),
  'the writer opens {piece} beside the graph': ({ piece }) => writer.opensBeside(piece),
  'opens {piece} beside the graph': ({ piece }) => writer.opensBeside(piece),
  'the writer closes the panel': () => writer.closesThePanel(),
  'nothing is open beside the graph': () => sees.noPanelIsOpen(),
  'focus moves to the paragraph': () => sees.focusIsInTheParagraph(),
  'the writer has not chosen where to keep their projects': () =>
    staged.hasNotChosenWhereToKeepProjects(),
  'a folder "{name}" on the writer\'s machine is empty': ({ name }) =>
    staged.anEmptyFolderNamed(name),
  'the writer keeps their projects in a folder': () => staged.keepsProjectsInAFolderHolding([]),
  'the writer keeps their projects in a folder that holds a project\'s folder named "{title}"': ({
    title,
  }) => staged.keepsProjectsInAFolderHolding([title]),
  'the writer chooses "{name}" to keep their projects in': ({ name }) =>
    staged.choosesTheFolderNamed(name),
  'the writer chooses the folder of a project titled "{title}"': ({ title }) =>
    staged.choosesTheProjectFolder(title),
  'Your projects, in "{folder}", lists no projects': ({ folder }) => sees.yourProjectsIn(folder),
  'the header names the project "{title}"': ({ title }) => sees.namesTheProject(title),
  "focus is in the story's one-sentence summary": () => sees.focusIsInTheSummary(),
  'the new project\'s files are in a folder "{name}" beside it': ({ name }) =>
    sees.filesInTheFolder(name),
  'the files in "{name}" are as they were': ({ name }) => sees.filesInTheFolder(name),
  'the app says "{text}"': ({ text }) => sees.says(text),
  'the writer types "{text}" as {piece}\'s {facet}': ({ text, piece, facet }) =>
    facet.endsWith(besideTheGraph)
      ? writer.typesBeside(text, { piece, facet: facet.slice(0, -besideTheGraph.length) })
      : writer.types(text, { piece, facet }),
  '{piece}\'s {facet} beside the graph reads "{text}"': ({ piece, facet, text }) =>
    sees.readsBeside(piece, facet, text),
  'the writer adds a scene under {beat}': ({ beat }) => writer.addsASceneUnder(beat),
  'adds a scene under {beat}': ({ beat }) => writer.addsASceneUnder(beat),
  'the writer adds two scenes under {beat}': async ({ beat }) => {
    await writer.addsASceneUnder(beat);
    await writer.addsASceneUnder(beat);
  },
  'types "{text}" as {scene}\'s list line under {beat}': async ({ text, scene, beat }) => {
    await writer.makesCurrent(beat);
    if (!shows(await sees.tree(), scene)) throw new Error(`${scene} is not under ${beat}`);
    await writer.types(text, { piece: scene, facet: 'List line' });
  },
});
