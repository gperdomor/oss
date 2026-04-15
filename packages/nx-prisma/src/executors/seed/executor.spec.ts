import * as core from '@nx-tools/core';
import { ExecutorContext } from '@nx/devkit';
import { expectCommandToHaveBeenCalled } from '../generate/executor.spec';
import executor from './executor';
import { SeedExecutorSchema } from './schema';

vi.spyOn(core, 'exec').mockResolvedValue({
  stderr: '',
  stdout: 'mocked output',
  exitCode: 0,
});

const context: Omit<ExecutorContext, 'nxJsonConfiguration' | 'projectGraph'> = {
  root: 'workspace-folder',
  projectsConfigurations: { version: 2, projects: { foo: { root: 'apps/foo' } } },
  projectName: 'foo',
  cwd: process.cwd(),
  isVerbose: false,
};

describe('Seed Executor', () => {
  it('can run with empty options', async () => {
    const options: SeedExecutorSchema = {
      script: undefined,
    };
    expect.assertions(1);
    await expect(executor(options, context as ExecutorContext)).rejects.toThrowError(
      'You must specify a seed script file.',
    );
  });

  describe('with ts-node', () => {
    it('script option', async () => {
      const options: SeedExecutorSchema = {
        script: 'custom-seed-file.ts',
      };
      const output = await executor(options, context as ExecutorContext);
      expect(
        expectCommandToHaveBeenCalled([
          'ts-node',
          '--project=workspace-folder/apps/foo/tsconfig.json',
          'custom-seed-file.ts',
        ]),
      );
      expect(output.success).toBeTruthy();
    });

    // it('with all options', async () => {
    //   const options: SeedExecutorSchema = {
    //     script: 'seed.ts',
    //     tsConfig: 'tsconfig.base.ts',
    //   };
    //   const output = await executor(options, context as ExecutorContext);
    //   expect(expectCommandToHaveBeenCalled(['ts-node', '--project=tsconfig.base.ts', 'seed.ts']));
    //   expect(output.success).toBeTruthy();
    // });
  });

  // describe('with tsx', () => {
  //   it('script option', async () => {
  //     const options: SeedExecutorSchema = {
  //       script: 'custom-seed-file.ts',
  //       executeWith: 'tsx',
  //     };
  //     const output = await executor(options, context as ExecutorContext);
  //     expect(
  //       expectCommandToHaveBeenCalled([
  //         'tsx',
  //         '--tsconfig=workspace-folder/apps/foo/tsconfig.json',
  //         'custom-seed-file.ts',
  //       ]),
  //     );
  //     expect(output.success).toBeTruthy();
  //   });

  //   it('with all options', async () => {
  //     const options: SeedExecutorSchema = {
  //       script: 'seed.ts',
  //       tsConfig: 'tsconfig.base.ts',
  //       executeWith: 'tsx',
  //     };
  //     const output = await executor(options, context as ExecutorContext);
  //     expect(expectCommandToHaveBeenCalled(['tsx', '--tsconfig=tsconfig.base.ts', 'seed.ts']));
  //     expect(output.success).toBeTruthy();
  //   });
  // });
});
