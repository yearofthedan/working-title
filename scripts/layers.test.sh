#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"
PATH="$root/node_modules/.bin:$PATH"
export PATH

project="$work/project"
layers='domain application ports adapters ui'

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%s\n' "$2" >"$project/$1"
}
may_not_import() {
  case "$1" in
  domain) echo 'application ports adapters ui' ;;
  application) echo 'adapters ui' ;;
  ports) echo 'application adapters ui' ;;
  adapters) echo 'application ui' ;;
  ui) echo 'domain ports adapters' ;;
  esac
}
refused() {
  if [ "$status" -ne 0 ]; then ok "$1"; else no "$1"; fi
}
allowed() {
  if [ "$status" -eq 0 ]; then ok "$1"; else no "$1 (exit $status)"; fi
}
not_out() {
  if grep -qF "$1" "$work/out"; then no "$2"; else ok "$2"; fi
}
not_err() {
  if grep -qF "$1" "$work/err"; then no "$2"; else ok "$2"; fi
}

run_layers() {
  status=0
  (cd "$project" && "$root/scripts/layers") >"$work/out" 2>"$work/err" || status=$?
}

run_do layers
expect_status 0 "the imports this repository has keep the direction"
not_out '(0 modules' "the crawl of this repository read its files"

for from in $layers; do
  for to in $layers; do
    [ "$from" = "$to" ] && continue
    write "src/$from/to-$to.ts" "import { two } from '../$to/two';
export const one = two;"
    write "src/$to/two.ts" "export const two = 'x';"
  done
done
write src/ui/round.ts "import { back } from './back';
export const round = back;"
write src/ui/back.ts "import { round } from './round';
export const back = round;"
write src/domain/enum.ts "import { two } from '../ui/two';
export enum Thing { One }
export const thing = (label: string): Thing => (label === two ? Thing.One : Thing.One);"
write src/ui/type-only.ts "import type { Story } from '../domain/story';
export const summary = (story: Story): string => story.summary;"
write src/domain/story.ts "export interface Story { summary: string }"
write src/ui/re-export-type.ts "export type { Story } from '../domain/story';"
run_layers
refused "a project with an import out of turn is refused"

for from in $layers; do
  for to in $layers; do
    [ "$from" = "$to" ] && continue
    if printf '%s' "$(may_not_import "$from")" | grep -qw "$to"; then
      expect_out "layer-direction-$from: src/$from/to-$to.ts → src/$to/two.ts" \
        "$from importing $to is refused, by the rule for $from"
    else
      not_out "src/$from/to-$to.ts" "$from importing $to is allowed"
    fi
  done
done

expect_out 'layer-direction-domain: src/domain/enum.ts → src/ui/two.ts' \
  "a file of TypeScript syntax is refused"
expect_out 'layer-direction-ui: src/ui/type-only.ts → src/domain/story.ts' \
  "an import of a type over a layer is refused"
expect_out 'layer-direction-ui: src/ui/re-export-type.ts → src/domain/story.ts' \
  "a type re-exported over a layer is refused"

expect_out 'no-circular: src/ui/back.ts →' "a cycle is refused"
expect_out 'src/ui/round.ts →' "the cycle is shown round to back"
expect_out '0002-hexagonal-layers.md' "the refusal links the record"

rm -rf "$project/src"
write src/domain/story.ts 'export type Story = { summary: string };'
write src/application/plan.ts "import type { Story } from '../domain/story';
export const plan = (story: Story) => story.summary;"
run_layers
allowed "imports that point inward are allowed"
not_out 'error' "nothing is reported where there is nothing to refuse"

