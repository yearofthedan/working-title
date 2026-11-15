export interface ProjectsFolder {
  readonly name: string;
  ownTitle(): Promise<string | undefined>;
  freeNameFor(title: string): Promise<string>;
  start(title: string): Promise<FileSystemDirectoryHandle>;
}

export interface ProjectsFolderChooser {
  choose(): Promise<ProjectsFolder | undefined>;
}
