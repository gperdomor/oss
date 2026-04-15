import * as core from '@nx-tools/core';
import { ExecutorContext, getPackageManagerCommand } from '@nx/devkit';
import executor from './executor';
import { GenerateExecutorSchema } from './schema';

vi.spyOn(core, 'exec').mockResolvedValue({
  stderr: '',
  stdout: 'mocked output',
  exitCode: 0,
});

const context: Omit<ExecutorContext, 'nxJsonConfiguration' | 'projectGraph'> = {
  root: 'workspace-root',
  projectsConfigurations: { version: 2, projects: { foo: { root: 'apps/foo' } } },
  projectName: 'foo',
  cwd: process.cwd(),
  isVerbose: false,
};

const expectCommandToHaveBeenCalled = (cmd: string, args: string[]) => {
  expect(core.exec).toHaveBeenCalledWith(cmd, args, { throwOnError: false });
};

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

describe('Generate Executor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => true);
  });

  it('can run with empty options', async () => {
    const [bin, ...pmArgs] = getPackageManagerCommand().exec.trim().split(/\s+/);
    const options: GenerateExecutorSchema = {};
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled(bin, [...pmArgs, 'graphql-codegen', '--config=workspace-root/apps/foo/codegen.ts']),
    );
    expect(output.success).toBeTruthy();
  });

  it('can run with config options', async () => {
    const [bin, ...pmArgs] = getPackageManagerCommand().exec.trim().split(/\s+/);
    const options: GenerateExecutorSchema = {
      config: 'workspace-root/apps/foo/codegen.ts',
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled(bin, [...pmArgs, 'graphql-codegen', '--config=workspace-root/apps/foo/codegen.ts']),
    );
    expect(output.success).toBeTruthy();
  });
});