rm -rf "$project/src"
write src/test-helpers/drivers/driver.ts 'export interface Driver { fresh(): Promise<void> }'
write src/test-helpers/drivers/playwright.driver.ts "import type { Driver } from './driver';
export const playwrightDriver = (): Driver => ({ fresh: async () => undefined });"
write src/test-helpers/drivers/vitest-browser.driver.ts "import type { Driver } from './driver';
export const vitestBrowserDriver = (): Driver => ({ fresh: async () => undefined });"
write src/test-helpers/runner/steps.ts 'export type StepAction = () => void;'
write src/ui/focus/focus.dsl.ts "import type { Driver } from '../../test-helpers/drivers/driver';
export const writerOn = (driver: Driver): Driver => driver;"
run_layers
allowed "a language file on the driver contract, and the drivers under it, are allowed"

write src/ui/focus/focus.dsl.ts "import type { StepAction } from '../../test-helpers/runner/steps';
export const steps = (): StepAction => () => undefined;"
run_layers
refused "a language file that does not import the driver contract is refused"
expect_out 'dsl-on-the-driver-contract: src/ui/focus/focus.dsl.ts' "the file that skips the contract is named"
expect_out 'standards/testing.md' "the refusal links the standard"

write src/ui/focus/focus.dsl.ts "import type { Driver } from '../../test-helpers/drivers/driver';
import { playwrightDriver } from '../../test-helpers/drivers/playwright.driver';
export const writerOn = (driver: Driver): unknown => playwrightDriver;"
run_layers
refused "a language file importing a protocol driver is refused"
expect_out 'dsl-not-on-a-driver: src/ui/focus/focus.dsl.ts → src/test-helpers/drivers/playwright.driver.ts' \
  "the driver it reached is shown"

write src/ui/focus/story-page.ts "import { writerOn } from './focus.dsl';
export const page = writerOn;"
run_layers
refused "a file outside the scenario layers importing a language file is refused"
expect_out 'scenario-code-in-test-helpers: src/ui/focus/story-page.ts → src/ui/focus/focus.dsl.ts' \
  "the language file it reached is shown"

rm -rf "$project/src"
write src/test-helpers/drivers/driver.ts 'export interface Driver { fresh(): Promise<void> }'
write src/ui/focus/focus.dsl.ts "import type { Driver } from '../../test-helpers/drivers/driver';
export const writerOn = (driver: Driver): Driver => driver;"
write src/ui/focus/focus.dsl.component.test.ts "import { writerOn } from './focus.dsl';
export const judge = writerOn;"
write src/test-helpers/runner.ts "import { writerOn } from '../ui/focus/focus.dsl';
export const run = writerOn;"
run_layers
allowed "a test file and src/test-helpers/ reach a language file"
not_out 'error' "nothing is reported where the scenario layers keep to themselves"

write e2e/journey.dsl.ts "import type { StepAction } from '../src/test-helpers/runner/steps';
export const steps = (): StepAction => () => undefined;"
run_layers
refused "a journey language file that does not import the driver contract is refused"
expect_out 'dsl-on-the-driver-contract: e2e/journey.dsl.ts' "the language file in e2e/ is named"

write e2e/journey.dsl.ts "import type { Driver } from '../src/test-helpers/drivers/driver';
export const journeyOn = (driver: Driver): Driver => driver;"
write e2e/journey.spec.ts "import { journeyOn } from './journey.dsl';
export const journey = journeyOn;"
run_layers
allowed "the journey language on the driver contract is allowed, and a spec reaches it"
not_out 'error' "nothing is reported of e2e/ keeping to the contract"

write src/ui/focus/focus.dom.ts "export const card = (): string => 'card';"
write src/ui/focus/graph.ts "import { card } from './focus.dom';
export const graph = card;"
run_layers
refused "a plain file in src/ui/ importing a *.dom.ts is refused"
expect_out 'logic-not-on-the-dom: src/ui/focus/graph.ts → src/ui/focus/focus.dom.ts' \
  "the two files it joins are named"
expect_out 'standards/testing.md' "the refusal links the standard"

