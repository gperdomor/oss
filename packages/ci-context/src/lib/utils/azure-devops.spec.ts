import { RunnerContext } from '../interfaces.js';
import * as devops from './azure-devops.js';
import { Azure } from './azure-devops.js';

describe('Azure DevOps Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('BUILD_SOURCEVERSION', 'devops-sha');
    vi.stubEnv('BUILD_SOURCEVERSIONAUTHOR', 'devops-actor');
    vi.stubEnv('AGENT_JOBNAME', 'devops-job');
    vi.stubEnv('BUILD_BUILDID', '40');
    vi.stubEnv('BUILD_REPOSITORY_URI', 'https://azure.com/gperdomor/oss');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    describe('When building pull requests', () => {
      beforeEach(() => {
        vi.stubEnv('SYSTEM_PULLREQUEST_SOURCEBRANCH', 'refs/heads/devops-ref-slug');
        vi.stubEnv('SYSTEM_PULLREQUEST_PULLREQUESTID', '123');
      });

      it('Should be take proper context values', async () => {
        context = await Azure.context();

        expect(context).toEqual({
          name: 'AZURE',
          actor: 'devops-actor',
          eventName: 'pull_request',
          job: 'devops-job',
          payload: {},
          ref: 'refs/heads/devops-ref-slug',
          runId: 40,
          runNumber: 40,
          repoUrl: 'https://azure.com/gperdomor/oss',
          sha: 'devops-sha',
        });
      });
    });

    describe('When building branches', () => {
      beforeEach(() => {
        vi.stubEnv('BUILD_SOURCEBRANCH', 'refs/heads/devops-ref-slug');
      });

      it('Should be take proper context values', async () => {
        context = await Azure.context();

        expect(context).toEqual({
          name: 'AZURE',
          actor: 'devops-actor',
          eventName: 'unknown',
          job: 'devops-job',
          payload: {},
          ref: 'refs/heads/devops-ref-slug',
          runId: 40,
          runNumber: 40,
          repoUrl: 'https://azure.com/gperdomor/oss',
          sha: 'devops-sha',
        });
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      const repo = await devops.repo();

      expect(repo).toEqual({
        default_branch: '',
        description: '',
        html_url: 'https://azure.com/gperdomor/oss',
        license: null,
        name: 'devops-job',
      });
    });
  });
});
