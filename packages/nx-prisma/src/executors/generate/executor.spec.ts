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

export const expectCommandToHaveBeenCalled = (args: string[]) => {
  const [bin, ...pmArgs] = getPackageManagerCommand().exec.trim().split(/\s+/);
  expect(core.exec).toHaveBeenCalledWith(bin, [...pmArgs, ...args], { throwOnError: false });
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
    const options: GenerateExecutorSchema = {};
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled(['prisma', 'generate', '--schema=workspace-root/apps/foo/prisma/schema.prisma']),
    );
    expect(output.success).toBeTruthy();
  });

  test.each([['schema', 'my-prisma-file.schema']])(
    'given %p option with %p value, should be handled has arg',
    async (option: string, value: string) => {
      const options: GenerateExecutorSchema = {
        [option]: value,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(expectCommandToHaveBeenCalled(['prisma', 'generate', `--${option}=${value}`]));
      expect(output.success).toBeTruthy();
    },
  );

  test.each([['data-proxy'], ['accelerate'], ['no-engine'], ['no-hints'], ['allow-no-models'], ['watch']])(
    'given %p, should be handled has flag',
    async (flag: string) => {
      const options: GenerateExecutorSchema = {
        [flag]: true,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(
        expectCommandToHaveBeenCalled([
          'prisma',
          'generate',
          '--schema=workspace-root/apps/foo/prisma/schema.prisma',
          `--${flag}`,
        ]),
      );
      expect(output.success).toBeTruthy();
    },
  );

  it('with all options', async () => {
    const options: GenerateExecutorSchema = {
      schema: 'my-schema.schema',
      'data-proxy': true,
      generator: 'sample-generator',
      watch: true,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'generate',
        '--schema=my-schema.schema',
        '--generator=sample-generator',
        '--data-proxy',
        '--watch',
      ]),
    );
    expect(output.success).toBeTruthy();
  });
});
