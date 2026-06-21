import { ExecutorContext } from '@nx/devkit';
import { getProjectRoot } from './workspace.js';

type CTX = Omit<ExecutorContext, 'nxJsonConfiguration' | 'projectGraph'>;

const ctx1: CTX = {
  root: 'workspace-folder',
  cwd: process.cwd(),
  isVerbose: false,
  projectsConfigurations: {
    version: 2,
    projects: {},
  },
};

const ctx2: CTX = {
  root: 'workspace-folder',
  cwd: process.cwd(),
  isVerbose: false,
  projectsConfigurations: {
    version: 2,
    projects: { foo: { root: 'apps/foo' }, bar: { root: 'apps/bar' } },
  },
};

describe('Workspace', () => {
  test.each([
    ['foo', ctx1, 'workspace-folder'],
    ['foo', ctx2, 'workspace-folder/apps/foo'],
    ['bar', ctx2, 'workspace-folder/apps/bar'],
    [undefined, ctx2, 'workspace-folder'],
  ])(
    'given test data and projectName=%p, should return "%p"',
    (projectName: string | undefined, ctx: CTX, expected: string) => {
      expect(getProjectRoot({ ...(ctx as ExecutorContext), projectName: projectName })).toEqual(expected);
    },
  );
});
