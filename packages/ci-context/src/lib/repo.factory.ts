import { provider } from 'std-env';
import { RepoMetadata } from './interfaces.js';
import * as azure from './utils/azure-devops.js';
import * as bitbucket from './utils/bitbucket.js';
import * as circle from './utils/circle.js';
import * as drone from './utils/drone.js';
import * as git from './utils/git.js';
import * as github from './utils/github.js';
import * as gitlab from './utils/gitlab.js';
import * as jenkins from './utils/jenkins.js';
import * as semaphore from './utils/semaphore.js';
import * as teamcity from './utils/teamcity.js';
import * as travis from './utils/travis.js';

export class RepoProxyFactory {
  public static async create(token: string): Promise<RepoMetadata> {
    switch (provider) {
      case 'azure_pipelines':
        return azure.repo();

      case 'bitbucket':
        return bitbucket.repo();

      case 'circle':
        return circle.repo();

      case 'drone':
        return drone.repo();

      case 'github_actions':
        return github.repo(token);

      case 'gitlab':
        return gitlab.repo();

      case 'jenkins':
        return jenkins.repo();

      case 'semaphore':
        return semaphore.repo();

      case 'travis':
        return travis.repo();

      case 'teamcity':
        return teamcity.repo();

      default:
        return git.repo();
    }
  }
}
