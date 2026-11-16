import { whereTheProjectsAreKept } from './folder-question/folder-question.test-page';
import { theProjectList } from './project-list/project-list.test-page';

export const yourProjects = () => ({
  question: whereTheProjectsAreKept(),
  list: theProjectList,
});
