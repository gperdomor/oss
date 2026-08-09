import { Options, Result, SyncOptions, SyncResult, x, xSync } from 'tinyexec';

export type ExecOptions = Options & { silent: boolean };

export type ExecResult = Result;

export interface ExecError extends Error {
  result: ExecResult;
}

/**
 * Execute a command executing shell commands with proper TypeScript support and error handling.
 *
 * @param command - The command to execute (e.g., 'git', 'npm', 'echo')
 * @param args - Array of arguments to pass to the command. Defaults to empty array.
 * @param options - Execution options including cwd, env, stdio settings, etc.
 * @returns Promise that resolves to an ExecResult containing stdout, stderr, exitCode, etc.
 *
 * @throws {Error} Throws an error if the command execution fails, unless configured otherwise
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await exec('echo', ['Hello World']);
 * console.log(result.stdout); // "Hello World"
 *
 * // With options
 * const result = await exec('git', ['status'], {
 *   cwd: '/path/to/repository',
 *   env: { GIT_AUTHOR_NAME: 'John Doe' }
 * });
 *
 * // Handle errors
 * try {
 *   const result = await exec('npm', ['test']);
 *   console.log('Tests passed!');
 * } catch (error) {
 *   console.error('Tests failed:', error.message);
 * }
 * ```
 *
 * @since 7.0.0
 */
export async function exec(command: string, args?: string[], options?: Partial<ExecOptions>): Promise<ExecResult> {
  const { silent = false, ...opts } = options || {};

  const res = await x(command, args, {
    throwOnError: true,
    ...opts,
  });

  // Handle stdout
  if (!silent && res.stdout) {
    process.stdout.write(res.stdout);
  }

  // Handle stderr
  if (!silent && res.stderr) {
    process.stderr.write(res.stderr);
  }

  return res;
}

export function execSync(command: string, args?: string[], options?: Partial<SyncOptions>): SyncResult {
  return xSync(command, args, {
    throwOnError: true,
    ...options,
  });
}
