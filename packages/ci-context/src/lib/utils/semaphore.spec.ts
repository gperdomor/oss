import { RunnerContext } from '../interfaces.js';
import * as semaphore from './semaphore.js';
import { Semaphore } from './semaphore.js';

describe('Semaphore Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('SEMAPHORE', 'true');
    vi.stubEnv('SEMAPHORE_GIT_REF_TYPE', 'semaphore-event-name');
    vi.stubEnv('SEMAPHORE_JOB_NAME', 'semaphore-job');
    vi.stubEnv('SEMAPHORE_GIT_REF', 'refs/heads/semaphore-ref');
    vi.stubEnv('SEMAPHORE_PIPELINE_ID', '10');
    vi.stubEnv('SEMAPHORE_JOB_ID', '100');
    vi.stubEnv('SEMAPHORE_GIT_SHA', 'semaphore-sha');
    vi.stubEnv('SEMAPHORE_GIT_URL', 'https://semaphore.com/gperdomor/oss');
    vi.stubEnv('SEMAPHORE_GIT_REPO_SLUG', 'gperdomor/oss');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    it('Should be take proper cotext values', async () => {
      context = await Semaphore.context();

      expect(context).toEqual({
        name: 'SEMAPHORE',
        actor: 'semaphore',
        eventName: 'semaphore-event-name',
        job: 'semaphore-job',
        payload: {},
        ref: 'refs/heads/semaphore-ref',
        runId: 10,
        runNumber: 100,
        repoUrl: 'https://semaphore.com/gperdomor/oss',
        sha: 'semaphore-sha',
      });
    });

    describe('When git tag is present', () => {
      beforeEach(() => {
        vi.stubEnv('SEMAPHORE_GIT_REF', 'refs/tags/semaphore-tag');
      });

      afterEach(() => {
        vi.stubEnv('SEMAPHORE_GIT_REF', '');
      });

      it('Should be take proper context values', async () => {
        context = await Semaphore.context();

        expect(context).toEqual({
          name: 'SEMAPHORE',
          actor: 'semaphore',
          eventName: 'semaphore-event-name',
          job: 'semaphore-job',
          payload: {},
          ref: 'refs/tags/semaphore-tag',
          runId: 10,
          runNumber: 100,
          repoUrl: 'https://semaphore.com/gperdomor/oss',
          sha: 'semaphore-sha',
        });
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      const repo = await semaphore.repo();

      expect(repo).toEqual({
        default_branch: '',
        description: '',
        html_url: 'https://semaphore.com/gperdomor/oss',
        license: null,
        name: 'oss',
      });
    });
  });
});
