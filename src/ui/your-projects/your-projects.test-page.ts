import { whereTheProjectsAreKept } from './projects-folder/projects-folder.test-page';
import { theProjectList } from './project-list/project-list.test-page';

export const yourProjects = () => ({
  question: whereTheProjectsAreKept(),
  list: theProjectList,
});
