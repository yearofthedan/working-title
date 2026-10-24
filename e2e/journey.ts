import type { AppScope } from '../src/test-helpers/scope';
import type { StepAction } from '../src/test-helpers/steps';
import { focusPageActions } from '../src/ui/focus/writer';

export const journeyActions = (scope: AppScope): Record<string, StepAction> => ({
  ...focusPageActions(scope),
  'a new project': async () => {
    await scope.fresh();
  },
  'reloads the app': async () => {
    await scope.reload();
  },
  'the writer types "{text}" as the story\'s {facet}': async ({ text, facet }) => {
    await scope.field(facet).enter(text);
  },
});
