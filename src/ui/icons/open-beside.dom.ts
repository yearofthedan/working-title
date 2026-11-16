import { svgIn } from './svg.dom';

export const openBesideIcon = (): SVGElement => {
  const icon = svgIn('svg', {
    viewBox: '0 0 16 16',
    'aria-hidden': 'true',
  });
  icon.append(
    svgIn('rect', {
      x: '1.5',
      y: '2.5',
      width: '13',
      height: '11',
      rx: '2',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.5',
    }),
    svgIn('rect', { x: '9.5', y: '4', width: '3.5', height: '8', rx: '1', fill: 'currentColor' }),
    svgIn('line', {
      x1: '9.5',
      y1: '2.5',
      x2: '9.5',
      y2: '13.5',
      stroke: 'currentColor',
      'stroke-width': '1.5',
    }),
  );
  return icon;
};
