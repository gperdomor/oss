/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RepoMetadata, RunnerContext } from '../interfaces.js';

export class Semaphore {
  public static async context(): Promise<RunnerContext> {
    return {
      name: 'SEMAPHORE',
      actor: 'semaphore',
      eventName: process.env['SEMAPHORE_GIT_REF_TYPE']!,
      job: process.env['SEMAPHORE_JOB_NAME']!,
      payload: {},
      ref: process.env['SEMAPHORE_GIT_REF']!,
      runId: parseInt(process.env['SEMAPHORE_PIPELINE_ID']!, 10),
      runNumber: parseInt(process.env['SEMAPHORE_JOB_ID']!, 10),
      repoUrl: process.env['SEMAPHORE_GIT_URL']!,
      sha: process.env['SEMAPHORE_GIT_SHA']!,
    };
  }
}

export async function repo(): Promise<RepoMetadata> {
  return {
    default_branch: '',
    description: '',
    html_url: process.env['SEMAPHORE_GIT_URL']!,
    license: null,
    name: process.env['SEMAPHORE_GIT_REPO_SLUG']!.split('/')[1],
  };
}
