import type { AppReads, Driver, Opening } from './driver';
import type { SeededProject } from './seed';

export const storyDrawn = [
  '- main:',
  '  - group "The story":',
  '    - heading "The story" [level=2]',
  '  - group "Beat 4":',
  '    - heading "Beat 4" [level=3]',
];

export const recording = (tree: readonly string[]) => {
  const calls: string[] = [];
  const started: SeededProject[] = [];
  const driver: Driver = {
    press: async (key) => {
      calls.push(`press ${key}`);
    },
    click: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`click ${role} "${name}"${root}`);
    },
    focus: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`focus ${role} "${name}"${root}`);
    },
    scrollToTheEnd: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`scrollToTheEnd ${role} "${name}"${root}`);
    },
    type: async (_text, label, within) => {
      calls.push(`type ${label} in "${within.name}"`);
    },
    clickAway: async () => {
      calls.push('clickAway');
    },
    value: async (label, within) => {
      calls.push(`value ${label} in "${within.name}"`);
      return '';
    },
    focusIs: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`focusIs ${role} "${name}"${root}`);
      return false;
    },
    tree: async () => tree,
  };
  const opening: Opening = {
    fresh: async () => {
      calls.push('fresh');
    },
    reopen: async () => {
      calls.push('reopen');
    },
  };
  const reads: AppReads = { drawn: async () => [], path: async () => '' };
  const startFrom = async (project: SeededProject): Promise<void> => {
    started.push(project);
  };
  return { calls, driver, opening, reads, startFrom, started };
};