rm -f "$project/src/ui/focus/graph.ts"
write src/ui/focus/cards.dom.ts "import { card } from './focus.dom';
export const cards = card;"
write src/ui/focus/graph.component.test.ts "import { card } from './focus.dom';
export const judge = card;"
run_layers
allowed "a *.dom.ts importing a *.dom.ts, and a component test importing one, are allowed"
not_out 'logic-not-on-the-dom' "the rule says nothing where the DOM is in a *.dom.ts"

rm -rf "$project/src/ui"
write src/ui/card/card.ts "export type CardLook = 'card' | 'chip';
export const looks: readonly CardLook[] = ['card', 'chip'];"
write src/ui/card/card.dom.ts "export const renderCard = (): string => 'card';"
write src/ui/graph/graph.dom.ts "import { looks } from '../card/card';
export const renderGraph = (): number => looks.length;"
run_layers
refused "a component importing a value from another component's plain module is refused"
expect_out 'a-component-through-its-render: src/ui/graph/graph.dom.ts → src/ui/card/card.ts' \
  "the two files it joins are named"
expect_out 'project-structure.md' "the refusal links the page that sets the rule"

write src/ui/graph/graph.dom.ts "import { renderCard } from '../card/card.dom';
import type { CardLook } from '../card/card';
export const renderGraph = (look: CardLook): string => renderCard() + look;"
write src/ui/graph/graph.test.ts "import { looks } from '../card/card';
export const judged = looks;"
write src/ui/card/card.test.ts "import { looks } from './card';
export const judged = looks;"
run_layers
allowed "another component's *.dom.ts, a type from its plain module, its own plain module and a test reaching across are allowed"
not_out 'a-component-through-its-render' "the rule says nothing where a component goes through the render"

rm -rf "$project/src/ui"
write src/ui/project/graph/card/card.ts "export type CardLook = 'card' | 'chip';
export const looks: readonly CardLook[] = ['card', 'chip'];"
write src/ui/project/graph/card/card.dom.ts "export const renderCard = (): string => 'card';"
write src/ui/project/graph/graph.dom.ts "import { looks } from './card/card';
export const renderGraph = (): number => looks.length;"
run_layers
refused "a component nested in another importing its own nested component's plain module is refused"
expect_out 'a-component-through-its-render: src/ui/project/graph/graph.dom.ts → src/ui/project/graph/card/card.ts' \
  "the two nested files it joins are named"

write src/ui/project/graph/graph.dom.ts "import { p } from '../panel/panel';
export const renderGraph = (): number => p;"
write src/ui/project/panel/panel.ts "export const p = 1;"
write src/ui/project/panel/panel.dom.ts "export const renderPanel = (): number => 1;"
run_layers
refused "a nested component importing its sibling's plain module is refused"
expect_out 'a-component-through-its-render: src/ui/project/graph/graph.dom.ts → src/ui/project/panel/panel.ts' \
  "the two files it joins are named"

rm -rf "$project/src/ui/project/panel"
write src/ui/project/graph/graph.dom.ts "import { renderCard } from './card/card.dom';
import type { CardLook } from './card/card';
import { looks } from './graph';
export const renderGraph = (look: CardLook): string => renderCard() + looks.length + look;"
write src/ui/project/graph/graph.ts "export const looks: readonly string[] = ['graph'];"
run_layers
allowed "a nested component's own plain module, a nested component's *.dom.ts and a type from its plain module are allowed"
not_out 'a-component-through-its-render' "the rule says nothing where a nested component goes through the render"

rm -rf "$project/src" "$project/e2e"
write src/domain/story.ts 'export type Story = { summary: string };'
write src/test-helpers/runner/raw-glob.ts 'export interface RawGlob { glob(pattern: string, options: { query: string; import: string; eager: true }): Record<string, string>; }'
write src/ui/focus/scenarios/a-rule.approved.md "Rule: A rule
"
run_layers
refused "a scenarios folder with no test beside it is refused"
expect_err 'src/ui/focus/scenarios has no test beside it' "the refusal names the folder"

