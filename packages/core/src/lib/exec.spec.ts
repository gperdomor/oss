import { homedir } from 'node:os';
import type { MockInstance } from 'vitest';
import { describe, expect, it } from 'vitest';
import { exec, execSync } from './exec.js';

describe('exec', () => {
  let stdoutSpy: MockInstance;
  let stderrSpy: MockInstance;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  describe('async exec', () => {
    it('should execute a simple command', async () => {
      const result = await exec('echo', ['Hello World']);

      expect(result.stdout).toContain('Hello World');
      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should execute a command without arguments', async () => {
      const result = await exec('echo');

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('');
      expect(result.stderr.trim()).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith('\n');
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should execute a command with multiple arguments', async () => {
      const result = await exec('echo', ['Hello', 'World', 'Test']);

      expect(result.stdout).toContain('Hello');
      expect(result.stdout).toContain('World');
      expect(result.stdout).toContain('Test');

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should accept cwd option', async () => {
      const temp = homedir();

      const result1 = await exec('pwd', [], {
        nodeOptions: {},
      });
      expect(result1.exitCode).toBe(0);
      expect(result1.stdout.trim()).not.toBe(temp);
      expect(result1.stderr).toBe('');

      const result2 = await exec('pwd', [], { nodeOptions: { cwd: temp } });
      expect(result2.exitCode).toBe(0);
      expect(result2.stdout.trim()).toBe(temp);
      expect(result2.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenNthCalledWith(1, result1.stdout);
      expect(stdoutSpy).toHaveBeenNthCalledWith(2, result2.stdout);

      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should accept environment variables option', async () => {
      const result = await exec('node', ['-e', 'console.log(process.env.CUSTOM_VAR)'], {
        nodeOptions: {
          env: { ...process.env, CUSTOM_VAR: 'custom' },
        },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('custom');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should inherit current process environment by default', async () => {
      vi.stubEnv('CUSTOM_VAR', 'inherited_value');

      const result = await exec('node', ['-e', 'console.log(process.env.CUSTOM_VAR)']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('inherited_value');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should override inherited environment variables', async () => {
      vi.stubEnv('OVERRIDE_VAR', 'original');

      const result = await exec('node', ['-e', 'console.log(process.env.OVERRIDE_VAR)'], {
        nodeOptions: {
          env: { OVERRIDE_VAR: 'overridden' },
        },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('overridden');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should set environment variables using shell commands', async () => {
      const result = await exec('echo', ['Hello $NAME'], {
        nodeOptions: {
          env: { NAME: 'Joe!' },
          shell: true,
        },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('Hello Joe!');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      // expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should capture stderr', async () => {
      const result = await exec('sh', ['-c', 'echo error message >&2']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('error message');
    });

    it('should fail on command not found', async () => {
      await expect(exec('this-command-does-not-exist-xyz')).rejects.toThrow();
    });

    it('should handle command failure when throwOnError=false', async () => {
      const result = await exec('false', [], { throwOnError: false });

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should fail when command exits with non-zero code', async () => {
      await expect(exec('sh', ['-c', 'exit 1'])).rejects.toThrow('Process exited with non-zero status (1)');
    });

    describe('silent option', () => {
      it('should write to stdout by default (silent=false)', async () => {
        const result = await exec('echo', ['test output']);

        expect(result.exitCode).toBe(0);
        expect(result.stdout.trim()).toBe('test output');
        expect(result.stderr).toBe('');

        expect(stdoutSpy).toHaveBeenCalledWith('test output\n');
        expect(stderrSpy).not.toHaveBeenCalled();
      });

      it('should not write to stdout when silent=true', async () => {
        const result = await exec('echo', ['test output'], { silent: true });

        expect(result.exitCode).toBe(0);
        expect(result.stdout.trim()).toBe('test output');
        expect(result.stderr).toBe('');

        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(stderrSpy).not.toHaveBeenCalled();
      });

      it('should write to stderr by default (silent=false)', async () => {
        const result = await exec('node', ['-e', 'console.error("error output")'], {
          throwOnError: false,
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe('');
        expect(result.stderr.trim()).toBe('error output');

        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(stderrSpy).toHaveBeenCalledWith('error output\n');
      });

      it('should not write to stderr when silent=true', async () => {
        const result = await exec('node', ['-e', 'console.error("error output")'], {
          silent: true,
          throwOnError: false,
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe('');
        expect(result.stderr.trim()).toBe('error output');

        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(stderrSpy).not.toHaveBeenCalled();
      });

      it('should not write anything when silent=true and command has both stdout and stderr', async () => {
        const result = await exec('node', ['-e', 'console.log("stdout"); console.error("stderr")'], {
          silent: true,
          throwOnError: false,
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout.trim()).toBe('stdout');
        expect(result.stderr.trim()).toBe('stderr');

        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(stderrSpy).not.toHaveBeenCalled();
      });
    });

    it('should handle empty args array', async () => {
      const result = await exec('echo', []);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('');
    });

    it('should handle special characters in arguments', async () => {
      const result = await exec('echo', ['hello "world" with (special) chars']);
      expect(result.stdout).toContain('special');
      expect(result.exitCode).toBe(0);
    });

    it('should allow options override', async () => {
      const result = await exec('ls', ['this-file-does-not-exist'], {
        throwOnError: false,
      });
      expect(result.exitCode).not.toBe(0);
    });

    it('should preserve stdout in result', async () => {
      const result = await exec('echo', ['test output']);
      expect(result.stdout).toBeDefined();
      expect(typeof result.stdout).toBe('string');
    });

    it('should include stderr and stdout in result', async () => {
      const result = await exec('echo', ['test']);
      expect(result.stdout).toBeDefined();
      expect(result.stderr).toBeDefined();
      expect(typeof result.stderr).toBe('string');
    });
  });

  describe('sync execSync', () => {
    it('should execute a simple command synchronously', () => {
      const result = execSync('echo', ['Hello World']);
      expect(result.stdout).toContain('Hello World');
      expect(result.exitCode).toBe(0);
    });

    it('should execute a command without arguments', () => {
      const result = execSync('echo');
      expect(result.exitCode).toBe(0);
    });

    it('should execute a command with multiple arguments', () => {
      const result = execSync('echo', ['Hello', 'World', 'Test']);
      expect(result.stdout).toContain('Hello');
      expect(result.stdout).toContain('World');
      expect(result.stdout).toContain('Test');
    });

    it('should accept cwd option in sync mode', () => {
      const result = execSync('echo', ['test'], {
        nodeOptions: {
          cwd: process.cwd(),
        },
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('test');
    });

    it('should accept environment variables in sync mode', () => {
      const result = execSync('node', ['-e', 'console.log(process.env.CUSTOM_VAR)'], {
        nodeOptions: {
          env: { ...process.env, CUSTOM_VAR: 'custom' },
        },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('custom');
    });

    it('should inherit current process environment by default in sync mode', () => {
      vi.stubEnv('CUSTOM_VAR', 'inherited_value');

      const result = execSync('node', ['-e', 'console.log(process.env.CUSTOM_VAR)']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('inherited_value');
    });

    it('should override inherited environment variables in sync mode', () => {
      vi.stubEnv('OVERRIDE_VAR', 'original');

      const result = execSync('node', ['-e', 'console.log(process.env.OVERRIDE_VAR)'], {
        nodeOptions: {
          env: { OVERRIDE_VAR: 'overridden' },
        },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('overridden');
    });

    it('should set environment variables using shell commands in sync mode', async () => {
      const result = execSync('echo', ['Hello $NAME'], {
        nodeOptions: {
          env: { NAME: 'Joe!' },
          shell: true,
        },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('Hello Joe!');
      expect(result.stderr.trim()).toBe('');
    });

    it('should capture stderr in sync mode', () => {
      const result = execSync('sh', ['-c', 'echo error message >&2']);
      expect(result.stderr).toContain('error message');
    });

    it('should fail on command not found in sync mode', () => {
      expect(() => execSync('this-command-does-not-exist-xyz')).toThrow();
    });

    it('should handle command failure when throwOnError=false', () => {
      const result = execSync('false', [], { throwOnError: false });

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');
    });

    it('should fail when command exits with non-zero code in sync mode', () => {
      expect(() => execSync('sh', ['-c', 'exit 1'])).toThrow();
    });

    it('should handle empty args array in sync mode', () => {
      const result = execSync('echo', []);
      expect(result.exitCode).toBe(0);
    });

    it('should handle special characters in arguments in sync mode', () => {
      const result = execSync('echo', ['hello "world" with (special) chars']);
      expect(result.stdout).toContain('special');
    });

    it('should allow options override in sync mode', () => {
      const result = execSync('ls', ['this-file-does-not-exist'], {
        throwOnError: false,
      });
      expect(result.exitCode).not.toBe(0);
    });

    it('should preserve stdout in sync result', () => {
      const result = execSync('echo', ['test output']);
      expect(result.stdout).toBeDefined();
      expect(typeof result.stdout).toBe('string');
    });

    it('should include stderr and stdout in sync result', () => {
      const result = execSync('echo', ['test']);
      expect(result.stdout).toBeDefined();
      expect(result.stderr).toBeDefined();
      expect(typeof result.stderr).toBe('string');
    });
  });

  describe('comparison: async vs sync', () => {
    it('should produce equivalent results for same command', async () => {
      const args = ['test', 'output'];
      const asyncResult = await exec('echo', args);
      const syncResult = execSync('echo', args);

      expect(asyncResult.stdout).toBe(syncResult.stdout);
      expect(asyncResult.exitCode).toBe(syncResult.exitCode);
    });

    it('should both fail on invalid command', async () => {
      const invalidCmd = 'invalid-cmd-xyz-123';

      await expect(exec(invalidCmd)).rejects.toThrow();
      expect(() => execSync(invalidCmd)).toThrow();
    });
  });
});
