import * as core from '@nx-tools/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContextProxyFactory } from './context.factory.js';
import { RunnerContext } from './interfaces.js';
import { Azure } from './utils/azure-devops.js';
import { BitBucket } from './utils/bitbucket.js';
import { Circle } from './utils/circle.js';
import { Drone } from './utils/drone.js';
import { Git } from './utils/git.js';
import { Github } from './utils/github.js';
import { Gitlab } from './utils/gitlab.js';
import { Jenkins } from './utils/jenkins.js';
import { Semaphore } from './utils/semaphore.js';
import { Teamcity } from './utils/teamcity.js';
import { Travis } from './utils/travis.js';

vi.mock('@nx-tools/core', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('std-env');

vi.mock('./utils/azure-devops.js');
vi.mock('./utils/bitbucket.js');
vi.mock('./utils/circle.js');
vi.mock('./utils/drone.js');
vi.mock('./utils/git.js');
vi.mock('./utils/github.js');
vi.mock('./utils/gitlab.js');
vi.mock('./utils/jenkins.js');
vi.mock('./utils/semaphore.js');
vi.mock('./utils/teamcity.js');
vi.mock('./utils/travis.js');

describe('ContextProxyFactory', () => {
  const mockContext: RunnerContext = {
    name: 'TEST',
    actor: 'test-actor',
    eventName: 'test-event',
    job: 'test-job',
    payload: {},
    ref: 'test-ref',
    runId: 123,
    runNumber: 456,
    repoUrl: 'https://test.com/test/repo',
    sha: 'test-sha',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('create', () => {
    it('should create Azure context when provider is azure_pipelines', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'azure_pipelines';
      vi.mocked(Azure.context).mockResolvedValue({ ...mockContext, name: 'AZURE' });

      const result = await ContextProxyFactory.create();

      expect(Azure.context).toHaveBeenCalled();
      expect(result.name).toBe('AZURE');
    });

    it('should create BitBucket context when provider is bitbucket', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'bitbucket';
      vi.mocked(BitBucket.context).mockResolvedValue({ ...mockContext, name: 'BITBUCKET' });

      const result = await ContextProxyFactory.create();

      expect(BitBucket.context).toHaveBeenCalled();
      expect(result.name).toBe('BITBUCKET');
    });

    it('should create Circle context when provider is circle', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'circle';
      vi.mocked(Circle.context).mockResolvedValue({ ...mockContext, name: 'CIRCLE' });

      const result = await ContextProxyFactory.create();

      expect(Circle.context).toHaveBeenCalled();
      expect(result.name).toBe('CIRCLE');
    });

    it('should create Drone context when provider is drone', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'drone';
      vi.mocked(Drone.context).mockResolvedValue({ ...mockContext, name: 'DRONE' });

      const result = await ContextProxyFactory.create();

      expect(Drone.context).toHaveBeenCalled();
      expect(result.name).toBe('DRONE');
    });

    it('should create Github context when provider is github_actions', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'github_actions';
      vi.mocked(Github.context).mockResolvedValue({ ...mockContext, name: 'GITHUB' });

      const result = await ContextProxyFactory.create();

      expect(Github.context).toHaveBeenCalled();
      expect(result.name).toBe('GITHUB');
    });

    it('should create Gitlab context when provider is gitlab', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'gitlab';
      vi.mocked(Gitlab.context).mockResolvedValue({ ...mockContext, name: 'GITLAB' });

      const result = await ContextProxyFactory.create();

      expect(Gitlab.context).toHaveBeenCalled();
      expect(result.name).toBe('GITLAB');
    });

    it('should create Jenkins context when provider is hudson and JENKINS env is set', async () => {
      vi.stubEnv('HUDSON_URL', 'true');
      vi.stubEnv('JENKINS', 'true');

      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'hudson';
      vi.mocked(Jenkins.context).mockResolvedValue({ ...mockContext, name: 'JENKINS' });

      const result = await ContextProxyFactory.create();

      expect(Jenkins.context).toHaveBeenCalled();
      expect(result.name).toBe('JENKINS');
    });

    it('should create Jenkins context when provider is hudson and JENKINS_URL env is set', async () => {
      vi.stubEnv('HUDSON_URL', 'true');
      vi.stubEnv('JENKINS_URL', 'http://jenkins.example.com');

      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'hudson';
      vi.mocked(Jenkins.context).mockResolvedValue({ ...mockContext, name: 'JENKINS' });

      const result = await ContextProxyFactory.create();

      expect(Jenkins.context).toHaveBeenCalled();
      expect(result.name).toBe('JENKINS');
    });

    it('should fallback to Git context when provider is hudson but neither JENKINS nor JENKINS_URL is set', async () => {
      vi.stubEnv('HUDSON_URL', 'true');

      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'hudson';
      vi.mocked(Git.context).mockResolvedValue({ ...mockContext, name: 'GIT' });

      const result = await ContextProxyFactory.create();

      expect(core.logger.info).toHaveBeenCalledWith(
        'Unsupported CI Provider "hudson"... Using Git context as fallback',
      );
      expect(Git.context).toHaveBeenCalled();
      expect(result.name).toBe('GIT');
    });

    it('should create Jenkins context when provider is jenkins', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'jenkins';
      vi.mocked(Jenkins.context).mockResolvedValue({ ...mockContext, name: 'JENKINS' });

      const result = await ContextProxyFactory.create();

      expect(Jenkins.context).toHaveBeenCalled();
      expect(result.name).toBe('JENKINS');
    });

    it('should create Semaphore context when provider is semaphore', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'semaphore';
      vi.mocked(Semaphore.context).mockResolvedValue({ ...mockContext, name: 'SEMAPHORE' });

      const result = await ContextProxyFactory.create();

      expect(Semaphore.context).toHaveBeenCalled();
      expect(result.name).toBe('SEMAPHORE');
    });

    it('should create Travis context when provider is travis', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'travis';
      vi.mocked(Travis.context).mockResolvedValue({ ...mockContext, name: 'TRAVIS' });

      const result = await ContextProxyFactory.create();

      expect(Travis.context).toHaveBeenCalled();
      expect(result.name).toBe('TRAVIS');
    });

    it('should create Teamcity context when provider is teamcity', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'teamcity';
      vi.mocked(Teamcity.context).mockResolvedValue({ ...mockContext, name: 'TEAMCITY' });

      const result = await ContextProxyFactory.create();

      expect(Teamcity.context).toHaveBeenCalled();
      expect(result.name).toBe('TEAMCITY');
    });

    it('should fallback to Git context when provider is unknown', async () => {
      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = '';

      // No CI environment variables set
      vi.mocked(Git.context).mockResolvedValue({ ...mockContext, name: 'GIT' });

      const result = await ContextProxyFactory.create();

      expect(core.logger.info).toHaveBeenCalledWith('Unsupported CI Provider ""... Using Git context as fallback');
      expect(Git.context).toHaveBeenCalled();
      expect(result.name).toBe('GIT');
    });

    it('should fallback to Git context when provider is an unsupported CI', async () => {
      vi.stubEnv('CI', 'true');

      const stdEnv = await import('std-env');
      vi.mocked(stdEnv).provider = 'zeabur';

      vi.mocked(Git.context).mockResolvedValue({ ...mockContext, name: 'GIT' });

      const result = await ContextProxyFactory.create();

      expect(core.logger.info).toHaveBeenCalled();
      expect(Git.context).toHaveBeenCalled();
      expect(result.name).toBe('GIT');
    });
  });
});
