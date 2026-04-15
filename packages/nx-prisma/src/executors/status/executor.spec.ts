import * as core from '@nx-tools/core';
import { ExecutorContext } from '@nx/devkit';
import { expectCommandToHaveBeenCalled } from '../generate/executor.spec';
import executor from './executor';
import { StatusExecutorSchema } from './schema';

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

describe('Status Executor', () => {
  it('can run with empty options', async () => {
    const options: StatusExecutorSchema = {};
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'migrate',
        'status',
        '--schema=workspace-root/apps/foo/prisma/schema.prisma',
      ]),
    );
    expect(output.success).toBeTruthy();
  });

  test.each([['schema', 'my-prisma-file.schema']])(
    'given %p option with %p value, should be handled has arg',
    async (option: string, value: string) => {
      const options: StatusExecutorSchema = {
        [option]: value,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(expectCommandToHaveBeenCalled(['prisma', 'migrate', 'status', `--${option}=${value}`]));
      expect(output.success).toBeTruthy();
    },
  );
});
