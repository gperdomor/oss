import { ExecutorContext } from '@nx/devkit';
import { execSync } from 'node:child_process';
import executor from './executor';
import { ResetExecutorSchema } from './schema';

vi.mock('node:child_process');

const context: Omit<ExecutorContext, 'nxJsonConfiguration' | 'projectGraph'> = {
  root: 'workspace-root',
  projectsConfigurations: { version: 2, projects: { foo: { root: 'apps/foo' } } },
  projectName: 'foo',
  cwd: process.cwd(),
  isVerbose: false,
};

describe.skip('Reset Executor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('can run with empty options', async () => {
    const options: ResetExecutorSchema = { force: true };
    const output = await executor(options, context as ExecutorContext);
    expect(execSync).toHaveBeenCalledWith(
      `npx prisma migrate reset --schema=workspace-root/apps/foo/prisma/schema.prisma --force`,
      {
        stdio: 'inherit',
      },
    );
    expect(output.success).toBeTruthy();
  });

  test.each([['schema', 'my-prisma-file.schema']])(
    'given %p option with %p value, should be handled has arg',
    async (option: string, value: string) => {
      const options: ResetExecutorSchema = {
        force: true,
        [option]: value,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(execSync).toHaveBeenCalledWith(`npx prisma migrate reset --${option}=${value} --force`, {
        stdio: 'inherit',
      });
      expect(output.success).toBeTruthy();
    },
  );

  test.each([['skip-generate'], ['skip-seed']])('given %p, should be handled has flag', async (flag: string) => {
    const options: ResetExecutorSchema = {
      force: true,
      [flag]: true,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(execSync).toHaveBeenCalledWith(
      `npx prisma migrate reset --schema=workspace-root/apps/foo/prisma/schema.prisma --force --${flag}`,
      {
        stdio: 'inherit',
      },
    );
    expect(output.success).toBeTruthy();
  });

  it('with all options', async () => {
    const options: ResetExecutorSchema = {
      schema: 'my-schema.schema',
      force: true,
      'skip-generate': true,
      'skip-seed': true,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(execSync).toHaveBeenCalledWith(
      'npx prisma migrate reset --schema=my-schema.schema --force --skip-generate --skip-seed',
      { stdio: 'inherit' },
    );
    expect(output.success).toBeTruthy();
  });
});
