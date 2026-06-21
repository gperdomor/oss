/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Gitlab {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'GITLAB',
      actor: process.env['GITLAB_USER_LOGIN']!,
      eventName: process.env['CI_PIPELINE_SOURCE']!,
      job: process.env['CI_JOB_NAME']!,
      payload: {
        repository: {
          default_branch: process.env['CI_DEFAULT_BRANCH']!,
          private: process.env['CI_PROJECT_VISIBILITY'] === 'private',
        },
      },
      ref: process.env['CI_COMMIT_TAG']
        ? `refs/tags/${process.env['CI_COMMIT_TAG']}`
        : `refs/heads/${process.env['CI_COMMIT_REF_SLUG']}`,
      runId: parseInt(process.env['CI_PIPELINE_IID']!, 10),
      runNumber: parseInt(process.env['CI_PIPELINE_ID']!, 10),
      repoUrl: process.env['CI_PROJECT_URL']!,
      sha: process.env['CI_COMMIT_SHA']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: process.env['CI_DEFAULT_BRANCH']!,
    description: '',
    html_url: process.env['CI_PROJECT_URL']!,
    license: null,
    name: process.env['CI_PROJECT_NAME']!,
  };
}
