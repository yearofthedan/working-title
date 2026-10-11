import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { projectStore } from '../../adapters/local-storage-project-store';
import { openProject } from '../../application/project';
import { snowflakeExtended } from '../../methods/snowflake-extended';
import { renderFocus } from './focus';

const key = 'working-title:project';
const facet = snowflakeExtended.rootKind.facets[0];
const stored = (): string | undefined => {
  const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as {
    root?: { facets?: Record<string, string> };
  };
  return facet === undefined ? undefined : saved.root?.facets?.[facet.id];
};

const fieldOf = (label: string): HTMLTextAreaElement => {
  const field = document.querySelector(`textarea[id="facet-${facet?.id}"]`);
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error(`no field labelled ${label}`);
  }
  return field;
};

describe('the focus page', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.body.replaceChildren();
    const main = document.createElement('main');
    document.body.append(main);
    renderFocus(main, await openProject(snowflakeExtended, projectStore()));
  });

  it('saves each keystroke as it is typed, so a reload mid-typing loses nothing', () => {
    const field = fieldOf(facet?.label ?? '');

    for (const text of ['A wid', "A widow hunts the man's"]) {
      field.value = text;
      field.dispatchEvent(new Event('input'));
      expect(stored()).toBe(text);
    }
  });

  it('holds a facet under the label the method gives it', () => {
    expect(document.querySelector(`textarea[id="facet-${facet?.id}"]`)).not.toBeNull();
    expect(document.body.textContent).toContain(facet?.label ?? '');
  });
});
