export type StepKeyword = 'Given' | 'When' | 'Then' | 'And';

export interface Step {
  readonly keyword: StepKeyword;
  readonly phrase: string;
}

export interface Scenario {
  readonly behaviour: string;
  readonly steps: readonly Step[];
  /** What the runner observed, kept as written: the parser reads no meaning into it. */
  readonly observed?: readonly string[];
}

/** The step a scenario ends with: the runner prints the page there, and the block under it. */
export const OBSERVED = 'the writer sees';

export interface ScenarioFile {
  readonly rule: string;
  readonly scenarios: readonly Scenario[];
}

const rank = { Given: 0, When: 1, Then: 2 } as const;
const stepKeywords = Object.keys(rank) as (keyof typeof rank)[];

const stepLine = /^(Given|When|Then|And) (.+)$/;
const looksLikeAStep = new RegExp(`^(${stepKeywords.join('|')})\\b`, 'i');

const oneLine = (what: string, line: string): string => {
  if (line.trim() === '') {
    throw new Error(`${what} is one non-empty line, not ${JSON.stringify(line)}`);
  }
  return line;
};

const stepIn = (line: string, soFar: readonly Step[], at: number): Step => {
  const plain = stepLine.exec(line);
  if (plain) {
    const keyword = plain[1] as StepKeyword;
    if (keyword === 'And') {
      if (soFar.length === 0) throw new Error(`Line ${at} is an "and" with no step before it`);
      return { keyword, phrase: oneLine('A step phrase', plain[2]) };
    }
    const last = [...soFar].reverse().find((step) => step.keyword !== 'And');
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

/** The runner prints the accessibility tree of `main`, whose every line names a node. */
const isObservedLine = (line: string): boolean => /^\s*- /.test(line);

const firstDifference = (printed: string, text: string): number => {
  const a = printed.split('\n');
  const b = text.split('\n');
  const at = a.findIndex((line, index) => line !== b[index]);
  return (at === -1 ? Math.min(a.length, b.length) : at) + 1;
};

/**
 * A scenario file is the story template's acceptance criteria, copied as agreed: a rule line,
 * then per scenario a heading and one fenced block holding its steps and, after them, what the
 * runner observed. A file that does not read as it prints is refused, so nothing is silently
 * rewritten — the layout is part of what was agreed.
 */
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

  const scenarios: Scenario[] = [];
  let behaviour: string | undefined;
  let steps: Step[] = [];
  let observed: string[] | undefined;
  let inFence = false;

  const close = () => {
    if (behaviour === undefined) return;
    if (steps.length === 0) {
      throw new Error(`The scenario ${JSON.stringify(behaviour)} holds no step`);
    }
    steps.forEach((step, at) => {
      if (step.phrase !== OBSERVED) return;
      if (step.keyword !== 'Then' || at !== steps.length - 1) {
        throw new Error(
          `"${OBSERVED}" is the last step of a scenario and follows a Then, and here it is a ${step.keyword} at ${at + 1} of ${steps.length}`,
        );
      }
    });
    scenarios.push({ behaviour, steps, ...(observed ? { observed } : {}) });
    behaviour = undefined;
    steps = [];
    observed = undefined;
  };

  for (const [index, line] of lines.slice(1).entries()) {
    const at = index + 2;

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

    if (observed) {
      if (isStepLine(line) || looksLikeAStep.test(line)) {
        throw new Error(
          `Line ${at} is a step after what the runner observed: ${JSON.stringify(line)}`,
        );
      }
      if (!isObservedLine(line)) {
        throw new Error(`Line ${at} is not what the runner prints: ${JSON.stringify(line)}`);
      }
      observed.push(line);
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
      const last = [...steps].reverse().find((step) => step.keyword !== 'And');
      if (last?.keyword !== 'Then') {
        throw new Error(
          `Line ${at} is not a step, and only a Then is followed by what the runner observed: ${JSON.stringify(line)}`,
        );
      }
      if (!isObservedLine(line)) {
        throw new Error(
          `Line ${at} is neither a step nor what the runner prints: ${JSON.stringify(line)}`,
        );
      }
      observed = [line];
      continue;
    }

    if (line === '') continue;
    throw new Error(`Line ${at} is inside a scenario outside its block: ${JSON.stringify(line)}`);
  }

  if (inFence) throw new Error('The last block is not closed');
  close();
  if (scenarios.length === 0) throw new Error('A scenario file holds at least one scenario');

  const file = { rule, scenarios };
  const printed = printScenarioFile(file);
  if (printed !== text) {
    throw new Error(
      `A scenario file reads as it prints, and this one does not, from line ${firstDifference(printed, text)}`,
    );
  }
  return file;
};

export const printScenarioFile = ({ rule, scenarios }: ScenarioFile): string =>
  [
    `Rule: ${rule}`,
    ...scenarios.flatMap(({ behaviour, steps, observed }) => [
      '',
      `### Scenario: ${behaviour}`,
      '',
      '```',
      ...steps.map((step) => `${step.keyword} ${step.phrase}`),
      ...(observed ?? []),
      '```',
    ]),
  ].join('\n') + '\n';

/** Replace one scenario's observed block, leaving every other line as it was. */
export const withObserved = (
  text: string,
  behaviour: string,
  observed: readonly string[],
): string => {
  const file = readScenarioFile(text);
  if (!file.scenarios.some((scenario) => scenario.behaviour === behaviour)) {
    throw new Error(`The file holds no scenario named ${JSON.stringify(behaviour)}`);
  }
  return printScenarioFile({
    ...file,
    scenarios: file.scenarios.map((scenario) =>
      scenario.behaviour === behaviour
        ? { ...scenario, ...(observed.length > 0 ? { observed } : { observed: undefined }) }
        : scenario,
    ),
  });
};
