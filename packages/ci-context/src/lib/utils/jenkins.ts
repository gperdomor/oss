/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Jenkins {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'JENKINS',
      actor: process.env['CHANGE_AUTHOR']!,
      eventName: process.env['CHANGE_FORK'] ? process.env['CHANGE_FORK'] : 'unknown',
      job: process.env['JOB_NAME']!,
      payload: {},
      ref: process.env['TAG_NAME']
        ? `refs/tags/${process.env['TAG_NAME']}`
        : `refs/heads/${process.env['BRANCH_NAME']}`,
      runId: parseInt(process.env['BUILD_NUMBER']!, 10),
      runNumber: parseInt(process.env['BUILD_NUMBER']!, 10),
      repoUrl: process.env['GIT_URL']!,
      sha: process.env['GIT_COMMIT']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: '',
    description: '',
    html_url: process.env['GIT_URL']!,
    license: null,
    name: process.env['JOB_BASE_NAME']!,
  };
}
