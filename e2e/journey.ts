import type { AppScope } from '../src/test-helpers/scope';
import type { StepAction } from '../src/test-helpers/steps';
import { focusPageActions } from '../src/ui/focus/writer';

export const journeyActions = (scope: AppScope): Record<string, StepAction> => ({
  ...focusPageActions(scope),
  'reloads the app': async () => {
    await scope.reload();
  },
  'the writer types "{text}" as {piece}\'s {facet}': async ({ text, piece, facet }) => {
    await scope.group(piece).field(facet).enter(text);
  },
});
