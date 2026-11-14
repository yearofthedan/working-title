export type StepKeyword = 'Given' | 'When' | 'Then' | 'And' | 'But';

export type StepKind = 'Given' | 'When' | 'Then';

export interface Step {
  readonly keyword: StepKeyword;
  readonly phrase: string;
  readonly observed?: readonly string[];
}

export interface Scenario {
  readonly behaviour: string;
  readonly steps: readonly Step[];
}

export const OBSERVED = 'the writer sees';

export interface ScenarioFile {
  readonly rule: string;
  readonly sees?: 'the app';
  readonly serves?: 'a private build';
  readonly scenarios: readonly Scenario[];
}

const rank = { Given: 0, When: 1, Then: 2 } as const;
const stepKeywords = Object.keys(rank) as (keyof typeof rank)[];

const stepLine = /^(Given|When|Then|And|But) (.+)$/;
const looksLikeAStep = new RegExp(`^(${stepKeywords.join('|')})\\b`, 'i');

const oneLine = (what: string, line: string): string => {
  if (line.trim() === '') {
    throw new Error(`${what} is one non-empty line, not ${JSON.stringify(line)}`);
  }
  return line;
};

export const kindOf = (steps: readonly Step[], at: number): StepKind => {
  for (let before = at; before >= 0; before -= 1) {
    const keyword = steps[before]?.keyword;
    if (keyword === 'Given' || keyword === 'When' || keyword === 'Then') return keyword;
  }
  throw new Error(`Step ${at + 1} follows no Given, When or Then`);
};

const stepIn = (line: string, soFar: readonly Step[], at: number): Step => {
  const plain = stepLine.exec(line);
  if (plain) {
    const keyword = plain[1] as StepKeyword;
    if (keyword === 'And') {
      if (soFar.length === 0) throw new Error(`Line ${at} is an "and" with no step before it`);
      return { keyword, phrase: oneLine('A step phrase', plain[2]) };
    }
    const last = [...soFar]
      .reverse()
      .find((step) => step.keyword !== 'And' && step.keyword !== 'But');
    if (keyword === 'But') {
      if (last?.keyword !== 'Then') {
        throw new Error(`Line ${at} is a "but" before any Then: a "but" follows a Then`);
      }
      return { keyword, phrase: oneLine('A step phrase', plain[2]) };
    }
    if (last && rank[keyword] < rank[last.keyword as keyof typeof rank]) {
      throw new Error(
        `Line ${at} is a ${keyword} after a ${last.keyword}: a scenario reads Given, When, Then`,
      );
    }
    return { keyword, phrase: oneLine('A step phrase', plain[2]) };
  }
  throw new Error(`Line ${at} reads as a step but is not one: ${JSON.stringify(line)}`);
};

const isStepLine = (line: string): boolean => stepLine.test(line);

const isObservedLine = (line: string): boolean => /^\s*- /.test(line);

const firstDifference = (printed: string, text: string): number => {
  const a = printed.split('\n');
  const b = text.split('\n');
  const at = a.findIndex((line, index) => line !== b[index]);
  return (at === -1 ? Math.min(a.length, b.length) : at) + 1;
};

