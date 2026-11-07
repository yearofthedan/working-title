import type { Opening, ReloadingDriver } from '../src/test-helpers/driver';
import type { SeededProject } from '../src/test-helpers/seed';
import type { StepAction } from '../src/test-helpers/steps';
import { graphSteps, writerOn, type Sees, type Writer } from '../src/ui/graph/graph.dsl';

export interface Journey extends Writer {
  reloads(): Promise<void>;
}

export const journeyOn = (
  driver: ReloadingDriver,
  opening: Opening,
  startFrom?: (project: SeededProject) => Promise<void>,
): Journey => ({
  ...writerOn(driver, opening, startFrom),
  reloads: () => driver.reload(),
});

export const journeySteps = (journey: Journey, sees: Sees): Record<string, StepAction> => ({
  ...graphSteps(journey, sees),
  'reloads the app': () => journey.reloads(),
  '{piece}\'s {facet} reads "{text}"': ({ piece, facet, text }) => sees.reads(piece, facet, text),
});
