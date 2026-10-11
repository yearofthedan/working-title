import { expect, it } from 'vite-plus/test';
import type { Project as Saved } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { expectApproved } from '../test-helpers/approved';
import { Scenario, printScenarios } from '../test-helpers/scenario';
import { openProject, type Focus } from './project';

// Serialises as browser storage does, so a reload gets a copy, never the object it saved.
const storeInMemory = (): ProjectStore => {
  let saved: string | undefined;
  return {
    load: async () => (saved === undefined ? undefined : (JSON.parse(saved) as Saved)),
    save: async (project) => {
      saved = JSON.stringify(project);
    },
  };
};

class App {
  readonly store = storeInMemory();
  focus?: Focus;

  async open(): Promise<void> {
    this.focus = await openProject(snowflakeExtended, this.store);
  }

  theStorysSummary() {
    const facet = this.focus?.facets.find(({ label }) => label === 'One-sentence summary');
    if (!facet) throw new Error('The story has no one-sentence summary to show');
    return facet;
  }
}

const aNewProject = async (s: Scenario, app: App) => {
  s.Given('a new project');
  await app.open();
};

const theWriterTypesAsTheStorysOneSentenceSummary = async (s: Scenario, app: App, text: string) => {
  s.When(`the writer types ${JSON.stringify(text)} as the story's one-sentence summary`);
  await app.focus?.elaborate(app.theStorysSummary().id, text);
};

const reloadsTheApp = async (s: Scenario, app: App) => {
  s.And('reloads the app');
  await app.open();
};

const theStorysOneSentenceSummaryReads = (s: Scenario, app: App, text: string) => {
  s.Then(`the story's one-sentence summary reads ${JSON.stringify(text)}`);
  expect(app.theStorysSummary().text).toBe(text);
};

it('keep the story sentence', async () => {
  const sentence = "A widow hunts the man who sank her husband's ship";
  const s = new Scenario('the story sentence survives a reload');
  const app = new App();
  await aNewProject(s, app);
  await theWriterTypesAsTheStorysOneSentenceSummary(s, app, sentence);
  await reloadsTheApp(s, app);
  theStorysOneSentenceSummaryReads(s, app, sentence);
  await expectApproved(
    printScenarios(
      "what the writer types as the story's one-sentence summary is still there after a reload.",
      [s],
    ),
  );
});
