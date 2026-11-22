import type { Opening, ReloadingDriver } from '../src/test-helpers/drivers/driver';
import type { SeededProject } from '../src/test-helpers/seed/seed';
import type { StepAction } from '../src/test-helpers/runner/steps';
import {
  projectSteps,
  projectWriterOn,
  type ProjectSees,
  type ProjectWriter,
} from '../src/ui/project/project.dsl';

export interface Journey extends ProjectWriter {
  reloads(): Promise<void>;
}

export const journeyOn = (
  driver: ReloadingDriver,
  opening: Opening,
  startFrom?: (project: SeededProject) => Promise<void>,
): Journey => ({
  ...projectWriterOn(driver, opening, startFrom),
  reloads: () => driver.reload(),
});

export const journeySteps = (journey: Journey, sees: ProjectSees): Record<string, StepAction> => ({
  ...projectSteps(journey, sees),
  'reloads the app': () => journey.reloads(),
});
