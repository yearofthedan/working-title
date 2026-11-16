import { describe, expect, it } from 'vite-plus/test';
import { refusalFor } from './your-projects';

describe('refusing the folder of a project', () => {
  it('names it by the title its project.md holds', () => {
    expect(refusalFor('The Ferryman')).toBe(
      "“The Ferryman” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.",
    );
  });

  it('calls a project with no title "Untitled project"', () => {
    expect(refusalFor('')).toBe(
      "“Untitled project” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.",
    );
  });
});
