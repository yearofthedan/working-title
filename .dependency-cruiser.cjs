// The layers of docs/architecture.md, and the import graph rules that hold them there
// (docs/adr/0002-hexagonal-layers.md). Which layer may import which is written once, below.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    ...Object.entries({
      domain: ['application', 'ports', 'adapters', 'ui'],
      application: ['adapters', 'ui'],
      ports: ['application', 'adapters', 'ui'],
      adapters: ['application', 'ui'],
      ui: ['domain', 'ports', 'adapters'],
    }).map(([layer, others]) => ({
      name: `layer-direction-${layer}`,
      severity: 'error',
      comment: `The ${layer} layer may not import ${others.join(', ')}, because a layer's dependencies point inward (docs/adr/0002-hexagonal-layers.md).`,
      from: { path: `^src/${layer}/` },
      to: { path: others.map((other) => `^src/${other}/`) },
    })),
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a cycle, so the modules in it cannot be read one at a time. Break it by moving what they share down a layer (docs/adr/0002-hexagonal-layers.md).',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // Without this a `../ui/app` specifier stays unresolved, so no rule of this file
    // can see where it points: `.ts` is off by default because dependency-cruiser
    // wants a `typescript` below 7 to read TypeScript, which this project does not have.
    enhancedResolveOptions: { extensions: ['.js', '.ts', '.tsx'] },
  },
};
