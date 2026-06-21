import { RunnerContext } from '../interfaces.js';
import * as drone from './drone.js';
import { Drone } from './drone.js';

describe('Drone Context', () => {
  let context: RunnerContext;

  beforeEach(() => {
    vi.stubEnv('DRONE', 'true');
    vi.stubEnv('DRONE_BUILD_EVENT', 'drone-event-name');
    vi.stubEnv('DRONE_COMMIT_SHA', 'drone-sha');
    vi.stubEnv('DRONE_COMMIT_REF', 'refs/heads/drone-ref');
    vi.stubEnv('DRONE_STAGE_NAME', 'drone-job');
    vi.stubEnv('DRONE_COMMIT_AUTHOR', 'drone-actor');
    vi.stubEnv('DRONE_BUILD_NUMBER', '100');
    vi.stubEnv('DRONE_REPO_BRANCH', 'drone-main');
    vi.stubEnv('DRONE_REPO_LINK', 'https://drone.com/gperdomor/oss');
    vi.stubEnv('DRONE_REPO', 'gperdomor/oss');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('context', () => {
    it('Should be take proper cotext values', async () => {
      context = await Drone.context();

      expect(context).toEqual({
        name: 'DRONE',
        actor: 'drone-actor',
        eventName: 'drone-event-name',
        job: 'drone-job',
        payload: {
          repository: {
            private: false,
          },
        },
        ref: 'refs/heads/drone-ref',
        runId: 100,
        runNumber: 100,
        repoUrl: 'https://drone.com/gperdomor/oss',
        sha: 'drone-sha',
      });
    });

    describe('When git tag is present', () => {
      beforeEach(() => {
        vi.stubEnv('DRONE_COMMIT_REF', 'refs/tags/drone-v1.0.0');
        vi.stubEnv('DRONE_REPO_PRIVATE', 'true');
      });

      afterEach(() => {
        vi.stubEnv('DRONE_COMMIT_REF', '');
        vi.stubEnv('DRONE_REPO_PRIVATE', '');
      });

      it('Should be take proper context values', async () => {
        context = await Drone.context();

        expect(context).toEqual({
          name: 'DRONE',
          actor: 'drone-actor',
          eventName: 'drone-event-name',
          job: 'drone-job',
          payload: {
            repository: {
              private: true,
            },
          },
          ref: 'refs/tags/drone-v1.0.0',
          runId: 100,
          runNumber: 100,
          repoUrl: 'https://drone.com/gperdomor/oss',
          sha: 'drone-sha',
        });
      });
    });
  });

  describe('repo', () => {
    it('Should be take proper repo values', async () => {
      const repo = await drone.repo();

      expect(repo).toEqual({
        default_branch: 'drone-main',
        description: '',
        html_url: 'https://drone.com/gperdomor/oss',
        license: null,
        name: 'gperdomor/oss',
      });
    });
  });
});
