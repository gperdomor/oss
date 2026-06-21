import { RunnerContext } from '../interfaces.js';
import * as gitlab from './gitlab.js';
import { Gitlab } from './gitlab.js';

describe('GitLab Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('GITLAB_CI', 'true');
    vi.stubEnv('CI_PIPELINE_SOURCE', 'gitlab-event-name');
    vi.stubEnv('CI_COMMIT_SHA', 'gitlab-sha');
    vi.stubEnv('CI_COMMIT_REF_SLUG', 'gitlab-ref-slug');
    vi.stubEnv('CI_JOB_ID', 'gitlab-action');
    vi.stubEnv('GITLAB_USER_LOGIN', 'gitlab-actor');
    vi.stubEnv('CI_JOB_NAME', 'gitlab-job');
    vi.stubEnv('CI_PIPELINE_ID', '10');
    vi.stubEnv('CI_PIPELINE_IID', '100');
    vi.stubEnv('CI_DEFAULT_BRANCH', 'main');
    vi.stubEnv('CI_PROJECT_URL', 'https://gitlab.com/gperdomor/oss');
    vi.stubEnv('CI_PROJECT_NAME', 'nx-tools');
    vi.stubEnv('CI_PROJECT_VISIBILITY', 'public');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    it('Should be take proper cotext values', async () => {
      context = await Gitlab.context();

      expect(context).toEqual({
        name: 'GITLAB',
        actor: 'gitlab-actor',
        eventName: 'gitlab-event-name',
        job: 'gitlab-job',
        payload: {
          repository: {
            default_branch: 'main',
            private: false,
          },
        },
        ref: 'refs/heads/gitlab-ref-slug',
        runId: 100,
        runNumber: 10,
        repoUrl: 'https://gitlab.com/gperdomor/oss',
        sha: 'gitlab-sha',
      });
    });

    describe('When git tag is present', () => {
      beforeEach(() => {
        vi.stubEnv('CI_COMMIT_TAG', 'gitlab-tag');
        vi.stubEnv('CI_PROJECT_VISIBILITY', 'private');
      });

      afterEach(() => {
        vi.stubEnv('CI_COMMIT_TAG', '');
        vi.stubEnv('CI_PROJECT_VISIBILITY', '');
      });

      it('Should be take proper context values', async () => {
        context = await Gitlab.context();

        expect(context).toEqual({
          name: 'GITLAB',
          actor: 'gitlab-actor',
          eventName: 'gitlab-event-name',
          job: 'gitlab-job',
          payload: {
            repository: {
              default_branch: 'main',
              private: true,
            },
          },
          ref: 'refs/tags/gitlab-tag',
          runId: 100,
          runNumber: 10,
          repoUrl: 'https://gitlab.com/gperdomor/oss',
          sha: 'gitlab-sha',
        });
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      const repo = await gitlab.repo();

      expect(repo).toEqual({
        default_branch: 'main',
        description: '',
        html_url: 'https://gitlab.com/gperdomor/oss',
        license: null,
        name: 'nx-tools',
      });
    });
  });
});
