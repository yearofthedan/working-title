import type { AppScope } from '../src/test-helpers/scope';
import type { StepAction } from '../src/test-helpers/steps';
import { focusPageActions } from '../src/ui/focus/writer';

export const journeyActions = (scope: AppScope): Record<string, StepAction> => ({
  ...focusPageActions(scope),
  'a new project': async () => {
    await scope.fresh();
  },
  'the writer opens the app': async () => {
    await scope.fresh();
  },
  'reloads the app': async () => {
    await scope.reload();
  },
  'the writer types "{text}" as {piece}\'s {facet}': async ({ text, piece, facet }) => {
    await scope.group(piece).field(facet).enter(text);
  },
  'adds a scene under {beat}': async ({ beat }) => {
    await scope.group(beat).press('Add a scene');
  },
  'types "{text}" as {scene}\'s list line under {beat}': async ({ text, scene, beat }) => {
    await scope.group(beat).group(scene).field('List line').enter(text);
  },
});
