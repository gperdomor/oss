import * as core from '@nx-tools/core';
import { ExecutorContext } from '@nx/devkit';
import { expectCommandToHaveBeenCalled } from '../generate/executor.spec';
import executor from './executor';
import { PullExecutorSchema } from './schema';

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

describe('Pull Executor', () => {
  it('can run with empty options', async () => {
    const options: PullExecutorSchema = {};
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled(['prisma', 'db', 'pull', '--schema=workspace-root/apps/foo/prisma/schema.prisma']),
    );
    expect(output.success).toBeTruthy();
  });

  test.each([['schema', 'my-prisma-file.schema']])(
    'given %p option with %p value, should be handled has arg',
    async (option: string, value: string) => {
      const options: PullExecutorSchema = {
        [option]: value,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(expectCommandToHaveBeenCalled(['prisma', 'db', 'pull', `--${option}=${value}`]));
      expect(output.success).toBeTruthy();
    },
  );

  test.each([['force'], ['print']])('given %p, should be handled has flag', async (flag: string) => {
    const options: PullExecutorSchema = {
      [flag]: true,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'db',
        'pull',
        '--schema=workspace-root/apps/foo/prisma/schema.prisma',
        `--${flag}`,
      ]),
    );
    expect(output.success).toBeTruthy();
  });

  it('with all options', async () => {
    const options: PullExecutorSchema = {
      schema: 'my-schema.schema',
      force: true,
      print: true,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(expectCommandToHaveBeenCalled(['prisma', 'db', 'pull', '--schema=my-schema.schema', '--force', '--print']));
    expect(output.success).toBeTruthy();
  });
});
