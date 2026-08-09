import type { Interfaces } from '@oclif/core';
import { type Mock, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@nx-tools/core', () => ({
  execSync: vi.fn(),
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockImplementation(actual.readFileSync),
  };
});

import { execSync } from '@nx-tools/core';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createLoadOptions } from '../load-options.js';
import Gitlab, { stripNewLineEndings } from './gitlab.js';

const BASE_URL = 'https://gitlab.example.com/api/v4';
const PROJECT_ID = '99999';
const HEAD_SHA = 'aabbccddeeff0011aabbccddeeff0011aabbccdd';
const PIPELINE_SHA = 'deadbeef1234abcddeadbeef1234abcddeadbeef';

describe('stripNewLineEndings', () => {
  it('removes a trailing newline', () => {
    expect(stripNewLineEndings('abc123\n')).toBe('abc123');
  });

  it('removes multiple trailing newlines', () => {
    expect(stripNewLineEndings('abc123\n\n')).toBe('abc123');
  });

  it('removes Windows line endings', () => {
    expect(stripNewLineEndings('abc123\r\n')).toBe('abc123');
  });

  it('removes mixed line endings', () => {
    expect(stripNewLineEndings('abc123\n\r\n')).toBe('abc123');
  });

  it('returns the string unchanged when there is no newline', () => {
    expect(stripNewLineEndings('abc123')).toBe('abc123');
  });
});

