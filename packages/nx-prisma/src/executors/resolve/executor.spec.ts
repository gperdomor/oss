import * as core from '@nx-tools/core';
import { ExecutorContext } from '@nx/devkit';
import { expectCommandToHaveBeenCalled } from '../generate/executor.spec';
import executor from './executor';
import { ResolveExecutorSchema } from './schema';

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

describe('Resolve Executor', () => {
  it('can run with empty options', async () => {
    const options: ResolveExecutorSchema = {};
    expect.assertions(1);
    await expect(executor(options, context as ExecutorContext)).rejects.toThrowError(
      'You must specify either --rolled-back or --applied.',
    );
  });

  it('with --rolled-back and --applied', async () => {
    const options: ResolveExecutorSchema = {
      applied: 'add-user-table',
      'rolled-back': 'add-products-table',
    };
    expect.assertions(1);
    await expect(executor(options, context as ExecutorContext)).rejects.toThrowError(
      'You must specify either --rolled-back or --applied.',
    );
  });

  test.each([
    ['applied', 'add_users_table'],
    ['rolled-back', 'add_products_table'],
  ])('given %p option with %p value, should be included in the args array', async (option: string, value: string) => {
    const options: ResolveExecutorSchema = {
      [option]: value,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'migrate',
        'resolve',
        '--schema=workspace-root/apps/foo/prisma/schema.prisma',
        `--${option}=${value}`,
      ]),
    );
    expect(output.success).toBeTruthy();
  });

  it('with schema and applied', async () => {
    const options: ResolveExecutorSchema = {
      schema: 'custom.schema',
      applied: 'add_users_table',
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'migrate',
        'resolve',
        '--schema=custom.schema',
        '--applied=add_users_table',
      ]),
    );
    expect(output.success).toBeTruthy();
  });

  it('with schema and applied', async () => {
    const options: ResolveExecutorSchema = {
      schema: 'custom.schema',
      'rolled-back': 'add_users_table',
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'migrate',
        'resolve',
        '--schema=custom.schema',
        '--rolled-back=add_users_table',
      ]),
    );
    expect(output.success).toBeTruthy();
  });
});
