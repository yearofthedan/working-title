export interface ProjectsFolder {
  readonly name: string;
  ownTitle(): Promise<string | undefined>;
  freeNameFor(title: string): Promise<string>;
  start(title: string): Promise<void>;
}

export interface ProjectsFolderChooser {
  readonly canChoose: boolean;
  choose(): Promise<ProjectsFolder | undefined>;
}
