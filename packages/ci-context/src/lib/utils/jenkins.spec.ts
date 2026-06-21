import { RunnerContext } from '../interfaces.js';
import * as jenkins from './jenkins.js';
import { Jenkins } from './jenkins.js';

describe('Jenkins Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('CI', 'true');
    vi.stubEnv('CHANGE_FORK', 'pull_request');
    vi.stubEnv('GIT_COMMIT', 'jenkins-sha');
    vi.stubEnv('BRANCH_NAME', 'jenkins-ref-slug');
    vi.stubEnv('CHANGE_AUTHOR', 'jenkins-actor');
    vi.stubEnv('JOB_NAME', 'jenkins-job');
    vi.stubEnv('BUILD_NUMBER', '40');
    vi.stubEnv('GIT_URL', 'https://jenkins.com/gperdomor/oss');
    vi.stubEnv('JOB_BASE_NAME', 'nx-tools');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    it('Should be take proper context values', async () => {
      context = await Jenkins.context();

      expect(context).toEqual({
        name: 'JENKINS',
        actor: 'jenkins-actor',
        eventName: 'pull_request',
        job: 'jenkins-job',
        payload: {},
        ref: 'refs/heads/jenkins-ref-slug',
        runId: 40,
        runNumber: 40,
        repoUrl: 'https://jenkins.com/gperdomor/oss',
        sha: 'jenkins-sha',
      });
    });

    it('Should be take proper context values - no pr', async () => {
      delete process.env['CHANGE_FORK'];
      context = await Jenkins.context();

      expect(context).toEqual({
        name: 'JENKINS',
        actor: 'jenkins-actor',
        eventName: 'unknown',
        job: 'jenkins-job',
        payload: {},
        ref: 'refs/heads/jenkins-ref-slug',
        runId: 40,
        runNumber: 40,
        repoUrl: 'https://jenkins.com/gperdomor/oss',
        sha: 'jenkins-sha',
      });
    });

    describe('When git tag is present', () => {
      beforeEach(() => {
        process.env['TAG_NAME'] = 'jenkins-tag';
      });

      it('Should be take proper context values', async () => {
        context = await Jenkins.context();

        expect(context).toEqual({
          name: 'JENKINS',
          actor: 'jenkins-actor',
          eventName: 'pull_request',
          job: 'jenkins-job',
          payload: {},
          ref: 'refs/tags/jenkins-tag',
          runId: 40,
          runNumber: 40,
          repoUrl: 'https://jenkins.com/gperdomor/oss',
          sha: 'jenkins-sha',
        });
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      const repo = await jenkins.repo();

      expect(repo).toEqual({
        default_branch: '',
        description: '',
        html_url: 'https://jenkins.com/gperdomor/oss',
        license: null,
        name: 'nx-tools',
      });
    });
  });
});
