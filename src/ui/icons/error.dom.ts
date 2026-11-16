import { svgIn } from './svg.dom';

export const errorIcon = (): SVGElement => {
  const icon = svgIn('svg', {
    viewBox: '0 0 16 16',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  icon.append(
    svgIn('circle', {
      cx: '8',
      cy: '8',
      r: '6.25',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.5',
    }),
    svgIn('line', {
      x1: '8',
      y1: '4.5',
      x2: '8',
      y2: '8.5',
      stroke: 'currentColor',
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
    }),
    svgIn('circle', { cx: '8', cy: '11.25', r: '1.1', fill: 'currentColor' }),
  );
  return icon;
};