write src/ui/focus/focus.component.test.ts 'const glob = "/src/ui/focus/scenarios/*.approved.md";'
run_layers
allowed "a component test beside the folder that reads it is allowed"

write src/ui/focus/focus.component.test.ts 'const glob = "/src/ui/other/scenarios/*.approved.md";'
run_layers
refused "a test beside the folder that reads a different folder is refused"

rm -f "$project/src/ui/focus/focus.component.test.ts"
write src/ui/focus/focus.test.ts 'const glob = "/src/ui/focus/scenarios/*.approved.md";'
run_layers
refused "a test that is not a component test is refused"

rm -rf "$project/src" "$project/e2e"
write src/domain/story.ts 'export type Story = { summary: string };'
write src/test-helpers/measures/frames.ts 'export const easesOut = (easing = ""): boolean => easing === "ease-out";'
write src/ui/graph/test-helpers/measures.ts 'export const heightOf = (element: Element): number => element.clientHeight;'
write src/ui/graph/graph.component.test.ts "import { heightOf } from './test-helpers/measures';
export const judged = heightOf;"
run_layers
allowed "a component's own file reaching its test-helpers/ is allowed"
not_out 'helpers-of-' "the folder's rule says nothing where the folder itself reads its helper"

write src/ui/panel/panel.component.test.ts "import { heightOf } from '../graph/test-helpers/measures';
export const judged = heightOf;"
run_layers
refused "a sibling component reaching another's test-helpers/ is refused"
expect_out 'helpers-of-src-ui-graph: src/ui/panel/panel.component.test.ts → src/ui/graph/test-helpers/measures.ts' \
  "the folder it reached is named"
expect_out 'standards/testing.md' "the refusal links the standard"

rm -f "$project/src/ui/panel/panel.component.test.ts"
write src/ui/above.ts "import { heightOf } from './graph/test-helpers/measures';
export const measured = heightOf;"
run_layers
refused "a file above a component reaching its test-helpers/ is refused"

rm -f "$project/src/ui/above.ts"
write src/ui/your-projects/start-a-project/test-helpers/seed.ts 'export const aProject = (): number => 1;'
write src/ui/your-projects/start-a-project/start-a-project.harness.ts "import { aProject } from './test-helpers/seed';
export const staged = aProject;"
run_layers
allowed "the component that holds the test-helpers/ reaches it"

write src/ui/your-projects/your-projects.harness.ts "import { aProject } from './start-a-project/test-helpers/seed';
export const staged = aProject;"
run_layers
refused "a parent reaching a child's test-helpers/ is refused"

rm -f "$project/src/ui/your-projects/your-projects.harness.ts"
write src/domain/project.test.ts "import { easesOut } from '../test-helpers/measures/frames';
export const judged = easesOut;"
run_layers
allowed "a file anywhere in src/ reaching src/test-helpers/ is allowed"

write e2e/journey.spec.ts "import { easesOut } from '../src/test-helpers/measures/frames';
export const measured = easesOut;"
run_layers
allowed "e2e/ reaching src/test-helpers/ is allowed"

write e2e/journey.spec.ts "import { heightOf } from '../src/ui/graph/test-helpers/measures';
export const measured = heightOf;"
run_layers
refused "e2e/ reaching a folder's test-helpers/ is refused"
expect_out 'helpers-of-src-ui-graph: e2e/journey.spec.ts' "the file in e2e/ is named"

rm -rf "$project/src" "$project/e2e"
write src/test-helpers/drivers/driver.ts 'export interface Driver { fresh(): Promise<void> }'
write src/test-helpers/staging/staging.ts 'export const root = (tag: string): string => tag;'
write src/test-helpers/drivers/vitest-browser.driver.ts "import { root } from '../staging/staging';
export const vitestBrowserDriver = root;"
run_layers
refused "a driver importing a staging helper is refused"
expect_out 'test-helpers-kind-drivers: src/test-helpers/drivers/vitest-browser.driver.ts → src/test-helpers/staging/staging.ts' \
  "the two helpers it joins are named"
