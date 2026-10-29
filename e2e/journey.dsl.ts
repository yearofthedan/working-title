import type { ReloadingDriver } from '../src/test-helpers/driver';
import type { StepAction } from '../src/test-helpers/steps';
import { graphSteps, writerOn, type Sees, type Writer } from '../src/ui/graph/graph.dsl';

export interface Journey extends Writer {
  reloads(): Promise<void>;
}

export const journeyOn = (driver: ReloadingDriver): Journey => ({
  ...writerOn(driver),
  reloads: () => driver.reload(),
});

export const journeySteps = (journey: Journey, sees: Sees): Record<string, StepAction> => ({
  ...graphSteps(journey, sees),
  'reloads the app': () => journey.reloads(),
  'the writer types "{text}" as {piece}\'s {facet}': ({ text, piece, facet }) =>
    journey.types(text, { piece, facet }),
});
