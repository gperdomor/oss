import { RunnerContext } from '../interfaces.js';
import * as github from './github.js';
import { Github } from './github.js';

vi.mock('@actions/github', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('@actions/github')>()),
    getOctokit: vi.fn(() => ({
      rest: {
        repos: {
          get: vi.fn(() => ({
            data: {
              default_branch: 'main',
              description: 'Nx Tools',
              html_url: 'https://github.com/gperdomor/oss',
              license: 'MIT',
              name: 'nx-tools',
            },
          })),
        },
      },
    })),
  };
});

describe('GitHub Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('GITHUB_ACTIONS', 'true');
    vi.stubEnv('GITHUB_EVENT_NAME', 'github-event-name');
    vi.stubEnv('GITHUB_SHA', 'github-sha');
    vi.stubEnv('GITHUB_REF', 'github-ref');
    vi.stubEnv('GITHUB_ACTOR', 'github-actor');
    vi.stubEnv('GITHUB_JOB', 'github-job');
    vi.stubEnv('GITHUB_RUN_NUMBER', '20');
    vi.stubEnv('GITHUB_RUN_ID', '200');
    vi.stubEnv('GITHUB_REPOSITORY', 'gperdomor/oss');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    it('Should be take proper context values', async () => {
      context = await Github.context();

      expect(context).toEqual({
        name: 'GITHUB',
        actor: 'github-actor',
        eventName: 'github-event-name',
        job: 'github-job',
        payload: {},
        ref: 'github-ref',
        runId: 200,
        runNumber: 20,
        repoUrl: 'https://github.com/gperdomor/oss',
        sha: 'github-sha',
      });
    });
  });

  describe('repo', () => {
    it('Should throws if not token provided', async () => {
      await expect(github.repo()).rejects.toThrow('Missing github token');
    });

    it('Should be take proper repo values', async () => {
      const repo = await github.repo('FAKE_TOKEN');

      expect(repo).toEqual({
        default_branch: 'main',
        description: 'Nx Tools',
        html_url: 'https://github.com/gperdomor/oss',
        license: 'MIT',
        name: 'nx-tools',
      });
    });
  });
});
