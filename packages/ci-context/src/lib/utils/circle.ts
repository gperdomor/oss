/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Circle {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'CIRCLE',
      actor: process.env['CIRCLE_USERNAME']!,
      eventName: process.env['CI_PULL_REQUEST'] ? 'pull_request' : 'unknown',
      job: process.env['CIRCLE_JOB']!,
      payload: {},
      ref: process.env['CIRCLE_TAG']
        ? `refs/tags/${process.env['CIRCLE_TAG']}`
        : `refs/heads/${process.env['CIRCLE_BRANCH']}`,
      runId: parseInt(process.env['CIRCLE_BUILD_NUM']!, 10),
      runNumber: parseInt(process.env['CIRCLE_BUILD_NUM']!, 10),
      repoUrl: process.env['CIRCLE_REPOSITORY_URL']!,
      sha: process.env['CIRCLE_SHA1']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: '',
    description: '',
    html_url: process.env['CIRCLE_REPOSITORY_URL']!,
    license: null,
    name: process.env['CIRCLE_PROJECT_REPONAME']!,
  };
}
