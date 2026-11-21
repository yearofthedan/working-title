export const en = {
  shell: {
    appTitle: 'working-title',
    yourProjectsTitle: 'Your projects',
    reload: 'Reload',
    newVersionIsReady: 'A new version is ready. ',
    whereYouAre: 'Where you are',
  },

  project: {
    untitledTitle: 'Untitled project',
  },

  projectsFolder: {
    heading: 'Choose where to keep your projects',
    chooseAFolder: 'Choose a folder…',
    whatWorkingTitleIs:
      'working-title is for planning a story and writing it, one piece at a time. Each story is a project.',
    whereProjectsAreKept:
      'Your projects are kept in a folder on your computer. Choose or make a folder for them, such as Documents › Writing. If you’ve used working-title before, choose the folder you used then.',
    chromeWillAsk: 'Chrome will ask you to let working-title edit files in that folder.',
    ownFolder: (title: string) =>
      `“${title}” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.`,
    couldNotOpenTheFolder: "working-title couldn't open that folder. Try another one.",
    noFolderPicker:
      "This browser can't keep your projects in a folder. Open working-title in Chrome or Edge on a computer.",
  },

  projectList: {
    inFolder: (folder: string) => `In ${folder}`,
    none: 'No projects yet.',
    startAProject: 'Start a project',
  },

  startAProject: {
    title: 'Title',
    willMakeAFolder: {
      before: 'working-title will make a folder named ',
      after: (folder: string) => ` in ${folder}.`,
    },
    madeAFolder: {
      before: 'working-title made a folder named ',
      after: (folder: string) => ` in ${folder}.`,
    },
    start: 'Start project',
    cancel: 'Cancel',
    couldNotMakeTheFolder: "working-title couldn't make the project's folder. Try again.",
    couldNotOpenTheProject:
      "working-title made the project's folder but couldn't open the project. Try again.",
  },

  card: {
    openBeside: 'Open beside',
    addA: (label: string) => `Add a ${label.toLowerCase()}`,
    keyHints: [
      { keys: ['Enter'], after: ' to write · ' },
      { keys: ['Tab'], after: ' for the next row · ' },
      { keys: ['←', '→'], after: ' along the row · ' },
      { keys: ['↑', '↓'], after: ' a level' },
    ],
  },

  graph: {
    namedUnder: (named: string, under: string) => `${named} under ${under}`,
  },

  panel: {
    close: 'Close',
  },
};
