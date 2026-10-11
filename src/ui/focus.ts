import type { Focus } from '../application/project';

const field = ({ id, label, text }: Focus['facets'][number], elaborate: Focus['elaborate']) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'facet';
  const name = document.createElement('label');
  name.htmlFor = `facet-${id}`;
  name.textContent = label;
  const input = document.createElement('textarea');
  input.id = `facet-${id}`;
  input.value = text;
  input.rows = 3;
  input.addEventListener('input', () => void elaborate(id, input.value));
  wrapper.append(name, input);
  return wrapper;
};

export const renderFocus = (main: HTMLElement, focus: Focus): void => {
  main.replaceChildren(...focus.facets.map((facet) => field(facet, focus.elaborate)));
};
