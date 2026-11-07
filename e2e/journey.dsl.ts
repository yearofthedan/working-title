import type { Opening, ReloadingDriver } from '../src/test-helpers/driver';
import type { SeededProject } from '../src/test-helpers/seed';
import type { StepAction } from '../src/test-helpers/steps';
import { appSteps, appWriterOn, type AppSees, type AppWriter } from '../src/ui/app/app.dsl';

export interface Journey extends AppWriter {
  reloads(): Promise<void>;
}

export const journeyOn = (
  driver: ReloadingDriver,
  opening: Opening,
  startFrom?: (project: SeededProject) => Promise<void>,
): Journey => ({
  ...appWriterOn(driver, opening, startFrom),
  reloads: () => driver.reload(),
});

export const journeySteps = (journey: Journey, sees: AppSees): Record<string, StepAction> => ({
  ...appSteps(journey, sees),
  'reloads the app': () => journey.reloads(),
});
