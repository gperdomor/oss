import { Interfaces } from '@oclif/core';
import { runHook } from '@oclif/test';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createLoadOptions } from '../../load-options.js';

describe('init hook node version validation', () => {
  let loadOptions: Interfaces.Options;

  beforeAll(() => {
    loadOptions = createLoadOptions();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['22.13.0', 'exact minimum'],
    ['22.13.1', 'same major.minor, higher patch'],
    ['22.14.0', 'same major, higher minor'],
    ['24.0.0', 'Node 24 LTS'],
    ['25.0.0', 'Node 25'],
    ['26.0.0', 'Node 26'],
  ])('does not report an error for v%s (%s)', async (version) => {
    vi.spyOn(process.versions, 'node', 'get').mockReturnValue(version);

    const { error } = await runHook('init', { id: 'mycommand' }, loadOptions);
    expect(error).toBeUndefined();
  });

  it.each([
    ['20.18.9', 'same major, minor just below threshold'],
    ['20.17.0', 'same major, minor well below threshold'],
    ['19.9.9', 'lower major'],
    ['18.0.0', 'Node 18 (EOL)'],
  ])('reports an error for v%s (%s)', async (version) => {
    vi.spyOn(process.versions, 'node', 'get').mockReturnValue(version);

    const { error } = await runHook('init', { id: 'mycommand' }, loadOptions);
    expect(error).toBeDefined();
    expect(error?.message).toContain('Node.js v20.19.0 or newer is required to run this tool.');
    expect(error?.message).toContain(`Current version: v${version}.`);
    expect(error?.message).toContain('Please upgrade Node.js and try again.');
  });
});