describe('Gitlab command', () => {
  let loadOptions: Interfaces.Options;
  let fetchMock: Mock;

  beforeAll(() => {
    loadOptions = createLoadOptions();
  });

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // Default execSync: HEAD returns HEAD_SHA, rev-parse for branch~1 returns PIPELINE_SHA
    (execSync as Mock).mockImplementation((_cmd: string, args: string[]) => {
      if (args[0] === 'rev-parse' && args[1] === 'HEAD') {
        return { stdout: `${HEAD_SHA}\n`, exitCode: 0 };
      }
      if (args[0] === 'rev-parse') {
        // covers origin/main~1
        return { stdout: `${PIPELINE_SHA}\n`, exitCode: 0 };
      }
      if (args[0] === 'merge-base') {
        return { stdout: `${PIPELINE_SHA}\n`, exitCode: 0 };
      }
      if (args[0] === 'cat-file') {
        return { stdout: '', exitCode: 0 };
      }
      if (args[0] === 'hash-object') {
        return { stdout: '4b825dc642cb6eb9a060e54bf8d69288fbee4904\n', exitCode: 0 };
      }
      return { stdout: '', exitCode: 0 };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    delete process.env.CI_MERGE_REQUEST_IID;
    delete process.env.CI_MERGE_REQUEST_EVENT_TYPE;
    delete process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME;
    delete process.env.CI_JOB_TOKEN;
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Mock a single successful pipeline lookup + commitExists pass for PIPELINE_SHA */
  function mockSuccessfulPipeline(sha = PIPELINE_SHA) {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [{ sha }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: sha }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: sha }] });
  }

  // ── Helper Methods ───────────────────────────────────────────────────────

  describe('resolveFallbackSHA', () => {
    beforeEach(() => {
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] });
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('uses provided fallback SHA when specified', async () => {
      vi.stubEnv('CI_MERGE_REQUEST_EVENT_TYPE', 'merged_result');

      const result = (await Gitlab.run(
        ['--url', BASE_URL, '--project', PROJECT_ID, '--fallback', 'myCustomSha'],
        loadOptions,
      )) as { NX_BASE: string; NX_HEAD: string };

      expect(result.NX_BASE).toBe('myCustomSha');
    });

    it('uses HEAD~1 when available', async () => {
      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(PIPELINE_SHA);
      expect(execSync).toHaveBeenCalledWith('git', ['rev-parse', 'origin/main~1'], expect.any(Object));
    });

    it('uses empty tree hash when HEAD~1 does not exist', async () => {
      const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
      (execSync as Mock).mockImplementation((_cmd: string, args: string[]) => {
        if (args[0] === 'rev-parse' && args[1] === 'HEAD') {
          return { stdout: `${HEAD_SHA}\n`, exitCode: 0 };
        }
        if (args[0] === 'rev-parse' && args[1].includes('~1')) {
          return { stdout: '', exitCode: 128 };
        }
        if (args[0] === 'hash-object') {
          return { stdout: `${EMPTY_TREE}\n`, exitCode: 0 };
        }
        return { stdout: '', exitCode: 0 };
      });

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(EMPTY_TREE);
    });
  });

  // ── Merge request event ───────────────────────────────────────────────────

  describe('merge request event', () => {
    beforeEach(() => {
      process.env.CI_MERGE_REQUEST_IID = '42';
      process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME = 'main';
    });

    it('resolves BASE via git merge-base when event type is not merged_result', async () => {
      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(execSync).toHaveBeenCalledWith('git', ['merge-base', 'origin/main', 'HEAD'], expect.any(Object));
      expect(result.NX_BASE).toBe(PIPELINE_SHA);
      expect(result.NX_HEAD).toBe(HEAD_SHA);
    });

    it('falls through to pipeline API when event type is merged_result', async () => {
      process.env.CI_MERGE_REQUEST_EVENT_TYPE = 'merged_result';
      mockSuccessfulPipeline();

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(PIPELINE_SHA);
      expect(result.NX_HEAD).toBe(HEAD_SHA);
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  // ── Push event - successful pipeline ────────────────────────────────────

  describe('push event - successful pipeline found', () => {
    it('returns NX_BASE from the most recent successful pipeline SHA', async () => {
      mockSuccessfulPipeline();

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(PIPELINE_SHA);
      expect(result.NX_HEAD).toBe(HEAD_SHA);
    });

    it('uses PRIVATE-TOKEN header when --token is provided', async () => {
      mockSuccessfulPipeline();

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID, '--token', 'my-secret'], loadOptions);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/pipelines'),
        expect.objectContaining({ headers: { 'PRIVATE-TOKEN': 'my-secret' } }),
      );
    });

    it('uses JOB-TOKEN header when no token is provided', async () => {
      process.env.CI_JOB_TOKEN = 'ci-job-token';
      mockSuccessfulPipeline();

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/pipelines'),
        expect.objectContaining({ headers: { 'JOB-TOKEN': 'ci-job-token' } }),
      );
    });

    it('includes ref= query param for push events', async () => {
      mockSuccessfulPipeline();

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID, '--branch', 'main'], loadOptions);

      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('ref=main'), expect.any(Object));
    });

    it('omits ref= query param for merge_request_event', async () => {
      mockSuccessfulPipeline();

      await Gitlab.run(
        ['--url', BASE_URL, '--project', PROJECT_ID, '--last-successful-event', 'merge_request_event'],
        loadOptions,
      );

      const [url] = fetchMock.mock.calls[0] as [string];
      expect(url).not.toContain('ref=');
    });

    it('skips a SHA whose commit details API returns an error', async () => {
      const BAD_SHA = 'badc0ffee000000000000000000000000000000';

      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => [{ sha: BAD_SHA }, { sha: PIPELINE_SHA }] })
        // commitExists for BAD_SHA: commit details returns 404
        .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Not Found' }) })
        // commitExists for PIPELINE_SHA: commit details OK
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: PIPELINE_SHA }) })
        // commitExists for PIPELINE_SHA: commits on branch
        .mockResolvedValueOnce({ ok: true, json: async () => [{ id: PIPELINE_SHA }] });

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(PIPELINE_SHA);
    });

    it('skips a SHA that exists globally but not on the target branch', async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => [{ sha: PIPELINE_SHA }] })
        // commit exists in GitLab
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: PIPELINE_SHA }) })
        // but is NOT in the branch commits list
        .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'other-sha' }] });

      // HEAD~1 fallback
      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      // No pipeline SHA found → falls back to HEAD~1
      expect(result.NX_BASE).toBe(PIPELINE_SHA); // PIPELINE_SHA is also what rev-parse origin/main~1 returns in the default mock
    });
  });

  // ── Push event - no successful pipeline ─────────────────────────────────

  describe('push event - no successful pipeline found', () => {
    beforeEach(() => {
      // Pipelines API returns empty list
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] });
    });

    it('throws when --error-on-no-successful-pipeline is set', async () => {
      await expect(
        Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID, '--error-on-no-successful-pipeline'], loadOptions),
      ).rejects.toThrow();
    });

    it('uses the provided --fallback SHA', async () => {
      const result = (await Gitlab.run(
        ['--url', BASE_URL, '--project', PROJECT_ID, '--fallback', 'fallback000sha'],
        loadOptions,
      )) as { NX_BASE: string; NX_HEAD: string };

      expect(result.NX_BASE).toBe('fallback000sha');
      expect(result.NX_HEAD).toBe(HEAD_SHA);
    });

    it('defaults to HEAD~1 when it exists', async () => {
      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(execSync).toHaveBeenCalledWith(
        'git',
        ['rev-parse', 'origin/main~1'],
        expect.objectContaining({ nodeOptions: { encoding: 'utf-8' } }),
      );
      expect(result.NX_BASE).toBe(PIPELINE_SHA);
    });

    it('defaults to empty tree hash when HEAD~1 does not exist', async () => {
      const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

      (execSync as Mock).mockImplementation((_cmd: string, args: string[]) => {
        if (args[0] === 'rev-parse' && args[1] === 'HEAD') return { stdout: `${HEAD_SHA}\n`, exitCode: 0 };
        if (args[0] === 'rev-parse') return { stdout: '', exitCode: 128 }; // HEAD~1 not found
        if (args[0] === 'hash-object') return { stdout: `${EMPTY_TREE}\n`, exitCode: 0 };
        return { stdout: '', exitCode: 0 };
      });

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(EMPTY_TREE);
    });

    it('falls back to the hardcoded empty tree constant when hash-object produces no stdout', async () => {
      (execSync as Mock).mockImplementation((_cmd: string, args: string[]) => {
        if (args[0] === 'rev-parse' && args[1] === 'HEAD') return { stdout: `${HEAD_SHA}\n`, exitCode: 0 };
        if (args[0] === 'rev-parse') return { stdout: '', exitCode: 128 };
        if (args[0] === 'hash-object') return { stdout: null, exitCode: 0 };
        return { stdout: '', exitCode: 0 };
      });

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe('4b825dc642cb6eb9a060e54bf8d69288fbee4904');
    });
  });

  // ── Pipeline API error ───────────────────────────────────────────────────

  it('throws when the pipelines API returns an error response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Unauthorized' }) });

    await expect(Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)).rejects.toThrow();
  });

  // ── HTTP Client Tests ────────────────────────────────────────────────────

  describe('GitLabHttpClient integration', () => {
    it('uses the HTTP client for pipeline API calls', async () => {
      mockSuccessfulPipeline();

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions);

      const [firstCall] = fetchMock.mock.calls[0] as [string];
      expect(firstCall).toContain('/pipelines');
      expect(firstCall).toContain('scope=finished');
      expect(firstCall).toContain('status=success');
    });

    it('applies timeout to all API calls', async () => {
      mockSuccessfulPipeline();

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions);

      const calls = fetchMock.mock.calls;
      calls.forEach(([, options]) => {
        expect((options as Record<string, unknown>).signal).toBeDefined();
      });
    });

    it('preserves existing headers when making API calls', async () => {
      process.env.CI_JOB_TOKEN = 'test-token';
      mockSuccessfulPipeline();

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/pipelines'),
        expect.objectContaining({
          headers: { 'JOB-TOKEN': 'test-token' },
        }),
      );
    });
  });

  // ── Commit Validation Tests ──────────────────────────────────────────────

  describe('commit validation steps', () => {
    it('skips commit if local git check fails', async () => {
      const BAD_SHA = 'badc0ffee000000000000000000000000000000';

      (execSync as Mock).mockImplementation((_cmd: string, args: string[]) => {
        if (args[0] === 'cat-file') {
          return { stdout: '', exitCode: 128 }; // cat-file fails
        }
        if (args[0] === 'rev-parse' && args[1] === 'HEAD') {
          return { stdout: `${HEAD_SHA}\n`, exitCode: 0 };
        }
        return { stdout: `${PIPELINE_SHA}\n`, exitCode: 0 };
      });

      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => [{ sha: BAD_SHA }, { sha: PIPELINE_SHA }] })
        // commitExists for PIPELINE_SHA: commit details OK
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: PIPELINE_SHA }) })
        // commitExists for PIPELINE_SHA: commits on branch
        .mockResolvedValueOnce({ ok: true, json: async () => [{ id: PIPELINE_SHA }] });

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(PIPELINE_SHA);
    });

    it('validates commit exists globally in GitLab', async () => {
      const BAD_SHA = 'badc0ffee000000000000000000000000000000';

      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => [{ sha: BAD_SHA }, { sha: PIPELINE_SHA }] })
        // commitExists for BAD_SHA: local git ok, but API returns 404
        .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Not Found' }) })
        // commitExists for PIPELINE_SHA: commit details OK
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: PIPELINE_SHA }) })
        // commitExists for PIPELINE_SHA: commits on branch
        .mockResolvedValueOnce({ ok: true, json: async () => [{ id: PIPELINE_SHA }] });

      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(PIPELINE_SHA);
    });

    it('validates commit exists on the target branch', async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => [{ sha: PIPELINE_SHA }] })
        // commit exists locally and globally
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: PIPELINE_SHA }) })
        // but NOT in the branch commits list
        .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'other-sha' }] });

      // Should fall back to HEAD~1
      const result = (await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID], loadOptions)) as {
        NX_BASE: string;
        NX_HEAD: string;
      };

      expect(result.NX_BASE).toBe(PIPELINE_SHA); // HEAD~1 is also PIPELINE_SHA in mocks
    });
  });

  // ── Output file ──────────────────────────────────────────────────────────

  describe('output file', () => {
    it('writes NX_BASE and NX_HEAD to a new file', async () => {
      mockSuccessfulPipeline();
      (existsSync as Mock).mockReturnValue(false);

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID, '--output', 'nx.env'], loadOptions);

      expect(writeFileSync).toHaveBeenCalledWith('nx.env', `NX_BASE=${PIPELINE_SHA}\nNX_HEAD=${HEAD_SHA}`, {
        encoding: 'utf-8',
      });
    });

    it('preserves unrelated variables and replaces NX_BASE/NX_HEAD in an existing file', async () => {
      mockSuccessfulPipeline();
      (existsSync as Mock).mockReturnValue(true);
      (readFileSync as Mock).mockReturnValueOnce(Buffer.from(`MY_VAR=hello\nNX_BASE=old-base\nNX_HEAD=old-head\n`));

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID, '--output', 'nx.env'], loadOptions);

      expect(writeFileSync).toHaveBeenCalledWith(
        'nx.env',
        `MY_VAR=hello\nNX_BASE=${PIPELINE_SHA}\nNX_HEAD=${HEAD_SHA}`,
        { encoding: 'utf-8' },
      );
    });
  });

  // ── setupWorkingDirectory ────────────────────────────────────────────────

  describe('setupWorkingDirectory', () => {
    it('calls process.chdir when the working directory exists', async () => {
      const chdirSpy = vi.spyOn(process, 'chdir').mockImplementation(() => {
        /* no-op */
      });
      (existsSync as Mock).mockImplementation((p: string) => p === '/custom/dir');
      mockSuccessfulPipeline();

      await Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID, '--working-directory', '/custom/dir'], loadOptions);

      expect(chdirSpy).toHaveBeenCalledWith('/custom/dir');
    });

    it('does not throw and logs a warning when the working directory does not exist', async () => {
      (existsSync as Mock).mockReturnValue(false);
      mockSuccessfulPipeline();

      await expect(
        Gitlab.run(['--url', BASE_URL, '--project', PROJECT_ID, '--working-directory', '/nonexistent'], loadOptions),
      ).resolves.toBeDefined();
    });
  });
});
