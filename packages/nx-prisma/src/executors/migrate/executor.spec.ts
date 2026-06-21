import { ExecutorContext } from '@nx/devkit';
import { execSync } from 'node:child_process';
import executor from './executor';
import { MigrateExecutorSchema } from './schema';

vi.mock('node:child_process');

const context: Omit<ExecutorContext, 'nxJsonConfiguration' | 'projectGraph'> = {
  root: 'workspace-root',
  projectsConfigurations: { version: 2, projects: { foo: { root: 'apps/foo' } } },
  projectName: 'foo',
  cwd: process.cwd(),
  isVerbose: false,
};

describe.skip('Migrate Executor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skip('can run with empty options', async () => {
    const options: MigrateExecutorSchema = { name: 'mig-name' };
    const output = await executor(options, context as ExecutorContext);
    expect(execSync).toHaveBeenCalledWith(
      `npx prisma migrate dev --schema=workspace-root/apps/foo/prisma/schema.prisma --name="mig-name"`,
      {
        stdio: 'inherit',
      },
    );
    expect(output.success).toBeTruthy();
  });

  test.each([['create-only'], ['skip-generate'], ['skip-seed']])(
    'given %p, should be handled has flag',
    async (flag: string) => {
      const options: MigrateExecutorSchema = {
        name: 'users',
        [flag]: true,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(execSync).toHaveBeenCalledWith(
        `npx prisma migrate dev --schema=workspace-root/apps/foo/prisma/schema.prisma --name="users" --${flag}`,
        {
          stdio: 'inherit',
        },
      );
      expect(output.success).toBeTruthy();
    },
  );

  it('with all options', async () => {
    const options: MigrateExecutorSchema = {
      schema: 'my-schema.schema',
      name: 'migration-name',
      'create-only': true,
      'skip-generate': true,
      'skip-seed': true,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(execSync).toHaveBeenCalledWith(
      'npx prisma migrate dev --schema=my-schema.schema --name="migration-name" --create-only --skip-generate --skip-seed',
      { stdio: 'inherit' },
    );
    expect(output.success).toBeTruthy();
  });
});
