/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class BitBucket {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'BITBUCKET',
      actor: process.env['BITBUCKET_STEP_TRIGGERER_UUID']!,
      eventName: process.env['BITBUCKET_PR_ID'] ? 'pull_request' : 'unknown',
      job: process.env['BITBUCKET_STEP_UUID']!,
      payload: {},
      ref: process.env['BITBUCKET_TAG']
        ? `refs/tags/${process.env['BITBUCKET_TAG']}`
        : `refs/heads/${process.env['BITBUCKET_BRANCH']}`,
      runId: parseInt(process.env['BITBUCKET_BUILD_NUMBER']!, 10),
      runNumber: parseInt(process.env['BITBUCKET_BUILD_NUMBER']!, 10),
      repoUrl: process.env['BITBUCKET_GIT_HTTP_ORIGIN']!,
      sha: process.env['BITBUCKET_COMMIT']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: '',
    description: '',
    html_url: `https://bitbucket.org/${process.env['BITBUCKET_REPO_FULL_NAME']}`,
    license: null,
    name: process.env['BITBUCKET_WORKSPACE']!,
  };
}
