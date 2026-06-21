/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Drone {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'DRONE',
      actor: process.env['DRONE_COMMIT_AUTHOR']!,
      eventName: process.env['DRONE_BUILD_EVENT']!,
      job: process.env['DRONE_STAGE_NAME']!,
      payload: {
        repository: {
          private: process.env['DRONE_REPO_PRIVATE'] === 'true',
        },
      },
      ref: process.env['DRONE_COMMIT_REF']!,
      runId: parseInt(process.env['DRONE_BUILD_NUMBER']!, 10),
      runNumber: parseInt(process.env['DRONE_BUILD_NUMBER']!, 10),
      repoUrl: process.env['DRONE_REPO_LINK']!,
      sha: process.env['DRONE_COMMIT_SHA']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: process.env['DRONE_REPO_BRANCH']!,
    description: '',
    html_url: process.env['DRONE_REPO_LINK']!,
    license: null,
    name: process.env['DRONE_REPO']!,
  };
}
