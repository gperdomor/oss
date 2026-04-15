import * as core from '@nx-tools/core';
import { ExecutorContext } from '@nx/devkit';
import { expectCommandToHaveBeenCalled } from '../generate/executor.spec';
import executor from './executor';
import { StudioExecutorSchema } from './schema';

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

describe('Studio Executor', () => {
  it('can run with empty options', async () => {
    const options: StudioExecutorSchema = {};
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled(['prisma', 'studio', `--schema=workspace-root/apps/foo/prisma/schema.prisma`]),
    );
    expect(output.success).toBeTruthy();
  });

  test.each([
    ['browser', 'safari'],
    ['browser', 'chrome'],
    ['port', 5555],
  ])(
    'given %p option with %p value, should be included in the args array',
    async (option: string, value: string | number) => {
      const options: StudioExecutorSchema = {
        [option]: value,
      };
      const output = await executor(options, context as ExecutorContext);
      expect(
        expectCommandToHaveBeenCalled([
          'prisma',
          'studio',
          '--schema=workspace-root/apps/foo/prisma/schema.prisma',
          `--${option}=${value}`,
        ]),
      );
      expect(output.success).toBeTruthy();
    },
  );

  it('with all options', async () => {
    const options: StudioExecutorSchema = {
      schema: 'my-schema.schema',
      browser: 'firefox',
      port: 6666,
    };
    const output = await executor(options, context as ExecutorContext);
    expect(
      expectCommandToHaveBeenCalled([
        'prisma',
        'studio',
        '--schema=my-schema.schema',
        '--browser=firefox',
        '--port=6666',
      ]),
    );
    expect(output.success).toBeTruthy();
  });
});
