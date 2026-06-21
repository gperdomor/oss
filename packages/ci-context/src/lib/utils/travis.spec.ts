import { RunnerContext } from '../interfaces.js';
import * as travis from './travis.js';
import { Travis } from './travis.js';

describe('Travis Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('TRAVIS', 'true');
    vi.stubEnv('TRAVIS_EVENT_TYPE', 'travis-event-name');
    vi.stubEnv('TRAVIS_COMMIT', 'travis-sha');
    vi.stubEnv('TRAVIS_BRANCH', 'travis-ref-slug');
    vi.stubEnv('USER', 'travis-actor');
    vi.stubEnv('TRAVIS_JOB_NAME', 'travis-job');
    vi.stubEnv('TRAVIS_BUILD_ID', '10');
    vi.stubEnv('TRAVIS_BUILD_NUMBER', '100');
    vi.stubEnv('TRAVIS_REPO_SLUG', 'travis/nx-tools');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    it('Should be take proper cotext values', async () => {
      context = await Travis.context();

      expect(context).toEqual({
        name: 'TRAVIS',
        actor: 'travis-actor',
        eventName: 'travis-event-name',
        job: 'travis-job',
        payload: {},
        ref: 'refs/heads/travis-ref-slug',
        runId: 100,
        runNumber: 10,
        repoUrl: '',
        sha: 'travis-sha',
      });
    });

    describe('When git tag is present', () => {
      beforeEach(() => {
        vi.stubEnv('TRAVIS_TAG', 'travis-tag');
      });

      it('Should be take proper context values', async () => {
        context = await Travis.context();

        expect(context).toEqual({
          name: 'TRAVIS',
          actor: 'travis-actor',
          eventName: 'travis-event-name',
          job: 'travis-job',
          payload: {},
          ref: 'refs/tags/travis-tag',
          runId: 100,
          runNumber: 10,
          repoUrl: '',
          sha: 'travis-sha',
        });
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      const repo = await travis.repo();

      expect(repo).toEqual({
        default_branch: '',
        description: '',
        html_url: '',
        license: null,
        name: 'travis/nx-tools',
      });
    });
  });
});
