import { RunnerContext } from '../interfaces.js';
import * as circle from './circle.js';
import { Circle } from './circle.js';

describe('CircleCI Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('CIRCLECI', 'true');
    vi.stubEnv('CI_PULL_REQUEST', 'true');
    vi.stubEnv('CIRCLE_SHA1', 'circleci-sha');
    vi.stubEnv('CIRCLE_BRANCH', 'circleci-ref-slug');
    vi.stubEnv('CIRCLE_USERNAME', 'circleci-actor');
    vi.stubEnv('CIRCLE_JOB', 'circleci-job');
    vi.stubEnv('CIRCLE_BUILD_NUM', '30');
    vi.stubEnv('CIRCLE_REPOSITORY_URL', 'https://circle.com/gperdomor/oss');
    vi.stubEnv('CIRCLE_PROJECT_REPONAME', 'nx-tools');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    it('Should be take proper context values', async () => {
      context = await Circle.context();

      expect(context).toEqual({
        name: 'CIRCLE',
        actor: 'circleci-actor',
        eventName: 'pull_request',
        job: 'circleci-job',
        payload: {},
        ref: 'refs/heads/circleci-ref-slug',
        runId: 30,
        runNumber: 30,
        repoUrl: 'https://circle.com/gperdomor/oss',
        sha: 'circleci-sha',
      });
    });

    it('Should be take proper context values - no pr', async () => {
      delete process.env['CI_PULL_REQUEST'];
      context = await Circle.context();

      expect(context).toEqual({
        name: 'CIRCLE',
        actor: 'circleci-actor',
        eventName: 'unknown',
        job: 'circleci-job',
        payload: {},
        ref: 'refs/heads/circleci-ref-slug',
        runId: 30,
        runNumber: 30,
        repoUrl: 'https://circle.com/gperdomor/oss',
        sha: 'circleci-sha',
      });
    });

    describe('When git tag is present', () => {
      beforeEach(() => {
        vi.stubEnv('CIRCLE_TAG', 'circleci-tag');
      });

      afterEach(() => {
        vi.stubEnv('CIRCLE_TAG', '');
      });

      it('Should be take proper context values', async () => {
        context = await Circle.context();

        expect(context).toEqual({
          name: 'CIRCLE',
          actor: 'circleci-actor',
          eventName: 'pull_request',
          job: 'circleci-job',
          payload: {},
          ref: 'refs/tags/circleci-tag',
          runId: 30,
          runNumber: 30,
          repoUrl: 'https://circle.com/gperdomor/oss',
          sha: 'circleci-sha',
        });
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      const repo = await circle.repo();

      expect(repo).toEqual({
        default_branch: '',
        description: '',
        html_url: 'https://circle.com/gperdomor/oss',
        license: null,
        name: 'nx-tools',
      });
    });
  });
});