expect_out 'standards/testing.md' "the refusal links the standard"

write src/test-helpers/drivers/vitest-browser.driver.ts 'export const vitestBrowserDriver = (): number => 1;'
write src/adapters/file-system-folders.ts 'export interface DirectoryPicker { pick(): Promise<void> }
export const fileSystemFolders = (): DirectoryPicker => ({ pick: async () => undefined });'
write src/test-helpers/staging/staging.ts "import { fileSystemFolders } from '../../adapters/file-system-folders';
export const root = fileSystemFolders;"
run_layers
refused "a staging helper importing an adapter is refused"
expect_out 'test-helpers-kind-staging: src/test-helpers/staging/staging.ts → src/adapters/file-system-folders.ts' \
  "the adapter it reached is named"

write src/test-helpers/staging/staging.ts "import type { DirectoryPicker } from '../../adapters/file-system-folders';
export const root = (picker: DirectoryPicker): DirectoryPicker => picker;"
run_layers
allowed "a staging helper importing a type from an adapter is allowed"
not_out 'test-helpers-kind-staging' "the staging rule lets a type-only import through"

write src/test-helpers/folders/folders.ts "import { root } from '../staging/staging';
export const theEntriesIn = root;"
run_layers
refused "a folders helper importing a staging helper is refused"
expect_out 'test-helpers-kind-folders: src/test-helpers/folders/folders.ts → src/test-helpers/staging/staging.ts' \
  "the staging helper it reached is named"

write src/test-helpers/folders/folders.ts 'export const theEntriesIn = (): readonly string[] => [];'
write src/test-helpers/runner/play.ts "import { aProject } from '../seed/seed';
export const playScenarios = aProject;"
write src/test-helpers/seed/seed.ts 'export const aProject = (): number => 1;'
run_layers
refused "a runner helper importing a seed helper is refused"
expect_out 'test-helpers-kind-runner: src/test-helpers/runner/play.ts → src/test-helpers/seed/seed.ts' \
  "the seed helper it reached is named"

write src/test-helpers/runner/play.ts 'export const playScenarios = (): number => 1;'
write src/test-helpers/seed/seed.ts "import { root } from '../staging/staging';
export const aProject = root;"
run_layers
refused "a seed helper importing a staging helper is refused"
expect_out 'test-helpers-kind-seed: src/test-helpers/seed/seed.ts → src/test-helpers/staging/staging.ts' \
  "the staging helper it reached is named"

write src/test-helpers/seed/seed.ts 'export const aProject = (): number => 1;'
write src/test-helpers/seed/seed.test.ts "import { root } from '../staging/staging';
export const judged = root;"
run_layers
allowed "a test beside a helper importing another kind is allowed"
not_out 'test-helpers-kind-' "the kind rules say nothing of a test"

rm -rf "$project/src"
write src/ui/project/graph/card/card.test-page.ts 'export const nameOf = (): string => "card";'
write src/ui/project/graph/test-helpers/measures.ts "import { nameOf } from '../card/card.test-page';
export const heightOf = (): string => nameOf();"
run_layers
allowed "a test-helper reaching a component it holds is allowed"
not_out 'test-code-of-its-own-component' "the direction rule says nothing of a held component"
not_out 'a-component-through-its-render' "the render rule says nothing of a test-helper"

write src/ui/card/card.test-page.ts 'export const nameOf = (): string => "card";'
write src/ui/graph/test-helpers/measures.ts "import { nameOf } from '../../card/card.test-page';
export const heightOf = (): string => nameOf();"
run_layers
refused "a test-helper reaching a sibling component's test page is refused"
not_out 'a-component-through-its-render' "the render rule says it is not that rule"

expect_out 'test-code-of-its-own-component: src/ui/graph/test-helpers/measures.ts → src/ui/card/card.test-page.ts' \
  "the test page it reached is shown"

