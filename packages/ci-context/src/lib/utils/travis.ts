/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Travis {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'TRAVIS',
      actor: process.env['USER']!,
      eventName: process.env['TRAVIS_EVENT_TYPE']!,
      job: process.env['TRAVIS_JOB_NAME']!,
      payload: {},
      ref: process.env['TRAVIS_TAG']
        ? `refs/tags/${process.env['TRAVIS_TAG']}`
        : `refs/heads/${process.env['TRAVIS_BRANCH']}`,
      runId: parseInt(process.env['TRAVIS_BUILD_NUMBER']!, 10),
      runNumber: parseInt(process.env['TRAVIS_BUILD_ID']!, 10),
      repoUrl: '',
      sha: process.env['TRAVIS_COMMIT']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: '',
    description: '',
    html_url: '',
    license: null,
    name: process.env['TRAVIS_REPO_SLUG']!,
  };
}
