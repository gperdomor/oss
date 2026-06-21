import { homedir } from 'node:os';
import type { MockInstance } from 'vitest';
import { exec } from './exec.js';

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

  describe('basic functionality', () => {
    it('should execute a simple command successfully', async () => {
      const result = await exec('echo', ['hello world']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('hello world');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should handle commands with no output', async () => {
      const result = await exec('true', []);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should handle commands with multiple arguments', async () => {
      const result = await exec('echo', ['-n', 'hello', 'world']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('hello world');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw on command failure by default', async () => {
      await expect(exec('false', [])).rejects.toThrow('Process exited with non-zero status (1)');
    });

    it('should handle command failure when throwOnError=false', async () => {
      const result = await exec('false', [], { throwOnError: false });

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should handle non-existent commands', async () => {
      await expect(exec('nonexistentcommand12345', [])).rejects.toThrow();
    });

    it('should handle commands that write to stderr', async () => {
      const result = await exec('node', ['-e', 'console.error("error message")'], { throwOnError: false });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
      expect(result.stderr.trim()).toBe('error message');

      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).toHaveBeenCalledWith(result.stderr);
    });
  });

  describe('options handling', () => {
    it('should set working directory', async () => {
      const temp = homedir();

      const result1 = await exec('pwd', [], { nodeOptions: {} });
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

    it('should set environment variables', async () => {
      const result = await exec('node', ['-e', 'console.log(process.env.TEST_VAR)'], {
        nodeOptions: { env: { TEST_VAR: 'test_value' } },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('test_value');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should set environment variables using shell commands', async () => {
      const result = await exec('echo', ['Hello $NAME'], {
        nodeOptions: { env: { NAME: 'Joe!' }, shell: true },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('Hello Joe!');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      // expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should inherit current process environment by default', async () => {
      vi.stubEnv('INHERITED_VAR', 'inherited_value');

      const result = await exec('node', ['-e', 'console.log(process.env.INHERITED_VAR)']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('inherited_value');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('should override inherited environment variables', async () => {
      vi.stubEnv('OVERRIDE_VAR', 'original');

      const result = await exec('node', ['-e', 'console.log(process.env.OVERRIDE_VAR)'], {
        nodeOptions: { env: { OVERRIDE_VAR: 'overridden' } },
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('overridden');
      expect(result.stderr).toBe('');

      expect(stdoutSpy).toHaveBeenCalledWith(result.stdout);
      expect(stderrSpy).not.toHaveBeenCalled();
    });
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
      const result = await exec('node', ['-e', 'console.error("error output")'], { throwOnError: false });

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

  describe('command arguments', () => {
    it('should handle empty arguments array', async () => {
      const result = await exec('echo', []);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('');
    });

    it('should handle undefined arguments', async () => {
      const result = await exec('echo');

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('');
    });

    it('should handle arguments with special characters', async () => {
      const result = await exec('echo', ['hello "world"']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('hello "world"');
    });

    it('should handle arguments with spaces', async () => {
      const result = await exec('echo', ['hello world', 'foo bar']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe('hello world foo bar');
    });
  });

  describe('return type validation', () => {
    it('should return object with correct properties', async () => {
      const result = await exec('echo', ['test']);

      expect(result).toHaveProperty('stdout');
      expect(result).toHaveProperty('stderr');
      expect(result).toHaveProperty('exitCode');
      expect(typeof result.stdout).toBe('string');
      expect(typeof result.stderr).toBe('string');
      expect(typeof result.exitCode).toBe('number');
    });

    it('should return consistent result structure on error', async () => {
      const result = await exec('false', [], { throwOnError: false });

      expect(result).toHaveProperty('stdout');
      expect(result).toHaveProperty('stderr');
      expect(result).toHaveProperty('exitCode');
      expect(result.exitCode).toBe(1);
    });
  });
});