expect_out 'standards/testing.md' "the refusal links the standard"

rm -rf "$project/src"
write src/domain/story.ts 'export type Story = { summary: string };'
write src/ports/project-store.ts "import type { Story } from '../domain/story';
export interface ProjectStore { load(): Promise<Story | undefined> }"
write src/adapters/file-system-folders.ts 'export interface DirectoryPicker { pick(): Promise<void> }
export const fileSystemFolders = (): DirectoryPicker => ({ pick: async () => undefined });'
write src/ui/project/test-helpers/seed.ts "import { fileSystemFolders } from '../../../adapters/file-system-folders';
import type { Story } from '../../../domain/story';
import type { ProjectStore } from '../../../ports/project-store';
export const stored = async (store: ProjectStore, story: Story): Promise<ProjectStore> => {
  void story;
  void fileSystemFolders;
  return store;
};"
run_layers
allowed "a test-helper reaching the domain, the ports and an adapter is allowed"
not_out 'layer-direction' "the layer rules say nothing of a test-helper"

write src/ui/project/test-helpers/measures.ts 'export const heightOf = (element: Element): number => element.clientHeight;'
write src/ui/project/project.dom.ts "import { heightOf } from './test-helpers/measures';
export const renderProject = heightOf;"
run_layers
refused "a plain src/ui/ file importing a test-helpers/ file is refused"
expect_out 'scenario-code-in-test-helpers: src/ui/project/project.dom.ts → src/ui/project/test-helpers/measures.ts' \
  "the helper it reached is shown"

rm -f "$project/src/ui/project/project.dom.ts"
write src/ui/project/project.test-page.ts "import { heightOf } from './test-helpers/measures';
export const measured = heightOf;"
run_layers
allowed "a test page reaching its own component's test-helpers/ is allowed"
not_out 'scenario-code-in-test-helpers' "the rule says nothing of a test page"

rm -rf "$project/src"
write src/ui/project/panel/panel.test-page.ts 'export const thePanelOn = (): string => "panel";'
write src/ui/project/graph/graph.test-page.ts "import { thePanelOn } from '../panel/panel.test-page';
export const everyCard = thePanelOn;"
run_layers
refused "a component's test page reaching its sibling's is refused"
expect_out 'test-code-of-its-own-component: src/ui/project/graph/graph.test-page.ts → src/ui/project/panel/panel.test-page.ts' \
  "the sibling's test page is named"

expect_out 'standards/testing.md' "the refusal links the standard"

rm -f "$project/src/ui/project/graph/graph.test-page.ts"
write src/ui/project/project.test-page.ts 'export const thePageHolds = (): string => "page";'
write src/ui/project/panel/panel.test-page.ts "import { thePageHolds } from '../project.test-page';
export const thePanelOn = thePageHolds;"
run_layers
refused "a held component's test page reaching its holder's is refused"
expect_out 'test-code-of-its-own-component: src/ui/project/panel/panel.test-page.ts → src/ui/project/project.test-page.ts' \
  "the holder's test page is named"

write src/ui/project/panel/panel.test-page.ts 'export const thePanelOn = (): string => "panel";'
write src/ui/project/project.test-page.ts "import { thePanelOn } from './panel/panel.test-page';
export const thePageHolds = thePanelOn;"
run_layers
allowed "a holder's test page reaching its held component's is allowed"
not_out 'test-code-of-its-own-component' "the rule says nothing where the component is held"

write src/ui/your-projects/your-projects.test-page.ts 'export const yourProjects = (): string => "y";'
write src/ui/project/project.test-page.ts "import { yourProjects } from '../your-projects/your-projects.test-page';
export const thePageHolds = yourProjects;"
run_layers
allowed "project's test page reaching your-projects' is allowed, as it tests start-up"
not_out 'test-code-of-its-own-component' "the exception is written in the rule"

finish
