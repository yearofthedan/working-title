import { openProject, type OpenProject } from '../../../../application/project';
import { snowflakeExtended } from '../../../../methods/snowflake-extended';
import type { ProjectStore } from '../../../../ports/project-store';
import { inMemory, type SeededProject } from '../../../../test-helpers/seed/seed';

export const anInMemoryProject = async (
  seed?: SeededProject,
): Promise<{ store: ProjectStore; project: OpenProject }> => {
  const store = inMemory();
  if (seed !== undefined) await store.save(seed);
  return { store, project: await openProject(snowflakeExtended, store) };
};