export const readScenarioFile = (text: string): ScenarioFile => {
  if (text.includes('\r')) {
    throw new Error('A scenario file has LF line endings, and this one holds a carriage return');
  }
  const lines = (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n');
  const ruleLine = lines[0] ?? '';
  if (!ruleLine.startsWith('Rule: ')) {
    throw new Error(`A scenario file opens with "Rule: ", not ${JSON.stringify(ruleLine)}`);
  }
  const rule = oneLine('A rule', ruleLine.slice('Rule: '.length));
  let sees: 'the app' | undefined;
  let serves: 'a private build' | undefined;
  let first = 1;
  for (const line of lines.slice(1, 3)) {
    if (line?.startsWith('Sees: ') === true) {
      const value = line.slice('Sees: '.length);
      if (value !== 'the app') {
        throw new Error(
          `A scenario file sees "the app" or names nothing, not ${JSON.stringify(value)}`,
        );
      }
      sees = value;
    } else if (line?.startsWith('Serves: ') === true) {
      const value = line.slice('Serves: '.length);
      if (value !== 'a private build') {
        throw new Error(
          `A scenario file serves "a private build" or names nothing, not ${JSON.stringify(value)}`,
        );
      }
      serves = value;
    } else break;
    first += 1;
  }

  const scenarios: Scenario[] = [];
  let behaviour: string | undefined;
  let steps: Step[] = [];
  let inFence = false;

  const close = () => {
    if (behaviour === undefined) return;
    if (steps.length === 0) {
      throw new Error(`The scenario ${JSON.stringify(behaviour)} holds no step`);
    }
    steps.forEach((step, at) => {
      if (step.phrase !== OBSERVED) return;
      const kind = kindOf(steps, at);
      if (kind !== 'Then') {
        throw new Error(
          `"${OBSERVED}" follows a Then, and here it is a ${step.keyword} at ${at + 1} of ${steps.length}, under a ${kind}`,
        );
      }
    });
    scenarios.push({ behaviour, steps });
    behaviour = undefined;
    steps = [];
  };

  for (const [index, line] of lines.slice(first).entries()) {
    const at = index + first + 1;
    const last = steps.length - 1;

    if (line.startsWith('```')) {
      if (line !== '```') {
        throw new Error(`Line ${at} has something after the backticks: ${JSON.stringify(line)}`);
      }
      if (!inFence) {
        if (behaviour === undefined) {
          throw new Error(`Line ${at} opens a block with no scenario heading above it`);
        }
        inFence = true;
        continue;
      }
      inFence = false;
      close();
      continue;
    }

    if (line.startsWith('### Scenario: ')) {
      if (inFence) throw new Error(`Line ${at} opens a scenario inside a block that is still open`);
      close();
      behaviour = oneLine('A behaviour', line.slice('### Scenario: '.length));
      continue;
    }

    if (inFence) {
      if (line.trim() === '') {
        throw new Error(`Line ${at} is blank between steps: ${JSON.stringify(line)}`);
      }
      if (isStepLine(line) || looksLikeAStep.test(line)) {
        steps.push(stepIn(line, steps, at));
        continue;
      }
      const held = steps[last];
      if (held === undefined) {
        throw new Error(
          `Line ${at} is not a step, and only a Then is followed by what the runner observed: ${JSON.stringify(line)}`,
        );
      }
      const kind = kindOf(steps, last);
      if (kind !== 'Then') {
        throw new Error(
          `Line ${at} is not a step, and a ${kind} is followed by no block, and only a Then is followed by what the runner observed: ${JSON.stringify(line)}`,
        );
      }
      if (!isObservedLine(line)) {
        throw new Error(
          `Line ${at} is neither a step nor what the runner prints: ${JSON.stringify(line)}`,
        );
      }
      steps[last] = { ...held, observed: [...(held.observed ?? []), line] };
      continue;
    }

    if (line === '') continue;
    throw new Error(`Line ${at} is inside a scenario outside its block: ${JSON.stringify(line)}`);
  }

  if (inFence) throw new Error('The last block is not closed');
  close();
  if (scenarios.length === 0) throw new Error('A scenario file holds at least one scenario');

  const file = {
    rule,
    ...(sees === undefined ? {} : { sees }),
    ...(serves === undefined ? {} : { serves }),
    scenarios,
  };
  const printed = printScenarioFile(file);
  if (printed !== text) {
    throw new Error(
      `A scenario file reads as it prints, and this one does not, from line ${firstDifference(printed, text)}`,
    );
  }
  return file;
};

export const printScenarioFile = ({ rule, sees, serves, scenarios }: ScenarioFile): string =>
  [
    `Rule: ${rule}`,
    ...(sees === undefined ? [] : [`Sees: ${sees}`]),
    ...(serves === undefined ? [] : [`Serves: ${serves}`]),
    ...scenarios.flatMap(({ behaviour, steps }) => [
      '',
      `### Scenario: ${behaviour}`,
      '',
      '```',
      ...steps.flatMap((step) => [`${step.keyword} ${step.phrase}`, ...(step.observed ?? [])]),
      '```',
    ]),
  ].join('\n') + '\n';

export const withObserved = (
  text: string,
  behaviour: string,
  blocks: readonly (readonly string[])[],
): string => {
  const file = readScenarioFile(text);
  if (!file.scenarios.some((scenario) => scenario.behaviour === behaviour)) {
    throw new Error(`The file holds no scenario named ${JSON.stringify(behaviour)}`);
  }
  return printScenarioFile({
    ...file,
    scenarios: file.scenarios.map((scenario) => {
      if (scenario.behaviour !== behaviour) return scenario;
      const thens = scenario.steps.filter((_, at) => kindOf(scenario.steps, at) === 'Then').length;
      if (thens !== blocks.length) {
        throw new Error(
          `${behaviour} holds ${thens} Then-kind steps and was handed ${blocks.length} block${blocks.length === 1 ? '' : 's'}`,
        );
      }
      let seen = 0;
      const steps = scenario.steps.map((step, at) => {
        if (kindOf(scenario.steps, at) !== 'Then') return step;
        const block = blocks[seen++] ?? [];
        return { ...step, ...(block.length === 0 ? { observed: undefined } : { observed: block }) };
      });
      return { ...scenario, steps };
    }),
  });
};
