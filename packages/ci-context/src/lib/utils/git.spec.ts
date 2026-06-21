import * as core from '@nx-tools/core';
import * as local from './git.js';
import { Git } from './git.js';

describe('Git Context', () => {
  beforeEach(() => {
    vi.stubEnv('PATH', process.env['PATH']!);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('context', () => {
    it('Should be take proper cotext values', async () => {
      vi.spyOn(Git, 'getCommitUserEmail').mockResolvedValue('local-actor');
      vi.spyOn(Git, 'ref').mockResolvedValue('local-ref');
      vi.spyOn(Git, 'remoteURL').mockResolvedValue('https://local-git.com/gperdomor/oss');
      vi.spyOn(Git, 'fullCommit').mockResolvedValue('local-sha');

      const context = await Git.context();

      expect(context).toEqual({
        name: 'GIT',
        actor: 'local-actor',
        eventName: 'push',
        job: 'build',
        payload: {},
        ref: 'local-ref',
        runId: 0,
        runNumber: 0,
        repoUrl: 'https://local-git.com/gperdomor/oss',
        sha: 'local-sha',
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      vi.spyOn(Git, 'remoteURL').mockResolvedValue('https://local-git.com/gperdomor/oss');

      const repo = await local.repo();

      expect(repo).toEqual({
        default_branch: '',
        description: '',
        html_url: 'https://local-git.com/gperdomor/oss',
        license: null,
        name: '',
      });
    });
  });

  describe('remoteURL', () => {
    it('have been called', async () => {
      const execSpy = vi.spyOn(core, 'exec');
      try {
        await Git.remoteURL();
      } catch {
        // noop
      }
      expect(execSpy).toHaveBeenCalledWith(`git`, ['remote', 'get-url', 'origin'], {
        silent: true,
        throwOnError: false,
      });
    });
  });

  describe('ref', () => {
    it('returns mocked ref', async () => {
      vi.spyOn(core, 'exec').mockImplementation((cmd, args): Promise<core.ExecResult> => {
        const fullCmd = `${cmd} ${args?.join(' ')}`;
        let result = '';
        switch (fullCmd) {
          case 'git branch --show-current':
            result = 'test';
            break;
          case 'git symbolic-ref HEAD':
            result = 'refs/heads/test';
            break;
        }
        return Promise.resolve({
          stdout: result,
          stderr: '',
          exitCode: 0,
        }) as unknown as Promise<core.ExecResult>;
      });

      const ref = await Git.ref();

      expect(ref).toEqual('refs/heads/test');
    });

    it('returns mocked detached tag ref', async () => {
      vi.spyOn(core, 'exec').mockImplementation((cmd, args): Promise<core.ExecResult> => {
        const fullCmd = `${cmd} ${args?.join(' ')}`;
        let result = '';
        switch (fullCmd) {
          case 'git branch --show-current':
            result = '';
            break;
          case 'git show -s --pretty=%D':
            result = 'HEAD, tag: 8.0.0';
            break;
        }
        return Promise.resolve({
          stdout: result,
          stderr: '',
          exitCode: 0,
        }) as unknown as Promise<core.ExecResult>;
      });

      const ref = await Git.ref();

      expect(ref).toEqual('refs/tags/8.0.0');
    });

    it('returns mocked detached tag ref (shallow clone)', async () => {
      vi.spyOn(core, 'exec').mockImplementation((cmd, args): Promise<core.ExecResult> => {
        const fullCmd = `${cmd} ${args?.join(' ')}`;
        let result = '';
        switch (fullCmd) {
          case 'git branch --show-current':
            result = '';
            break;
          case 'git show -s --pretty=%D':
            result = 'grafted, HEAD, tag: 8.0.0';
            break;
        }
        return Promise.resolve({
          stdout: result,
          stderr: '',
          exitCode: 0,
        }) as unknown as Promise<core.ExecResult>;
      });

      const ref = await Git.ref();

      expect(ref).toEqual('refs/tags/8.0.0');
    });

    it('returns mocked detached pull request merge ref (shallow clone)', async () => {
      vi.spyOn(core, 'exec').mockImplementation((cmd, args): Promise<core.ExecResult> => {
        const fullCmd = `${cmd} ${args?.join(' ')}`;
        let result = '';
        switch (fullCmd) {
          case 'git branch --show-current':
            result = '';
            break;
          case 'git show -s --pretty=%D':
            result = 'grafted, HEAD, pull/221/merge';
            break;
        }
        return Promise.resolve({
          stdout: result,
          stderr: '',
          exitCode: 0,
        }) as unknown as Promise<core.ExecResult>;
      });

      const ref = await Git.ref();

      expect(ref).toEqual('refs/pull/221/merge');
    });

    it('should throws an error when detached HEAD ref is not supported', async () => {
      vi.spyOn(core, 'exec').mockImplementation((cmd, args): Promise<core.ExecResult> => {
        const fullCmd = `${cmd} ${args?.join(' ')}`;
        let result = '';
        switch (fullCmd) {
          case 'git branch --show-current':
            result = '';
            break;
          case 'git show -s --pretty=%D':
            result = 'wrong, HEAD, tag: 8.0.0';
            break;
        }
        return Promise.resolve({
          stdout: result,
          stderr: '',
          exitCode: 0,
        }) as unknown as Promise<core.ExecResult>;
      });

      await expect(Git.ref()).rejects.toThrow('Cannot find detached HEAD ref in "wrong, HEAD, tag: 8.0.0"');
    });

    it('returns mocked detached branch ref', async () => {
      vi.spyOn(core, 'exec').mockImplementation((cmd, args): Promise<core.ExecResult> => {
        const fullCmd = `${cmd} ${args?.join(' ')}`;
        let result = '';
        switch (fullCmd) {
          case 'git branch --show-current':
            result = '';
            break;
          case 'git show -s --pretty=%D':
            result = 'HEAD, origin/test, test';
            break;
        }
        return Promise.resolve({
          stdout: result,
          stderr: '',
          exitCode: 0,
        }) as unknown as Promise<core.ExecResult>;
      });

      const ref = await Git.ref();

      expect(ref).toEqual('refs/heads/test');
    });
  });

  describe('fullCommit', () => {
    it('have been called', async () => {
      const execSpy = vi.spyOn(core, 'exec');
      try {
        await Git.fullCommit();
      } catch {
        // noop
      }
      expect(execSpy).toHaveBeenCalledWith(`git`, ['show', '--format=%H', 'HEAD', '--quiet', '--'], {
        silent: true,
        throwOnError: false,
      });
    });
  });

  describe('tag', () => {
    it('have been called', async () => {
      const execSpy = vi.spyOn(core, 'exec');
      try {
        await Git.tag();
      } catch {
        // noop
      }
      expect(execSpy).toHaveBeenCalledWith(`git`, ['tag', '--points-at', 'HEAD', '--sort', '-version:creatordate'], {
        silent: true,
        throwOnError: false,
      });
    });
  });
});
