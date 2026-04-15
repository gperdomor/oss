import * as core from '@nx-tools/core';
import { ExecutorContext } from '@nx/devkit';
import { expectCommandToHaveBeenCalled } from '../generate/executor.spec';
import executor from './executor';
import { PushExecutorSchema } from './schema';

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

describe('Push Executor', () => {
  it('can run with empty options', async () => {
    const options: PushExecutorSchema = {};
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled(['prisma', 'db', 'push', '--schema=workspace-root/apps/foo/prisma/schema.prisma']),
    );
    expect(output.success).toBeTruthy();
  });

  test.each([['schema', 'my-prisma-file.schema']])(
    'given %p option with %p value, should be included in the args array',
    async (option: string, value: string) => {
      const options: PushExecutorSchema = {
        [option]: value,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(expectCommandToHaveBeenCalled(['prisma', 'db', 'push', `--${option}=${value}`]));
      expect(output.success).toBeTruthy();
    },
  );

  test.each([['skip-generate'], ['force-reset'], ['accept-data-loss']])(
    'given %p flag, should be included in the args array',
    async (flag: string) => {
      const options: PushExecutorSchema = {
        [flag]: true,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(
        expectCommandToHaveBeenCalled([
          'prisma',
          'db',
          'push',
          '--schema=workspace-root/apps/foo/prisma/schema.prisma',
          `--${flag}`,
        ]),
      );
      expect(output.success).toBeTruthy();
    },
  );

  it('with all options', async () => {
    const options: PushExecutorSchema = {
      schema: 'my-schema.schema',
      'skip-generate': true,
      'force-reset': true,
      'accept-data-loss': true,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'db',
        'push',
        '--schema=my-schema.schema',
        '--accept-data-loss',
        '--force-reset',
        '--skip-generate',
      ]),
    );
    expect(output.success).toBeTruthy();
  });
});
